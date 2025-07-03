import React from "react";
import ProductCard from "./ProductCard";

const SkeletonCard = () => (
  <div className="bg-white/80 border border-gray-100 rounded-2xl shadow-lg animate-pulse h-[340px] md:h-[370px] lg:h-[400px]" />
);

const ProductGrid = ({
  products = [],
  loading = false,
  count = 8,
  wishlist = [],
  onToggleWishlist = () => {},
  getProductAge = () => "New",
  formatRentalRate = () => "",
  getPriceRangeLabel = () => "",
  type = "product"
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
    {loading
      ? Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)
      : products.map(item => (
          <div key={item._id} className="h-[340px] md:h-[370px] lg:h-[400px]">
            <ProductCard
              item={item}
              type={type}
              isInWishlist={wishlist.includes(item._id)}
              onToggleWishlist={() => onToggleWishlist(item._id)}
              getProductAge={getProductAge}
              formatRentalRate={formatRentalRate}
              getPriceRangeLabel={getPriceRangeLabel}
            />
          </div>
        ))}
  </div>
);

export default ProductGrid; 