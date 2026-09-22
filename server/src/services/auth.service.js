import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { env } from "../config/env.js";

function tokenFor(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}
export async function register({ name, email, password }) {
  if (await User.exists({ email }))
    throw Object.assign(new Error("Email is already registered"), {
      statusCode: 409,
    });
  const user = await User.create({
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
  });
  return {
    token: tokenFor(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
}
export async function login({ email, password }) {
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    throw Object.assign(new Error("Invalid email or password"), {
      statusCode: 401,
    });
  return {
    token: tokenFor(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
}
