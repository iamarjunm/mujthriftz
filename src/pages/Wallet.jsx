import React, { useState, useEffect } from 'react';
import { FiGift, FiInfo, FiClock } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import { auth } from '../firebase';

const placeholderHistory = [
  { id: 1, type: 'Earned', amount: 50, date: '2024-06-01', desc: 'Purchase: Textbook (₹500)' },
  { id: 2, type: 'Used', amount: -30, date: '2024-06-03', desc: 'Coupon: 10% Off' },
  { id: 3, type: 'Earned', amount: 70, date: '2024-06-10', desc: 'Purchase: Lab Kit (₹700)' },
  { id: 4, type: 'Earned', amount: 30, date: '2024-06-12', desc: 'Bonus Event' },
  { id: 5, type: 'Used', amount: -50, date: '2024-06-15', desc: 'Coupon: Free Shipping' },
];

const Wallet = () => {
  const [coinBalance, setCoinBalance] = useState(0);
  const [user, setUser] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // TODO: Fetch real coin balance from backend/db
        setCoinBalance(120); // Placeholder value
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-blue-50 to-gray-100 py-12 px-2 md:px-8">
      <h1 className="text-4xl font-extrabold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-blue-600 drop-shadow-lg mt-14 md:mt-20">My Wallet</h1>
      <div className="w-full max-w-6xl mx-auto">
        <div className="w-full rounded-3xl shadow-2xl bg-white/80 backdrop-blur-lg p-0 md:p-10 flex flex-col gap-10">
          {/* Coin Balance Banner */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-t-3xl p-8 md:p-12 shadow-lg">
            <div className="flex items-center gap-6">
              <div className="bg-white/90 rounded-full p-6 shadow flex items-center justify-center border-4 border-blue-200">
                <FaRupeeSign className="text-5xl text-green-500" />
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-extrabold text-white drop-shadow">{coinBalance} <span className="text-yellow-300">Coins</span></div>
                <div className="text-blue-100 text-lg font-medium mt-1">Wallet Balance</div>
              </div>
            </div>
            <div className="mt-6 md:mt-0 text-center md:text-right flex flex-col gap-3 items-center md:items-end">
              <span className="inline-block bg-white/20 text-white px-6 py-2 rounded-full font-semibold text-lg shadow hover:bg-white/30 transition">Earn more coins by shopping!</span>
              <button
                className="mt-2 inline-flex items-center gap-2 px-5 py-2 bg-yellow-300 text-yellow-900 font-bold rounded-full shadow hover:bg-yellow-400 transition focus:outline-none focus:ring-2 focus:ring-yellow-400"
                onClick={() => setShowHistory(true)}
              >
                <FiClock className="text-xl" /> Coin History
              </button>
            </div>
          </div>

          {/* Coin History Modal */}
          {showHistory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative animate-fadeIn">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-purple-600 text-2xl font-bold focus:outline-none"
                  onClick={() => setShowHistory(false)}
                  aria-label="Close"
                >
                  ×
                </button>
                <h2 className="text-2xl font-bold mb-4 text-purple-700 flex items-center gap-2"><FiClock /> Coin Transaction History</h2>
                <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
                  {placeholderHistory.map(txn => (
                    <div key={txn.id} className="flex items-center justify-between py-3">
                      <div>
                        <div className={`font-semibold ${txn.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>{txn.type}</div>
                        <div className="text-gray-500 text-sm">{txn.desc}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${txn.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>{txn.amount > 0 ? '+' : ''}{txn.amount} <span className="text-yellow-400">🪙</span></div>
                        <div className="text-gray-400 text-xs">{txn.date}</div>
                      </div>
                    </div>
                  ))}
                  {placeholderHistory.length === 0 && (
                    <div className="text-center text-gray-400 py-8">No transactions yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Info Cards */}
          <div className="w-full flex flex-col lg:flex-row gap-6 px-4 md:px-0">
            <div className="flex-1 bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow border border-purple-100 flex flex-col">
              <div className="flex items-center gap-2 mb-3 text-purple-700 font-bold text-lg"><FiInfo /> How to Earn Coins</div>
              <ul className="text-gray-700 text-base list-disc ml-5 flex-1">
                <li>Earn <b>1 coin</b> for every <b>₹1</b> spent on purchases.</li>
                <li>Special events and promotions may offer bonus coins.</li>
              </ul>
            </div>
            <div className="flex-1 bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow border border-blue-100 flex flex-col">
              <div className="flex items-center gap-2 mb-3 text-blue-700 font-bold text-lg"><FiInfo /> How to Use Coins</div>
              <ul className="text-gray-700 text-base list-disc ml-5 flex-1">
                <li>Redeem coins for discount coupons at checkout.</li>
                <li>Use coins to unlock special features or offers.</li>
              </ul>
            </div>
            <div className="flex-1 bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow border border-yellow-100 flex flex-col">
              <div className="flex items-center gap-2 mb-3 text-yellow-600 font-bold text-lg"><FiGift /> Coupons & Offers</div>
              <ul className="text-gray-700 text-base list-disc ml-5 flex-1">
                <li>10% off coupon: <b>100 coins</b></li>
                <li>Free shipping: <b>50 coins</b></li>
                <li>More coming soon!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet; 