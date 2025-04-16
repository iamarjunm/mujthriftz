import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { client } from '../sanityClient';
import imageUrlBuilder from '@sanity/image-url';

const builder = imageUrlBuilder(client);
const urlFor = (source) => builder.image(source);

const Profile = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [user, setUser] = useState(null);

  const DEFAULT_PROFILE_IMAGE = 'https://www.gravatar.com/avatar/?d=mp&s=200';

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserProfile(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      setLoading(true);
      
      // Check Sanity first since it's our source of truth for images
      const sanityProfile = await client.fetch(
        `*[_type == "userProfile" && uid == $uid][0]`,
        { uid: userId }
      );
      
      if (sanityProfile) {
        updateLocalState(sanityProfile);
        // Update Firestore to match Sanity data
        await updateDoc(doc(db, 'users', userId), {
          fullName: sanityProfile.fullName,
          phone: sanityProfile.phone,
          photoURL: sanityProfile.profileImage ? urlFor(sanityProfile.profileImage).url() : null
        });
      } else {
        // Fallback to Firestore
        const userDocRef = doc(db, 'users', userId);
        const userSnapshot = await getDoc(userDocRef);
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          updateLocalState(userData);
          
          // Create Sanity profile if it doesn't exist
          await client.create({
            _type: 'userProfile',
            uid: userId,
            fullName: userData.fullName || '',
            phone: userData.phone || '',
            email: userData.email || '',
            profileImage: userData.photoURL ? {
              _type: 'image',
              asset: {
                _type: 'reference',
                _ref: `image-${userData.photoURL.split('/').pop().split('?')[0]}-400x400-jpg`
              }
            } : null
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ text: 'Failed to load profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const updateLocalState = (profileData) => {
    setFormData({
      fullName: profileData.fullName || user?.displayName || '',
      phone: profileData.phone || ''
    });
    
    // Set profile image from either Sanity or Firebase
    if (profileData.profileImage) {
      setProfileImage(profileData.profileImage);
    } else if (profileData.photoURL) {
      setProfileImage({
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: `image-${profileData.photoURL.split('/').pop().split('?')[0]}-400x400-jpg`
        }
      });
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return null;
    try {
      const asset = await client.assets.upload('image', file, {
        contentType: file.type,
        filename: file.name
      });
      return {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: asset._id
        }
      };
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      setMessage({ text: 'Full name is required', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      let updatedImage = profileImage;
      let imageUrl = user?.photoURL || DEFAULT_PROFILE_IMAGE;

      // Handle image upload if new file selected
      if (imageFile) {
        updatedImage = await handleImageUpload(imageFile);
        imageUrl = urlFor(updatedImage).url();
      } else if (profileImage?.asset?._ref) {
        imageUrl = urlFor(profileImage).url();
      }

      // Update all services
      await Promise.all([
        // Firebase Auth
        updateProfile(auth.currentUser, {
          displayName: formData.fullName,
          photoURL: imageUrl
        }),
        
        // Firestore
        updateDoc(doc(db, 'users', user.uid), {
          fullName: formData.fullName,
          phone: formData.phone,
          photoURL: imageUrl
        }),
        
        // Sanity
        (async () => {
          const existingProfile = await client.fetch(
            `*[_type == "userProfile" && uid == $uid][0]`,
            { uid: user.uid }
          );

          if (existingProfile) {
            await client
              .patch(existingProfile._id)
              .set({
                fullName: formData.fullName,
                phone: formData.phone,
                profileImage: updatedImage || existingProfile.profileImage
              })
              .commit();
          } else {
            await client.create({
              _type: 'userProfile',
              uid: user.uid,
              fullName: formData.fullName,
              phone: formData.phone,
              profileImage: updatedImage,
              email: user.email
            });
          }
        })()
      ]);

      // Force refresh of profile data
      await fetchUserProfile(user.uid);
      
      setMessage({ text: 'Profile updated!', type: 'success' });
      setIsEditing(false);
      setImageFile(null);
    } catch (error) {
      console.error('Update error:', error);
      setMessage({ 
        text: error.message.includes('image') 
          ? 'Image upload failed. Try a different image.' 
          : 'Failed to update profile', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getProfileImageUrl = () => {
    try {
      if (profileImage?.asset?._ref) {
        return urlFor(profileImage).url();
      }
      return user?.photoURL || DEFAULT_PROFILE_IMAGE;
    } catch {
      return DEFAULT_PROFILE_IMAGE;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white/70 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-gray-200">
        <h2 className="text-4xl font-extrabold text-purple-700 text-center mb-6">
          👤 Your Profile
        </h2>

        <div className="flex justify-center mb-6">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-300 shadow-lg relative">
            <img
              src={getProfileImageUrl()}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = DEFAULT_PROFILE_IMAGE;
              }}
            />
            {isEditing && (
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-sm font-semibold cursor-pointer hover:bg-black/60 transition">
                📸 Change Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0])}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-purple-700">{user?.email}</h3>
            <p className="text-gray-600">
              {user?.emailVerified ? '✅ Verified' : '❌ Not Verified'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
              <h4 className="text-lg font-semibold text-purple-700 mb-2">
                📛 Full Name
              </h4>
              {isEditing ? (
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-gray-600">{formData.fullName || 'Not provided'}</p>
              )}
            </div>

            <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
              <h4 className="text-lg font-semibold text-purple-700 mb-2">
                📞 Phone Number
              </h4>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter phone number"
                />
              ) : (
                <p className="text-gray-600">{formData.phone || 'Not provided'}</p>
              )}
            </div>
          </div>

          <div className="flex justify-center space-x-4 mt-6">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={`${loading ? 'bg-green-700' : 'bg-green-600'} text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition`}
                >
                  {loading ? '⏳ Saving...' : '💾 Save'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition"
                >
                  ❌ Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {message.text && (
            <p className={`text-center mt-4 text-lg font-semibold ${
              message.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              {message.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;