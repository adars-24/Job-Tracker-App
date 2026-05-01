import jwt from "jsonwebtoken";
import User, { IUser } from "../models/user";
import { ApiResponse } from "../config/types";
import { Request, Response } from "express";

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret", {
    expiresIn: "30d",
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, message: "User already exists" });
      return;
    }

    const user: IUser = await User.create({ name, email, password });
    const token = generateToken(user._id.toString());

    const response: ApiResponse<{ token: string; name: string }> = {
      success: true,
      data: { token, name: user.name },
      message: "Registered successfully",
    };
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const token = generateToken(user._id.toString());

    const response: ApiResponse<{ token: string; name: string }> = {
      success: true,
      data: { token, name: user.name },
      message: "Login successful",
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
