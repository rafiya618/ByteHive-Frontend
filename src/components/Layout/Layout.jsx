import React from 'react'
import Navbar from './Navbar'


const Layout = ({ children }) => {
  return (
    <div className='min-h-screen bg-rich-black  flex flex-col relative text-white'>

      <Navbar />
      <div
        className="absolute z-0"
        style={{
          width: 637,
          height: 300,
          top: -38,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#1A1842B3",
          filter: "blur(100px)",
          boxShadow: "0px 4px 100px 500px #00000066",
          borderRadius: 30,
          pointerEvents: "none",
        }}
      />
      <main style={{ marginTop: '80px', padding: '20px' }}>{children}</main>
    </div>
  )
}

export default Layout
