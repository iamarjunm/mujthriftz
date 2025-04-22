// src/lib/sanity.js
import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";


export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: "2024-01-01",
  token: import.meta.env.VITE_SANITY_TOKEN,
  useCdn: false, // Disable CDN for real-time messaging data
});

const builder = imageUrlBuilder(client);
export const urlFor = (source) => builder.image(source);

// Helper function to get user's Firebase UID from Sanity
export const getFirebaseUid = async (sellerRef) => {
  try {
    if (!sellerRef) throw new Error("Seller reference is missing");

    const query = `*[_type == "userProfile" && _id == $id][0]{
      uid
    }`;
    const user = await client.fetch(query, { id: sellerRef });

    if (!user?.uid) {
      throw new Error("Seller's Firebase UID not found in their profile");
    }
    return user.uid;
  } catch (error) {
    console.error("❌ Error fetching Firebase UID:", error);
    throw error;
  }
};

// Fetch minimal product data for chats
export const getProductForChat = async (productId) => {
  const query = `*[_type == "productListing" && _id == $id][0]{
    _id,
    title,
    "mainImage": images[0].asset->url,
    "sellerRef": seller._ref
  }`;
  
  return await client.fetch(query, { id: productId });
};