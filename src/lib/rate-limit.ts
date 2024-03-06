import { cache } from '@/infra';
import { headers } from 'next/headers';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import 'server-only';

function getIPAdress() {
    const FALLBACK_IP_ADDRESS = '0.0.0.0';
    const forwardedFor = headers().get('X-Forwarded-For');
    if (forwardedFor) {
        return forwardedFor.split(',')[0] ?? FALLBACK_IP_ADDRESS;
    }
    return headers().get('x-real-ip') ?? FALLBACK_IP_ADDRESS;
}

const signInRateLimiter = new RateLimiterRedis({
    storeClient: cache,
    keyPrefix: 'rate-limiter:sign-in',
    points: 5,
    duration: 5 * 60,
});

const signUpRateLimiter = new RateLimiterRedis({
    storeClient: cache,
    keyPrefix: 'rate-limiter:sign-up',
    points: 3,
    duration: 1 * 60 * 60 * 24,
});

const passwordResetRateLimiter = new RateLimiterRedis({
    storeClient: cache,
    keyPrefix: 'rate-limiter:password-reset',
    points: 3,
    duration: 1 * 60 * 60,
});

const verifyCodeRateLimiter = new RateLimiterRedis({
    storeClient: cache,
    keyPrefix: 'rate-limiter:verify-code',
    points: 5,
    duration: 1 * 60 * 60,
});

const resendCodeRateLimiter = new RateLimiterRedis({
    storeClient: cache,
    keyPrefix: 'rate-limiter:resend-code',
    points: 5,
    duration: 1 * 60 * 60,
});

const trackProcessingRateLimiter = new RateLimiterRedis({
    storeClient: cache,
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
        await signInRateLimiter.consume(getIPAdress());
    },

    /**
     * 3 requests from the same IP in 24 hours.
     */
    signUp: async () => {
        await signUpRateLimiter.consume(getIPAdress());
    },

    /**
     * 3 requests from the same IP in 1 hour.
     */
    passwordReset: async () => {
        await passwordResetRateLimiter.consume(getIPAdress());
    },

    /**
     * 5 requests from the same user in 1 hour.
     */
    verifyCode: async (userId: string) => {
        await verifyCodeRateLimiter.consume(userId);
    },

    /**
     * 5 requests from the same user in 1 hour.
     */
    resendCode: async (userId: string) => {
        await resendCodeRateLimiter.consume(userId);
    },

    /**
     * 10 requests from the same user in 24 hours.
     */
    trackProcessing: async (userId: string) => {
        await trackProcessingRateLimiter.consume(userId);
    },
};

if (process.env.ENABLE_RATE_LIMIT === 'false') {
    for (const key in rateLimit) {
        // @ts-expect-error - key guarantees to appear in rateLimit
        rateLimit[key] = async () => {};
    }
}

export { rateLimit };
