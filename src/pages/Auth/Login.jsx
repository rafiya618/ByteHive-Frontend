import axios from "axios";
import React, { useState } from "react";
import { useAuth } from "../../context/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import InputField from "../../shared/InputField";
import { jwtDecode } from "jwt-decode";
import { validateEmail, validatePassword } from "../../helpers/validators";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  // =========================
  // 🔹 Handle Submit
  // =========================
  const HandleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    if (emailError) return toast.error(emailError);

    const passwordError = validatePassword(password);
    if (passwordError) return toast.error(passwordError);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_AUTH_SERVICE_URL}/auth/login`,
        { email, password }
      );

      const decoded = jwtDecode(res.data.token);
      setAuth({ token: res.data.token, user: decoded });
      localStorage.setItem("Auth", JSON.stringify({ token: res.data.token }));

      toast.success(res.data.message);
      navigate("/");
    } catch (error) {
      if (error.response?.status) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error in login: " + error.message);
      }
    }
  };

  // =========================
  // 🔹 UI
  // =========================
  return (
    <div className="bg-navbar-bg text-white w-full flex items-center justify-center min-h-screen px-4">
      <div className="bg-dark-navy-purple w-[90%] sm:w-full max-w-md mx-auto p-6 sm:p-8 rounded-xl shadow-lg border border-navbar-border transition-shadow hover:shadow-xl">
        <h1 className="text-xl md:text-2xl font-bold text-center mb-6">
          Login to Your Account
        </h1>

        {/* Login Form */}
        <form onSubmit={HandleSubmit} className="flex flex-col gap-3 mt-8">
          <InputField
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter Email"
            required
          />

          <InputField
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            required
          />

          <button
            type="submit"
            className="mt-3 w-full bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 py-2 rounded-md font-semibold transition duration-200 cursor-pointer"
          >
            Login
          </button>
        </form>

        {/* Forgot Password */}
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/forgot-password")}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Forgot Password?
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center my-5">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="px-3 text-sm text-gray-400">OR</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        {/* Google Login */}
        <button
          onClick={() =>
            (window.location.href = `${import.meta.env.VITE_AUTH_SERVICE_URL}/auth/google?mode=login`)
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
    </div>
  );
};

export default Login;
