import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PropTypes from 'prop-types';

const illustrations = {
  product: "🛒",    // Shopping Cart
  borrow: "🤝",     // Handshake
  request: "📢",    // Megaphone
  roommate: "🏠"    // House Building
};

const HeroSection = ({
  title,
  subtitle,
  ctaText,
  ctaLink,
  illustration = "product",
  children // for optional stats row or extra content
}) => {
  const currentIllustration = useMemo(() => {
    return illustrations[illustration] || illustrations.product;
  }, [illustration]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      // Ensures full viewport width
      className="relative overflow-hidden py-14 md:py-20 bg-gradient-to-br from-white via-blue-50 to-purple-50" // Soft, subtle background
      style={{
        width: '100vw',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
      }}
    >
      {/* Subtle background SVG remains, but with reduced opacity for minimalism */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ zIndex: 0 }}>
        <defs>
          <linearGradient id="heroGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
        <path fill="url(#heroGradient)" fillOpacity="0.05" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z" />
        <circle cx="1200" cy="80" r="120" fill="#a78bfa" fillOpacity="0.03">
          <animate attributeName="cy" values="80;120;80" dur="6s" repeatCount="indefinite" />
        </circle>
        <circle cx="300" cy="220" r="80" fill="#60a5fa" fillOpacity="0.02">
          <animate attributeName="cy" values="220;180;220" dur="7s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 lg:px-8 gap-8">
        {/* Text Content */}
        <div className="flex-1 text-center md:text-left min-h-[150px] md:min-h-[180px] flex flex-col justify-center">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-indigo-600 mb-3 drop-shadow-xl"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-lg md:text-xl text-gray-600 mb-6 max-w-2xl mx-auto md:mx-0 font-normal leading-relaxed" // Neutral text color, normal weight
          >
            {subtitle}
          </motion.p>
          {ctaText && ctaLink && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Link
                to={ctaLink}
                className="inline-block px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 hover:shadow-lg transition-all duration-300 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2" // Clean, direct button
              >
                {ctaText}
              </Link>
            </motion.div>
          )}
          {children && <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }} className="mt-8">{children}</motion.div>}
        </div>

        {/* Illustration */}
        <div className="flex-1 flex items-center justify-center min-h-[150px] md:min-h-[180px]">
          <motion.span
            className="text-[6rem] md:text-[9rem] drop-shadow-md select-none" // Slightly less intense shadow
            aria-label={illustration}
            initial={{ scale: 0.9, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 12, duration: 0.7, delay: 0.1 }}
          >
            {currentIllustration}
          </motion.span>
        </div>
      </div>
    </motion.section>
  );
};

HeroSection.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  ctaText: PropTypes.string,
  ctaLink: PropTypes.string,
  illustration: PropTypes.oneOf(Object.keys(illustrations)),
  children: PropTypes.node,
};

export default HeroSection;