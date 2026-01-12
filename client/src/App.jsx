import { useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authAPI } from './services/api';
import { loginSuccess, logout } from './store/authSlice';
import io from 'socket.io-client';

// Components
import Navbar from './components/common/Navbar';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Feed from './pages/Feed/feed';
import GigDetail from './pages/Feed/gigdetails';
import PostGig from './pages/GigPost/postgig';
import Dashboard from './pages/Dashboard/dashboard';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const socketRef = useRef(null);
  const hasCheckedAuth = useRef(false);

  // Initialize Socket.io connection when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to Socket.io server
      const baseURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      console.log(`🔌 Connecting to Socket.io at ${baseURL}`);
      
      socketRef.current = io(baseURL, {
        auth: {
          userId: user._id,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],
      });

      socketRef.current.on('connect', () => {
        console.log('✓ Socket.io connected:', socketRef.current.id);
        // Emit join event with userId
        socketRef.current.emit('join', user._id);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('✗ Socket.io disconnected:', reason);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('❌ Socket.io connection error:', error);
      });

      socketRef.current.on('error', (error) => {
        console.error('❌ Socket.io error:', error);
      });

      // Cleanup on unmount
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [isAuthenticated, user]);

  // Check if user is already logged in (on app load only)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authAPI.getMe();
        dispatch(loginSuccess(response.data));
      } catch {
        // Silently fail - user is just not logged in
        dispatch(logout());
      }
    };

    // Only check auth once on initial app load
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      checkAuth();
    }
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? <Navigate to="/feed" /> : <Navigate to="/login" />
          } 
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gig/:id"
          element={
            <ProtectedRoute>
              <GigDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post-gig"
          element={
            <ProtectedRoute>
              <PostGig />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;