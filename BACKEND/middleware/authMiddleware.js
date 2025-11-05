import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Core function: Verify token and fetch user object
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // 1. Check for token presence
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." }); 
  }

  const token = authHeader.split(" ")[1];
  
  try {
    // 2. Verify the token signature (synchronous check)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Fetch the full user object from the database (asynchronous check)
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }
    
    // 4. Attach the full user object to the request
    req.user = user; 
    next();
  } catch (error) {
    // Handles JWT verification errors (expired, invalid signature)
    return res.status(403).json({ message: "Invalid or expired token." }); 
  }
};

// Admin Check: Uses the full user object attached by verifyToken
export const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};