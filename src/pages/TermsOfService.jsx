import React from 'react';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiShield, FiUser, FiShoppingCart, FiCreditCard, FiMail } from 'react-icons/fi';

const TermsOfService = () => {
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

  const sections = [
    {
      icon: <FiUser className="text-2xl text-purple-600" />,
      title: "1. Account Responsibility",
      content: (
        <>
          <p className="mb-4">You're responsible for maintaining the confidentiality of your account and password. Any activities under your account are your responsibility.</p>
          <p>You must be at least 18 years old or have parental consent to use MUJ Thriftz. We reserve the right to terminate accounts of users who violate these terms.</p>
        </>
      )
    },
    {
      icon: <FiShoppingCart className="text-2xl text-purple-600" />,
      title: "2. Listings & Transactions",
      content: (
        <>
          <p className="mb-4">All listings must be accurate and lawful. Prohibited items include:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Counterfeit or replica items</li>
            <li>Weapons, alcohol, or illegal substances</li>
            <li>Items that infringe on intellectual property rights</li>
            <li>Live animals</li>
          </ul>
          <p>MUJ Thriftz is not responsible for transactions between users. We don't handle payments or guarantee item conditions.</p>
        </>
      )
    },
    {
      icon: <FiCreditCard className="text-2xl text-purple-600" />,
      title: "3. Payments & Fees",
      content: (
        <>
          <p className="mb-4">Currently, MUJ Thriftz doesn't charge fees for basic listings. Optional promoted listings may incur fees in the future.</p>
          <p>All payments between buyers and sellers are conducted at your own risk. We recommend using secure payment methods and meeting in safe locations.</p>
        </>
      )
    },
    {
      icon: <FiShield className="text-2xl text-purple-600" />,
      title: "4. Privacy & Data",
      content: (
        <>
          <p className="mb-4">We collect necessary data to operate the platform. By using MUJ Thriftz, you agree to our Privacy Policy regarding:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Personal information collection</li>
            <li>Use of cookies</li>
            <li>Data sharing with necessary third parties</li>
          </ul>
          <p>We never sell your personal data to advertisers.</p>
        </>
      )
    },
    {
      icon: <FiAlertCircle className="text-2xl text-purple-600" />,
      title: "5. Prohibited Conduct",
      content: (
        <>
          <p className="mb-4">You agree not to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Harass other users</li>
            <li>Post false or misleading information</li>
            <li>Use the platform for commercial spamming</li>
            <li>Circumvent our safety systems</li>
            <li>Violate any laws through our service</li>
          </ul>
          <p>Violations may result in account suspension or legal action.</p>
        </>
      )
    },
    {
      icon: <FiMail className="text-2xl text-purple-600" />,
      title: "6. Communications",
      content: (
        <>
          <p className="mb-4">By creating an account, you consent to receive:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Transaction-related emails</li>
            <li>Platform updates and announcements</li>
            <li>Optional newsletters (you can unsubscribe)</li>
          </ul>
          <p>We'll never spam you or share your email without permission.</p>
        </>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-sm p-8 mb-12"
        >
          <p className="text-gray-700 mb-4">
            Welcome to MUJ Thriftz! These Terms of Service ("Terms") govern your use of our platform. By accessing or using MUJ Thriftz, you agree to be bound by these Terms.
          </p>
          <p className="text-gray-700">
            <strong>Note:</strong> We're students building this platform, not lawyers. These terms are written in plain English to be actually understandable. For legal purposes, this constitutes a binding agreement.
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="space-y-8"
        >
          {sections.map((section, index) => (
            <motion.div
              key={index}
              variants={item}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {section.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">{section.title}</h2>
                    <div className="text-gray-600 space-y-4">
                      {section.content}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Closing */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Need Help or Have Questions?</h3>
            <p className="text-gray-600 mb-6">
              We're happy to clarify anything about these terms. Contact us at:
            </p>
            <a 
              href="mailto:mujthriftz@gmail.com" 
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              mujthriftz@gmail.com
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;