import { router } from '../trpc';
import { healthRouter } from './health';
import { authRouter } from './auth';
import { usersRouter } from './users';
import { bundestagRouter } from './bundestag';
import { votesRouter } from './votes';
import { sessionRouter } from './session';
import { gamificationRouter } from './gamification';
import { topicsRouter } from './topics';
import { commentsRouter } from './comments';
import { moderationRouter } from './moderation';
import { searchRouter } from './search';
import { feedRouter } from './feed';
import { notificationsRouter } from './notifications';
import { pushRouter } from './push';
import { mapRouter } from './map';
import { adminRouter } from './admin';
import { adminUsersRouter } from './admin-users';
import { adminSyncRouter } from './admin-sync';
import { adminAnalyticsRouter } from './admin-analytics';
import { adminAuditRouter } from './admin-audit';
import { featureFlagsRouter } from './feature-flags';

export const appRouter = router({
  health: healthRouter,
  auth: authRouter,
  users: usersRouter,
  bundestag: bundestagRouter,
  votes: votesRouter,
  session: sessionRouter,
  gamification: gamificationRouter,
  topics: topicsRouter,
  comments: commentsRouter,
  moderation: moderationRouter,
  search: searchRouter,
  feed: feedRouter,
  notifications: notificationsRouter,
  push: pushRouter,
  map: mapRouter,
  admin: adminRouter,
  adminUsers: adminUsersRouter,
  adminSync: adminSyncRouter,
  adminAnalytics: adminAnalyticsRouter,
  adminAudit: adminAuditRouter,
  featureFlags: featureFlagsRouter,
});

export type AppRouter = typeof appRouter;
