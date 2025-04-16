import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";


const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [user] = useAuthState(auth);
  const [params] = useSearchParams();
  const conversationId = params.get("cid");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!conversationId) return;

    const msgRef = collection(db, "messages", conversationId, "messages");
    const q = query(msgRef, orderBy("timestamp", "asc"));

    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, [conversationId]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!msg.trim()) return;

    const msgRef = collection(db, "messages", conversationId, "messages");
    await addDoc(msgRef, {
      text: msg,
      senderId: user.uid,
      timestamp: serverTimestamp(),
    });

    await updateDoc(doc(db, "messages", conversationId), {
      lastMessage: msg,
      updatedAt: serverTimestamp(),
    });

    setMsg("");
  };

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white p-4 shadow-md rounded">
      <div className="h-64 overflow-y-scroll border-b mb-2 space-y-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`my-2 ${m.senderId === user.uid ? "text-right" : "text-left"}`}
          >
            <div
              className={`inline-block px-3 py-1 rounded ${
                m.senderId === user.uid ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 mt-3">
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          className="flex-1 border p-2 rounded"
          placeholder="Type your message..."
        />
        <button
          onClick={sendMessage}
          disabled={!msg.trim()}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
