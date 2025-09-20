import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/auth";
import InputField from "../../../shared/InputField";
import toast from "react-hot-toast";
import { validateEmail, validatePassword, validateOtp } from "../../../helpers/validators";

const Register = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [verifyDisabled, setVerifyDisabled] = useState(false);
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  // ==============================
  // 🔹 Countdown timer logic
  // ==============================
  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setVerifyDisabled(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // ==============================
  // 🔹 Handle Register
  // ==============================
  const handleRegister = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    if (emailError) return toast.error(emailError);

    const passwordError = validatePassword(password);
    if (passwordError) return toast.error(passwordError);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_AUTH_SERVICE_URL}/auth/register`,
        { email, password }
      );
      if (res.data.success) {
        toast.success("OTP sent to your email");
        setStep(2);
        setTimer(60);
        setVerifyDisabled(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending OTP");
    }
  };

  // ==============================
  // 🔹 Handle OTP Verification
  // ==============================
  const handleVerify = async (e) => {
    e.preventDefault();

    if (verifyDisabled) {
      toast.error("OTP expired. Please click Resend OTP.");
      return;
    }

    const otpError = validateOtp(otp);
    if (otpError) return toast.error(otpError);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_AUTH_SERVICE_URL}/auth/verify-otp`,
        { email, password, otp }
      );
      if (res.data.success) {
        const decoded = jwtDecode(res.data.token);
        setAuth({ token: res.data.token, user: decoded });
        localStorage.setItem("Auth", JSON.stringify({ token: res.data.token }));
        toast.success("Registration Successful!");
        navigate("/setup-profile");
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "Error verifying OTP");
      setOtp("");
    }
  };

  // ==============================
  // 🔹 Handle Resend OTP
  // ==============================
  const handleResendOTP = async () => {
    const emailError = validateEmail(email);
    if (emailError) return toast.error(emailError);

    try {
      setIsResending(true);
      const res = await axios.post(
        `${import.meta.env.VITE_AUTH_SERVICE_URL}/auth/resend-otp`,
        { email }
      );
      if (res.data.success) {
        toast.success("OTP resent successfully");
        setOtp("");
        setTimer(60);
        setVerifyDisabled(false);
      }
    } catch (error) {
      toast.error("Error resending OTP");
    } finally {
      setIsResending(false);
    }
  };

  // ==============================
  // 🔹 UI
  // ==============================
  return (
    <div className="bg-navbar-bg text-white w-full flex items-center justify-center min-h-screen px-4">
      {step === 1 && (
        <div className="bg-dark-navy-purple w-[90%] sm:w-full max-w-md mx-auto p-6 sm:p-8 rounded-xl shadow-lg border border-navbar-border transition-shadow hover:shadow-xl">
          <h1 className="text-xl md:text-2xl font-bold text-center mb-6">
            Create an Account
          </h1>

          <form onSubmit={handleRegister} className="flex flex-col gap-3 mt-8">
            <InputField
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Email"
            />

            <InputField
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
            />

            <button
              type="submit"
              aria-label="Register Account"
              className="mt-3 w-full bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 py-2 rounded-md font-semibold transition duration-200 cursor-pointer"
            >
              Register
            </button>
          </form>

          <p
            onClick={() => navigate("/login")}
            className="text-sm text-blue-500 hover:text-blue-400 cursor-pointer text-center mt-4"
          >
            Already have an account? Log in
          </p>

          {/* Divider */}
          <div className="flex items-center my-5">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="px-3 text-sm text-gray-400">OR</span>
            <div className="flex-grow border-t border-gray-600"></div>
          </div>

          {/* Google button */}
          <button
            onClick={() =>
              (window.location.href = `${import.meta.env.VITE_AUTH_SERVICE_URL}/auth/google?mode=register`)
            }
            aria-label="Continue with Google"
            className="w-full flex items-center justify-center gap-2 
              bg-dark-indigo text-gray-200 border border-faint-greyish-overlay 
              py-2 px-3 rounded-md font-medium 
              hover:bg-[#2f2f4a] active:bg-[#181628] 
              transition-all duration-200 cursor-pointer hover:scale-[1.02]"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Continue with Google
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-dark-navy-purple w-[90%] sm:w-full max-w-md mx-auto p-6 sm:p-8 rounded-xl shadow-lg border border-navbar-border transition-shadow hover:shadow-xl">
          <h1 className="text-xl md:text-2xl font-bold text-center mb-6">
            Verify Your Email
          </h1>

          <form onSubmit={handleVerify} className="flex flex-col gap-3 mt-4">
            <InputField
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              required
              disabled={verifyDisabled}
            />

            <button
              type="submit"
              disabled={verifyDisabled}
              className={`mt-3 w-full py-2 rounded-md font-semibold transition duration-200 cursor-pointer ${
                verifyDisabled
                  ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
              }`}
            >
              {verifyDisabled ? "OTP Expired" : "Verify OTP & Register"}
            </button>
          </form>

          <p className="text-sm text-gray-400 mt-3 text-center">
            OTP will expire in{" "}
            <span className="text-white font-semibold">{timer}</span> second(s)
          </p>

          <button
            type="button"
            onClick={handleResendOTP}
            disabled={isResending}
            className="mt-4 w-full bg-dark-indigo text-gray-200 border border-faint-greyish-overlay py-2 px-3 rounded-md font-medium hover:bg-[#2f2f4a] active:bg-[#181628] transition-all duration-200 cursor-pointer hover:scale-[1.02]"
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Register;
