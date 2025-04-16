import { FiMessageSquare } from "react-icons/fi";

export const MessageButton = ({ product }) => {
  const sellerPhone = product?.seller?.phone;

  const handleClick = () => {
    if (!sellerPhone) {
      alert("Seller phone number is missing.");
      return;
    }

    // Add +91 prefix (ensure no duplicate if already present)
    const formattedPhone = sellerPhone.startsWith("+91")
      ? sellerPhone
      : `+91${sellerPhone}`;

    const message = encodeURIComponent(
      `Hi! I'm interested in your product "${product.title}" listed on MUJ Thriftz.`
    );

    const whatsappUrl = `https://wa.me/${formattedPhone.replace("+", "")}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
      aria-label="Message seller on WhatsApp"
    >
      <FiMessageSquare />
      Message Seller
    </button>
  );
};

export const RequestButton = ({ request }) => {
  const requesterPhone = request?.requestedBy?.phone;

  const handleClick = () => {
    if (!requesterPhone) {
      alert("Requester phone number is missing.");
      return;
    }

    const formattedPhone = requesterPhone.startsWith("+91")
      ? requesterPhone
      : `+91${requesterPhone}`;

    const message = encodeURIComponent(
      `Hi! I saw your request for "${request.title}" on MUJ Thriftz. I might be able to help!`
    );

    const whatsappUrl = `https://wa.me/${formattedPhone.replace("+", "")}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
      aria-label="Contact requester on WhatsApp"
    >
      <FiMessageSquare />
      Contact Requester
    </button>
  );
};
