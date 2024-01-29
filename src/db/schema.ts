// This file should not contain any runtime logic besides defining the schema.
// See https://orm.drizzle.team/docs/migrations#quick-start
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

export const asset = pgTable(
    'asset',
    {
        id: serial('id').primaryKey(),
        userId: text('user_id')
            .notNull()
            .references(() => userTable.id, {
                onDelete: 'cascade',
            }),
        url: text('url').notNull(),
        mimeType: mimeType('mime_type').notNull(),
        createdAt: timestamp('created_at').defaultNow(),
        updatedAt: timestamp('updated_at').defaultNow(),
    },
    (table) => {
        return {
            userIdIdx: index('asset_user_id_idx').on(table.userId),
        };
    },
);

export const track = pgTable(
    'track',
    {
        id: serial('id').primaryKey(),
        // no need to use UUID since track IDs are not sensitive
        // but useful technique, so keep it here for future reference
        uuid: uuid('uuid').notNull().defaultRandom().unique(),
        userId: text('user_id')
            .notNull()
            .references(() => userTable.id, {
                onDelete: 'cascade',
            }),
        taskId: bigint('task_id', { mode: 'number' })
            .notNull()
            .references(() => task.id, {
                onDelete: 'cascade',
            })
            .unique(), // 1-to-1 relationship
        vocalsAssetId: bigint('vocals_asset_id', { mode: 'number' }).references(
            () => asset.id,
            {
                onDelete: 'cascade',
            },
        ),
        accompanimentAssetId: bigint('accompaniment_asset_id', {
            mode: 'number',
        }).references(() => asset.id, { onDelete: 'cascade' }),
        bassAssetId: bigint('bass_asset_id', { mode: 'number' }).references(
            () => asset.id,
            { onDelete: 'cascade' },
        ),
        drumsAssetId: bigint('drums_asset_id', { mode: 'number' }).references(
            () => asset.id,
            { onDelete: 'cascade' },
        ),
        guitarAssetId: bigint('guitar_asset_id', { mode: 'number' }).references(
            () => asset.id,
            { onDelete: 'cascade' },
        ),
        pianoAssetId: bigint('piano_asset_id', { mode: 'number' }).references(
            () => asset.id,
            { onDelete: 'cascade' },
        ),
        midiAssetId: bigint('midi_asset_id', { mode: 'number' }).references(
            () => asset.id,
            { onDelete: 'cascade' },
        ),
        title: text('title').notNull(),
        artist: text('artist'),
        stems: integer('stems').notNull(), // TODO: add CHECK constraint here once Drizzle has added support for it
        includesMidi: boolean('includes_midi').notNull(),
        tempo: integer('tempo').notNull(),
        createdAt: timestamp('created_at').defaultNow(),
        updatedAt: timestamp('updated_at').defaultNow(),
    },
    (table) => {
        return {
            trackUuidIdx: index('track_uuid_idx').on(table.uuid),
            userIdIdx: index('track_user_id_idx').on(table.userId),
        };
    },
);

export const taskStatusEnum = pgEnum('task_status', [
    'starting', // the prediction is starting up. If this status lasts longer than a few seconds, then it’s typically because a new worker is being started to run the prediction.
    'processing', // the predict() method of the model is currently running.
    'succeeded', // the prediction completed successfully.
    'failed', // the prediction encountered an error during processing.
    'canceled', // the prediction was canceled by its creator.
]);

// Will be hidden from the user-facing parts of the web client, so no need UUID
export const task = pgTable('task', {
    id: serial('id').primaryKey(),
    status: taskStatusEnum('status').notNull(),
});
