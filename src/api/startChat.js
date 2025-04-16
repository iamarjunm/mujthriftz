import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

// Helper function to generate chat ID
const getChatId = (uid1, uid2, productId) => {
  return [uid1, uid2].sort().join("_") + `_${productId}`;
};

// Client-side function (no req/res)
export const startChat = async ({ currentUserId, otherUserId, productId }) => {
  try {
    // Validate inputs
    if (!currentUserId || !otherUserId || !productId) {
      throw new Error("Missing user or product info");
    }

    const chatId = getChatId(currentUserId, otherUserId, productId);
    const chatRef = doc(db, "conversations", chatId);

    // Check if chat exists
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
      await setDoc(chatRef, {
        participants: [currentUserId, otherUserId],
        productId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: "",
        lastSender: null,
      }, { merge: true });
    }

    return { chatId }; // Return chatId directly (no HTTP response)
  } catch (err) {
    console.error("Error starting chat:", err);
    throw new Error("Failed to start chat. Please try again.");
  }
};