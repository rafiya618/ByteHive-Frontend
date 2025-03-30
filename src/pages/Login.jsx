import axios from 'axios'
import React, { useState } from 'react'
import { useAuth } from '../context/auth'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'


const Login = () => {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [auth, setAuth] = useAuth()
    const navigate = useNavigate()

    const HandleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, { email, password});
            setAuth({...auth, token: res.data.token})
            localStorage.setItem('Auth', JSON.stringify(res.data))
            console.log(res.data.message)
            toast.success(res.data.message)
            navigate('/')
        } catch (error) {
            if(error.response?.status) {
                console.log(error.response.data.message)
                toast.error(error.response.data.message)
            } else
                console.log('Error in login: ', error)
                toast.error('Error in login: ', error)
        }
    }

    return (
       
        <div>
            <h1>Login Page</h1>
            <br />
            <form onSubmit={HandleSubmit}>
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Enter Email' required/>
                <br />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Enter password' required/>
                <br />
                <button type='submit'>Login</button>
            </form>
            
            <button onClick={() => navigate("/forgot-password")}>Forgot Password?</button>
            <br />
            <button onClick={() => window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google?mode=login`}>
                    Continue with Google
            </button>
        </div>
    )
}

export default Login
