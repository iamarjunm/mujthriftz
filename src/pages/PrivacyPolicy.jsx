import React from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiDatabase, FiUser, FiShield, FiTrash2, FiMail } from 'react-icons/fi';

const PrivacyPolicy = () => {
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

  const policySections = [
    {
      icon: <FiDatabase className="text-2xl text-purple-600" />,
      title: "1. Information We Collect",
      content: (
        <>
          <p className="mb-4">We collect only what's necessary to make MUJ Thriftz work:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Account Info:</strong> Name, email</li>
            <li><strong>Listings:</strong> Item details, photos, prices</li>
            <li><strong>Technical:</strong> IP address, device info for security</li>
          </ul>
          <p>We <span className="font-bold">never</span> access your contacts, location (unless you share it), or other sensitive data without permission.</p>
        </>
      )
    },
    {
      icon: <FiLock className="text-2xl text-purple-600" />,
      title: "2. How We Use Your Data",
      content: (
        <>
          <p className="mb-4">Your information helps us:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Verify you're an MUJ student</li>
            <li>Display your listings to potential buyers</li>
            <li>Prevent fraud and keep the platform safe</li>
            <li>Improve MUJ Thriftz (via anonymized analytics)</li>
            <li>Send important service notifications</li>
          </ul>
          <p>We <span className="font-bold">don't</span> sell your data to third parties or advertisers.</p>
        </>
      )
    },
    {
      icon: <FiShield className="text-2xl text-purple-600" />,
      title: "3. Data Sharing & Protection",
      content: (
        <>
          <p className="mb-4">We may share information only when necessary:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>With other users:</strong> Your profile name and listings are visible</li>
            <li><strong>With authorities:</strong> If required by law or to prevent harm</li>
            <li><strong>With service providers:</strong> Secure hosting, analytics (under strict contracts)</li>
          </ul>
          <p>We implement <span className="font-bold">SSL encryption</span>, regular security audits, and restrict database access.</p>
        </>
      )
    },
    {
      icon: <FiUser className="text-2xl text-purple-600" />,
      title: "4. Your Rights & Choices",
      content: (
        <>
          <p className="mb-4">You control your data:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Access:</strong> Access your data anytime from account settings</li>
            <li><strong>Edit:</strong> Update profile info or listings</li>
            <li><strong>Delete:</strong> Remove your account and all associated data</li>
            <li><strong>Opt-out:</strong> Unsubscribe from non-essential emails</li>
          </ul>
          <p>Deletion requests are processed within <span className="font-bold">72 hours</span>.</p>
        </>
      )
    },
    {
      icon: <FiTrash2 className="text-2xl text-purple-600" />,
      title: "5. Data Retention",
      content: (
        <>
          <p className="mb-4">We keep your information only as long as needed:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Active accounts:</strong> Until you delete them</li>
            <li><strong>Inactive accounts:</strong> 2 years after last login</li>
            <li><strong>Backups:</strong> Securely encrypted and rotated every 30 days</li>
          </ul>
          <p>Deleted data is <span className="font-bold">permanently erased</span> from our systems.</p>
        </>
      )
    },
    {
      icon: <FiMail className="text-2xl text-purple-600" />,
      title: "6. Changes & Contact",
      content: (
        <>
          <p className="mb-4">We'll notify you of significant policy changes via email.</p>
          <p className="mb-4">For privacy concerns or data requests:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Email: <span className="font-bold">mujthriftz@gmail.com</span></li>
            <li>In-app: Settings → Help Center</li>
          </ul>
          <p>We respond to all inquiries within <span className="font-bold">48 hours</span>.</p>
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
            Privacy Policy
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
            At MUJ Thriftz, we treat your privacy as seriously as we'd want ours treated. This policy explains:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>What data we collect (and why)</li>
            <li>How we protect your information</li>
            <li>Your rights and choices</li>
            <li>Who can access your data</li>
          </ul>
          <p className="text-gray-700 mt-4">
            <strong>TL;DR:</strong> We only collect what's necessary, never sell your data, and give you full control.
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
          {policySections.map((section, index) => (
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
            <h3 className="text-xl font-bold text-gray-800 mb-4">Built by Students, For Students</h3>
            <p className="text-gray-600 mb-6">
              We're MUJ undergrads who care about your privacy. This isn't legalese - it's our actual commitment to you.
            </p>
            <p className="text-gray-600">
              Questions? Email us at <span className="font-bold text-purple-600">mujthriftz@gmail.com</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;