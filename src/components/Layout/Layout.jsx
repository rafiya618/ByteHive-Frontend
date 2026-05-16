import React from 'react'
import Navbar from '../../shared/Navbar';
// import Navbar from './Navbar';
import { useAuth } from '../../context/auth';

const Layout = ({ children }) => {
  const { auth } = useAuth()
  return (
    <div className='min-h-screen bg-rich-black  flex flex-col relative text-white'>

      <Navbar />

      {/* marginTop: '80px', padding: '20px' */}
      <main style={{}}>{children}</main>
    </div>

  )
}

export default Layout
