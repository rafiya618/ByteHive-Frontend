import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        if (timer > 0) {
            const interval = setTimeout(() => setTimer(timer - 1), 1000);
            return () => clearTimeout(interval); // Cleanup on unmount or when timer updates
        }
    }, [timer]); // Runs when `timer` changes

    const sendOtp = async () => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/forgot-password`, { email });
            toast.success(res.data.message);
            setStep(2);
            setTimer(60); // Reset timer without creating duplicate intervals
        } catch (error) {
            console.error(error);
        }
    };

    const verifyOtp = async () => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/verify-reset-otp`, { email, otp });
            toast.success(res.data.message);
            setStep(3);
            setTimer(0); // Stop timer when OTP is verified
        } catch (error) {
            console.error(error);
        }
    };

    const resetPassword = async () => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/reset-password`, { email, password });
            toast.success(res.data.message);
            window.location.href = '/login';
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            {step === 1 && (
                <>
                    <h3>Forgot Password</h3>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required />
                    <button onClick={sendOtp}>Send OTP</button>
                </>
            )}

            {step === 2 && (
                <>
                    <h3>Enter OTP</h3>
                    <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" required />
                    <p>Expires in: {timer}s</p>
                    <button onClick={verifyOtp} disabled={timer === 0}>Verify OTP</button>
                    <button onClick={sendOtp}>Resend OTP</button>
                </>
            )}

            {step === 3 && (
                <>
                    <h3>Reset Password</h3>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password" required />
                    <button onClick={resetPassword}>Reset Password</button>
                </>
            )}
        </div>
    );
};

export default ForgotPassword;
