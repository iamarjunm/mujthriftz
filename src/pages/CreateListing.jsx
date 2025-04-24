import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { client, urlFor } from "../sanityClient";
import {useAuth} from "../Context/AuthContext";
import slugify from "slugify";
import { FiUpload, FiX, FiLoader, FiTrash2 } from "react-icons/fi";



const CreateListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // If user is not logged in, don't render the form
  if (!user) {
    return null; // or a loading spinner if you prefer
  }
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    condition: "",
    listingType: "sell",
    price: 0,
    rentalRate: { amount: 0, duration: "hour", deposit: 0 },
    productAge: { years: 0, months: 0 },
    images: [],
    isAnonymous: false,
    anonymousName: "",
    tags: [],
    location: null,
    slug: { current: "" }
  });

  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filesToUpload, setFilesToUpload] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));
  };

  const handleRentalRateChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      rentalRate: {
        ...prev.rentalRate,
        [name]: name === "amount" || name === "deposit" ? Number(value) : value,
      },
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
    if (totalFiles > 10) {
      alert(`Maximum 10 images allowed. You already have ${imagePreviews.length} images.`);
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
      // Remove an image that's already been uploaded to Sanity
      try {
        const imageToRemove = formData.images[index];
        if (imageToRemove?.asset?._ref) {
          await client.delete(imageToRemove.asset._ref);
        }
      } catch (error) {
        console.error("Error deleting image from Sanity:", error);
      }
    }

    // Update state to remove the image
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleCancelUpload = () => {
    // Revoke object URLs for any previews that haven't been uploaded yet
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

  // Generate slug from title when it changes
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      if (!user) {
        alert("Please login to create listing");
        return;
      }
  
      // Get seller reference
      const sellerProfile = await client.fetch(
        `*[_type == "userProfile" && uid == $uid][0]`,
        { uid: user.uid }
      );
  
      if (!sellerProfile) {
        alert("Please complete your profile first");
        navigate("/profile");
        return;
      }
  
      // Ensure slug is unique
      const uniqueSlug = await makeSlugUnique(formData.slug.current);
  
      const doc = {
        _type: "productListing",
        title: formData.title,
        slug: { current: uniqueSlug },
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        listingType: formData.listingType,
        ...(formData.listingType === "sell" && { price: formData.price }),
        ...(formData.listingType === "lend" && { 
          rentalRate: {
            amount: formData.rentalRate.amount,
            duration: formData.rentalRate.duration,
            ...(formData.rentalRate.deposit > 0 && { deposit: formData.rentalRate.deposit })
          }
        }),
        productAge: formData.productAge,
        images: formData.images,
        isAnonymous: formData.isAnonymous,
        ...(formData.isAnonymous && formData.anonymousName && { 
          anonymousName: formData.anonymousName 
        }),
        seller: {
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
        isAvailable: true
      };
  
      await client.create(doc);
      alert("Listing created successfully!");
      
      // Redirect based on listing type
      if (formData.listingType === "sell") {
        navigate("/products");
      } else {
        navigate("/borrow");
      }
    } catch (error) {
      console.error("Error creating listing:", error);
      alert("Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to ensure slug is unique
  const makeSlugUnique = async (slug) => {
    let uniqueSlug = slug;
    let counter = 1;
    
    while (true) {
      const existing = await client.fetch(
        `count(*[_type == "productListing" && slug.current == $slug])`,
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-5xl font-extrabold text-purple-700 text-center mb-12 pt-12">
          Create New Listing
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-lg">

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
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Enter listing title"
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
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select category</option>
                <option value="textbooks">📚 Textbooks & Study Materials</option>
                <option value="lab-equipment">🛠 Lab Equipment</option>
                <option value="electronics">💻 Electronics</option>
                <option value="furniture">🪑 Furniture</option>
                <option value="clothing">👕 Clothing</option>
                <option value="accessories">🎒 Accessories</option>
                <option value="gaming">🎮 Gaming</option>
                <option value="vehicles">🚲 Vehicles</option>
                <option value="art-collectibles">🎨 Art & Collectibles</option>
                <option value="other">🎭 Miscellaneous</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium text-purple-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
              rows={5}
              placeholder="Describe your item in detail"
              minLength={30}
              maxLength={500}
              required
            />
          </div>

          {/* Condition & Listing Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-medium text-purple-700 mb-2">
                Condition *
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select condition</option>
                <option value="new">Brand New</option>
                <option value="like-new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            <div>
              <label className="block text-lg font-medium text-purple-700 mb-2">
                Listing Type *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="listingType"
                    value="sell"
                    checked={formData.listingType === "sell"}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  Sell
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="listingType"
                    value="lend"
                    checked={formData.listingType === "lend"}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  Lend
                </label>
              </div>
            </div>
          </div>

          {/* Price/Rental Fields */}
          {formData.listingType === "sell" ? (
            <div>
              <label className="block text-lg font-medium text-purple-700 mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Enter price"
                min="0"
                step="0.01"
                required
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-lg font-medium text-purple-700 mb-2">
                  Rental Rate (₹) *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.rentalRate.amount}
                  onChange={handleRentalRateChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Amount"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-purple-700 mb-2">
                  Duration *
                </label>
                <select
                  name="duration"
                  value={formData.rentalRate.duration}
                  onChange={handleRentalRateChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="hour">Per Hour</option>
                  <option value="day">Per Day</option>
                  <option value="week">Per Week</option>
                  <option value="month">Per Month</option>
                </select>
              </div>
              <div>
                <label className="block text-lg font-medium text-purple-700 mb-2">
                  Deposit (₹)
                </label>
                <input
                  type="number"
                  name="deposit"
                  value={formData.rentalRate.deposit}
                  onChange={handleRentalRateChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Optional"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          )}

          {/* Product Age */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-medium text-purple-700 mb-2">
                Product Age (Years)
              </label>
              <input
                type="number"
                name="years"
                value={formData.productAge.years}
                onChange={handleProductAgeChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Years"
                min="0"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-purple-700 mb-2">
                Product Age (Months)
              </label>
              <input
                type="number"
                name="months"
                value={formData.productAge.months}
                onChange={handleProductAgeChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Months (0-11)"
                min="0"
                max="11"
              />
            </div>
          </div>

        {/* Images Section */}
        <div>
          <label className="block text-lg font-medium text-purple-700 mb-2">
            Images (1-10) *
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
                <p className="text-xs text-gray-500">PNG, JPG, JPEG (Max 10 images)</p>
              </div>
              <input 
                type="file" 
                name="images"
                onChange={handleImageUpload}
                className="hidden"
                multiple
                accept="image/*"
                disabled={uploadingImages}
                required={imagePreviews.length === 0}
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
                      // Remove all images from state
                      setImagePreviews([]);
                      setFormData(prev => ({ ...prev, images: [] }));
                      
                      // Delete all uploaded images from Sanity
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
              Tags (Max 10)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-lg"
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
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Latitude"
                step="any"
              />
              <input
                type="number"
                name="lng"
                value={formData.location?.lng || ""}
                onChange={handleLocationChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Longitude"
                step="any"
              />
            </div>
          </div>

          {/* Anonymous Listing
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
                List Anonymously
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
            {loading ? "Creating Listing..." : "Create Listing"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;