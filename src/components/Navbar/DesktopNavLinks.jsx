import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const DesktopNavLinks = ({ navLinks }) => {
  const location = useLocation();

  return (
    <div className="hidden md:flex items-center space-x-1">
      {navLinks.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none ${
            location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path))
              ? 'text-purple-700 font-medium bg-purple-50'
              : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50/50'
          }`}
        >
          {link.label}
          {(location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path))) && (
            <motion.span
              layoutId="navUnderline"
              className="absolute left-0 bottom-0 h-0.5 bg-purple-600 rounded-full"
              style={{ width: '100%', transform: 'translateX(0)' }}
              transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
            />
          )}
        </Link>
      ))}
    </div>
  );
};

export default DesktopNavLinks;