
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Homepage from './pages/homepage'
import Register from './pages/Register'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import GoogleAuth from './pages/GoogleAuth'
import toast, { Toaster } from 'react-hot-toast';

function App() {

  return (
    <>
      <Toaster />
      <Routes>
        <Route path='/' element={ <Homepage />} />
        <Route path='/register' element={ <Register />} />
        <Route path='/login' element={ <Login />} />
        <Route path="/google-auth" element={<GoogleAuth />} />  {/* Google callback route */}
        <Route path='/forgot-password' element={<ForgotPassword />} />
        
      </Routes>
    </>
  )
}

export default App
