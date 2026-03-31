import { TRPCError } from '@trpc/server';
import type { Context } from '../context';
import type { PrivilegeTier } from '@/lib/auth/types';
import { PRIVILEGE_TIERS } from '@/lib/auth/types';

/**
 * Erstellt eine tRPC-Middleware, die eine Mindest-Privilegstufe erzwingt.
 *
 * Muss nach der Auth-Middleware verwendet werden (benötigt ctx.user und ctx.profile).
 *
 * Beispiel:
 * ```ts
 * .use(requireTier(2)) // Mindestens "Mitwirkender"
 * ```
 */
export function requireTier(minTier: PrivilegeTier) {
  return async ({
    ctx,
    next,
  }: {
    ctx: Context & { user: NonNullable<Context['user']> };
    next: () => Promise<unknown>;
  }) => {
    const userTier = (ctx.profile?.privilege_tier ?? 0) as PrivilegeTier;

    if (userTier < minTier) {
      const requiredName = PRIVILEGE_TIERS[minTier].name;
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Diese Aktion erfordert mindestens die Stufe "${requiredName}".`,
      });
    }

    return next();
  };
}
