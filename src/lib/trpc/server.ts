import 'server-only';
import { createCallerFactory } from '@/server/trpc';
import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/server/context';

const createCaller = createCallerFactory(appRouter);

export async function createServerCaller() {
  const ctx = await createContext();
  return createCaller(ctx);
}
