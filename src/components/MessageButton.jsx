import { FiMessageSquare } from "react-icons/fi";
import { BsWhatsapp } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import {useAuth} from "../Context/AuthContext";
import { toast } from "react-toastify";

export const MessageButton = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const sellerPhone = product?.seller?.phone;
  const sellerId = product?.seller?.uid;
  const productId = product?._id;

  const handleWhatsAppClick = (e) => {
    e.stopPropagation();
    if (!sellerPhone) {
      toast.warning("Seller hasn't provided a WhatsApp number");
      return;
    }

    const formattedPhone = sellerPhone.startsWith("+91")
      ? sellerPhone
      : `+91${sellerPhone}`;

    window.open(
      `https://wa.me/${formattedPhone.replace("+", "")}`,
      "_blank",
      "noopener noreferrer"
    );
  };

  const handleInAppClick = async (e) => {
    e.stopPropagation();
  
    if (!sellerId || !productId) {
      toast.error("Product information incomplete");
      return;
    }
  
    if (!user) {
      toast.info("Please login to start chatting");
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
  
    try {      
      const token = await user.getIdToken();
      const conversationId = `${[user.uid, sellerId].sort().join('_')}_${productId}`;
      
      // 1. First create the conversation (without a message)
      const createResponse = await fetch(`${import.meta.env.VITE_API_URL}/create-conversation`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          participants: [user.uid, sellerId],
          productId,
          conversationId
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData?.error || 'Failed to create conversation');
      }

      // 2. Navigate to the chat page
      navigate(`/chat/${productId}/${conversationId}`, {
        state: { 
          productTitle: product.title,
          productImage: product.images?.[0]?.asset?.url,
          otherUser: product.seller
        }
      });
  
    } catch (error) {
      toast.error(error.message || "Failed to start conversation");
      console.error("Chat error:", error);
    }
  };

  return (
    <div className="flex gap-3 flex-col sm:flex-row w-full">
      <button
        onClick={handleInAppClick}
        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all hover:shadow-md disabled:opacity-70"
        aria-label="Message seller in app"
        disabled={!sellerId}
      >
        <FiMessageSquare className="text-lg" />
        <span>In-App Chat</span>
      </button>

      {sellerPhone && (
        <button
          onClick={handleWhatsAppClick}
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all hover:shadow-md"
          aria-label="Message seller on WhatsApp"
        >
          <BsWhatsapp className="text-lg" />
          <span>WhatsApp</span>
        </button>
      )}
    </div>
  );
};