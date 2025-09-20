import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import InputField from "../../shared/InputField";
import { validateEmail, validatePassword, validateOtp } from "../../helpers/validators";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [timer, setTimer] = useState(0);

  // countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(interval);
    }
  }, [timer]);

  // step 1 → send OTP
  const sendOtp = async () => {
    const emailError = validateEmail(email);
    if (emailError) return toast.error(emailError);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_AUTH_SERVICE_URL}/auth/forgot-password`,
        { email }
      );
      toast.success(res.data.message);
      setStep(2);
      setTimer(60);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending OTP");
    }
  };

  // step 2 → verify OTP
  const verifyOtp = async () => {
    const otpError = validateOtp(otp);
    if (otpError) return toast.error(otpError);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_AUTH_SERVICE_URL}/auth/verify-reset-otp`,
        { email, otp }
      );
      toast.success(res.data.message);
      setStep(3);
      setTimer(0);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    }
  };

  // step 3 → reset password
  const resetPassword = async () => {
    const passwordError = validatePassword(password);
    if (passwordError) return toast.error(passwordError);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_AUTH_SERVICE_URL}/auth/reset-password`,
        { email, password }
      );
      toast.success(res.data.message);
      window.location.href = "/login";
    } catch (error) {
      toast.error(error.response?.data?.message || "Error resetting password");
    }
  };

  return (
    <div className="bg-navbar-bg text-white w-full flex items-center justify-center min-h-screen px-4">
      <div className="bg-dark-navy-purple w-[90%] sm:w-full max-w-md mx-auto p-6 sm:p-8 rounded-xl shadow-lg border border-navbar-border transition-shadow hover:shadow-xl">
        {step === 1 && (
          <>
            <h3 className="text-xl md:text-2xl font-bold text-center mb-6">
              Forgot Password
            </h3>
            <InputField
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
            <button
              onClick={sendOtp}
              className="mt-4 w-full bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 py-2 rounded-md font-semibold transition duration-200 cursor-pointer"
            >
              Send OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h3 className="text-xl md:text-2xl font-bold text-center mb-6">
              Enter OTP
            </h3>
            <InputField
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              required
            />
            <p className="text-sm text-gray-400 mt-2">
              Expires in:{" "}
              <span className="text-white font-semibold">{timer}s</span>
            </p>
            <button
              onClick={verifyOtp}
              disabled={timer === 0}
              className={`mt-4 w-full py-2 rounded-md font-semibold transition duration-200 cursor-pointer ${
                timer === 0
                  ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
              }`}
            >
              {timer === 0 ? "OTP Expired" : "Verify OTP"}
            </button>

            <button
              onClick={sendOtp}
              className="mt-3 w-full bg-dark-indigo text-gray-200 border border-faint-greyish-overlay py-2 px-3 rounded-md font-medium hover:bg-[#2f2f4a] active:bg-[#181628] transition-all duration-200 cursor-pointer hover:scale-[1.02]"
            >
              Resend OTP
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h3 className="text-xl md:text-2xl font-bold text-center mb-6">
              Reset Password
            </h3>
            <InputField
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
            <button
              onClick={resetPassword}
              className="mt-4 w-full bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 py-2 rounded-md font-semibold transition duration-200 cursor-pointer"
            >
              Reset Password
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
