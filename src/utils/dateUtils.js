import { formatDistanceToNow, parseISO } from 'date-fns';

export const formatMessageTime = (timestamp) => {
  try {
    // Handle Firestore Timestamp, ISO string, or Date object
    const date = timestamp?.toDate 
      ? timestamp.toDate() 
      : typeof timestamp === 'string' 
        ? parseISO(timestamp)
        : timestamp instanceof Date 
          ? timestamp 
          : new Date();
    
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return "just now";
  }
};

export const sortMessagesByTime = (messages) => {
  return messages.sort((a, b) => {
    const dateA = a.timestamp?.toDate 
      ? a.timestamp.toDate() 
      : typeof a.timestamp === 'string' 
        ? parseISO(a.timestamp)
        : a.timestamp instanceof Date 
          ? a.timestamp 
          : new Date(0);
    
    const dateB = b.timestamp?.toDate 
      ? b.timestamp.toDate() 
      : typeof b.timestamp === 'string' 
        ? parseISO(b.timestamp)
        : b.timestamp instanceof Date 
          ? b.timestamp 
          : new Date(0);
    
    return dateA - dateB;
  });
};