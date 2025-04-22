import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMessageSquare, FiUser } from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { motion } from "framer-motion";
import {useAuth} from "../Context/AuthContext";
import { fetchSellerProfile } from "../utils/fetchSellerProfile";
import { toast } from "react-toastify";
import { urlFor } from "../sanityClient";

const Inbox = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({ total: 0, byConversation: {} });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch both conversations and unread counts in parallel
        const [conversationsRes, unreadRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/users/${user.uid}/conversations`),
          fetch(`${import.meta.env.VITE_API_URL}/users/${user.uid}/unread-count`)
        ]);

        if (!conversationsRes.ok || !unreadRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const conversationsData = await conversationsRes.json();
        const unreadData = await unreadRes.json();

        // Enrich conversations with other user info and unread counts
        const enrichedConversations = await Promise.all(
          conversationsData.map(async (conv) => {
            const otherUserId = conv.participants.find(id => id !== user.uid);
            const otherUser = otherUserId ? await fetchSellerProfile(otherUserId) : null;
            
            return {
              ...conv,
              otherUser,
              lastMessageTime: conv.lastUpdated,
              lastMessageSender: conv.lastMessageSender || otherUserId,
              unreadCount: unreadData.conversations[conv.conversationId] || 0
            };
          })
        );

        setConversations(enrichedConversations);
        setUnreadCounts({
          total: unreadData.totalUnread,
          byConversation: unreadData.conversations
        });
      } catch (err) {
        console.error("Error fetching inbox data:", err);
        toast.error("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleClick = async (conv) => {
    // Mark messages as read when conversation is opened
    if (conv.unreadCount > 0) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/conversations/${conv.conversationId}/mark-read`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.uid })
        });
        
        // Update local state to reflect read status
        setConversations(prev => prev.map(c => 
          c.conversationId === conv.conversationId 
            ? { ...c, unreadCount: 0 } 
            : c
        ));
        setUnreadCounts(prev => ({
          total: prev.total - conv.unreadCount,
          byConversation: {
            ...prev.byConversation,
            [conv.conversationId]: 0
          }
        }));
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    }

    navigate(`/chat/${conv.productId}/${conv.conversationId}`, {
      state: {
        productTitle: conv.productTitle,
        productImage: conv.productImage?.asset?._ref, // Pass the image reference
        otherUser: conv.otherUser
      },
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return formatTime(date);
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 pt-20 max-w-3xl">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Inbox Header with total unread count */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">Your Conversations</h1>
              {unreadCounts.total > 0 && (
                <span className="bg-white text-purple-600 text-xs font-bold px-2 py-1 rounded-full">
                  {unreadCounts.total}
                </span>
              )}
            </div>
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <BsThreeDotsVertical />
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FiMessageSquare className="mx-auto text-4xl mb-4 text-gray-300" />
              <p className="text-lg font-medium">No conversations yet</p>
              <p className="text-sm">Start a chat from a product listing</p>
            </div>
          ) : (
            conversations.map((conv, idx) => (
              <ConversationItem 
                key={conv.conversationId}
                conv={conv}
                user={user}
                idx={idx}
                handleClick={handleClick}
                formatDate={formatDate}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Extracted Conversation Item component for better readability
const ConversationItem = ({ conv, user, idx, handleClick, formatDate }) => {
  const otherUser = conv.otherUser;
  const isLastMessageFromMe = conv.lastMessageSender === user?.uid;
  const displayTime = formatDate(conv.lastMessageTime);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      onClick={() => handleClick(conv)}
      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-3">
        {/* User Avatar */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {otherUser?.profileImage ? (
              <img
                src={urlFor(otherUser.profileImage).width(100).url()}
                alt={otherUser.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <FiUser className="text-xl text-gray-500" />
            )}
          </div>
          {conv.unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {conv.unreadCount}
            </div>
          )}
        </div>

        {/* Conversation Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center gap-2">
            <h3 className="font-medium truncate">
              {otherUser?.fullName || "Unknown User"}
            </h3>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {displayTime}
            </span>
          </div>
          <p className="text-sm text-gray-600 truncate">
            {isLastMessageFromMe && (
              <span className="text-purple-600 mr-1">You:</span>
            )}
            {conv.lastMessage || "No messages yet"}
          </p>
          <div className="flex items-center gap-1 mt-1">
            {conv.productTitle && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full truncate max-w-[120px]">
                {conv.productTitle}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Inbox;