"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

// Define the prop types for the component
interface SuccessPopupProps {
  isOpen: boolean;
  memberId: string;
  onClose: () => void;
}

const SuccessPopup: React.FC<SuccessPopupProps> = ({ isOpen, memberId, onClose }) => {
  const router = useRouter();

  // Close popup and redirect to home page
  const handleGoHome = () => {
    onClose();
    router.push('/');
  };

  // Close popup and redirect to status check page
  const handleCheckStatus = () => {
    onClose();
    router.push('/registration-status');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6 md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-xs sm:max-w-sm md:max-w-md relative"
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
          >
            {/* Success icon */}
            <div className="bg-green-500 py-4 sm:py-5 md:py-6 flex justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <svg className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  />
                </svg>
              </motion.div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-5 md:p-6 text-center">
              <motion.h2
                className="text-xl sm:text-2xl font-bold text-gray-800 mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Registration Successful!
              </motion.h2>

              <motion.div
                className="space-y-2 sm:space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-gray-600 text-sm sm:text-base">Thank you for registering with BKV.</p>

                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100 my-3 sm:my-4">
                  <p className="text-gray-700 text-sm sm:text-base">Your Member ID is:</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">{memberId}</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Please save this ID for future reference</p>
                </div>

                <p className="text-gray-600 text-xs sm:text-sm px-1">
                  We will contact you when you are selected. You can also check your registration
                  status anytime using your Member ID.
                </p>
              </motion.div>

              {/* Buttons */}
              <div className="mt-4 sm:mt-5 md:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                <motion.button
                  onClick={handleCheckStatus}
                  className="px-4 py-2 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Check Status
                </motion.button>

                <motion.button
                  onClick={handleGoHome}
                  className="px-4 py-2 bg-green-600 text-white text-sm sm:text-base rounded-lg hover:bg-green-700 transition duration-300 flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Go to Home
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessPopup;