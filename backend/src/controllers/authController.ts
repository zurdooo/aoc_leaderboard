import { Request, Response } from "express";
import { SHARED_PASSWORD, COOKIE_NAME, IS_PROD } from "../config";

export const login = (req: Request, res: Response) => {
  const { username, password } = req.body ?? {};
  console.log(`Login attempt for user: '${username}'`);

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  // In the future, you can replace this with a database check
  const isValid = password === SHARED_PASSWORD;

  if (!isValid) {
    console.log(`Login failed for user: '${username}'. Invalid password.`);
    return res.status(401).json({ error: "Invalid credentials" });
  }

  console.log(`Login successful for user: '${username}'`);

  // Create a simple token (in production, use a real JWT)
  const token = `user:${username}:${Math.random().toString(36).slice(2)}`;

  // Set HttpOnly cookie
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: IS_PROD, // Only send over HTTPS in production
    sameSite: "lax", // Allows the cookie to be sent on top-level nav
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  return res.json({ success: true, user: { username } });
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME);
  return res.json({ success: true });
};

export const validateSession = (req: Request, res: Response) => {
  console.log("Validating session...");
  const token = req.cookies[COOKIE_NAME];

  if (!token) {
    console.log("No token found in cookies.");
    return res.status(401).json({ authenticated: false });
  }

  console.log("Token found:", token);

  // In a real app, verify the JWT here
  // For now, we just check if the cookie exists and has the right format
  const [prefix, username] = token.split(":");
  if (prefix !== "user" || !username) {
    console.log("Invalid token format.");
    return res.status(401).json({ authenticated: false });
  }

  console.log(`Session validated for user: ${username}`);
  return res.json({ authenticated: true, user: { username } });
};
