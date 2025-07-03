import React, { useState, useRef } from "react";
import emailjs from '@emailjs/browser';
import { motion, AnimatePresence } from "framer-motion";
import { FaPaperPlane, FaEnvelope, FaInstagram, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { FiAlertCircle, FiCheckCircle, FiCopy, FiCheck } from "react-icons/fi";

const SOCIALS = [
  { icon: FaInstagram, label: 'Instagram', url: 'https://www.instagram.com/muj_thriftz/' },
  { icon: FaLinkedin, label: 'LinkedIn', url: 'https://linkedin.com/company/mujthriftz' },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState({ submitting: false, error: null, success: null });
  const [copied, setCopied] = useState(false);
  const formRef = useRef();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendEmail = (e) => {
    e.preventDefault();
    setStatus({ submitting: true, error: null, success: null });
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ submitting: false, error: "Please fill in all required fields.", success: null });
      return;
    }
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      setStatus({ submitting: false, error: "Please enter a valid email address.", success: null });
      return;
    }
    emailjs.sendForm(
      'service_9toub17',
      'template_sxkm50c',
      formRef.current,
      'KnW74zjkGTLX8MjqW'
    )
      .then(() => {
        setStatus({ submitting: false, error: null, success: "Message sent! We'll get back to you soon. 🎉" });
        setFormData({ name: "", email: "", subject: "", message: "" });
      }, () => {
        setStatus({ submitting: false, error: "Oops! Something went wrong. Please try again later.", success: null });
      });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText('mujthriftz@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-white px-2 py-10 flex items-center justify-center overflow-hidden"
    >
      {/* Animated Background Blobs */}
      <motion.div
        className="absolute top-0 left-0 w-72 h-72 bg-purple-200 rounded-full opacity-30 blur-2xl z-0"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-10 right-0 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl z-0"
        animate={{ x: [0, -60, 0], y: [0, -40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 w-40 h-40 bg-purple-300 rounded-full opacity-25 blur-2xl z-0"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="w-full max-w-5xl mx-auto z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 80, damping: 12, delay: 0.1 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="inline-flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-full w-20 h-20 shadow-lg mb-4 animate-float"
          >
            <FaEnvelope className="text-5xl" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We love hearing from you! Whether you have a question, feedback, or just want to say hi, our team is here to help. Fill out the form or reach out directly.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
          {/* Contact Form Card */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 14, delay: 0.2 }}
            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-10 flex flex-col justify-center relative"
          >
            <AnimatePresence>
              {status.success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 rounded-2xl z-20"
                >
                  <FiCheckCircle className="text-green-500 text-5xl mb-2 animate-bounce" />
                  <div className="text-lg font-semibold text-green-700 mb-2">{status.success}</div>
                  <div className="text-sm text-gray-500">We'll reply to your email soon!</div>
                </motion.div>
              )}
            </AnimatePresence>
            <form ref={formRef} onSubmit={sendEmail} className="space-y-7 relative z-10">
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="peer w-full p-4 pt-6 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-transparent"
                  placeholder="Your name"
                  required
                />
                <label className="absolute left-4 top-4 text-gray-500 text-base transition-all duration-200 pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-xs peer-focus:text-purple-600 bg-white px-1">
                  Name *
                </label>
              </div>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="peer w-full p-4 pt-6 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-transparent"
                  placeholder="your.email@example.com"
                  required
                />
                <label className="absolute left-4 top-4 text-gray-500 text-base transition-all duration-200 pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-xs peer-focus:text-purple-600 bg-white px-1">
                  Email *
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="peer w-full p-4 pt-6 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-transparent"
                  placeholder="What's this about?"
                />
                <label className="absolute left-4 top-4 text-gray-500 text-base transition-all duration-200 pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-xs peer-focus:text-purple-600 bg-white px-1">
                  Subject
                </label>
              </div>
              <div className="relative">
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="peer w-full p-4 pt-6 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-transparent resize-none"
                  placeholder="Your message here..."
                  required
                ></textarea>
                <label className="absolute left-4 top-4 text-gray-500 text-base transition-all duration-200 pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-xs peer-focus:text-purple-600 bg-white px-1">
                  Message *
                </label>
              </div>
              {status.error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="mb-2 p-3 bg-red-50 text-red-700 rounded-lg flex items-center"
                >
                  <FiAlertCircle className="mr-2" /> {status.error}
                </motion.div>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={status.submitting}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-lg font-semibold flex items-center justify-center hover:shadow-lg transition-all text-lg"
              >
                {status.submitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  <>
                    <FaPaperPlane className="mr-2" /> Send Message
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Info Card */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 14, delay: 0.3 }}
            className="bg-gradient-to-br from-blue-600 to-purple-700 p-10 rounded-2xl text-white flex flex-col justify-center shadow-2xl relative"
          >
            <div className="text-center mb-6">
              <FaEnvelope className="text-5xl mx-auto mb-3 opacity-90" />
              <h2 className="text-2xl font-bold mb-1">Email Us Directly</h2>
              <p className="mb-4 opacity-90">Prefer to write directly?</p>
              <div className="flex items-center justify-center gap-2 mb-2">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  onClick={handleCopy}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium transition-all text-black"
                  title="Copy email"
                >
                  mujthriftz@gmail.com
                  {copied ? <FiCheck className="ml-1 text-green-600" /> : <FiCopy className="ml-1" />}
                </motion.button>
                <span className="bg-white/20 text-xs text-black px-2 py-1 rounded-full ml-2">Avg. response: &lt;24h</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4 mt-4">
              <div className="flex gap-4">
                {SOCIALS.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.15, rotate: 6 }}
                    className="bg-white/20 hover:bg-white/30 p-3 rounded-full text-2xl text-white transition-all shadow-lg"
                    title={social.label}
                  >
                    <social.icon />
                  </motion.a>
                ))}
              </div>
            </div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-10 pt-8 border-t border-white border-opacity-20"
            >
              <h3 className="font-bold text-lg mb-3">What happens next?</h3>
              <ul className="space-y-2 opacity-90">
                <li className="flex items-start">
                  <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 text-black">1</span>
                  <span>You send us a message</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 text-black">2</span>
                  <span>We get back to you within 24 hours</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 text-black">3</span>
                  <span>We solve your problem together</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Contact;