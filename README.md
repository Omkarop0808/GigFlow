# GigFlow - Freelance Marketplace Platform

A full-stack freelance marketplace where users can post gigs and bid on projects. Built with the MERN stack, featuring real-time notifications and atomic transaction handling.

## 🚀 Features

### Core Functionality
- **Dual Role System**: Users can act as both clients (posting gigs) and freelancers (submitting bids)
- **Gig Management**: Create, browse, and search for gigs with category filtering
- **Bidding System**: Submit proposals with cover letters and delivery estimates
- **Atomic Hiring Logic**: Prevents race conditions using MongoDB transactions
- **Real-time Notifications**: Socket.io integration for instant hire notifications

### Security Features
- JWT authentication with HttpOnly cookies
- Password hashing with bcrypt
- Protected API routes with middleware
- CORS configuration for secure cross-origin requests
- XSS and CSRF protection

### Technical Highlights
- **MongoDB Transactions**: Ensures atomic updates during hiring process
- **Optimistic UI Updates**: Immediate feedback on user actions
- **Error Handling**: Comprehensive error handling middleware
- **Responsive Design**: Mobile-first Tailwind CSS styling
- **State Management**: Redux Toolkit for predictable state updates

## 🛠️ Tech Stack

### Frontend
- **React** (v18) with Vite
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Axios** for API calls
- **Tailwind CSS** for styling
- **Socket.io Client** for real-time updates

### Backend
- **Node.js** & **Express.js**
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.io** for WebSocket connections
- **Bcrypt** for password hashing

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Git

### Clone Repository
```bash
git clone <your-repo-url>
cd gigflow
```

### Backend Setup
```bash
cd server
npm install

# Create .env file
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/gigflow
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
COOKIE_EXPIRE=7
CLIENT_URL=http://localhost:5173
```

### Frontend Setup
```bash
cd client
npm install

# Create .env file
cp .env.example .env
```

Edit `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd server
npm run dev
```
Server will run on `http://localhost:5000`

### Start Frontend Development Server
```bash
cd client
npm run dev
```
Application will run on `http://localhost:5173`

## 📖 Usage Guide

### As a Client (Posting Gigs)
1. Register/Login to your account
2. Click "Post Gig" in the navigation
3. Fill in gig details (title, description, budget, category)
4. Submit and view your gig in the Dashboard
5. When freelancers bid, review their proposals
6. Click "Hire This Freelancer" to accept a bid
7. All other bids are automatically rejected

### As a Freelancer (Bidding)
1. Register/Login to your account
2. Browse available gigs in the Feed
3. Click "View Details" on a gig you're interested in
4. Click "Submit a Bid"
5. Enter your proposed amount, delivery time, and cover letter
6. Submit and track your bid in the Dashboard
7. Receive real-time notification if you're hired! 🎉

## 🔥 Key Technical Implementations

### Atomic Hiring Logic
The hiring process uses MongoDB transactions to ensure data consistency:

```javascript
// When a client hires a freelancer:
1. Gig status → 'assigned'
2. Selected bid → 'hired'
3. All other bids → 'rejected' (in one atomic operation)

// If any step fails, everything rolls back
```

This prevents race conditions where two clients might try to hire different freelancers simultaneously.

### Real-Time Notifications
Socket.io emits events when bids are accepted or rejected:
- Hired freelancers receive instant success notifications
- Other bidders are notified their proposals weren't selected
- No page refresh needed!

## 🗂️ Project Structure

```
gigflow/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level pages
│   │   ├── store/          # Redux slices
│   │   ├── services/       # API integration
│   │   └── utils/          # Helper functions
│   └── ...
├── server/                 # Express backend
│   ├── config/             # Database connection
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth & error handling
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API endpoints
│   └── utils/              # JWT helpers
└── README.md
```

## 🧪 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Gigs
- `GET /api/gigs` - Get all open gigs (with search/filter)
- `GET /api/gigs/:id` - Get single gig
- `POST /api/gigs` - Create new gig (protected)
- `GET /api/gigs/my/gigs` - Get user's posted gigs (protected)

### Bids
- `POST /api/bids` - Submit bid (protected)
- `GET /api/bids/:gigId` - Get bids for gig (owner only)
- `GET /api/bids/my-bids` - Get user's submitted bids (protected)
- `PATCH /api/bids/:bidId/hire` - Hire freelancer (protected, atomic)

## 🔐 Security Best Practices

1. **HttpOnly Cookies**: JWT stored in HttpOnly cookies prevent XSS attacks
2. **Password Hashing**: Bcrypt with salt rounds for secure password storage
3. **Protected Routes**: Middleware validates JWT before accessing sensitive endpoints
4. **CORS Configuration**: Restricts API access to trusted origins
5. **Input Validation**: Mongoose schemas validate all data before database insertion
6. **Error Sanitization**: Production mode hides stack traces

## 🎨 Design Decisions

### Why HttpOnly Cookies over localStorage?
- **XSS Protection**: JavaScript cannot access HttpOnly cookies
- **Automatic Sending**: Browser includes cookies in every request
- **CSRF Mitigation**: SameSite flag prevents cross-site attacks

### Why Redux Toolkit?
- **Single Source of Truth**: Centralized state management
- **DevTools Integration**: Time-travel debugging
- **Simplified Boilerplate**: Less code than traditional Redux

### Why MongoDB Transactions?
- **Data Consistency**: Ensures all updates succeed or none do
- **Race Condition Prevention**: Prevents concurrent hiring conflicts
- **Production-Grade**: Enterprise-level reliability

## 🚧 Known Limitations

- Single-page dashboard (no separate pages for different gig statuses)
- No payment integration (Stripe/PayPal would be next step)
- No file upload for portfolios (could use Cloudinary/AWS S3)
- No messaging system between clients and freelancers

## 🔮 Future Enhancements

- [ ] Payment gateway integration (Stripe)
- [ ] Escrow system for secure payments
- [ ] Rating and review system
- [ ] Advanced search with filters
- [ ] File uploads for portfolios
- [ ] In-app messaging system
- [ ] Email notifications
- [ ] Admin dashboard for platform management

## 👨‍💻 Developer

Created as part of a MERN stack internship application.

**Key Learning Outcomes:**
- Implemented atomic database transactions
- Built real-time features with WebSockets
- Designed secure authentication flow
- Mastered Redux state management
- Applied professional code organization

## 📝 License

This project is created for educational purposes as part of an internship application.

---

**Built with ❤️ using the MERN Stack**
