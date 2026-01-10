import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiCalendar, FiUser, FiLogOut, FiMenu, FiX, FiHome, FiBookmark, FiCreditCard } from 'react-icons/fi';
import { MdEvent } from 'react-icons/md';



const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="navbar">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <MdEvent className="text-2xl text-primary" />
              <span className="text-xl font-bold text-gray-900">EventFlow</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-primary transition-colors flex items-center space-x-1">
                <FiHome />
                <span>Home</span>
              </Link>
              <Link to="/events" className="text-gray-700 hover:text-primary transition-colors flex items-center space-x-1">
                <FiCalendar />
                <span>Events</span>
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link to="/bookings" className="text-gray-700 hover:text-primary transition-colors flex items-center space-x-1">
                    <FiBookmark />
                    <span>Bookings</span>
                  </Link>
                  <Link to="/profile" className="text-gray-700 hover:text-primary transition-colors flex items-center space-x-1">
                    <FiUser />
                    <span>Profile</span>
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="text-gray-700 hover:text-primary transition-colors flex items-center space-x-1">
                      <FiCreditCard />
                      <span>Admin</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="btn btn-outline flex items-center space-x-1"
                  >
                    <FiLogOut />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline">Login</Link>
                  <Link to="/register" className="btn btn-primary">Register</Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4">
              <div className="flex flex-col space-y-4">
                <Link to="/" className="text-gray-700 hover:text-primary transition-colors">Home</Link>
                <Link to="/events" className="text-gray-700 hover:text-primary transition-colors">Events</Link>
                {isAuthenticated ? (
                  <>
                    <Link to="/bookings" className="text-gray-700 hover:text-primary transition-colors">Bookings</Link>
                    <Link to="/profile" className="text-gray-700 hover:text-primary transition-colors">Profile</Link>
                    <button
                      onClick={handleLogout}
                      className="text-left text-gray-700 hover:text-primary transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-gray-700 hover:text-primary transition-colors">Login</Link>
                    <Link to="/register" className="text-gray-700 hover:text-primary transition-colors">Register</Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow container py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">EventFlow</h3>
              <p className="text-gray-400">
                Your one-stop solution for event management and ticketing.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white">Home</Link></li>
                <li><Link to="/events" className="text-gray-400 hover:text-white">Events</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
                <li><Link to="/faq" className="text-gray-400 hover:text-white">FAQ</Link></li>
                <li><Link to="/terms" className="text-gray-400 hover:text-white">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <p className="text-gray-400">
                Subscribe to our newsletter for updates
              </p>
              <div className="mt-4">
                <input
                  type="email"
                  placeholder="Your email"
                  className="form-control"
                />
                <button className="btn btn-primary mt-2 w-full">Subscribe</button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} EventFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;