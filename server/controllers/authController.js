import User from '../models/user.model.js';
import generateToken from '../utils/generateToken.js';

// create user 
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide all required fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email');
    }

    // Create user (password will be hashed by pre-saved middleware)
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate token and set cookie
    generateToken(res, user._id);

    // Send response
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(res.statusCode || 500);
    throw error;
  }
};


// login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    // Find user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');

    // Check user and password
    if (user && (await user.matchPassword(password))) {
      // Generate token and set cookie
      generateToken(res, user._id);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    res.status(res.statusCode || 500);
    throw error;
  }
};

// logout user
export const logoutUser = async (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  };

  // Match production cookie settings for cross-origin
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.sameSite = 'none';
    cookieOptions.secure = true;
  } else {
    cookieOptions.sameSite = 'lax';
    cookieOptions.secure = false;
  }

  res.cookie('jwt', '', cookieOptions);

  res.status(200).json({ message: 'Logged out successfully' });
};

// get current user profile
export const getMe = async (req, res) => {
  const user = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    bio: req.user.bio,
    skills: req.user.skills,
  };

  res.json(user);
};