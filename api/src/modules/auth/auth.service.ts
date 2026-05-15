import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { conflict, unauthorized } from '../../utils/app-error.js';
import { signAccessToken } from '../../utils/jwt.js';
import { comparePassword, hashPassword } from '../../utils/password.js';
import type { LoginInput, RegisterInput } from './auth.schemas.js';

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export async function register(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });

  if (existingUser) {
    throw conflict('Email is already registered');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      passwordHash,
    },
    select: publicUserSelect,
  });

  const token = signAccessToken({ userId: user.id });

  return { user, token };
}

export async function login(input: LoginInput) {
  const userWithPassword = await prisma.user.findUnique({ where: { email: input.email } });

  if (!userWithPassword) {
    throw unauthorized('Invalid email or password');
  }

  const passwordMatches = await comparePassword(input.password, userWithPassword.passwordHash);

  if (!passwordMatches) {
    throw unauthorized('Invalid email or password');
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userWithPassword.id },
    select: publicUserSelect,
  });
  const token = signAccessToken({ userId: user.id });

  return { user, token };
}
