import React from 'react'
import Navbar from './Navbar'


const Layout = ({children}) => {
  return (
    <div>
        <Navbar />
        <main style={{ marginTop: '80px', padding: '20px'}}>{children}</main>
    </div>
  )
}

export default Layout
