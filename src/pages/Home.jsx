import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { 
  FiArrowRight, 
  FiSearch, 
  FiHeart, 
  FiClock, 
  FiDollarSign, 
  FiTrendingUp,
  FiUsers,
  FiShield,
  FiZap,
  FiStar,
  FiShoppingBag,
  FiBookOpen,
  FiTool,
  FiHome,
  FiGift,
  FiAward,
  FiTarget,
  FiCheckCircle
} from "react-icons/fi";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { client, urlFor } from "../sanityClient";

const Home = () => {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, 50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const springConfig = { damping: 20, stiffness: 100 };
  const springY1 = useSpring(y1, springConfig);
  const springY2 = useSpring(y2, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
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

  // Floating animation variants
  const floatingAnimation = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const pulseAnimation = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const rotateAnimation = {
    animate: {
      rotate: [0, 360],
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  // Stagger animation for cards
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.8
    },
    show: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-purple-50 via-white to-blue-50 text-gray-900 overflow-x-hidden">
      {/* <Navbar /> -- removed to prevent duplicate navbars */}

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-purple-200 rounded-full opacity-30 blur-xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-40 left-1/4 w-16 h-16 bg-purple-300 rounded-full opacity-25 blur-lg"
          animate={{
            x: [0, 60, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute inset-0 z-0">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full blur-3xl"
            style={{ y: springY1 }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/15 to-purple-400/15 rounded-full blur-3xl"
            style={{ y: springY2 }}
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          {/* Floating Icons */}
          <motion.div
            className="absolute top-10 left-10 text-purple-400 text-4xl opacity-60"
            variants={floatingAnimation}
            animate="animate"
          >
            <FiShoppingBag />
          </motion.div>
          <motion.div
            className="absolute top-20 right-20 text-blue-400 text-3xl opacity-60"
            variants={floatingAnimation}
            animate="animate"
            style={{ animationDelay: "1s" }}
          >
            <FiHeart />
          </motion.div>
          <motion.div
            className="absolute bottom-20 left-20 text-purple-400 text-3xl opacity-60"
            variants={floatingAnimation}
            animate="animate"
            style={{ animationDelay: "2s" }}
          >
            <FiStar />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <motion.span
              className="inline-block px-6 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 font-semibold rounded-full text-sm border border-purple-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🚀 MUJ's Premier Marketplace
            </motion.span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-7xl lg:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 mb-6 leading-tight"
          >
            MUJ
            <span className="block text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              THRIFTZ
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed"
          >
            The ultimate <span className="font-semibold text-purple-600">sustainable marketplace</span> for MUJ students. 
            <br className="hidden md:block" />
            Buy, sell, borrow, and request items within our vibrant campus community.
          </motion.p>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex justify-center gap-8 mb-12"
          >
            {[
              { icon: <FiUsers />, value: "1,000+", label: "Active Students" },
              { icon: <FiShield />, value: "100%", label: "Secure" },
              { icon: <FiCheckCircle />, value: "Campus Only", label: "Verified" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-2xl text-purple-500 mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
            className="flex flex-col sm:flex-row justify-center gap-6"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/products"
                className="relative px-10 py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl hover:shadow-2xl transition-all duration-300 group overflow-hidden block"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center justify-center gap-3 text-lg">
                  <FiShoppingBag className="text-xl" />
                  Explore Listings 
                  <FiArrowRight className="transition-transform group-hover:translate-x-2 duration-300" />
                </span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/create-request"
                className="relative px-10 py-5 bg-white text-purple-600 border-2 border-purple-600 font-bold rounded-2xl hover:bg-purple-50 transition-all duration-300 group overflow-hidden block shadow-lg hover:shadow-xl"
              >
                <span className="relative z-10 flex items-center justify-center gap-3 text-lg">
                  <FiSearch className="text-xl" />
                  Make a Request 
                  <FiArrowRight className="transition-transform group-hover:translate-x-2 duration-300" />
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-20 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-50/50 to-transparent"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-block mb-4"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                <FiTrendingUp className="text-white text-2xl" />
              </div>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
              Hot Deals on Campus
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Recently listed items that are getting lots of attention from our community
            </p>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <motion.div 
                  key={i} 
                  className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl h-96 animate-pulse"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                />
              ))}
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-8"
            >
              {trendingProducts.map((product, index) => (
                <motion.div 
                  key={product._id} 
                  variants={cardVariants}
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
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
      <section className="py-20 bg-gradient-to-br from-purple-50 via-white to-blue-50 relative">
        <div className={`absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-50`}></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-block mb-4"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                <FiTarget className="text-white text-2xl" />
              </div>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
              MUJ Exclusive Categories
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Find exactly what you need from these campus-specific categories
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { 
                icon: <FiBookOpen />, 
                name: "Textbooks & Study Materials", 
                desc: "Buy, sell or exchange course materials",
                color: "from-purple-500 to-indigo-500",
                gradient: "from-purple-100 to-indigo-100",
                link: "/products",
                action: "Browse",
                count: "500+ items"
              },
              { 
                icon: <FiTool />, 
                name: "Lab Equipment", 
                desc: "Specialized equipment for engineering students",
                color: "from-blue-500 to-cyan-500",
                gradient: "from-blue-100 to-cyan-100",
                link: "/products",
                action: "Browse",
                count: "200+ items"
              },
              { 
                icon: <FiHome />, 
                name: "Roommate Finder", 
                desc: "Connect with potential roommates",
                color: "from-green-500 to-teal-500",
                gradient: "from-green-100 to-teal-100",
                link: "/create-request",
                action: "Create Request",
                count: "50+ requests"
              }
            ].map((category, index) => (
              <motion.div 
                key={index} 
                variants={cardVariants}
                whileHover={{ y: -12, scale: 1.04, boxShadow: "0 8px 32px 0 rgba(139,92,246,0.15)" }}
                transition={{ type: "spring", stiffness: 300 }}
                className="h-full"
              >
                <Link 
                  to={category.link}
                  className="block group h-full"
                >
                  <div className="min-h-[22rem] h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col justify-between">
                    <div>
                      <div className={`h-1 bg-gradient-to-r ${category.color}`}></div>
                      <div className="p-8 text-center flex flex-col items-center justify-center">
                        <motion.div
                          className={`w-20 h-20 bg-gradient-to-r ${category.gradient} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 animate-float`}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <div className={`text-3xl bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                            {category.icon}
                          </div>
                        </motion.div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2 mt-2">{category.name}</h3>
                        <p className="text-gray-600 mb-4 min-h-[2.5rem]">{category.desc}</p>
                        <div className="text-sm text-purple-500 font-medium mb-2">{category.count}</div>
                      </div>
                    </div>
                    <div className="px-8 pb-8 flex justify-center">
                      <div className="w-full">
                        <div className="text-purple-600 font-semibold flex items-center justify-center gap-2 group-hover:gap-3 transition-all duration-300">
                          {category.action}
                          <FiArrowRight className="transition-transform group-hover:translate-x-2 duration-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-block mb-4"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                <FiZap className="text-white text-2xl" />
              </div>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
              Why Choose MUJ Thriftz?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Experience the best marketplace designed specifically for MUJ students
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              {
                icon: <FiShield />,
                title: "100% Secure",
                desc: "Verified student accounts and secure transactions"
              },
              {
                icon: <FiTrendingUp />,
                title: "Best Prices",
                desc: "Save up to 80% compared to retail prices"
              },
              {
                icon: <FiUsers />,
                title: "Campus Community",
                desc: "Connect with fellow MUJ students only"
              },
              {
                icon: <FiGift />,
                title: "Sustainable",
                desc: "Reduce waste and promote circular economy"
              }
            ].map((feature, index) => (
              <motion.div 
                key={index} 
                variants={cardVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-center group"
              >
                <motion.div
                  className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="text-white text-2xl">
                    {feature.icon}
                  </div>
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Borrow/Lend Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 relative">
        <div className={`absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-50`}></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col lg:flex-row items-center gap-12 bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="lg:w-1/2 p-12">
              <motion.div
                className="inline-block mb-6"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                  <FiGift className="text-white text-2xl" />
                </div>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
                Need Something Temporarily?
              </h2>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Borrow textbooks, lab equipment, or even formal wear for events. 
                Or earn money by lending items you're not currently using!
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/borrow"
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300 flex items-center gap-3"
                  >
                    <FiShoppingBag />
                    Browse Rentals 
                    <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/create-listing"
                    className="px-8 py-4 bg-white text-purple-600 border-2 border-purple-600 font-bold rounded-xl hover:bg-purple-50 transition-all duration-300 flex items-center gap-3"
                  >
                    <FiGift />
                    List an Item 
                    <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              </div>
            </div>
            <div className="lg:w-1/2 h-80 lg:h-auto bg-gradient-to-br from-blue-400 to-purple-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center opacity-20"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/50 to-purple-600/50"></div>
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="text-white text-center">
                  <FiUsers className="text-6xl mb-4 mx-auto opacity-80" />
                  <p className="text-xl font-semibold">Join the Community</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-blue-600 text-white relative overflow-hidden">
        <div className={`absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-50`}></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-block mb-6"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto">
                <FiAward className="text-white text-3xl" />
              </div>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Join the MUJ Thriftz Community?</h2>
            <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto leading-relaxed">
              Whether you're looking to save money, earn some extra cash, or just live more sustainably, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/login"
                  className="px-10 py-5 bg-white text-purple-600 font-bold rounded-2xl hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg"
                >
                  <FiCheckCircle />
                  Sign Up Now 
                  <FiArrowRight />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/products"
                  className="px-10 py-5 bg-transparent border-2 border-white text-white font-bold rounded-2xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3 text-lg"
                >
                  <FiSearch />
                  Browse Listings 
                  <FiArrowRight />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-block mb-4"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                <FiStar className="text-white text-2xl" />
              </div>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
              What Students Say
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Join thousands of MUJ students who've saved money and made connections
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                quote: "Saved ₹8,000 on textbooks this semester! The condition was like new.",
                author: "Rahul, CSE 3rd Year",
                rating: "★★★★★",
                avatar: "👨‍🎓"
              },
              {
                quote: "Found the perfect lab equipment for my project at half the retail price.",
                author: "Priya, ECE 2nd Year",
                rating: "★★★★★",
                avatar: "👩‍🎓"
              },
              {
                quote: "Met my current roommate through this platform. Best decision ever!",
                author: "Amit, ME 1st Year",
                rating: "★★★★★",
                avatar: "👨‍🎓"
              }
            ].map((testimonial, index) => (
              <motion.div 
                key={index} 
                variants={cardVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 h-full flex flex-col border border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="text-amber-400 mb-4 text-xl">{testimonial.rating}</div>
                  <p className="text-gray-700 mb-6 flex-grow text-lg leading-relaxed">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{testimonial.avatar}</div>
                    <div className="text-purple-600 font-semibold">{testimonial.author}</div>
                  </div>
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