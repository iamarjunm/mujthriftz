import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight, FiSearch, FiHeart, FiClock, FiDollarSign } from "react-icons/fi";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { client, urlFor } from "../sanityClient";

const Home = () => {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In your useEffect hook, replace the fetchTrendingProducts function with:
const fetchTrendingProducts = async () => {
  try {
    const query = `*[_type == "productListing" && isAvailable == true] | order(_createdAt desc)[0...3]{
      _id,
      title,
      description,
      category,
      condition,
      price,
      rentalRate,
      listingType,
      productAge,
      images,
      isAnonymous,
      anonymousName,
      seller->{
        _id,
        fullName,
        profileImage
      },
      tags,
      _createdAt
    }`;
    const data = await client.fetch(query);
    setTrendingProducts(data);
  } catch (err) {
    console.error("Error fetching products:", err);
  } finally {
    setLoading(false);
  }
};
  
    fetchTrendingProducts();
  }, []);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-purple-50 via-blue-50 to-gray-50 text-gray-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-20"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-7xl lg:text-8xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 mb-6"
          >
            MUJ THRIFTZ
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10"
          >
            The sustainable marketplace for MUJ students. Buy, sell, borrow, and request items within our campus community.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link
              to="/products"
              className="relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:shadow-xl transition-all group overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Explore Listings <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            
            <Link
              to="/create-request"
              className="relative px-8 py-4 bg-white text-purple-600 border-2 border-purple-600 font-bold rounded-xl hover:bg-purple-50 transition-all group overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Make a Request <FiSearch className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              Hot Deals on Campus
            </h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
              Recently listed items that are getting lots of attention
            </p>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-100 rounded-xl h-96 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <motion.div 
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-8"
            >
              {trendingProducts.map((product) => (
  <motion.div key={product._id} variants={item}>
    <ProductCard 
      item={product}
      type={product.listingType === 'lend' ? 'borrow' : 'product'}
      isInWishlist={false}
      onToggleWishlist={() => {}}
      getProductAge={(age) => {
        if (!age) return "New";
        const { years, months } = age;
        if (years === 0 && months === 0) return "New";
        if (years === 0) return `${months} month${months > 1 ? 's' : ''}`;
        if (months === 0) return `${years} year${years > 1 ? 's' : ''}`;
        return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
      }}
      formatRentalRate={(rate) => {
        if (!rate) return "Rate not specified";
        const durationMap = { hour: "hr", day: "day", week: "wk", month: "mo" };
        return `₹${rate.amount?.toLocaleString()}/${durationMap[rate.duration]}`;
      }}
    />
  </motion.div>
))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              MUJ Exclusive Categories
            </h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
              Find exactly what you need from these campus-specific categories
            </p>
          </motion.div>

          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
  { 
    icon: "📚", 
    name: "Textbooks & Study Materials", 
    desc: "Buy, sell or exchange course materials",
    color: "from-purple-500 to-indigo-500",
    link: "/products",
    action: "Browse"
  },
  { 
    icon: "🛠", 
    name: "Lab Equipment", 
    desc: "Specialized equipment for engineering students",
    color: "from-blue-500 to-cyan-500",
    link: "/products",
    action: "Browse"
  },
  { 
    icon: "🏠", 
    name: "Roommate Finder", 
    desc: "Connect with potential roommates",
    color: "from-green-500 to-teal-500",
    link: "/create-request",
    action: "Create Request"
  }
].map((category, index) => (
  <motion.div key={index} variants={item}>
    <Link 
      to={category.link}
      className="block group"
    >
      <div className="h-full bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${category.color}`}></div>
        <div className="p-6 text-center">
          <span className="text-4xl mb-4 inline-block">{category.icon}</span>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{category.name}</h3>
          <p className="text-gray-600">{category.desc}</p>
          <div className="mt-4 text-purple-600 font-medium flex items-center justify-center gap-1">
            {category.action}
            <FiArrowRight className="transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
))}

          </motion.div>
        </div>
      </section>

      {/* Sustainability Section
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl p-8 md:p-12 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-3xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <FaLeaf className="text-2xl" />
                  <span className="font-bold tracking-wider">SUSTAINABLE CAMPUS</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Reduce, Reuse, Recycle at MUJ</h2>
                <p className="text-lg mb-6 opacity-90">
                  By buying and selling used items, our community has saved over 5,000kg of CO₂ emissions this semester alone. 
                  Join the movement towards a more sustainable campus!
                </p>
                <div className="flex flex-wrap gap-4 mb-8">
                  {[
                    { icon: <FaRecycle className="text-xl" />, value: "5,000+", label: "Items Recycled" },
                    { icon: <FaRupeeSign className="text-xl" />, value: "₹2M+", label: "Saved by Students" },
                    { icon: <FaHandsHelping className="text-xl" />, value: "1,200+", label: "Transactions" }
                  ].map((stat, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/20 backdrop-blur-sm px-6 py-4 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-full">
                          {stat.icon}
                        </div>
                        <div>
                          <div className="font-bold text-xl">{stat.value}</div>
                          <div className="text-sm opacity-80">{stat.label}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 bg-white text-green-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                >
                  Learn About Our Impact
                  <FiArrowRight />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Borrow/Lend Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row items-center gap-8 bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="md:w-1/2 p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
                Need Something Temporarily?
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                Borrow textbooks, lab equipment, or even formal wear for events. 
                Or earn money by lending items you're not currently using!
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/borrow"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  Browse Rentals <FiArrowRight />
                </Link>
                <Link
                  to="/create-listing"
                  className="px-6 py-3 bg-white text-purple-600 border-2 border-purple-600 font-bold rounded-lg hover:bg-purple-50 transition-all flex items-center gap-2"
                >
                  List an Item <FiArrowRight />
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 h-64 md:h-auto bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80)] bg-cover bg-center"></div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Join the MUJ Thriftz Community?</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Whether you're looking to save money, earn some extra cash, or just live more sustainably, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/login"
                className="px-8 py-4 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
              >
                Sign Up Now <FiArrowRight />
              </Link>
              <Link
                to="/products"
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                Browse Listings <FiSearch />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              What Students Say
            </h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
              Join thousands of MUJ students who've saved money and made connections
            </p>
          </motion.div>

          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                quote: "Saved ₹8,000 on textbooks this semester! The condition was like new.",
                author: "Rahul, CSE 3rd Year",
                rating: "★★★★★"
              },
              {
                quote: "Found the perfect lab equipment for my project at half the retail price.",
                author: "Priya, ECE 2nd Year",
                rating: "★★★★☆"
              },
              {
                quote: "Met my current roommate through this platform. Best decision ever!",
                author: "Amit, ME 1st Year",
                rating: "★★★★★"
              }
            ].map((testimonial, index) => (
              <motion.div key={index} variants={item}>
                <div className="bg-gray-50 rounded-xl p-6 h-full flex flex-col">
                  <div className="text-amber-400 mb-4 text-xl">{testimonial.rating}</div>
                  <p className="text-gray-700 mb-6 flex-grow">"{testimonial.quote}"</p>
                  <div className="text-purple-600 font-medium">{testimonial.author}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;