import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { client, urlFor } from "../sanityClient";

const BorrowListing = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const query = `*[_type == "productListing" && listingType == "lend"] | order(_createdAt desc){
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
        const data = await client.fetch(query);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <h2 className="text-3xl font-extrabold text-center mb-6">📖 Borrow & Lend</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="border p-4 rounded-lg shadow-lg bg-white hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            {/* Image */}
            {product.images?.length > 0 && (
              <img
                src={urlFor(product.images[0]).width(400).quality(80).url()}
                alt={product.title}
                loading="lazy"
                className="w-full h-48 object-cover rounded-md"
              />
            )}

            {/* Title */}
            <h3 className="text-lg font-semibold mt-3">
              {product.isAnonymous ? product.anonymousName || "Anonymous" : product.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm mt-1 truncate">{product.description}</p>

            {/* Category & Condition */}
            <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
              <span>📂 {product.category}</span>
              <span>📌 {product.condition}</span>
            </div>

            {/* View Product Button */}
            <Link to={`/product/${product._id}`}>
              <button className="mt-3 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition">
                View Product
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BorrowListing;
