import { redis } from '@/infra';
import { headers } from 'next/headers';
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import 'server-only';

import { errorHandler } from './error';

function getIPAdress() {
    const FALLBACK_IP_ADDRESS = '0.0.0.0';
    const forwardedFor = headers().get('X-Forwarded-For');
    if (forwardedFor) {
        return forwardedFor.split(',')[0] ?? FALLBACK_IP_ADDRESS;
    }
    return headers().get('x-real-ip') ?? FALLBACK_IP_ADDRESS;
}

const signInRateLimiter = new RateLimiterRedis({
    storeClient: redis,
    useRedisPackage: true,
    keyPrefix: 'rate-limiter:sign-in',
    points: 5,
    duration: 5 * 60,
});

const signUpRateLimiter = new RateLimiterRedis({
    storeClient: redis,
    useRedisPackage: true,
    keyPrefix: 'rate-limiter:sign-up',
    points: 3,
    duration: 1 * 60 * 60 * 24,
});

const passwordResetRateLimiter = new RateLimiterRedis({
    storeClient: redis,
    useRedisPackage: true,
    keyPrefix: 'rate-limiter:password-reset',
    points: 3,
    duration: 1 * 60 * 60,
});

const verifyCodeRateLimiter = new RateLimiterRedis({
    storeClient: redis,
    useRedisPackage: true,
    keyPrefix: 'rate-limiter:verify-code',
    points: 5,
    duration: 1 * 60 * 60,
});

const resendCodeRateLimiter = new RateLimiterRedis({
    storeClient: redis,
    useRedisPackage: true,
    keyPrefix: 'rate-limiter:resend-code',
    points: 5,
    duration: 1 * 60 * 60,
});

const trackProcessingRateLimiter = new RateLimiterRedis({
    storeClient: redis,
    useRedisPackage: true,
    keyPrefix: 'rate-limiter:track-processing',
    points: 10,
    duration: 1 * 60 * 60 * 24,
});

/**
 * These rate limiters will throw an error if the rate limit is exceeded. Handle
 * the errors appropriately.
 */
const rateLimit = {
    /**
     * 5 requests from the same IP in 5 minutes.
     */
    signIn: async () => {
        try {
            await signInRateLimiter.consume(getIPAdress());
        } catch (rejRes) {
            if (rejRes instanceof RateLimiterRes) {
                throw rejRes;
            }
            await errorHandler.handleError(rejRes as Error);
        }
    },

    /**
     * 3 requests from the same IP in 24 hours.
     */
    signUp: async () => {
        try {
            await signUpRateLimiter.consume(getIPAdress());
        } catch (rejRes) {
            if (rejRes instanceof RateLimiterRes) {
                throw rejRes;
            }
            await errorHandler.handleError(rejRes as Error);
        }
    },

    /**
     * 3 requests from the same IP in 1 hour.
     */
    passwordReset: async () => {
        try {
            await passwordResetRateLimiter.consume(getIPAdress());
        } catch (rejRes) {
            if (rejRes instanceof RateLimiterRes) {
                throw rejRes;
            }
            await errorHandler.handleError(rejRes as Error);
        }
    },

    /**
     * 5 requests from the same user in 1 hour.
     */
    verifyCode: async (userId: string) => {
        try {
            await verifyCodeRateLimiter.consume(userId);
        } catch (rejRes) {
            if (rejRes instanceof RateLimiterRes) {
                throw rejRes;
            }
            await errorHandler.handleError(rejRes as Error);
        }
    },

    /**
     * 5 requests from the same user in 1 hour.
     */
    resendCode: async (userId: string) => {
        try {
            await resendCodeRateLimiter.consume(userId);
        } catch (rejRes) {
            if (rejRes instanceof RateLimiterRes) {
                throw rejRes;
            }
            await errorHandler.handleError(rejRes as Error);
        }
    },

    /**
     * 10 requests from the same user in 24 hours.
     */
    trackProcessing: async (userId: string) => {
        try {
            await trackProcessingRateLimiter.consume(userId);
        } catch (rejRes) {
            if (rejRes instanceof RateLimiterRes) {
                throw rejRes;
            }
            await errorHandler.handleError(rejRes as Error);
        }
    },

    getUserCredits: async (userId: string) => {
        try {
            const rateLimiterRes = await trackProcessingRateLimiter.get(userId);

            if (!rateLimiterRes) {
                return {
                    remainingCredits: 10,
                    msBeforeNext: 0,
                };
            }

            return {
                remainingCredits: rateLimiterRes.remainingPoints,
                msBeforeNext: rateLimiterRes.msBeforeNext,
            };
        } catch (rejRes) {
            await errorHandler.handleError(rejRes as Error);
            return {
                remainingCredits: 10,
                msBeforeNext: 0,
            };
        }
    },
};

if (process.env.ENABLE_RATE_LIMIT === 'false') {
    for (const key in rateLimit) {
        // @ts-expect-error - key guarantees to appear in rateLimit
        rateLimit[key] = async () => {};
        rateLimit.getUserCredits = async () => {
            return {
                remainingCredits: 10,
                msBeforeNext: 0,
            };
        };
    }
}

export { rateLimit };
