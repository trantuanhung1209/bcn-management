import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

// Password hashing
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
}

// JWT token generation
export const generateToken = (payload: any): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export const verifyToken = (token: string): any => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.verify(token, secret);
}

// ObjectId validation
export const isValidObjectId = (id: string): boolean => {
  return ObjectId.isValid(id);
}

export const toObjectId = (id: string): ObjectId => {
  if (!isValidObjectId(id)) {
    throw new Error("Invalid ObjectId format");
  }
  return new ObjectId(id);
}

// API response helpers
export const successResponse = <T>(data: T, message?: string) => {
  return {
    success: true,
    data,
    message: message || 'Operation successful'
  };
}

export const errorResponse = (message: string, error?: string) => {
  return {
    success: false,
    message,
    error
  };
}
