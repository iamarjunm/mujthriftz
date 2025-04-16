import React from "react";
import { motion } from "framer-motion";

const Footer = () => {

  const footerLinks = [
    { title: "About Us", url: "/about" },
    { title: "Terms of Service", url: "/terms" },
    { title: "Privacy Policy", url: "/privacy" },
    { title: "FAQ", url: "/faq" },
    { title: "Contact", url: "/contact" }
  ];

  return (
    <motion.footer 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-12 px-4"
    >
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo and description */}
          <div className="md:col-span-2">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="text-3xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-yellow-300 bg-clip-text text-transparent"
            >
              MUJ Thriftz
            </motion.div>
            <p className="text-purple-100 mb-4">
              The ultimate marketplace for MUJ students to buy, sell, and borrow items within campus.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              {footerLinks.slice(0, 3).map((link, index) => (
                <motion.li 
                  key={index}
                  whileHover={{ x: 5 }}
                >
                  <a 
                    href={link.url} 
                    className="text-purple-100 hover:text-white transition-colors"
                  >
                    {link.title}
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.slice(3).map((link, index) => (
                <motion.li 
                  key={index}
                  whileHover={{ x: 5 }}
                >
                  <a 
                    href={link.url} 
                    className="text-purple-100 hover:text-white transition-colors"
                  >
                    {link.title}
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-purple-500 my-6"></div>

        {/* Copyright */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-purple-100 mb-4 md:mb-0">
            © {new Date().getFullYear()} MUJ Thriftz. All rights reserved.
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-purple-100">Made with</span>
            <motion.span 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-pink-400"
            >
              ❤️
            </motion.span>
            <span className="text-purple-100">by MUJ Students</span>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;