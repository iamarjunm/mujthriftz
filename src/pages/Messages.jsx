// pages/messages.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ChatInterface from "../components/ChatInterface";

const MessagesPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const conversationId = params.get("cid");

  useEffect(() => {
    // Simulate loading and error handling for chat initialization
    if (!conversationId) {
      setError("Invalid chat ID.");
      setIsLoading(false);
    } else {
      // If conversation ID is valid, proceed with fetching messages, etc.
      setIsLoading(false);
    }
  }, [conversationId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading chat...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Chat with Seller</h1>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-blue-500 hover:text-blue-700"
        >
          Go Back
        </button>
      </div>

      <ChatInterface />
    </div>
  );
};

export default MessagesPage;
