import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { client, urlFor } from "../sanityClient";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const query = `*[_type == "productListing" && _id == $id][0]{
          _id,
          title,
          description,
          category,
          condition,
          price,
          listingType,
          isAnonymous,
          anonymousName,
          images
        }`;
        const data = await client.fetch(query, { id });
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="container mx-auto px-4 py-10 mt-20">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        {/* Image */}
        {product.images?.length > 0 && (
          <img
            src={urlFor(product.images[0]).width(600).quality(90).url()}
            alt={product.title}
            className="w-full h-80 object-cover rounded-md"
          />
        )}

        {/* Title & Details */}
        <h2 className="text-3xl font-bold mt-4">{product.title}</h2>
        <p className="text-gray-600 mt-2">{product.description}</p>

        {/* Category & Condition */}
        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
          <span>📂 Category: {product.category}</span>
          <span>📌 Condition: {product.condition}</span>
        </div>

        {/* Price & Listing Type */}
        <div className="flex justify-between items-center mt-4">
          <p className="text-2xl font-bold text-gray-900">₹{product.price}</p>
          <span
            className={`px-3 py-1 text-sm font-semibold rounded-full ${
              product.listingType === "sell" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
            }`}
          >
            {product.listingType === "sell" ? "For Sale" : "For Lend"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
