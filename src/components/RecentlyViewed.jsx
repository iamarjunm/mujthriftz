import React from "react";

const RecentlyViewed = ({ type = "product" }) => (
  <section className="mt-12">
    <h2 className="text-xl font-bold mb-4 text-purple-700">Recently Viewed</h2>
    <div className="flex gap-4 overflow-x-auto pb-2">
      {/* Placeholder cards */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="min-w-[180px] h-40 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl shadow flex items-center justify-center text-3xl text-purple-400">
          🛒
        </div>
      ))}
    </div>
  </section>
);

export default RecentlyViewed; 