import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate for redirection

const Login = () => {
  // State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");

  // Navigation hook
  const navigate = useNavigate();

  // Refs for animations
  const containerEl = useRef(null);

  // Firebase Google Auth Provider
  const googleProvider = new GoogleAuthProvider();

  // GSAP Animation Effect
  useEffect(() => {
    gsap.fromTo(
      containerEl.current,
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
    );
  }, []);

  // Listen for auth state changes & redirect if logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/"); // ✅ Redirect to home page when user logs in
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Handle Login & Signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/"); // ✅ Redirect after login/signup
    } catch (err) {
      setError(err.message);
    }
  };

  // Google Login
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/"); // ✅ Redirect after Google login
    } catch (err) {
      setError(err.message);
    }
  };

  // Forgot Password
  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setError("Password reset link sent to your email.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
      <div
        ref={containerEl}
        className="w-96 p-8 bg-white/70 shadow-lg backdrop-blur-lg rounded-xl border border-gray-200"
      >
        <h2 className="text-center text-2xl font-semibold text-purple-700 mb-2">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>

        {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            required
          />

          {/* Forgot Password */}
          {!isSignUp && (
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-purple-600 text-sm underline hover:text-purple-800 transition"
            >
              Forgot Password?
            </button>
          )}

          {/* Submit Button */}
          <button className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold">
            {isSignUp ? "Sign Up" : "Login"}
          </button>
        </form>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full p-3 mt-3 bg-red-500 text-white rounded-lg flex justify-center items-center hover:bg-red-600 transition font-semibold"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png"
            alt="Google Logo"
            className="w-5 h-5 mr-2"
          />
          Continue with Google
        </button>

        {/* Toggle Login & Sign Up */}
        <p className="text-center text-sm mt-4 text-gray-600">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-purple-600 font-semibold underline hover:text-purple-800 transition"
          >
            {isSignUp ? "Login" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
