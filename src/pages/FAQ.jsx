import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiChevronDown, FiShoppingBag, FiUser, FiDollarSign, FiShield, FiHelpCircle, FiMail } from 'react-icons/fi';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

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

  const faqCategories = [
    {
      icon: <FiUser className="text-2xl text-purple-600" />,
      title: "Account & Profile",
      questions: [
        {
          q: "Can I change my display name?",
          a: "Yes! Go to Profile → Edit. Your name must follow community guidelines (no impersonation or offensive content)."
        },
        {
          q: "What if I forget my password?",
          a: "Click 'Forgot Password' on the login page. We'll send a reset link to your registered email (expires in 1 hour)."
        }
      ]
    },
    {
      icon: <FiShoppingBag className="text-2xl text-purple-600" />,
      title: "Buying & Selling",
      questions: [
        {
          q: "What items are prohibited?",
          a: "We ban weapons, alcohol, drugs, counterfeit goods, and anything illegal. When in doubt, ask at support@mujthriftz.com."
        },
        {
          q: "How do I ensure safe transactions?",
          a: "Meet in public campus spaces, inspect items before paying, and use UPI for traceable payments. Avoid cash when possible."
        },
        {
          q: "Can I negotiate prices?",
          a: "Absolutely! It all depends upon the seller, you can contact them for any price related queries"
        }
      ]
    },
    {
      icon: <FiDollarSign className="text-2xl text-purple-600" />,
      title: "Payments & Fees",
      questions: [
        {
          q: "Does MUJ Thriftz handle payments?",
          a: "No, buyers and sellers arrange payments directly. We recommend using UPI for security and record-keeping."
        },
        {
          q: "Are there any fees?",
          a: "Currently free! We may introduce optional paid features (like promoted listings) in the future, with clear notices."
        },
        {
          q: "What if I get scammed?",
          a: "Report immediately via the 'Report User' button. While we can't refund money, we'll ban fraudulent accounts and help document cases for authorities."
        }
      ]
    },
    {
      icon: <FiShield className="text-2xl text-purple-600" />,
      title: "Safety & Privacy",
      questions: [
        {
          q: "Who sees my contact information?",
          a: "Only users you message directly or if a buyer wants to contact you. Profile shows only your first name and last initial."
        },
        {
          q: "How do I report suspicious activity?",
          a: "Click the 'Report' button on any listing or profile. For urgent issues, email safety@mujthriftz.com with screenshots."
        },
        {
          q: "Can I remain anonymous?",
          a: "Yes! Enable 'Anonymous Mode' when creating a listing or request."
        }
      ]
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
          <div className="inline-flex items-center justify-center bg-white p-3 rounded-full shadow-sm mb-6">
            <FiHelpCircle className="text-4xl text-purple-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Quick answers to common questions about MUJ Thriftz
          </p>
        </motion.div>

        {/* FAQ Categories */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          viewport={{ once: true }}
          className="space-y-8"
        >
          {faqCategories.map((category, catIndex) => (
            <motion.div 
              key={catIndex}
              variants={item}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  {category.icon}
                  <h2 className="text-xl font-bold text-gray-800">{category.title}</h2>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {category.questions.map((question, qIndex) => {
                  const index = `${catIndex}-${qIndex}`;
                  return (
                    <div key={index} className="p-6">
                      <button
                        onClick={() => toggleFAQ(index)}
                        className="flex justify-between items-center w-full text-left"
                      >
                        <h3 className="font-medium text-gray-800">{question.q}</h3>
                        <FiChevronDown 
                          className={`text-gray-500 transition-transform duration-200 ${activeIndex === index ? 'transform rotate-180' : ''}`}
                        />
                      </button>
                      
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{
                          opacity: activeIndex === index ? 1 : 0,
                          height: activeIndex === index ? 'auto' : 0
                        }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="pt-4 text-gray-600">{question.a}</p>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16"
        >
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;