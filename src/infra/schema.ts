// This file should not contain any runtime logic besides defining the schema.
// See https://orm.drizzle.team/docs/migrations#quick-start
import {
    boolean,
    index,
    pgEnum,
    pgTable,
    primaryKey,
    serial,
    text,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core';
import { customAlphabet } from 'nanoid';

const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
const publicIdLength = 15;

const nanoid = customAlphabet(alphabet, publicIdLength);

export const generatePublicId = () => {
    return nanoid();
};

const cascadingUpdateAndDelete = {
    onUpdate: 'cascade',
    onDelete: 'cascade',
} as const;

const updateAndCreatedAt = {
    updatedAt: timestamp('updated_at').notNull(),
    createdAt: timestamp('created_at').notNull(),
};

export const userTable = pgTable('user', {
    id: text('id').primaryKey(),
    email: text('email').unique().notNull(),
    emailVerified: boolean('email_verified').notNull().default(false),
    hashedPassword: text('hashed_password'),
    // other user attributes
    ...updateAndCreatedAt,
});

export const sessionTable = pgTable(
    'session',
    {
        id: text('id').primaryKey(),
        userId: text('user_id')
            .notNull()
            .references(() => userTable.id, cascadingUpdateAndDelete),
        expiresAt: timestamp('expires_at', {
            withTimezone: true,
            mode: 'date',
        }).notNull(),
    },
    (table) => {
        return {
            userIdIdx: index('session_user_id_idx').on(table.userId),
        };
    },
);

export const providerId = pgEnum('provider_id', [
    'github',
    'google',
    // 'facebook',
]);

export const oauthAccountTable = pgTable(
    'oauth_account',
    {
        providerId: providerId('provider_id').notNull(),
        providerUserId: text('provider_user_id').notNull(),
        userId: text('user_id')
            .notNull()
            .references(() => userTable.id, cascadingUpdateAndDelete),
    },
    (table) => {
        return {
            oauthAccountPk: primaryKey({
                columns: [table.providerId, table.providerUserId],
            }),
            providerIdIdx: index('oauth_account_provider_id_idx').on(
                table.providerId,
            ),
            providerUserIdIdx: index('oauth_account_provider_user_id_idx').on(
                table.providerUserId,
            ),
            userIdIdx: index('oauth_account_user_id_idx').on(table.userId),
        };
    },
);

export const emailVerificationTable = pgTable(
    'email_verification_code',
    {
        id: serial('id').primaryKey(),
        code: varchar('code', {
            length: 6,
        }).notNull(),
        userId: text('user_id')
            .notNull()
            .references(() => userTable.id, cascadingUpdateAndDelete),
        email: text('email').notNull(),
        expiresAt: timestamp('expires_at', {
            withTimezone: true,
            mode: 'date',
        }).notNull(),
    },
    (table) => {
        return {
            userIdIdx: index('email_verification_user_id_idx').on(table.userId),
        };
    },
);

export const passwordResetTable = pgTable(
    'password_reset_token',
    {
        id: text('id').primaryKey(), // Token to send inside the reset link
        userId: text('user_id')
            .notNull()
            .references(() => userTable.id, cascadingUpdateAndDelete),
        expiresAt: timestamp('expires_at', {
            withTimezone: true,
            mode: 'date',
        }).notNull(),
    },
    (table) => {
        return {
            userIdIdx: index('password_reset_user_id_idx').on(table.userId),
        };
    },
);

export const mimeType = pgEnum('mime_type', [
    'audio/mp3',
    'audio/mpeg',
    'audio/wav',
    'audio/flac',
    'audio/mp4',
    'audio/mov',
    'audio/wma',
    'audio/ogg',
    'audio/m4a',
    'application/json',
    'image/png',
    'audio/sp-midi',
    'audio/x-wav',
]);

export const trackAssetType = pgEnum('track_asset_type', [
    'generation',
    'remix',
    'original',
    'vocals',
    'accompaniment',
    'bass',
    'drums',
    'guitar',
    'piano',
    'analysis',
    'analysis_sonic',
    'analysis_viz',
    'midi',
    'lyrics',
]);

export const assetTable = pgTable(
    'asset',
    {
        // TODO: https://github.com/drizzle-team/drizzle-orm/pull/1471
        // Wait for this to land and replace the below workaround for all tables
        id: varchar('id', {
            length: publicIdLength,
        })
            .primaryKey()
            .$defaultFn(generatePublicId),
        userId: text('user_id')
            .notNull()
            .references(() => userTable.id, cascadingUpdateAndDelete),
        trackId: varchar('track_id', {
            length: publicIdLength,
        }).references(() => trackTable.id, cascadingUpdateAndDelete),
        type: trackAssetType('track_type'),
        name: text('name').unique().notNull(), // FK to S3 object name, cannot guarantee that users will actually upload files with their presigned URLs
        mimeType: mimeType('mime_type'),
        ...updateAndCreatedAt,
    },
    (table) => {
        return {
            userIdIdx: index('asset_user_id_idx').on(table.userId),
            trackIdIdx: index('asset_track_id_idx').on(table.trackId),
        };
    },
);

// our 'processing' -> received webhook of 'completed' event -> our 'succeeded' or 'failed' or 'canceled'
export const trackStatusEnum = pgEnum('replicate_task_status', [
    'processing',
    'succeeded',
    'failed',
    'canceled',
]);

// Replicate's definitions:
// 'starting', // the prediction is starting up. If this status lasts longer than a few seconds, then it’s typically because a new worker is being started to run the prediction.
// 'processing', // the predict() method of the model is currently running.
// 'succeeded', // the prediction completed successfully.
// 'failed', // the prediction encountered an error during processing.
// 'canceled', // the prediction was canceled by its creator.

export const trackTable = pgTable(
    'track',
    {
        id: varchar('id', {
            length: publicIdLength,
        })
            .primaryKey()
            .$defaultFn(generatePublicId),
        // no need to use UUID since track IDs are not sensitive
        // but useful technique, so keep it here for future reference
        // maybe look into nanoid, temporarily use nanoid for track ids
        // https://brockherion.dev/blog/posts/why-im-using-nanoids-for-my-database-keys/
        userId: text('user_id')
            .notNull()
            .references(() => userTable.id, cascadingUpdateAndDelete),
        name: text('name').notNull(),
        public: boolean('public').notNull().default(false),
        musicGenerationStatus: trackStatusEnum('music_generation_status'),
        styleRemixStatus: trackStatusEnum('style_remix_status'),
        trackSeparationStatus: trackStatusEnum('track_separation_status'),
        trackAnalysisStatus: trackStatusEnum('track_analysis_status'),
        midiTranscriptionStatus: trackStatusEnum('midi_transcription_status'),
        lyricsTranscriptionStatus: trackStatusEnum(
            'lyrics_transcription_status',
        ),
        ...updateAndCreatedAt,
    },
    (table) => {
        return {
            userIdIdx: index('track_user_id_idx').on(table.userId),
        };
    },
);

export const trackStatusColumns = [
    'musicGenerationStatus',
    'styleRemixStatus',
    'trackSeparationStatus',
    'trackAnalysisStatus',
    'midiTranscriptionStatus',
    'lyricsTranscriptionStatus',
] as const;
