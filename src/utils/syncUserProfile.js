import { client } from "../sanityClient";

export async function syncUserProfile(user) {
  const { uid, displayName, email, photoURL } = user;

  try {
    let profileImage;

    // Process profile image if available
    if (photoURL && isValidUrl(photoURL)) {
      try {
        profileImage = await uploadProfileImage(photoURL);
      } catch (imageError) {
        console.warn("Image upload failed:", imageError);
      }
    }

    // Check if user profile exists
    const existingProfile = await client.fetch(
      `*[_type == "userProfile" && uid == $uid][0]`,
      { uid }
    );

    if (existingProfile) {
      // Update existing profile
      await updateExistingProfile(existingProfile, {
        displayName,
        email,
        profileImage,
      });
    } else {
      // Create new profile
      await createNewProfile({
        uid,
        displayName,
        email,
        profileImage,
      });
    }
  } catch (error) {
    console.error("Error syncing user profile with Sanity:", error);
    throw error; // Re-throw to allow calling code to handle
  }
}

// Helper functions
async function uploadProfileImage(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  const blob = await response.blob();
  const file = new File([blob], "profile-image", { type: blob.type });

  const asset = await client.assets.upload("image", file);
  return {
    _type: "image",
    asset: {
      _type: "reference",
      _ref: asset._id,
    },
  };
}

async function updateExistingProfile(existingProfile, updates) {
  const patch = client.patch(existingProfile._id)
    .setIfMissing({
      fullName: updates.displayName || "",
      email: updates.email || "",
    });

  if (updates.profileImage !== undefined) {
    patch.set({ profileImage: updates.profileImage });
  }

  await patch.commit();
}

async function createNewProfile(params) {
  return client.create({
    _type: "userProfile",
    uid: params.uid,
    fullName: params.displayName || "",
    email: params.email || "",
    phone: null,
    profileImage: params.profileImage,
  });
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}