import React, { useState, useRef } from "react";
import emailjs from '@emailjs/browser';
import { motion } from "framer-motion";
import { FaPaperPlane, FaEnvelope } from "react-icons/fa";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState({
    submitting: false,
    error: null,
    success: null
  });

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

    // Using EmailJS
    emailjs.sendForm(
      'service_9toub17', 
      'template_sxkm50c', 
      formRef.current, 
      'KnW74zjkGTLX8MjqW'
    )
    .then((result) => {
      setStatus({ submitting: false, error: null, success: "Message sent successfully! We'll get back to you soon. ✅" });
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    }, (error) => {
      setStatus({ submitting: false, error: "Oops! Something went wrong. Please try again later.", success: null });
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-12 flex items-center justify-center"
    >
      <div className="w-full max-w-4xl mx-auto">
        <motion.div 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300"
        >
          <motion.h1 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-4xl font-bold text-center text-gray-800 mb-2"
          >
            Let's Connect
          </motion.h1>
          <p className="text-center text-gray-600 mb-8">
            Have something to say? Fill out the form below or email us directly.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              {status.error && (
                <motion.div 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center"
                >
                  <FiAlertCircle className="mr-2" /> {status.error}
                </motion.div>
              )}

              {status.success && (
                <motion.div 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center"
                >
                  <FiCheckCircle className="mr-2" /> {status.success}
                </motion.div>
              )}

              <form ref={formRef} onSubmit={sendEmail} className="space-y-5">
                <div className="space-y-1">
                  <label className="block text-gray-700 font-medium">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-gray-700 font-medium">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-gray-700 font-medium">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What's this about?"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-gray-700 font-medium">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message here..."
                    rows="5"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  ></textarea>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={status.submitting}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-lg font-medium flex items-center justify-center hover:shadow-lg transition-all"
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
            </div>

            {/* Email Info */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-blue-600 to-purple-700 p-8 rounded-2xl text-white flex flex-col justify-center"
            >
              <div className="text-center">
                <FaEnvelope className="text-5xl mx-auto mb-4 opacity-90" />
                <h2 className="text-2xl font-bold mb-2">Email Us Directly</h2>
                <p className="mb-6 opacity-90">Prefer to write directly?</p>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  href="mailto:mujthriftz@gmail.com"
                  className="inline-block bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-lg font-medium transition-all text-black"
                >
                  mujthriftz@gmail.com
                </motion.a>
              </div>

              <motion.div 
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 pt-8 border-t border-white border-opacity-20"
              >
            <h3 className="font-bold text-lg mb-3">What happens next?</h3>
              <ul className="space-y-2 opacity-90">
                <li className="flex items-start">
                  <span className="bg-white bg-opacity-20 rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 text-black">1</span>
                  <span>You send us a message</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-white bg-opacity-20 rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 text-black">2</span>
                  <span>We get back to you within 24 hours</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-white bg-opacity-20 rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 text-black">3</span>
                  <span>We solve your problem together</span>
                </li>
              </ul>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Contact;