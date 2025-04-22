import Pusher from 'pusher-js';

// In your frontend code (where you initialize Pusher)
const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
  cluster: import.meta.env.VITE_PUSHER_CLUSTER,
  authEndpoint: `${import.meta.env.VITE_API_URL}/pusher/auth`, // ← Add full URL
  auth: {
    headers: {
      'user-id': currentUserId,
      'Content-Type': 'application/json'
    }
  }
});

export default pusher;
