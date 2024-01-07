import { lucia } from "lucia";
// import "lucia/polyfill/node";
import { cache } from "react";
import * as context from "next/headers";
import { nextjs_future } from "lucia/middleware";
import { prisma as prismaAdapter } from "@lucia-auth/adapter-prisma";
import { redis as redisAdapter } from "@lucia-auth/adapter-session-redis";
import { queryClient, redisClient } from "./db";

export const auth = lucia({
  env: process.env.NODE_ENV === "development" ? "DEV" : "PROD",
  middleware: nextjs_future(),
  adapter: {
    user: prismaAdapter(queryClient),
    session: redisAdapter(redisClient),
  },
  sessionCookie: {
    expires: false,
  },
  getUserAttributes: (databaseUser) => {
    return {
      username: databaseUser.username,
      usernameLower: databaseUser.username_lower,
      email: databaseUser.email,
      emailVerified: databaseUser.email_verified,
    };
  },
});

export type Auth = typeof auth;

export const getPageSession = cache(() => {
  const authRequest = auth.handleRequest("GET", context);
  return authRequest.validate();
});
