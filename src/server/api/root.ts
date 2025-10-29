import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { workspaceRouter } from "./routers/workspace/workspace";
import { promptRouter } from "./routers/prompt/prompt";
import { cronRouter } from "./routers/cron/cron";
import { locationRouter } from "./routers/location/location";
import { analysisRouter } from "./routers/analysis/analysis";
import { brandRouter } from "./routers/brand/brand";

export const appRouter = createTRPCRouter({
    workspace: workspaceRouter,
    prompt: promptRouter,
    cron: cronRouter,
    location: locationRouter,
    analysis: analysisRouter,
    brand: brandRouter
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
