export const isEmailValid = (email: unknown): boolean => {
  if (typeof email !== "string") return false;
  const s = email.trim();
  if (!s || s.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
};
