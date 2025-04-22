import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProductListing from "./pages/ProductListing";
import ProductDetails from "./pages/ProductDetails";
import BorrowListing from "./pages/BorrowListing";
import Contact from "./pages/Contact";
import Wishlist from "./pages/Wishlist";
import RequestListing from "./pages/RequestListing";
import CreateListing from "./pages/CreateListing";
import Profile from "./pages/Profile";
import CreateRequest from "./pages/CreateRequest";
import RequestDetails from "./pages/RequestDetails";
import ManageListings from "./pages/ManageListings";
import About from "./pages/About";
import TermsOfService from "./pages/TermsOfService";
import ManageRequests from "./pages/ManageRequests";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import FAQ from "./pages/FAQ";
import ChatPage from "./pages/ChatPage"
import Inbox from "./pages/Inbox";

const App = () => {
  return (
    <Router>
      <ScrollToTop /> 
      <Navbar />
      <main className = "pt-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/borrow" element={<BorrowListing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/request" element={<RequestListing />} />
          <Route path="/request/:id" element={<RequestDetails />} />
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-request" element={<CreateRequest />} />
          <Route path="/manage-listings" element={<ManageListings />} />
          <Route path="/manage-requests" element={<ManageRequests />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/inbox" element={<Inbox />} />
        <Route path="/chat/:productId/:conversationId" element={<ChatPage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
};

export default App;
