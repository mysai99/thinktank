import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

export const authRoutes = new Hono();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(1, 'Display name is required').max(100),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Register
authRoutes.post('/register', zValidator('json', registerSchema), async (c) => {
  const data = c.req.valid('json');

  // TODO: Implement actual registration logic
  // - Check if email exists
  // - Hash password with bcrypt
  // - Create user in database
  // - Generate JWT token

  return c.json(
    {
      message: 'Registration successful',
      user: {
        id: 'temp-user-id',
        email: data.email,
        displayName: data.displayName,
      },
    },
    201
  );
});

// Login
authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const data = c.req.valid('json');

  // TODO: Implement actual login logic
  // - Find user by email
  // - Verify password
  // - Generate JWT token

  return c.json({
    message: 'Login successful',
    token: 'temp-jwt-token',
    user: {
      id: 'temp-user-id',
      email: data.email,
    },
  });
});

// Logout
authRoutes.post('/logout', async (c) => {
  // TODO: Implement token invalidation if needed
  return c.json({ message: 'Logged out successfully' });
});

// Get current user
authRoutes.get('/me', async (c) => {
  // TODO: Implement JWT verification and user retrieval
  return c.json({
    user: null,
    message: 'Not authenticated',
  });
});
