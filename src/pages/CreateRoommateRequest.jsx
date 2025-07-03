import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { client } from "../sanityClient";
import { useAuth } from "../Context/AuthContext";
import { motion } from "framer-motion";
import { FiPlusCircle, FiCheckCircle, FiAlertCircle, FiUpload } from "react-icons/fi";

const initialState = {
  title: "",
  description: "",
  roommatePreferences: {
    gender: "any",
    ageRange: "",
    otherPreferences: ""
  },
  budget: "",
  location: { lat: "", lng: "" },
  contactInfo: "",
  images: [],
  accommodationType: "flat-apartment"
};

const genderOptions = [
  { label: "Any", value: "any" },
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" }
];
const accommodationOptions = [
  { label: "Flat/Apartment", value: "flat-apartment" },
  { label: "PG", value: "pg" },
  { label: "College Hostel", value: "college-hostel" }
];

const CreateRoommateRequest = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return null;
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState({ submitting: false, error: null, success: null });
  const [imagePreviews, setImagePreviews] = useState([]);
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("roommatePreferences.")) {
      setForm((prev) => ({
        ...prev,
        roommatePreferences: {
          ...prev.roommatePreferences,
          [name.split(".")[1]]: value
        }
      }));
    } else if (name.startsWith("location.")) {
      setForm((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [name.split(".")[1]]: value
        }
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setForm((prev) => ({ ...prev, images: files }));
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
  };

  const validate = () => {
    if (!form.title || form.title.length > 100) return "Title is required (max 100 chars).";
    if (!form.description || form.description.length < 30 || form.description.length > 500) return "Description must be 30-500 characters.";
    if (!form.budget) return "Budget is required.";
    if (!form.contactInfo) return "Contact info is required.";
    if (!form.accommodationType) return "Accommodation type is required.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      setStatus({ submitting: false, error, success: null });
      return;
    }
    setStatus({ submitting: true, error: null, success: null });
    try {
      // Upload images to Sanity
      let imageRefs = [];
      if (form.images.length > 0) {
        imageRefs = await Promise.all(
          form.images.map(async (file) => {
            const asset = await client.assets.upload('image', file);
            return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
          })
        );
      }
      // Fetch userProfile document by Firebase UID
      const userProfileArr = await client.fetch(`*[_type == "userProfile" && uid == $uid][0]{_id}`, { uid: user?.uid });
      const userProfileId = userProfileArr?._id || "";
      // Prepare document
      const doc = {
        _type: "roommateFinder",
        title: form.title,
        description: form.description,
        roommatePreferences: form.roommatePreferences,
        budget: form.budget,
        location: {
          _type: "geopoint",
          lat: parseFloat(form.location.lat) || 0,
          lng: parseFloat(form.location.lng) || 0
        },
        contactInfo: form.contactInfo,
        images: imageRefs,
        postedBy: {
          _type: "reference",
          _ref: userProfileId
        },
        isActive: true,
        accommodationType: form.accommodationType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await client.create(doc);
      setStatus({ submitting: false, error: null, success: "Roommate request posted!" });
      setTimeout(() => navigate("/roommate-finder"), 1200);
    } catch (err) {
      setStatus({ submitting: false, error: "Failed to post. Please try again.", success: null });
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 px-2 py-10 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto bg-white/90 rounded-2xl shadow-2xl p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6 flex items-center justify-center gap-2">
          <FiPlusCircle className="text-purple-500" /> Create Roommate Request
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-medium mb-1">Title *</label>
            <input type="text" name="title" value={form.title} onChange={handleChange} maxLength={100} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} minLength={30} maxLength={500} rows={4} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Preferred Gender</label>
              <select name="roommatePreferences.gender" value={form.roommatePreferences.gender} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg">
                {genderOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Preferred Age Range</label>
              <input type="text" name="roommatePreferences.ageRange" value={form.roommatePreferences.ageRange} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="e.g. 18-25" />
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Other Preferences</label>
            <input type="text" name="roommatePreferences.otherPreferences" value={form.roommatePreferences.otherPreferences} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="e.g. Non-smoker, vegetarian, etc." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Budget (per month) *</label>
              <input type="text" name="budget" value={form.budget} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label className="block font-medium mb-1">Accommodation Type *</label>
              <select name="accommodationType" value={form.accommodationType} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" required>
                {accommodationOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Preferred Location (Latitude, Longitude)</label>
            <div className="flex gap-2">
              <input type="number" name="location.lat" value={form.location.lat} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Latitude" step="any" />
              <input type="number" name="location.lng" value={form.location.lng} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Longitude" step="any" />
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Contact Information *</label>
            <input type="text" name="contactInfo" value={form.contactInfo} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Email, phone, etc." required />
          </div>
          <div>
            <label className="block font-medium mb-1">Images (Optional, up to 5)</label>
            <input type="file" accept="image/*" multiple onChange={handleImageChange} ref={fileInputRef} className="w-full" />
            {imagePreviews.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {imagePreviews.map((src, i) => (
                  <img key={i} src={src} alt="preview" className="w-20 h-20 object-cover rounded-lg border" />
                ))}
              </div>
            )}
          </div>
          {status.error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center">
              <FiAlertCircle className="mr-2" /> {status.error}
            </div>
          )}
          {status.success && (
            <div className="p-3 bg-green-50 text-green-700 rounded-lg flex items-center">
              <FiCheckCircle className="mr-2" /> {status.success}
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={status.submitting}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-lg font-semibold flex items-center justify-center hover:shadow-lg transition-all text-lg"
          >
            {status.submitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Posting...
              </span>
            ) : (
              <>
                <FiPlusCircle className="mr-2" /> Post Roommate Request
              </>
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default CreateRoommateRequest; 