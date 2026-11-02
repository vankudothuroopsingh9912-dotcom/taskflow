import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.ts';
import { dbStatus, getMemoryDb } from '../config/db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'taskflow_super_secure_jwt_secret_key_2026_x89f';

export interface AuthenticatedUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export const generateToken = (id: string): string => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Not authorized: Access token is missing',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    if (dbStatus.type === 'mongodb' && dbStatus.connected) {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Not authorized: User no longer exists',
        });
        return;
      }
      req.user = {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      };
    } else {
      // Embedded DB lookup
      const memoryDb = getMemoryDb();
      const user = memoryDb.users.find((u) => u._id === decoded.id);
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Not authorized: User not found in active session store',
        });
        return;
      }
      req.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      };
    }

    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      message: 'Not authorized: Token has expired or is invalid',
      error: err.message,
    });
  }
};
