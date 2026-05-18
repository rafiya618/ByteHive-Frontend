import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";
import Navbar from "../../shared/Navbar";
import { useAuth } from "../../context/auth";
import CallControls from "../../components/VideoCall/CallControls";
import VideoGrid from "../../components/VideoCall/VideoGrid";
import ChatPanel from "../../components/VideoCall/ChatPanel";
import { getRequiredUrl } from "../../utils/env";

const VIDEOCALL_SERVER_URL = getRequiredUrl("VITE_VIDEOCALL_SERVER_URL");
const socket = io(VIDEOCALL_SERVER_URL);

export default function Room({ communityId: propCommunityId }) {
  // Get communityId from URL params if not provided as prop
  const [communityId, setCommunityId] = useState(propCommunityId);
  
  useEffect(() => {
    if (!communityId) {
      const urlParts = window.location.pathname.split('/');
      const roomId = urlParts[urlParts.length - 1];
      if (roomId && roomId !== 'room') {
        setCommunityId(roomId);
      }
    }
  }, [communityId]);

  const [device, setDevice] = useState(null);
  const sendTransportRef = useRef(null);
  const recvTransportRef = useRef(null);
  const localStreamRef = useRef(null);
  const [localPreviewStream, setLocalPreviewStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [participants, setParticipants] = useState(new Set());

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const { auth } = useAuth();

  // Keep track of consumed producers and consumers
  const consumedProducersRef = useRef(new Set());
  const consumersRef = useRef(new Map()); // consumerId -> consumer
  const audioProducerRef = useRef(null);
  const videoProducerRef = useRef(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const screenStreamRef = useRef(null);
  const isStoppingScreenShareRef = useRef(false);

  const roomId = communityId;

  const getDisplayName = () => {
    const user = auth?.user || {};
    const joinedName = [user.firstName, user.lastName].filter(Boolean).join(" ");
    const name = user.displayName || user.name || user.username || user.userName || user.fullName || joinedName;
    if (name) return String(name).trim();
    if (user.email) return String(user.email).split("@")[0];
    return user.sub || user.id || user._id || socket.id || "Guest";
  };
  // Screen sharing logic
  const startScreenShare = async () => {
    if (!isJoined || !videoProducerRef.current || isScreenSharing) return;
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = screenStream;
      const screenTrack = screenStream.getVideoTracks()[0];
      screenTrack.onended = () => {
        if (!isStoppingScreenShareRef.current) stopScreenShare();
      };
      // Replace video track in producer
      await videoProducerRef.current.replaceTrack({ track: screenTrack });
      setIsScreenSharing(true);
      setLocalPreviewStream(screenStream);
    } catch (err) {
      alert("Failed to share screen: " + err.message);
    }
  };

  const stopScreenShare = async () => {
    if (!isJoined || !videoProducerRef.current || isStoppingScreenShareRef.current) return;
    try {
      isStoppingScreenShareRef.current = true;
      const activeScreenStream = screenStreamRef.current;
      const screenTrack = activeScreenStream?.getVideoTracks?.()[0];
      if (screenTrack) screenTrack.onended = null;

      // Stop screen stream
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }
      // Reacquire camera if needed
      let camStream = localStreamRef.current;
      if (!camStream || camStream.getVideoTracks().length === 0) {
        camStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 15 } },
          audio: false
        });
        localStreamRef.current = camStream;
      }
      const camTrack = camStream.getVideoTracks()[0];
      try {
        await videoProducerRef.current.replaceTrack({ track: camTrack });
      } catch {
        // If replaceTrack fails, close and recreate video producer
        try {
          await videoProducerRef.current.close();
        } catch (closeError) {
          console.warn("Failed to close video producer during screen-share recovery:", closeError);
        }
        // Create new video producer
        if (sendTransportRef.current) {
          const newProducer = await sendTransportRef.current.produce({ track: camTrack });
          videoProducerRef.current = newProducer;
        }
      }
      setIsScreenSharing(false);
      setLocalPreviewStream(camStream);
    } catch (err) {
      alert("Failed to stop screen share: " + err.message);
    } finally {
      isStoppingScreenShareRef.current = false;
    }
  };

  useEffect(() => {
    const handleNewProducer = async ({ producerId, ownerSocketId, kind }) => {
      console.log("New producer:", producerId, "from:", ownerSocketId, "kind:", kind);
      
      // Skip consuming our own producers
      if (ownerSocketId === socket.id) {
        console.log("Skipping own producer:", producerId);
        return;
      }

      // Add to participants list
      setParticipants(prev => new Set([...prev, ownerSocketId]));
      
      // Wait a bit to ensure transports are ready
      if (device && recvTransportRef.current && !consumedProducersRef.current.has(producerId)) {
        console.log("Attempting to consume producer:", producerId);
        setTimeout(() => consume(producerId), 500);
      } else {
        console.log("Cannot consume yet - device/transport not ready or already consumed");
      }
    };

    const handleProducerClosed = ({ producerId }) => {
      console.log("Producer closed:", producerId);
      
      // Clean up consumer if exists
      for (const [consumerId, consumer] of consumersRef.current.entries()) {
        if (consumer.producerId === producerId) {
          consumer.close();
          consumersRef.current.delete(consumerId);
          break;
        }
      }
      
      setRemoteStreams((prev) => {
        const newStreams = new Map(prev);
        // Find and remove the stream that contains this producer
        for (const [streamId, streamData] of newStreams.entries()) {
          if (streamData.producerId === producerId) {
            newStreams.delete(streamId);
            break;
          }
        }
        return newStreams;
      });
      consumedProducersRef.current.delete(producerId);
    };

    const handlePeerLeft = ({ socketId }) => {
      console.log("Peer left:", socketId);
      // Remove from participants
      setParticipants(prev => {
        const newSet = new Set(prev);
        newSet.delete(socketId);
        return newSet;
      });
      
      // Remove all streams from this peer
      setRemoteStreams((prev) => {
        const newStreams = new Map(prev);
        for (const [streamId, streamData] of newStreams.entries()) {
          if (streamData.ownerSocketId === socketId) {
            newStreams.delete(streamId);
          }
        }
        return newStreams;
      });
    };

    const handlePeerJoined = ({ socketId }) => {
      console.log("Peer joined:", socketId);
      setParticipants(prev => new Set([...prev, socketId]));
    };

    socket.on("new-producer", handleNewProducer);
    socket.on("producer-closed", handleProducerClosed);
    socket.on("peer-left", handlePeerLeft);
    socket.on("peer-joined", handlePeerJoined);

    return () => {
      socket.off("new-producer", handleNewProducer);
      socket.off("producer-closed", handleProducerClosed);
      socket.off("peer-left", handlePeerLeft);
      socket.off("peer-joined", handlePeerJoined);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);


// receive incoming messages
useEffect(() => {
  socket.on("call:chat-message", (msg) => {
    setChatMessages((prev) => [...prev, msg]);
  });

  return () => {
    socket.off("call:chat-message");
  };
}, []);

  // join the room
  const joinRoom = async () => {
    if (isJoined || !communityId) return;
    
    console.log("Joining room:", communityId);
    
    socket.emit("join-room", { roomId, displayName: getDisplayName() }, async (res) => {
      if (res?.error) {
        console.error("join-room error", res.error);
        alert("Failed to join room: " + res.error);
        return;
      }

      console.log("Joined room successfully", res);
      const { routerRtpCapabilities, existingProducers, chatHistory } = res;
      setChatMessages(chatHistory || []);

      try {
        // Initialize device
        const dev = new mediasoupClient.Device();
        await dev.load({ routerRtpCapabilities });
        setDevice(dev);

        // Create transports
        console.log("Creating transports...");
        const [sendTransport, recvTransport] = await Promise.all([
          createSendTransport(dev),
          createRecvTransport(dev)
        ]);
        
        if (!sendTransport || !recvTransport) {
          throw new Error("Failed to create transports");
        }
        
        sendTransportRef.current = sendTransport;
        recvTransportRef.current = recvTransport;
        console.log("Transports created successfully");

        // Start local media and produce
        await startCameraAndProduce(sendTransport);

        // After producing local media, consume all producers in existingProducers for this room
        if (existingProducers && existingProducers.length > 0) {
          for (const p of existingProducers) {
            if (p.ownerSocketId === socket.id) continue; // skip own
            setParticipants(prev => new Set([...prev, p.ownerSocketId]));
            if (!consumedProducersRef.current.has(p.id)) {
              await consume(p.id);
            }
          }
        }

        setIsJoined(true);
        console.log("Room setup completed successfully");
      } catch (err) {
        console.error("Error setting up room:", err);
        alert("Failed to setup room: " + err.message);
      }
    });
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    socket.emit("call:chat-message", {
      roomId,
      message: chatInput,
      senderName: getDisplayName(),
    });
    setChatInput("");
  };

  const createSendTransport = (dev) =>
    new Promise((resolve, reject) => {
      socket.emit("create-transport", { roomId }, (params) => {
        if (params?.error) {
          console.error("create-transport error", params.error);
          return reject(new Error(params.error));
        }
        
        console.log("Creating send transport with params:", params);
        const transport = dev.createSendTransport(params);

        transport.on("connect", ({ dtlsParameters }, callback, errback) => {
          console.log("Send transport connecting...");
          socket.emit("connect-transport", { roomId, transportId: params.id, dtlsParameters }, (res) => {
            if (res?.error) {
              console.error("Send transport connect error:", res.error);
              errback(new Error(res.error));
            } else {
              console.log("Send transport connected");
              callback();
            }
          });
        });

        transport.on("produce", ({ kind, rtpParameters }, callback, errback) => {
          console.log("Producing:", kind);
          socket.emit("produce", { roomId, transportId: params.id, kind, rtpParameters }, (res) => {
            if (res?.error) {
              console.error("Produce error:", res.error);
              return errback(new Error(res.error));
            }
            console.log("Produced:", kind, "with id:", res.id);
            callback({ id: res.id });
          });
        });

        transport.on("connectionstatechange", (state) => {
          console.log("Send transport connection state:", state);
          if (state === 'failed' || state === 'disconnected') {
            console.error("Send transport failed, attempting to reconnect...");
          }
        });

        resolve(transport);
      });
    });

  const createRecvTransport = (dev) =>
    new Promise((resolve, reject) => {
      socket.emit("create-transport", { roomId }, (params) => {
        if (params?.error) {
          console.error("create-transport error", params.error);
          return reject(new Error(params.error));
        }
        
        console.log("Creating recv transport with params:", params);
        const transport = dev.createRecvTransport(params);

        transport.on("connect", ({ dtlsParameters }, callback, errback) => {
          console.log("Recv transport connecting...");
          socket.emit("connect-transport", { roomId, transportId: params.id, dtlsParameters }, (res) => {
            if (res?.error) {
              console.error("Recv transport connect error:", res.error);
              errback(new Error(res.error));
            } else {
              console.log("Recv transport connected");
              callback();
            }
          });
        });

        transport.on("connectionstatechange", (state) => {
          console.log("Recv transport connection state:", state);
          if (state === 'failed' || state === 'disconnected') {
            console.error("Recv transport failed");
          }
        });

        resolve(transport);
      });
    });

  const startCameraAndProduce = async (sendTransport) => {
    try {
      console.log("Starting camera and microphone...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }, 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          frameRate: { ideal: 15 }
        } 
      });
      
      localStreamRef.current = stream;
      setLocalPreviewStream(stream);

      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      // Produce both tracks
      const promises = [];
      
      if (videoTrack) {
        console.log("Producing video track");
        promises.push(
          sendTransport.produce({ track: videoTrack }).then(producer => {
            videoProducerRef.current = producer;
            console.log("Video producer created:", producer.id);
            
            producer.on('transportclose', () => {
              console.log('Video producer transport closed');
            });
            
            producer.on('trackended', () => {
              console.log('Video track ended');
            });
          })
        );
      }
      
      if (audioTrack) {
        console.log("Producing audio track");
        promises.push(
          sendTransport.produce({ track: audioTrack }).then(producer => {
            audioProducerRef.current = producer;
            console.log("Audio producer created:", producer.id);
            
            producer.on('transportclose', () => {
              console.log('Audio producer transport closed');
            });
            
            producer.on('trackended', () => {
              console.log('Audio track ended');
            });
          })
        );
      }
      
      await Promise.all(promises);
      console.log("Local media production completed");
    } catch (err) {
      console.error("getUserMedia error:", err);
      alert("Failed to access camera/microphone: " + err.message);
      throw err;
    }
  };

  const consume = (producerId) =>
    new Promise((resolve) => {
      (async () => {
        try {
          if (!device || !recvTransportRef.current) {
            console.log("Device or recv transport not ready for consuming, retrying in 1000ms");
            setTimeout(() => consume(producerId).then(resolve), 1000);
            return;
          }
          
          if (consumedProducersRef.current.has(producerId)) {
            console.log("Producer already consumed:", producerId);
            return resolve();
          }

          console.log("Consuming producer:", producerId);

          socket.emit(
            "consume",
            { 
              roomId, 
              transportId: recvTransportRef.current.id, 
              producerId, 
              rtpCapabilities: device.rtpCapabilities 
            },
            async (res) => {
              if (res?.error) {
                console.error("consume error:", res.error);
                return resolve();
              }

              console.log("Consumer response:", res);

              try {
                const consumer = await recvTransportRef.current.consume({
                  id: res.id,
                  producerId: res.producerId,
                  kind: res.kind,
                  rtpParameters: res.rtpParameters,
                });

                console.log("Consumer created successfully:", consumer.kind, consumer.id);
                
                // Store consumer reference
                consumersRef.current.set(consumer.id, consumer);

                // Handle remote stream creation/updating
                const peerKey = res.ownerSocketId;
                const ownerDisplayName = res.ownerDisplayName || res.ownerName || res.ownerUsername || peerKey;
                
                setRemoteStreams((prevStreams) => {
                  const newStreams = new Map(prevStreams);
                  
                  let existingStreamData = null;
                  
                  // Find existing stream for this peer
                    for (const [_key, streamData] of newStreams.entries()) {
                    if (streamData.ownerSocketId === peerKey) {
                      existingStreamData = streamData;
                      break;
                    }
                  }
                  
                  if (existingStreamData) {
                    // Add track to existing stream
                    console.log("Adding", consumer.kind, "track to existing stream for peer", peerKey);
                    
                    // Remove existing track of the same kind if it exists
                    const existingTrack = existingStreamData.stream.getTracks().find(t => t.kind === consumer.track.kind);
                    if (existingTrack) {
                      existingStreamData.stream.removeTrack(existingTrack);
                    }
                    
                    existingStreamData.stream.addTrack(consumer.track);
                    
                    // Update stream data
                    const updatedStreamData = {
                      ...existingStreamData,
                      displayName: existingStreamData.displayName || ownerDisplayName,
                      [`${consumer.kind}ProducerId`]: res.producerId,
                      [`${consumer.kind}ConsumerId`]: consumer.id
                    };
                    
                    newStreams.set(peerKey, updatedStreamData);
                  } else {
                    // Create new stream for this peer
                    console.log("Creating new stream for peer", peerKey, "kind:", consumer.kind);
                    const newStream = new MediaStream([consumer.track]);
                    
                    const streamData = {
                      stream: newStream,
                      ownerSocketId: peerKey,
                      displayName: ownerDisplayName,
                      [`${consumer.kind}ProducerId`]: res.producerId,
                      [`${consumer.kind}ConsumerId`]: consumer.id
                    };
                    
                    newStreams.set(peerKey, streamData);
                  }
                  
                  return newStreams;
                });

                consumedProducersRef.current.add(producerId);

                // Set up consumer event handlers
                consumer.on("transportclose", () => {
                  console.log("Consumer transport closed:", consumer.id);
                  consumersRef.current.delete(consumer.id);
                });
                
                consumer.on("producerclose", () => {
                  console.log("Consumer producer closed:", consumer.id);
                  consumersRef.current.delete(consumer.id);
                  
                  setRemoteStreams((prev) => {
                    const newStreams = new Map(prev);
                    for (const [_key, streamData] of newStreams.entries()) {
                      if (streamData[`${consumer.kind}ProducerId`] === producerId) {
                        // Remove track from stream
                        const trackToRemove = streamData.stream.getTracks().find(t => t.kind === consumer.kind);
                        if (trackToRemove) {
                          streamData.stream.removeTrack(trackToRemove);
                        }
                        
                        // If no tracks left, remove entire stream
                        if (streamData.stream.getTracks().length === 0) {
                          newStreams.delete(peerKey);
                        }
                        break;
                      }
                    }
                    return newStreams;
                  });
                  
                  consumedProducersRef.current.delete(producerId);
                });

                // Resume consumer to start receiving media
                console.log("Resuming consumer:", consumer.id);
                socket.emit("resume-consumer", { roomId, consumerId: consumer.id }, (resumeRes) => {
                  if (resumeRes?.error) {
                    console.error("Failed to resume consumer:", resumeRes.error);
                  } else {
                    console.log("Consumer resumed successfully:", consumer.id);
                  }
                });

                resolve();
              } catch (consumerError) {
                console.error("Error creating consumer:", consumerError);
                resolve();
              }
            }
          );
        } catch (err) {
          console.error("consume exception", err);
          resolve();
        }
      })();
    });

  const leaveRoom = () => {
    console.log("Leaving room");
    
    socket.emit("leave-room", { roomId });
    
    // Clean up local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("Stopped local track:", track.kind);
      });
      localStreamRef.current = null;
    }
    
    // Close all consumers
    for (const [consumerId, consumer] of consumersRef.current.entries()) {
      try {
        consumer.close();
        console.log("Closed consumer:", consumerId);
      } catch (e) {
        console.error("Error closing consumer:", consumerId, e);
      }
    }
    consumersRef.current.clear();
    
    // Clear local video
    setRemoteStreams(new Map());
    setParticipants(new Set());
    consumedProducersRef.current.clear();
    setShowChat(false);

    // Close transports
    try {
      if (sendTransportRef.current) {
        sendTransportRef.current.close();
        sendTransportRef.current = null;
      }
      if (recvTransportRef.current) {
        recvTransportRef.current.close();
        recvTransportRef.current = null;
      }
    } catch (e) {
      console.error("Error closing transports:", e);
    }

    // Reset refs
    audioProducerRef.current = null;
    videoProducerRef.current = null;
    setLocalPreviewStream(null);
    setIsScreenSharing(false);
    setDevice(null);
    setIsJoined(false);
    
    console.log("Left room successfully");
  };

  const toggleMic = async () => {
    if (!audioProducerRef.current || !localStreamRef.current) return;
    
    try {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !micEnabled;
        setMicEnabled(!micEnabled);
        console.log("Microphone", !micEnabled ? "enabled" : "disabled");
      }
    } catch (err) {
      console.error("Error toggling microphone:", err);
    }
  };

  const toggleCam = async () => {
    if (!videoProducerRef.current || !localStreamRef.current) return;
    
    try {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !camEnabled;
        setCamEnabled(!camEnabled);
        console.log("Camera", !camEnabled ? "enabled" : "disabled");
      }
    } catch (err) {
      console.error("Error toggling camera:", err);
    }
  };

  // Convert Map to Array for rendering
  const remoteStreamArray = Array.from(remoteStreams.values());

  return (
    <div className="min-h-screen bg-rich-black flex flex-col events-page">
      <Navbar />
      <main className="relative flex-1 px-4 pb-28 pt-6 lg:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-[#101522]/85 px-5 py-4 shadow-[0_16px_40px_rgba(0,0,0,0.28)] backdrop-blur-lg lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-white/75">
                <span className="material-icons text-[#9cabff]">videocam</span>
                <span className="text-sm font-medium">Video room</span>
              </div>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">{communityId || 'Loading room...'}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                Status: {isJoined ? <span className="text-emerald-400">Connected</span> : <span className="text-amber-300">Disconnected</span>}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                Participants: <span className="text-white">{participants.size + (isJoined ? 1 : 0)}</span>
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                You: <span className="text-white">{getDisplayName()}</span>
              </span>
            </div>
          </div>

          <VideoGrid
            localStream={localPreviewStream}
            remoteStreams={remoteStreamArray.filter((streamData) => streamData.ownerSocketId !== socket.id)}
            localLabel={getDisplayName()}
            isScreenSharing={isScreenSharing}
          />
        </div>
      </main>

      <CallControls
        isJoined={isJoined}
        micEnabled={micEnabled}
        camEnabled={camEnabled}
        isScreenSharing={isScreenSharing}
        onToggleMic={toggleMic}
        onToggleCam={toggleCam}
        onToggleScreenShare={() => (isScreenSharing ? stopScreenShare() : startScreenShare())}
        onLeave={leaveRoom}
        onJoin={joinRoom}
        onToggleChat={() => setShowChat((prev) => !prev)}
      />

      {showChat && (
        <ChatPanel
          messages={chatMessages}
          value={chatInput}
          onChange={setChatInput}
          onSend={sendMessage}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}