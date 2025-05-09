
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Homepage from './pages/homepage'
import Register from './pages/Auth/Register'
import Login from './pages/Auth/Login'
import ForgotPassword from './pages/Auth/ForgotPassword'
import GoogleAuth from './pages/Auth/GoogleAuth'
import toast, { Toaster } from 'react-hot-toast';
import ProfilePage from './pages/ProfilePage'
import PageNotFound from './pages/PageNotFound'

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
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/*" element={<PageNotFound />} />

      </Routes>
    </>
  )
}

export default App
