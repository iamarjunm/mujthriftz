import React from "react";

const LOGO_URL = "https://cdn.sanity.io/images/gcb0j4e6/production/8be522aefa72638cc3ed9934a6c105e756b1868d-1500x1500.png";

const WorkInProgressOverlay = () => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white text-center" style={{ minHeight: '100vh' }}>
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
    <div className="relative z-10 flex flex-col items-center max-w-lg w-full p-8 rounded-2xl shadow-2xl border border-gray-700 bg-gray-900/90">
      <img
        src={LOGO_URL}
        alt="Thriftz Logo"
        className="w-24 h-24 mb-6 rounded-xl shadow-lg border border-gray-700 bg-white object-contain"
        style={{ background: 'white' }}
      />
      <h1 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight text-white">Website Under Scheduled Maintenance</h1>
      <p className="text-base md:text-lg text-gray-200 mb-6">
        Thriftz is currently undergoing important updates to bring you a better experience.<br />
        We appreciate your patience while we work behind the scenes.<br />
        <span className="block mt-2 text-gray-400 text-sm">Estimated downtime: 2 Weeks</span>
      </p>
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="w-full h-2 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 rounded-full animate-pulse mb-2" />
        <span className="text-gray-400 text-xs">If you have urgent queries, contact us at <a href="mailto:support@thriftz.in" className="underline hover:text-fuchsia-400">mujthriftz@gmail.com</a></span>
      </div>
    </div>
  </div>
);

export default WorkInProgressOverlay; 