import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX, FiCheckCircle, FiLoader } from 'react-icons/fi';
import emailjs from '@emailjs/browser';

const ReportComponent = ({ onClose, reportedItem, reportedItemType = 'listing' }) => {
  const [formData, setFormData] = useState({
    reason: '',
    description: '',
    contactEmail: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await emailjs.send(
        'service_9toub17', // Replace with your EmailJS service ID
        'template_83yo7wj',
        {
          reportedItem: reportedItem?.title || reportedItem?.id || 'N/A',
          reportedItemType,
          reason: formData.reason,
          description: formData.description,
          reporterEmail: formData.contactEmail,
          pageUrl: window.location.href,
          timestamp: new Date().toISOString(),
        },
        'KnW74zjkGTLX8MjqW'
      );
      setSubmitStatus('success');
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error('Failed to send report:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reportReasons = [
    "Fraud or scam",
    "Prohibited item",
    "Inappropriate content",
    "Harassment",
    "Incorrect information",
    "Other"
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-md"
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <FiAlertTriangle className="text-2xl text-red-500" />
                <h3 className="text-xl font-bold">
                  Report {reportedItemType === 'user' ? 'User' : 'Listing'}
                </h3>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {reportedItem && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="font-medium text-gray-800">
                  Reporting Item: <span className="font-normal">{reportedItem.title || `ID: ${reportedItem.id}`}</span>
                </p>
              </div>
            )}

            {submitStatus === 'success' ? (
              <div className="text-center py-8">
                <FiCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
                <h4 className="text-xl font-bold mb-2">Report Submitted</h4>
                <p className="text-gray-600">Thank you for helping keep MUJ Thriftz safe.</p>
              </div>
            ) : submitStatus === 'error' ? (
              <div className="text-center py-8">
                <FiAlertTriangle className="text-5xl text-red-500 mx-auto mb-4" />
                <h4 className="text-xl font-bold mb-2">Submission Failed</h4>
                <p className="text-gray-600 mb-4">Please try again or contact support directly.</p>
                <button
                  onClick={() => setSubmitStatus(null)}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Report *
                    </label>
                    <select
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select a reason</option>
                      {reportReasons.map((reason) => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Detailed Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Please provide as much detail as possible..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Email (Optional)
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="For follow-up questions"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      We may contact you for more information about this report
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <FiLoader className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Report"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReportComponent;