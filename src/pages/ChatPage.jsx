import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { FiSend, FiUser, FiImage } from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoCheckmarkDone } from "react-icons/io5";
import Pusher from "pusher-js";
import { toast } from "react-toastify";
import { useAuth } from "../Context/AuthContext";
import { syncUserProfile } from "../utils/syncUserProfile";
import { motion, AnimatePresence } from "framer-motion";
import { fetchSellerProfile } from "../utils/fetchSellerProfile";
import { urlFor, client } from "../sanityClient";

const ChatPage = () => {
  const { conversationId, productId, requestId } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [otherUser, setOtherUser] = useState({
    uid: null,
    fullName: "Loading...",
    profileImage: null,
    isAnonymous: false
  });
  const [itemInfo, setItemInfo] = useState({
    title: "Loading item...",
    image: null,
    type: productId ? 'product' : 'request',
    loading: true,
    error: false
  });
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const pusherRef = useRef(null);

  // Initialize user and item info
  useEffect(() => {
    if (user) {
      syncUserProfile(user);
      setCurrentUserId(user.uid);
    }

    // Set item info from location state if available
    if (state?.productTitle || state?.title) {
      setItemInfo({
        title: state.productTitle || state.title,
        image: state.productImage || state.image || null,
        type: state.type || (productId ? 'product' : 'request'),
        loading: false,
        error: false
      });
    } else if (productId || requestId) {
      fetchItemInfo();
    }
  }, [user, state, productId, requestId]);

  const fetchItemInfo = async () => {
    try {
      setItemInfo(prev => ({ ...prev, loading: true, error: false }));
      
      let itemData;
      if (productId) {
        const query = `*[_type == "productListing" && _id == $productId][0]{
          title,
          "image": images[0].asset->url,
          "type": "product"
        }`;
        itemData = await client.fetch(query, { productId });
      } else if (requestId) {
        const query = `*[_type == "requestProduct" && _id == $requestId][0]{
          title,
          "image": images[0].asset->url,
          "type": "request"
        }`;
        itemData = await client.fetch(query, { requestId });
      }
      
      if (itemData) {
        setItemInfo({
          title: itemData.title || "Untitled Item",
          image: itemData.image || null,
          type: itemData.type,
          loading: false,
          error: false
        });
      } else {
        throw new Error("Item not found");
      }
    } catch (err) {
      console.error("Failed to fetch item info:", err);
      setItemInfo({
        title: "Could not load item",
        image: null,
        type: productId ? 'product' : 'request',
        loading: false,
        error: true
      });
    }
  };

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    setTimeout(() => {
      if (containerRef.current && messagesEndRef.current) {
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior
        });
      }
    }, 0);
  }, []);

  const getOtherUserId = useCallback(() => {
    if (!currentUserId) return null;
    const [user1, user2] = conversationId.split("_");
    return currentUserId === user1 ? user2 : user1;
  }, [currentUserId, conversationId]);

  const fetchOtherUserData = useCallback(async (otherUserId) => {
    try {
      if (state?.otherUser) {
        setOtherUser({
          ...state.otherUser,
          profileImage: state.otherUser.profileImage ? urlFor(state.otherUser.profileImage).url() : null
        });
        return;
      }

      if (otherUserId) {
        try {
          const userRes = await fetch(`${import.meta.env.VITE_API_URL}/users/${otherUserId}`);
          const userData = await userRes.json();
          if (userData?.uid) {
            setOtherUser({
              uid: userData.uid,
              fullName: userData.fullName || "Unknown User",
              profileImage: userData.profileImage || null,
              isAnonymous: userData.isAnonymous || false
            });
            return;
          }
        } catch (apiError) {
          console.log("API user fetch failed, falling back to Sanity");
        }

        const sanityUser = await fetchSellerProfile(otherUserId);
        if (sanityUser) {
          setOtherUser({
            uid: sanityUser.uid,
            fullName: sanityUser.fullName || "Unknown User",
            profileImage: sanityUser.profileImage ? urlFor(sanityUser.profileImage).url() : null,
            isAnonymous: sanityUser.isAnonymous || false
          });
        } else {
          setOtherUser({
            uid: otherUserId,
            fullName: "Unknown User",
            profileImage: null,
            isAnonymous: false
          });
        }
      }
    } catch (err) {
      console.error("Error fetching other user data:", err);
      setOtherUser(prev => ({
        ...prev,
        fullName: "Unknown User",
        profileImage: null
      }));
    }
  }, [state]);

  useEffect(() => {
    const fetchMessagesAndUser = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/conversations/${conversationId}/messages`);
        const data = await res.json();
        
        const processedMessages = data.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        
        setMessages(processedMessages);

        const otherId = getOtherUserId();
        if (otherId) {
          await fetchOtherUserData(otherId);
        }

        scrollToBottom('auto');
      } catch (err) {
        toast.error("Failed to load chat data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId) {
      fetchMessagesAndUser();
    }
  }, [conversationId, currentUserId, getOtherUserId, fetchOtherUserData, scrollToBottom]);

  // Pusher setup and cleanup
  useEffect(() => {
    if (!currentUserId || !conversationId || !user?.accessToken) return;

    pusherRef.current = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
      authEndpoint: `${import.meta.env.VITE_API_URL}/pusher/auth`,
      auth: {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      },
      forceTLS: true
    });

    const pusher = pusherRef.current;
    
    const privateChannel = pusher.subscribe(`private-chat-${conversationId}`);
    
    privateChannel.bind('new-message', (newMsg) => {
      setMessages(prev => {
        const isDuplicate = prev.some(m => 
          (m.id && m.id === newMsg.id) || 
          (m.timestamp === newMsg.timestamp)
        );
        
        if (!isDuplicate) {
          return [...prev, {
            ...newMsg,
            timestamp: new Date(newMsg.timestamp)
          }];
        }
        return prev;
      });
      scrollToBottom();
    });

    const presenceChannel = pusher.subscribe(`presence-chat-${conversationId}`);
    
    presenceChannel.bind('typing', (data) => {
      if (data.userId !== currentUserId) {
        setIsTyping(data.isTyping);
        if (data.isTyping) {
          clearTimeout(typingTimeout);
          setTypingTimeout(setTimeout(() => setIsTyping(false), 3000));
        }
      }
    });

    return () => {
      if (privateChannel) {
        privateChannel.unbind_all();
        privateChannel.unsubscribe();
      }
      if (presenceChannel) {
        presenceChannel.unbind_all();
        presenceChannel.unsubscribe();
      }
      clearTimeout(typingTimeout);
      pusher.disconnect();
    };
  }, [currentUserId, conversationId, user?.accessToken, scrollToBottom]);

  const handleTyping = useCallback((isTyping) => {
    if (!currentUserId) return;
    
    clearTimeout(typingTimeout);
    if (isTyping) {
      setTypingTimeout(setTimeout(() => {
        fetch(`${import.meta.env.VITE_API_URL}/conversations/${conversationId}/typing`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUserId, isTyping: false })
        }).catch(console.error);
      }, 2000));
    }

    fetch(`${import.meta.env.VITE_API_URL}conversations/${conversationId}/typing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUserId, isTyping })
    }).catch(console.error);
  }, [currentUserId, conversationId, typingTimeout]);

  const sendMessage = async () => {
    if (!input.trim() || !currentUserId) return;

    const timestamp = new Date();
    const newMsg = {
      senderId: currentUserId,
      receiverId: getOtherUserId(),
      message: input.trim(),
      conversationId,
      timestamp: timestamp.toISOString(),
      [productId ? 'productId' : 'requestId']: productId || requestId,
      type: productId ? 'product' : 'request'
    };

    const optimisticMsg = { 
      ...newMsg, 
      status: 'sent',
      timestamp
    };
    
    setMessages(prev => [...prev, optimisticMsg]);
    setInput("");
    handleTyping(false);
    scrollToBottom();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMsg),
      });

      if (!res.ok) throw new Error("Message failed");
    } catch (err) {
      toast.error("Failed to send message.");
      console.error(err);
      setMessages(prev => prev.filter(m => m.timestamp !== optimisticMsg.timestamp));
    }
  };

  const formatTime = useCallback((timestamp) => {
    if (!timestamp) return "";
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      console.error("Invalid timestamp:", timestamp);
      return "";
    }
  }, []);

  const formatDate = useCallback((timestamp) => {
    if (!timestamp) return "";
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toDateString() === today.toDateString()) {
        return "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    } catch (e) {
      console.error("Invalid timestamp:", timestamp);
      return "";
    }
  }, []);

  const groupedMessages = messages.reduce((acc, message) => {
    const date = formatDate(message.timestamp);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(message);
    return acc;
  }, {});

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  return (
    <div className="container mx-auto px-4 py-12 pt-20 max-w-3xl">
      {/* Header with user info and item details */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-xl shadow-lg mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
              {otherUser?.profileImage ? (
                <img 
                  src={otherUser.profileImage} 
                  alt={otherUser.fullName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiUser className="text-xl" />
              )}
            </div>
            <div>
              <h2 className="font-bold">
                {otherUser?.fullName}
                {otherUser?.isAnonymous && " (Anonymous)"}
              </h2>
              <div className="text-xs opacity-80 h-4">
                {isTyping ? (
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse delay-75"></span>
                    <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse delay-150"></span>
                    <span>typing</span>
                  </span>
                ) : (
                  <span>Online</span>
                )}
              </div>
            </div>
          </div>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <BsThreeDotsVertical />
          </button>
        </div>
        
        {/* Item info section with better loading states */}
        <div className="mt-2 flex items-center gap-2">
          {itemInfo.loading ? (
            <div className="flex items-center gap-2 animate-pulse">
              <div className="w-8 h-8 bg-white/20 rounded"></div>
              <div className="h-4 bg-white/20 rounded w-32"></div>
            </div>
          ) : itemInfo.error ? (
            <div className="text-sm opacity-90 flex items-center gap-2">
              <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
                <FiImage className="text-sm" />
              </div>
              <p className="text-white/80">Could not load item details</p>
            </div>
          ) : (
            <>
              {itemInfo.image ? (
                <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded overflow-hidden">
                  <img 
                    src={itemInfo.image} 
                    alt={itemInfo.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = '';
                      setItemInfo(prev => ({ ...prev, image: null }));
                    }}
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded flex items-center justify-center">
                  <FiImage className="text-sm" />
                </div>
              )}
              <div className="text-sm opacity-90 truncate">
                <p className="font-medium truncate">
                  Chat about: {itemInfo.title} ({itemInfo.type})
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Messages container */}
      <div 
        ref={containerRef}
        className="bg-white rounded-b-xl shadow-md mb-6"
        style={{ 
          height: '60vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth'
        }}
      >
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-pulse text-gray-500">Loading messages...</div>
            </div>
          ) : Object.entries(groupedMessages).length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full text-gray-500 text-center p-4">
              <div className="text-lg font-medium mb-2">No messages yet</div>
              <div className="text-sm">Start the conversation!</div>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date} className="space-y-2 mb-4">
                <div className="flex justify-center">
                  <div className="bg-gray-100 text-xs px-3 py-1 rounded-full shadow-sm">
                    {date}
                  </div>
                </div>
                {dateMessages.map((msg, i) => (
                  <AnimatePresence key={`${msg.id || msg.timestamp?.getTime() || i}`}>
                    <motion.div
                      initial={{ opacity: 0, y: msg.senderId === currentUserId ? 10 : -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${
                        msg.senderId === currentUserId ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl text-sm shadow-md ${
                          msg.senderId === currentUserId
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none"
                            : "bg-gray-100 text-gray-900 rounded-bl-none"
                        }`}
                      >
                        {msg.message}
                        <div className={`flex items-center justify-end gap-1 mt-1 ${
                          msg.senderId === currentUserId ? "text-blue-100" : "text-gray-500"
                        }`}>
                          <span className="text-[10px]">
                            {formatTime(msg.timestamp)}
                          </span>
                          {msg.senderId === currentUserId && (
                            <IoCheckmarkDone className={`text-xs ${
                              msg.status === 'read' ? 'text-blue-300' : 'opacity-70'
                            }`} />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                ))}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Typing indicator */}
      {isTyping && (
        <div className="px-4 pb-2">
          <div className="w-fit px-4 py-2 rounded-2xl bg-gray-100 text-sm shadow-md">
            <div className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-75"></span>
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-150"></span>
            </div>
          </div>
        </div>
      )}

      {/* Message input */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-8">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleTyping(e.target.value.trim().length > 0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            onBlur={() => handleTyping(false)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-full border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-purple-300 text-sm"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            disabled={!input.trim()}
            className={`p-2 rounded-full shadow-md ${
              input.trim()
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            } transition-all`}
          >
            <FiSend size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;