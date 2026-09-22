import { z } from "zod";
import { login, register } from "../services/auth.service.js";
const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(80).optional(),
});
export async function registerUser(req, res, next) {
  try {
    const input = credentials.parse(req.body);
    res.status(201).json(await register(input));
  } catch (error) {
    next(error);
  }
}
export async function loginUser(req, res, next) {
  try {
    const input = credentials.omit({ name: true }).parse(req.body);
    res.json(await login(input));
  } catch (error) {
    next(error);
  }
}
export function me(req, res) {
  res.json({ user: req.user });
}
