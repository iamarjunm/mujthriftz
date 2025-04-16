export async function fetchSellerProfile(uid) {
  if (!uid) return null; // Prevent unnecessary queries

  try {
    const sellerProfile = await client.fetch(
      `*[_type == "userProfile" && uid == $uid][0]`,
      { uid }
    );

    return sellerProfile || null; // Ensure null if not found
  } catch (error) {
    console.error('Error fetching seller profile:', error);
    return null;
  }
}
