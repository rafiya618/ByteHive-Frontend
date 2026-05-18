import React from 'react';

const VideoTile = ({ stream, label, muted, compact = false, highlight = false }) => {
	return (
		<div
			className={`relative overflow-hidden rounded-2xl border bg-[#111723] shadow-[0_12px_32px_rgba(0,0,0,0.35)] ${highlight ? 'border-[#7786ff]' : 'border-white/10'}`}
		>
			<video
				autoPlay
				playsInline
				muted={muted}
				ref={(el) => {
					if (el && el.srcObject !== stream) el.srcObject = stream;
				}}
				className={`block w-full object-cover ${compact ? 'aspect-[4/3]' : 'aspect-video'}`}
			/>
			<div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent p-3">
				<div className="max-w-full truncate text-sm font-medium text-white">{label}</div>
			</div>
		</div>
	);
};

const VideoGrid = ({ localStream, remoteStreams = [], localLabel = 'You', isScreenSharing = false }) => {
	const remote = remoteStreams.filter(Boolean);
	const primaryRemote = !isScreenSharing && remote.length > 0 ? remote[0] : null;

	const sideTiles = [];
	if (localStream && primaryRemote) {
		sideTiles.push({ stream: localStream, label: localLabel, muted: true, compact: true, highlight: true });
	}

	const startIndex = primaryRemote ? 1 : 0;
	for (let index = startIndex; index < remote.length; index += 1) {
		const streamData = remote[index];
		sideTiles.push({
			stream: streamData.stream,
			label: streamData.displayName || streamData.ownerDisplayName || streamData.ownerName || streamData.ownerSocketId || 'Participant',
			muted: false,
			compact: true,
		});
	}

	const mainStream = primaryRemote?.stream || localStream || remote[0]?.stream || null;
	const mainLabel = primaryRemote
		? primaryRemote.displayName || primaryRemote.ownerDisplayName || primaryRemote.ownerName || primaryRemote.ownerSocketId || 'Participant'
		: localLabel;

	if (!mainStream) {
		return (
			<div className="rounded-3xl border border-white/10 bg-[#101522] p-6 text-center text-sm text-white/70">
				Waiting for camera...
			</div>
		);
	}

	if (sideTiles.length === 0) {
		return (
			<div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
				<VideoTile stream={mainStream} label={mainLabel} muted={isScreenSharing || !primaryRemote} />
			</div>
		);
	}

	return (
		<div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
			<div className="min-w-0">
				<VideoTile stream={mainStream} label={mainLabel} muted={isScreenSharing || !primaryRemote} highlight />
			</div>

			<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 xl:content-start">
				{sideTiles.map((tile, index) => (
					<VideoTile
						key={`${tile.label}-${index}`}
						stream={tile.stream}
						label={tile.label}
						muted={tile.muted}
						compact={tile.compact}
						highlight={tile.highlight}
					/>
				))}
			</div>
		</div>
	);
};

export default VideoGrid;
