import { router } from '../trpc';
import { authRouter } from './auth';
import { journeyRouter } from './journey';

export const appRouter = router({
  auth: authRouter,
  journey: journeyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
