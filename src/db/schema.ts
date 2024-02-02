// This file should not contain any runtime logic besides defining the schema.
// See https://orm.drizzle.team/docs/migrations#quick-start
import { sql } from 'drizzle-orm';
import {
    bigint,
    boolean,
    index,
    integer,
    pgEnum,
    pgTable,
    primaryKey,
    serial,
    text,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';
import { customType } from 'drizzle-orm/pg-core';

export const userTable = pgTable('user', {
    id: text('id').primaryKey(),
    email: text('email').unique().notNull(),
    emailVerified: boolean('email_verified').notNull().default(false),
    username: text('username').unique().notNull(),
    usernameLower: text('username_lower').unique().notNull(),
    hashedPassword: text('hashed_password'),
    // other user attributes
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export interface DatabaseUser {
    id: string;
    email: string;
    emailVerified: boolean;
    username: string;
    usernameLower: string;
    hashedPassword?: string;
    createdAt: Date;
    updatedAt: Date;
}

export const sessionTable = pgTable(
    'session',
    {
        id: text('id').primaryKey(),
        userId: text('user_id')
            .notNull()
            .references(() => userTable.id, {
                onDelete: 'cascade',
            }),
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
    'facebook',
]);

export const oauthAccountTable = pgTable(
    'oauth_account',
    {
        providerId: providerId('provider_id').notNull(),
        providerUserId: text('provider_user_id').notNull(),
        userId: text('user_id')
            .notNull()
            .references(() => userTable.id, {
                onDelete: 'cascade',
            }),
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
            .references(() => userTable.id, {
                onDelete: 'cascade',
            }),
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
            .references(() => userTable.id, {
                onDelete: 'cascade',
            }),
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
    'audio/mpeg',
    'audio/wav',
    'audio/flac',
    'audio/mp4',
    'audio/mov',
    'audio/wma',
]);

// TODO: Opportunity to optimize: use DB as soft cache before hitting S3
export const assetTable = pgTable(
    'asset',
    {
        // TODO: https://github.com/drizzle-team/drizzle-orm/pull/1471
        // Wait for this to land and replace the below workaround for all tables
        id: varchar('id', {
            length: 15,
        }).primaryKey(),
        userId: text('user_id')
            .notNull()
            .references(() => userTable.id, {
                onDelete: 'cascade',
            }),
        name: text('name').unique().notNull(), // FK to S3 object name, cannot guarantee that users will actually upload files with their presigned URLs
        mimeType: mimeType('mime_type'),
        createdAt: timestamp('created_at').defaultNow(),
        updatedAt: timestamp('updated_at').defaultNow(),
    },
    (table) => {
        return {
            userIdIdx: index('asset_user_id_idx').on(table.userId),
        };
    },
);

// our 'pending' -> received webhook of 'start' event -> our 'processing'
// -> received webhook of 'completed' event -> our 'succeeded' or 'failed'
export const trackStatusEnum = pgEnum('replicate_task_status', [
    'pending',
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
            length: 15,
        }).primaryKey(),
        // no need to use UUID since track IDs are not sensitive
        // but useful technique, so keep it here for future reference
        // maybe look into nanoid, temporarily use nanoid for track ids
        // https://brockherion.dev/blog/posts/why-im-using-nanoids-for-my-database-keys/
        userId: text('user_id')
            .notNull()
            .references(() => userTable.id, {
                onDelete: 'cascade',
            }),
        // TODO: investigate why foreign keys default to NOT NULL
        originalAssetId: varchar('original_asset_id', {
            length: 15,
        }).references(() => assetTable.id, {
            onDelete: 'cascade',
        }),
        vocalsAssetId: varchar('vocals_asset_id', { length: 15 }).references(
            () => assetTable.id,
            {
                onDelete: 'cascade',
            },
        ),
        accompanimentAssetId: varchar('accompaniment_asset_id', {
            length: 15,
        }).references(() => assetTable.id, { onDelete: 'cascade' }),
        bassAssetId: varchar('bass_asset_id', { length: 15 }).references(
            () => assetTable.id,
            {
                onDelete: 'cascade',
            },
        ),
        drumsAssetId: varchar('drums_asset_id', { length: 15 }).references(
            () => assetTable.id,
            {
                onDelete: 'cascade',
            },
        ),
        guitarAssetId: varchar('guitar_asset_id', { length: 15 }).references(
            () => assetTable.id,
            {
                onDelete: 'cascade',
            },
        ),
        pianoAssetId: varchar('piano_asset_id', { length: 15 }).references(
            () => assetTable.id,
            {
                onDelete: 'cascade',
            },
        ),
        midiAssetId: varchar('midi_asset_id', { length: 15 }).references(
            () => assetTable.id,
            {
                onDelete: 'cascade',
            },
        ),
        name: text('name').notNull(),
        status: trackStatusEnum('status').notNull(),
        createdAt: timestamp('created_at').defaultNow(),
        updatedAt: timestamp('updated_at').defaultNow(),
    },
    (table) => {
        return {
            userIdIdx: index('track_user_id_idx').on(table.userId),
        };
    },
);
