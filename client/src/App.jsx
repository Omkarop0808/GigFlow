import { useEffect, useRef, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authAPI, bidAPI } from './services/api';
import { loginSuccess, logout } from './store/authSlice';
import io from 'socket.io-client';

// Components
import Navbar from './components/common/Navbar';
import Toast from './components/common/toast';

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
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Initialize Socket.io connection when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to Socket.io server
      let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      // Remove /api suffix if present for Socket.IO connection
      if (baseURL.endsWith('/api')) {
        baseURL = baseURL.replace('/api', '');
      }
      // Remove trailing slash
      baseURL = baseURL.replace(/\/$/, '');
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

      // Listen for "hired" notification events from server
      socketRef.current.on('hired', (data) => {
        console.log('📥 Hired notification received:', data);
        showToast(data?.message || 'You have been hired for a gig!', 'success');
      });

      // Listen for "bid_rejected" notification events from server
      socketRef.current.on('bid_rejected', (data) => {
        console.log('📥 Bid rejected notification received:', data);
        showToast(data?.message || 'Your bid was not selected.', 'warning');
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('✗ Socket.io disconnected:', reason);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error(' Socket.io connection error:', error);
      });

      socketRef.current.on('error', (error) => {
        console.error(' Socket.io error:', error);
      });

      // Cleanup on unmount
      return () => {
        if (socketRef.current) {
          socketRef.current.off('hired');
          socketRef.current.off('bid_rejected');
          socketRef.current.disconnect();
        }
      };
    }
  }, [isAuthenticated, user]);

  // Show missed notifications on login (if user was offline when hired/rejected)
  useEffect(() => {
    const checkMissedNotifications = async () => {
      try {
        const res = await bidAPI.getMyBids();
        const bids = Array.isArray(res.data) ? res.data : [];

        const storageKey = `gigflow:seenBidStatus:${user?._id}`;
        const seen = new Set(JSON.parse(localStorage.getItem(storageKey) || '[]'));

        // Only notify for non-pending bids that we haven't seen before
        const unseen = bids
          .filter((b) => b && b._id && b.status && b.status !== 'pending')
          .filter((b) => !seen.has(`${b._id}:${b.status}`))
          // newest first
          .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

        // Show at most 1 toast to avoid spam on login
        if (unseen.length > 0) {
          const b = unseen[0];
          if (b.status === 'hired') {
            showToast(`You have been hired for "${b.gig?.title || 'a gig'}"`, 'success');
          } else if (b.status === 'rejected') {
            showToast(`Your bid for "${b.gig?.title || 'a gig'}" was not selected.`, 'warning');
          }
        }

        unseen.forEach((b) => seen.add(`${b._id}:${b.status}`));
        localStorage.setItem(storageKey, JSON.stringify(Array.from(seen)));
      } catch {
        // ignore - auth may not be ready yet
      }
    };

    if (isAuthenticated && user?._id) {
      checkMissedNotifications();
    }
  }, [isAuthenticated, user?._id]);

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
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
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