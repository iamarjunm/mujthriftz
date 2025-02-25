import React from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-purple-50 to-blue-50 text-gray-800">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-purple-700 mb-4 animate-fadeIn">
          MUJ THRIFTZ
        </h1>
        <p className="text-xl text-gray-600 mb-8 animate-slideUp">
          Your Campus Thrift Store – Sustainable, Affordable, Trendy
        </p>
        <Link
          to="/products"
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:scale-105 transition-transform animate-bounce"
        >
          Explore Listings
        </Link>
      </section>

      {/* MUJ Exclusive Categories */}
      <section className="max-w-6xl mx-auto my-16 px-6">
        <h2 className="text-3xl font-bold text-center text-purple-800 mb-6">MUJ Exclusive Categories</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: "📚", name: "Textbooks & Study Materials" },
            { icon: "🛠", name: "Lab Equipment" },
            { icon: "🏠", name: "Roommate Finder" }
          ].map((category, index) => (
            <div key={index} className="p-6 bg-white shadow-lg rounded-lg text-center hover:shadow-xl transition">
              <h3 className="text-xl font-semibold text-purple-600">{category.icon} {category.name}</h3>
              <p className="text-gray-600 mt-2">Find or list items under this category.</p>
            </div>
          ))}
        </div>
      </section>

      {/* Borrow & Lend Section */}
      <section className="max-w-6xl mx-auto my-16 px-6 bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center text-purple-800 mb-6">Need Something Temporarily?</h2>
        <p className="text-lg text-gray-600 text-center mb-6">
          Borrow or lend books, project materials, and gadgets!
        </p>
        <div className="flex justify-center">
          <Link to="/borrow" className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:scale-105 transition-transform">
            Borrow or Lend Now
          </Link>
        </div>
      </section>

      {/* Wishlist & Requests */}
      <section className="max-w-6xl mx-auto my-16 px-6">
        <h2 className="text-3xl font-bold text-center text-purple-800 mb-6">Wishlist & Item Requests</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            { icon: "🌟", title: "Wishlist", desc: "Save items for later & get notified about price drops.", link: "/wishlist" },
            { icon: "📢", title: "Item Requests", desc: "Looking for something specific? Post a request.", link: "/requests" }
          ].map((item, index) => (
            <div key={index} className="p-6 bg-white shadow-lg rounded-lg text-center hover:shadow-xl transition">
              <h3 className="text-xl font-semibold text-purple-600">{item.icon} {item.title}</h3>
              <p className="text-gray-600 mt-2">{item.desc}</p>
              <Link to={item.link} className="text-purple-600 font-semibold mt-4 inline-block">
                {item.title === "Wishlist" ? "View Wishlist" : "Post a Request"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="max-w-6xl mx-auto my-16 px-6">
        <h2 className="text-3xl font-bold text-center text-purple-800 mb-6">Trending Products</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white shadow-lg rounded-lg p-4 hover:scale-105 transition-transform cursor-pointer"
            >
              <img
                src={`https://picsum.photos/300/200?random=${i}`}
                alt={`Product ${i}`}
                className="w-full rounded-lg"
              />
              <h3 className="text-lg font-semibold text-gray-800 mt-3">Item {i}</h3>
              <p className="text-gray-600">Best deal for students!</p>
              <button className="bg-purple-600 text-white px-4 py-2 rounded mt-3 w-full hover:bg-purple-700">
                View Product
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
