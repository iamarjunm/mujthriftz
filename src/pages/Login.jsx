import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { syncUserProfile } from "../utils/syncUserProfile";

const Login = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false); // New loading state

  const navigate = useNavigate();
  const containerEl = useRef(null);
  const googleProvider = new GoogleAuthProvider();

  useEffect(() => {
    gsap.fromTo(
      containerEl.current,
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
    );
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true);
        try {
          await syncUserProfile(user);
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserName(userDoc.data().fullName);
          } else {
            setUserName(user.displayName || "User");
          }
          navigate("/");
        } finally {
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const getFriendlyErrorMessage = (errorCode) => {
    const errorMessages = {
      "auth/email-already-in-use": "This email is already in use.",
      "auth/invalid-email": "Invalid email format.",
      "auth/weak-password": "Password should be at least 6 characters.",
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Incorrect password. Try again.",
      "auth/too-many-requests": "Too many attempts. Try again later.",
      default: "Something went wrong. Please try again.",
    };
    return errorMessages[errorCode] || errorMessages.default;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: fullName });

        await setDoc(doc(db, "users", user.uid), {
          fullName,
          email,
          wishlist: [],
        });

        await syncUserProfile(user);
        setUserName(fullName);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/");
    } catch (err) {
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await syncUserProfile(user);
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          fullName: user.displayName || "User",
          email: user.email,
          wishlist: [],
        });
      }

      setUserName(user.displayName || "User");
      navigate("/");
    } catch (err) {
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email first.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setError("Password reset link sent to your email.");
    } catch (err) {
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}

      <div
        ref={containerEl}
        className={`w-96 p-8 bg-white/70 shadow-lg backdrop-blur-lg rounded-xl border border-gray-200 relative ${
          loading ? "opacity-70" : ""
        }`}
      >
        <h2 className="text-center text-2xl font-semibold text-purple-700 mb-2">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>

        {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {isSignUp && (
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              required
              disabled={loading}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            required
            disabled={loading}
          />

          {!isSignUp && (
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-purple-600 text-sm underline hover:text-purple-800 transition"
              disabled={loading}
            >
              Forgot Password?
            </button>
          )}

          <button 
            className={`w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isSignUp ? "Creating Account..." : "Logging In..."}
              </span>
            ) : (
              isSignUp ? "Sign Up" : "Login"
            )}
          </button>
        </form>

        <button
          onClick={handleGoogleLogin}
          className={`w-full p-3 mt-3 bg-red-500 text-white rounded-lg flex justify-center items-center hover:bg-red-600 transition font-semibold ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          <img
            src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
            alt="Google Logo"
            className="w-5 h-5 mr-2"
          />
          Continue with Google
        </button>

        <p className="text-center text-sm mt-4 text-gray-600">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-purple-600 font-semibold underline hover:text-purple-800 transition"
            disabled={loading}
          >
            {isSignUp ? "Login" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;