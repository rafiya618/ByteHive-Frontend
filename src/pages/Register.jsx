import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";
import toast from "react-hot-toast";

const Register = () => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [isResending, setIsResending] = useState(false);
    const [timer, setTimer] = useState(60);
    const [verifyDisabled, setVerifyDisabled] = useState(false);
    const [auth, setAuth] = useAuth()
    const navigate = useNavigate();

    // Countdown timer logic
    useEffect(() => {
        let interval;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setVerifyDisabled(true); // Disable button when timer reaches 0
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    // Handle Register
    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/register`, { name, email, password });
            if (res.data.success) {
                // alert("OTP sent to your email");
                toast.success("OTP sent to your email")
                setStep(2);
                setTimer(60);
                setVerifyDisabled(false);
            }
        } catch (error) {
            if(error.response?.status) {
                console.log(error.response.data.message)
                toast.error(error.response.data.message)
            } else
                toast.error(error.response?.data?.message || "Error sending OTP");
        }
    };

    // Handle OTP Verification
    const handleVerify = async (e) => {
        e.preventDefault();
        if (verifyDisabled) {
            alert("OTP expired. Please click Resend OTP.");
            return;
        }
        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/verify-otp`, { name, email, password, otp });
            if (res.data.success) {
                toast.success("Registration Successful!");
                setAuth({...auth, token: res.data.token})
                localStorage.setItem('Auth', JSON.stringify(res.data))
                console.log(res.data.message)
                navigate('/')
            }
        } catch (error) {
            toast.error(error.response?.data?.msg || "Error verifying OTP");
            setOtp('');
        }
    };

    // Handle Resend OTP
    const handleResendOTP = async () => {
        try {
            setIsResending(true);
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/resend-otp`, { email });
            if (res.data.success) {
                toast.success("OTP resent successfully");
                setOtp('');
                setTimer(60);              // Reset timer
                setVerifyDisabled(false);  // Enable verify button again
            }
        } catch (error) {
            toast.error("Error resending OTP");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div>
            {step === 1 && (
                <>
                <h1>Register Page</h1>
                <br />
                <form onSubmit={handleRegister}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter Name"
                        required
                    /><br/>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter Email"
                        required
                    /><br/>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter Password"
                        required
                    /><br/>
                    <button type="submit">Submit</button>
                </form>

                <br/>
                <button onClick={() => window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google?mode=register`}>
                    Continue with Google
                </button>
                </>
            )}

            {step === 2 && (
                <form onSubmit={handleVerify}>
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter OTP"
                        required
                        disabled={verifyDisabled}
                    /><br/>
                    <button type="submit" disabled={verifyDisabled}>
                        {verifyDisabled ? "OTP Expired" : "Verify OTP & Register"}
                    </button><br/>

                    <p>OTP will expire in: {timer} second(s)</p>

                    <button type="button" onClick={handleResendOTP} disabled={isResending}>
                        {isResending ? "Resending..." : "Resend OTP"}
                    </button>
                </form>
            )}
        </div>
    );
};

export default Register;
