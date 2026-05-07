import bcrypt from 'bcrypt';
import { env } from '../config/env.js';

export function hashPassword(password: string) {
  return bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
}

export function comparePassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}
