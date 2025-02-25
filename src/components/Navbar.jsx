import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiUser, FiPlusCircle, FiLogOut, FiUserCheck, FiEdit3 } from "react-icons/fi";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Navbar = () => {
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setWishlistCount(docSnap.data().wishlist?.length || 0);
          }
        } catch (error) {
          console.error("Error fetching wishlist:", error);
        }
      } else {
        setWishlistCount(0);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white bg-opacity-90 border-b border-gray-200 z-50">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        <Link to="/" className="text-2xl font-bold text-purple-700">
          MUJ Thriftz
        </Link>

        <div className="hidden md:flex space-x-6">
          <Link to="/products" className="text-gray-600 hover:text-purple-700 transition-colors">
            Buy & Sell
          </Link>
          <Link to="/borrow" className="text-gray-600 hover:text-purple-700 transition-colors">
            Borrow & Lend
          </Link>
          <Link to="/requests" className="text-gray-600 hover:text-purple-700 transition-colors">
            Requests
          </Link>
          <Link to="/contact" className="text-gray-600 hover:text-purple-700 transition-colors">
            Contact
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <Link to="/wishlist" className="relative group">
              <FiHeart className="text-gray-600 text-2xl transition-colors group-hover:text-red-600" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="relative group">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-purple-700 transition">
                <FiUser className="text-2xl" />
                <span>{user.displayName || "Profile"}</span>
              </button>
              <div className="absolute right-0 mt-2 w-52 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link to="/profile" className="flex items-center px-4 py-2 hover:bg-gray-100">
                  <FiUserCheck className="mr-2" /> My Profile
                </Link>
                <Link to="/create-listing" className="flex items-center px-4 py-2 hover:bg-gray-100">
                  <FiPlusCircle className="mr-2" /> Create a Listing
                </Link>
                <Link to="/create-request" className="flex items-center px-4 py-2 hover:bg-gray-100">
                  <FiEdit3 className="mr-2" /> Create a Request
                </Link>
                <button onClick={handleLogout} className="flex items-center w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
                  <FiLogOut className="mr-2" /> Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:scale-105 transition-transform">
              Login / Sign Up
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
