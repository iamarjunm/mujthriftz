import { FiMessageSquare } from "react-icons/fi";
import { BsWhatsapp } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { toast } from "react-toastify";

export const RequestButton = ({ request }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const requesterPhone = request?.requestedBy?.phone;
  const requesterId = request?.requestedBy?.uid;
  const requestId = request?._id;

  const handleWhatsAppClick = (e) => {
    e.stopPropagation();
    if (!requesterPhone) {
      toast.warning("Requester hasn't provided a WhatsApp number");
      return;
    }

    const formattedPhone = requesterPhone.startsWith("+91")
      ? requesterPhone
      : `+91${requesterPhone}`;

    const message = encodeURIComponent(
      `Hi! I saw your request for "${request.title}" on MUJ Thriftz. I might be able to help!`
    );

    window.open(
      `https://wa.me/${formattedPhone.replace("+", "")}?text=${message}`,
      "_blank",
      "noopener noreferrer"
    );
  };

  const handleInAppClick = async (e) => {
    e.stopPropagation();
  
    if (!requesterId || !requestId) {
      toast.error("Request information incomplete");
      return;
    }
  
    if (!user) {
      toast.info("Please login to start chatting");
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
  
    try {      
      const token = await user.getIdToken();
      // Use requestId instead of productId for requests
      const conversationId = `${[user.uid, requesterId].sort().join('_')}_${requestId}`;
      
      // 1. First create the conversation (without a message)
      const createResponse = await fetch(`${import.meta.env.VITE_API_URL}/create-conversation`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          participants: [user.uid, requesterId],
          productId: requestId, // Using requestId as the identifier
          conversationId
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData?.error || 'Failed to create conversation');
      }

      // 2. Navigate to the chat page
      navigate(`/chat/${requestId}/${conversationId}`, {
        state: { 
          productTitle: request.title,
          productImage: request.images?.[0]?.asset?.url,
          otherUser: request.requestedBy
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
        aria-label="Message requester in app"
        disabled={!requesterId}
      >
        <FiMessageSquare className="text-lg" />
        <span>In-App Chat</span>
      </button>

      {requesterPhone && (
        <button
          onClick={handleWhatsAppClick}
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all hover:shadow-md"
          aria-label="Contact requester on WhatsApp"
        >
          <BsWhatsapp className="text-lg" />
          <span>WhatsApp</span>
        </button>
      )}
    </div>
  );
};