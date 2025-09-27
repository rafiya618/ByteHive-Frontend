import React, { useState, useRef } from "react";
import EmojiPicker from 'emoji-picker-react';

const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
      setShowEmojiPicker(false);
      setShowImageUpload(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false); // Close picker after selecting emoji
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Here you would typically handle the image upload
      console.log('Image selected:', file);
      // You might want to call a different handler for images
      // onSendMessage(`[Image: ${file.name}]`);
      setShowImageUpload(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
    setShowImageUpload(false);
  };

  return (
    <div className="pt-4 pb-6 relative">
      <div className="flex items-end gap-3">
        <img src="https://images.unsplash.com/photo-1695927621677-ec96e048dce2?q=80&w=435&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
             alt="Your avatar" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
        
        <div className="flex-1 relative">
          <div className="bg-navbar-bg rounded-lg border px-6 flex items-center gap-3 h-12" 
               style={{ borderColor: "var(--navbar-border)" }}>
            <input type="text" 
                   value={message} 
                   onChange={(e) => setMessage(e.target.value)} 
                   onKeyPress={handleKeyPress} 
                   placeholder="Type a message"
                   className="flex-1 bg-transparent text-white placeholder-columbia-blue outline-none font-lato text-base" />
            
            {/* Pin Icon for Image Upload */}
            <div className="relative">
              <button type="button" 
                      onClick={() => setShowImageUpload(!showImageUpload)}
                      className="text-columbia-blue hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              
              {/* Image Upload Dropdown */}
              {showImageUpload && (
                <div className="absolute bottom-full left-0 mb-2 bg-gray-700 rounded-lg shadow-lg border border-gray-600 py-2 w-40">
                  <button type="button" 
                          onClick={triggerFileInput}
                          className="w-full px-4 py-2 text-left text-white hover:bg-gray-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Upload Image
                  </button>
                </div>
              )}
            </div>
            
            {/* Emoji Button */}
            <button type="button" 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-columbia-blue hover:text-white transition-colors">
              <span className="material-icons text-xl">sentiment_satisfied</span>
            </button>
          </div>
          
          {/* Emoji Picker Popup */}
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2 z-50">
              <EmojiPicker 
                onEmojiClick={handleEmojiClick}
                theme="dark"
                width={350}
                height={400}
              />
            </div>
          )}
        </div>

        <button type="button" 
                disabled={!message.trim()}
                onClick={handleSubmit}
                className="disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 rounded-lg transition-colors duration-200 flex items-center gap-2 font-lato text-base font-medium h-12"
                style={{ background: "linear-gradient(135deg, #6866FF 0%, #5755D6 100%)" }}>
          <span className="material-icons text-lg">send</span>
          Send
        </button>
      </div>
      
      {/* Hidden file input */}
      <input type="file" 
             ref={fileInputRef}
             onChange={handleImageUpload}
             accept="image/*"
             className="hidden" />
      
      {/* Click outside handlers */}
      {(showEmojiPicker || showImageUpload) && (
        <div className="fixed inset-0 z-0" 
             onClick={() => {
               setShowEmojiPicker(false);
               setShowImageUpload(false);
             }} />
      )}
    </div>
  );
};

export default ChatInput;