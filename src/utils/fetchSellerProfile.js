// src/utils/fetchSellerProfile.js
import { client } from "../sanityClient";

export async function fetchSellerProfile(uid) {
  if (!uid) return null;

  try {
    const sellerProfile = await client.fetch(
      `*[_type == "userProfile" && uid == $uid][0]{
        _id,
        uid,
        fullName,
        profileImage,
        phone,
        email
      }`,
      { uid }
    );

    return sellerProfile || null;
  } catch (error) {
    console.error('Error fetching seller profile:', error);
    return null;
  }
}