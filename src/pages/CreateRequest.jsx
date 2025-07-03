import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { client, urlFor } from "../sanityClient";
import {useAuth} from "../Context/AuthContext";
import slugify from "slugify";
import { FiUpload, FiX, FiLoader, FiTrash2, FiPlusCircle, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { motion } from "framer-motion";

const CreateRequest = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return null;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    requestType: "buy",
    priceRange: "negotiable",
    productAge: { years: 0, months: 0 },
    condition: "good",
    images: [],
    isAnonymous: false,
    anonymousName: "",
    tags: [],
    location: null,
    slug: { current: "" }
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filesToUpload, setFilesToUpload] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleProductAgeChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      productAge: {
        ...prev.productAge,
        [name]: Number(value),
      },
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const totalFiles = files.length + imagePreviews.length;
    if (totalFiles > 5) {
      alert(`Maximum 5 images allowed. You already have ${imagePreviews.length} images.`);
      return;
    }

    setFilesToUpload(files);
    setUploadingImages(true);
    setUploadProgress(0);

    const uploadedImages = [];
    const newPreviews = [];
    const totalToProcess = files.length;
    let processedFiles = 0;

    try {
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          alert("Only image files are allowed");
          continue;
        }

        const previewURL = URL.createObjectURL(file);
        newPreviews.push({ url: previewURL, file });

        const asset = await client.assets.upload("image", file, {
          contentType: file.type,
          filename: file.name
        });
        uploadedImages.push(asset);

        processedFiles++;
        setUploadProgress(Math.round((processedFiles / totalToProcess) * 100));
      }

      setImagePreviews(prev => [...prev, ...newPreviews]);
      setFormData(prev => ({
        ...prev,
        images: [
          ...prev.images, 
          ...uploadedImages.map(image => ({
            _key: image._id,
            _type: "image",
            asset: {
              _type: "reference",
              _ref: image._id
            }
          }))
        ],
      }));
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload some images");
    } finally {
      setFilesToUpload([]);
      setUploadingImages(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = async (index, isUploaded) => {
    if (isUploaded) {
      try {
        const imageToRemove = formData.images[index];
        if (imageToRemove?.asset?._ref) {
          await client.delete(imageToRemove.asset._ref);
        }
      } catch (error) {
        console.error("Error deleting image from Sanity:", error);
      }
    }

    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleCancelUpload = () => {
    filesToUpload.forEach(file => {
      const preview = imagePreviews.find(p => p.file === file);
      if (preview) URL.revokeObjectURL(preview.url);
    });
    
    setFilesToUpload([]);
    setUploadingImages(false);
    setUploadProgress(0);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: Number(value)
      }
    }));
  };

  useEffect(() => {
    if (formData.title) {
      const slug = slugify(formData.title, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g
      });
      setFormData(prev => ({
        ...prev,
        slug: { current: slug }
      }));
    }
  }, [formData.title]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return null;
  }
  if (!user) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) {
        alert("Please login to create request");
        return;
      }

      const sellerProfile = await client.fetch(
        `*[_type == "userProfile" && uid == $uid][0]`,
        { uid: user.uid }
      );

      if (!sellerProfile) {
        alert("Please complete your profile first");
        navigate("/profile");
        return;
      }

      const uniqueSlug = await makeSlugUnique(formData.slug.current);

      const doc = {
        _type: "requestProduct",
        title: formData.title,
        slug: { current: uniqueSlug },
        description: formData.description,
        category: formData.category,
        requestType: formData.requestType,
        priceRange: formData.priceRange,
        productAge: formData.productAge,
        condition: formData.condition,
        images: formData.images,
        isAnonymous: formData.isAnonymous,
        ...(formData.isAnonymous && formData.anonymousName && { 
          anonymousName: formData.anonymousName 
        }),
        requestedBy: {
          _type: "reference",
          _ref: sellerProfile._id
        },
        ...(formData.location && { 
          location: {
            _type: "geopoint",
            lat: formData.location.lat,
            lng: formData.location.lng
          }
        }),
        ...(formData.tags.length > 0 && { tags: formData.tags }),
        isActive: true
      };

      await client.create(doc);
      alert("Request created successfully!");
      navigate("/request");
    } catch (error) {
      console.error("Error creating request:", error);
      alert("Failed to create request");
    } finally {
      setLoading(false);
    }
  };

  const makeSlugUnique = async (slug) => {
    let uniqueSlug = slug;
    let counter = 1;
    
    while (true) {
      const existing = await client.fetch(
        `count(*[_type == "requestProduct" && slug.current == $slug])`,
        { slug: uniqueSlug }
      );
      
      if (existing === 0) break;
      
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
    
    return uniqueSlug;
  };

  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 px-2 py-10 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto bg-white/90 rounded-2xl shadow-2xl p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6 flex items-center justify-center gap-2">
          <FiPlusCircle className="text-purple-500" /> Create Request
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-medium text-purple-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="What are you looking for?"
                maxLength={100}
                required
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-purple-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Select category</option>
                <option value="textbooks">📚 Textbooks & Study Materials</option>
                <option value="lab-equipment">🛠 Lab Equipment</option>
                <option value="electronics">💻 Electronics</option>
                <option value="furniture">🪑 Furniture</option>
                <option value="clothing">👕 Clothing</option>
                <option value="accessories">🎒 Accessories</option>
                <option value="roommate-housing">🏠 Roommate & Housing</option>
                <option value="gaming">🎮 Gaming</option>
                <option value="vehicles">🚲 Vehicles</option>
                <option value="art-collectibles">🎨 Art & Collectibles</option>
                <option value="other">🎭 Miscellaneous</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-lg font-semibold text-purple-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              rows={5}
              placeholder="Describe what you're looking for in detail"
              minLength={30}
              maxLength={500}
              required
            />
          </div>

          {/* Request Type & Price Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-medium text-purple-700 mb-2">
                Request Type *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="requestType"
                    value="buy"
                    checked={formData.requestType === "buy"}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  Buy
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="requestType"
                    value="rent"
                    checked={formData.requestType === "rent"}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  Rent
                </label>
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-purple-700 mb-2">
                Price Range *
              </label>
              <select
                name="priceRange"
                value={formData.priceRange}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="under-500">Under ₹500</option>
                <option value="500-1000">₹500 - ₹1000</option>
                <option value="1000-2000">₹1000 - ₹2000</option>
                <option value="2000-5000">₹2000 - ₹5000</option>
                <option value="5000-10000">₹5000 - ₹10000</option>
                <option value="over-10000">Over ₹10000</option>
                <option value="negotiable">Negotiable</option>
              </select>
            </div>
          </div>

          {/* Product Age & Condition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-medium text-purple-700 mb-2">
                Maximum Product Age
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    name="years"
                    value={formData.productAge.years}
                    onChange={handleProductAgeChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Years"
                    min="0"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name="months"
                    value={formData.productAge.months}
                    onChange={handleProductAgeChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Months (0-11)"
                    min="0"
                    max="11"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-purple-700 mb-2">
                Minimum Condition
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="new">Brand New</option>
                <option value="like-new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
                <option value="any">Any Condition</option>
              </select>
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-lg font-medium text-purple-700 mb-2">
              Reference Images (Optional)
              {imagePreviews.length > 0 && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  {imagePreviews.length} {imagePreviews.length === 1 ? 'image' : 'images'} selected
                </span>
              )}
            </label>
            
            <div className="relative">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG (Max 5 images)</p>
                </div>
                <input 
                  type="file" 
                  name="images"
                  onChange={handleImageUpload}
                  className="hidden"
                  multiple
                  accept="image/*"
                  disabled={uploadingImages}
                />
              </label>
              
              {uploadingImages && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg p-4">
                  <FiLoader className="animate-spin w-8 h-8 text-purple-600 mb-2" />
                  <p className="text-gray-700 text-center mb-2">
                    Uploading {filesToUpload.length} {filesToUpload.length === 1 ? 'image' : 'images'}... {uploadProgress}%
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-purple-600 h-2.5 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelUpload}
                    className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Cancel Upload
                  </button>
                </div>
              )}
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-100">
                        <img
                          src={preview.url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {uploadingImages && preview.file && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <FiLoader className="animate-spin text-white w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index, !preview.file)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                        title="Remove image"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                      {preview.file && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                          {preview.file.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Are you sure you want to remove all images?')) {
                        setImagePreviews([]);
                        setFormData(prev => ({ ...prev, images: [] }));
                        formData.images.forEach(async (image) => {
                          try {
                            if (image?.asset?._ref) {
                              await client.delete(image.asset._ref);
                            }
                          } catch (error) {
                            console.error("Error deleting image:", error);
                          }
                        });
                      }
                    }}
                    className="text-red-600 hover:text-red-800 flex items-center gap-1"
                    disabled={uploadingImages}
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Remove all images
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-lg font-medium text-purple-700 mb-2">
              Tags (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Add tags (e.g., textbook, engineering)"
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-purple-600 text-white px-4 rounded-lg"
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center gap-1"
                  >
                    {tag}
                    <button 
                      type="button"
                      onClick={() => handleRemoveTag(index)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-lg font-medium text-purple-700 mb-2">
              Location (Optional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                name="lat"
                value={formData.location?.lat || ""}
                onChange={handleLocationChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Latitude"
                step="any"
              />
              <input
                type="number"
                name="lng"
                value={formData.location?.lng || ""}
                onChange={handleLocationChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Longitude"
                step="any"
              />
            </div>
          </div>

          {/* Anonymous Request
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isAnonymous"
                checked={formData.isAnonymous}
                onChange={handleChange}
                className="w-5 h-5"
              />
              <span className="text-lg font-medium text-purple-700">
                Request Anonymously
              </span>
            </label>
            {formData.isAnonymous && (
              <div>
                <label className="block text-lg font-medium text-purple-700 mb-2">
                  Display Name (Optional)
                </label>
                <input
                  type="text"
                  name="anonymousName"
                  value={formData.anonymousName}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="e.g., Thrift Seeker"
                  maxLength={30}
                />
              </div>
            )}
          </div> */}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-bold text-lg mt-6 ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:bg-purple-700"
            }`}
          >
            {loading ? "Creating Request..." : "Create Request"}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default CreateRequest;