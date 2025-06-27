import { auth, currentUser } from '@clerk/nextjs/server';

export { auth, currentUser };

export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Not authenticated');
  }
  return userId;
}
