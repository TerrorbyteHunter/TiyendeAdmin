
import jwt from 'jsonwebtoken';
import { storage } from './storage';

// JWT Secret (in production, this would be an environment variable)
const JWT_SECRET = "tiyende-super-secret-key";
const JWT_EXPIRES_IN = "24h";

interface TokenPayload {
  id: number;
  username: string;
  role: string;
  sessionId?: string;
  iat?: number;
  exp?: number;
}

export async function createSession(userId: number, ipAddress: string, userAgent: string): Promise<string> {
  // Generate a unique session ID
  const sessionId = Math.random().toString(36).substring(2, 15) + 
                    Math.random().toString(36).substring(2, 15);
  
  // Log the session in the database
  await storage.createActivity({
    userId,
    action: "Session created",
    details: { 
      sessionId,
      ipAddress,
      userAgent,
      timestamp: new Date().toISOString()
    }
  });
  
  // Get user data
  const user = await storage.getUser(userId);
  if (!user) {
    throw new Error("User not found");
  }
  
  // Generate JWT token with session ID
  const token = jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role,
      sessionId 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  
  // Store token in user record
  await storage.setUserToken(userId, token);
  
  return token;
}

export async function validateSession(token: string): Promise<TokenPayload | null> {
  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    
    // Get the user
    const user = await storage.getUser(decoded.id);
    
    // Check if the token matches what's stored
    if (!user || user.token !== token) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function endSession(token: string): Promise<boolean> {
  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    
    // Clear the token
    await storage.setUserToken(decoded.id, null);
    
    // Log session end
    await storage.createActivity({
      userId: decoded.id,
      action: "Session ended",
      details: { 
        sessionId: decoded.sessionId,
        timestamp: new Date().toISOString()
      }
    });
    
    return true;
  } catch (error) {
    return false;
  }
}

export async function refreshSession(token: string): Promise<string | null> {
  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    
    // Get the user
    const user = await storage.getUser(decoded.id);
    
    // Check if the token matches what's stored
    if (!user || user.token !== token) {
      return null;
    }
    
    // Generate a new token with the same session ID
    const newToken = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        sessionId: decoded.sessionId 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    // Update token in user record
    await storage.setUserToken(decoded.id, newToken);
    
    return newToken;
  } catch (error) {
    return null;
  }
}
