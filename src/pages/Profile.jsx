import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { client } from '../sanityClient';
import imageUrlBuilder from '@sanity/image-url';
import { FiDollarSign, FiGift, FiInfo } from 'react-icons/fi';
import { motion } from 'framer-motion';

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
  const [coinBalance, setCoinBalance] = useState(0);

  const DEFAULT_PROFILE_IMAGE = 'https://www.gravatar.com/avatar/?d=mp&s=200';

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserProfile(currentUser.uid);
        setCoinBalance(120);
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
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-blue-50 to-gray-100 flex items-center justify-center p-2 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: 'spring', bounce: 0.2 }}
        className="w-full max-w-4xl bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-0 md:p-12 border border-gray-200 flex flex-col gap-8"
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-4xl md:text-5xl font-extrabold text-purple-700 text-center mb-2 mt-10 md:mt-0 drop-shadow-lg"
        >
          👤 My Profile
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7, type: 'spring' }}
          className="flex justify-center mb-6"
        >
          <motion.div
            whileHover={{ scale: 1.08, rotate: 2 }}
            className="w-36 h-36 rounded-full overflow-hidden border-4 border-purple-400 shadow-xl relative bg-white"
            style={{ transition: 'box-shadow 0.3s' }}
          >
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
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="space-y-8 w-full"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold text-purple-700 break-all">{user?.email}</h3>
            <p className="text-gray-600">
              {user?.emailVerified ? '✅ Verified' : '❌ Not Verified'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-purple-50 p-6 rounded-xl shadow-sm">
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

            <div className="bg-purple-50 p-6 rounded-xl shadow-sm">
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

          <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-6">
            {isEditing ? (
              <>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={loading}
                  className={`${loading ? 'bg-green-700' : 'bg-green-600'} text-white py-3 px-8 rounded-lg font-semibold hover:bg-green-700 transition text-lg shadow`}
                >
                  {loading ? 'Saving...' : 'Save'}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-gray-700 transition text-lg shadow"
                >
                  Cancel
                </motion.button>
              </>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition text-lg shadow"
              >
                Edit Profile
              </motion.button>
            )}
          </div>

          {message.text && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className={`text-center mt-4 text-lg font-semibold ${
                message.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {message.text}
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Profile;