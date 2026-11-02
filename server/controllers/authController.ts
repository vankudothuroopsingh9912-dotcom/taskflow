import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.ts';
import { dbStatus, getMemoryDb, saveEmbeddedDb } from '../config/db.ts';
import { generateToken, AuthRequest } from '../middleware/auth.ts';

// Helper to validate email format
const isValidEmail = (email: string) => {
  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, and password',
      });
      return;
    }

    if (name.trim().length < 2) {
      res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters long',
      });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (dbStatus.type === 'mongodb' && dbStatus.connected) {
      const userExists = await User.findOne({ email: normalizedEmail });
      if (userExists) {
        res.status(400).json({
          success: false,
          message: 'An account with this email already exists',
        });
        return;
      }

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
      });

      const token = generateToken(user._id.toString());

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        token,
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      });
    } else {
      // Embedded store registration
      const memoryDb = getMemoryDb();
      const userExists = memoryDb.users.some(
        (u) => u.email.toLowerCase() === normalizedEmail
      );

      if (userExists) {
        res.status(400).json({
          success: false,
          message: 'An account with this email already exists',
        });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newId = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);

      const newUser = {
        _id: newId,
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        avatar: '',
        role: 'developer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      memoryDb.users.push(newUser);
      saveEmbeddedDb();

      const token = generateToken(newId);

      res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        token,
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          avatar: newUser.avatar,
          role: newUser.role,
        },
      });
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (dbStatus.type === 'mongodb' && dbStatus.connected) {
      const user = await User.findOne({ email: normalizedEmail }).select('+password');

      if (!user || !(await user.matchPassword(password))) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password credentials',
        });
        return;
      }

      const token = generateToken(user._id.toString());

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      });
    } else {
      // Embedded store authentication
      const memoryDb = getMemoryDb();
      const user = memoryDb.users.find(
        (u) => u.email.toLowerCase() === normalizedEmail
      );

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password credentials',
        });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password credentials',
        });
        return;
      }

      const token = generateToken(user._id);

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      });
    }
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      error: error.message,
    });
  }
};

// @desc    Get current authenticated user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    res.json({
      success: true,
      user: req.user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving user session',
      error: error.message,
    });
  }
};

// @desc    Update user profile & password
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { name, email, avatar, role, currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (dbStatus.type === 'mongodb' && dbStatus.connected) {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      if (name) user.name = name.trim();
      if (email) user.email = email.toLowerCase().trim();
      if (avatar !== undefined) user.avatar = avatar;
      if (role) user.role = role;

      if (newPassword) {
        if (!currentPassword) {
          res.status(400).json({
            success: false,
            message: 'Current password is required to set a new password',
          });
          return;
        }
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
          res.status(400).json({
            success: false,
            message: 'Current password does not match',
          });
          return;
        }
        user.password = newPassword;
      }

      await user.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      });
    } else {
      // Embedded store profile update
      const memoryDb = getMemoryDb();
      const userIndex = memoryDb.users.findIndex((u) => u._id === userId);
      if (userIndex === -1) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      const user = memoryDb.users[userIndex];

      if (newPassword) {
        if (!currentPassword) {
          res.status(400).json({
            success: false,
            message: 'Current password is required to set a new password',
          });
          return;
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          res.status(400).json({
            success: false,
            message: 'Current password does not match',
          });
          return;
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
      }

      if (name) user.name = name.trim();
      if (email) user.email = email.toLowerCase().trim();
      if (avatar !== undefined) user.avatar = avatar;
      if (role) user.role = role;
      user.updatedAt = new Date().toISOString();

      saveEmbeddedDb();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error updating profile',
      error: error.message,
    });
  }
};
