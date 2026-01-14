import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { authAPI } from '../../services/api';
import { logout } from '../../store/authSlice';
import Button from './Button';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      dispatch(logout());
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">GigFlow</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/feed" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                  Browse Gigs
                </Link>
                <Link to="/post-gig" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                  Post a Gig
                </Link>
                <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                  Dashboard
                </Link>
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l">
                  <span className="text-gray-600 text-sm">
                    Hi, <span className="font-medium">{user?.name}</span>
                  </span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-controls="mobile-menu"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((v) => !v)}
          >
            <span className="sr-only">Open main menu</span>
            {isOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div id="mobile-menu" className="md:hidden pb-4 pt-2 border-t">
            <div className="flex flex-col space-y-2">
              {isAuthenticated ? (
                <>
                  <Link to="/feed" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                    Browse Gigs
                  </Link>
                  <Link to="/post-gig" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                    Post a Gig
                  </Link>
                  <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                    Dashboard
                  </Link>
                  <div className="px-3 pt-2 border-t">
                    <div className="text-gray-600 text-sm mb-2">
                      Hi, <span className="font-medium">{user?.name}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <div className="px-3 flex gap-2">
                  <Link to="/login" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" className="flex-1">
                    <Button variant="primary" size="sm" className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;