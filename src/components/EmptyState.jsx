import React from "react";

const EmptyState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-20 bg-white/80 rounded-2xl shadow-md">
    <div className="text-6xl mb-4 select-none">🛒</div>
    <div className="text-gray-500 text-lg mb-4 text-center max-w-md">{message}</div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
      >
        Try Again
      </button>
    )}
  </div>
);

export default EmptyState; 