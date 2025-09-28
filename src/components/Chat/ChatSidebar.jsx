import React from "react";

const ChatSidebar = ({ isOpen, onToggle }) => {
  // Sample chat list - you can replace this with your actual chat data
  const chatList = [
    "Next.jsDevs Chat",
    "React Developers",
    "Web Design Community",
    "JavaScript Masters",
    "Frontend Guild",
    "UI/UX Designers",
    "Node.js Discussion",
    "TypeScript Tips",
    "CSS Wizards",
    "API Development",
    "Mobile Dev Chat",
    "DevOps Community"
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${
        // Mobile: fixed positioning with transform
        isOpen 
          ? 'fixed left-0 top-0 h-full w-80 z-50 lg:relative lg:z-auto' 
          : 'fixed -left-80 top-0 h-full w-80 z-50 lg:relative lg:left-0 lg:w-80'
      } bg-rich-black border-r transition-all duration-300 ease-in-out lg:flex lg:flex-col`} 
      style={{ borderColor: "var(--navbar-border)" }}>
        
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: "var(--navbar-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => window.history.back()}
                className="text-columbia-blue hover:text-white transition-colors"
              >
                <span className="material-icons text-xl">arrow_back</span>
              </button>
              <h1 className="font-fenix text-2xl text-white font-normal">BYTE</h1>
            </div>
            <button 
              onClick={onToggle}
              className="lg:hidden text-columbia-blue hover:text-white transition-colors"
            >
              <span className="material-icons text-xl">close</span>
            </button>
          </div>
          <p className="font-lato text-columbia-blue text-sm leading-relaxed">
            Connect, collaborate, and share knowledge with developers worldwide
          </p>
        </div>

        {/* Create Byte Button */}
        <div className="p-6 border-b" style={{ borderColor: "var(--navbar-border)" }}>
          <button 
            className="w-full py-3 px-4 rounded-lg font-lato text-white font-medium transition-all duration-200 hover:shadow-lg"
            style={{ background: "linear-gradient(135deg, #6866FF 0%, #5755D6 100%)" }}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="material-icons text-lg">add</span>
              Create Byte
            </span>
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--rich-black) transparent'
        }}>
          <div className="p-6">
            <h3 className="font-lato text-white text-sm font-medium mb-4 uppercase tracking-wide">
              Recent Chats
            </h3>
            <div className="space-y-0">
              {chatList.map((chatName, index) => (
                <div key={index}>
                  <div className="px-6">
                    <button
                      className="w-full text-left p-3 rounded-lg font-lato text-columbia-blue hover:bg-navbar-bg hover:text-white transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-columbia-blue group-hover:bg-white opacity-60"></div>
                        <span className="text-sm truncate">{chatName}</span>
                      </div>
                    </button>
                  </div>
                  {index < chatList.length - 1 && (
                    <div className="my-2 h-px bg-gray-600 opacity-30"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>


      </div>
    </>
  );
};

export default ChatSidebar;