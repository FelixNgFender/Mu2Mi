// This file should not contain any runtime logic besides defining the schema.
// See https://orm.drizzle.team/docs/migrations#quick-start
import {
    bigint,
    boolean,
    index,
    integer,
    pgEnum,
    pgTable,
    serial,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';

export const user = pgTable('auth_user', {
    id: varchar('id', {
        length: 15, // change this when using custom user ids
    }).primaryKey(),
    username: varchar('username', {
        length: 32,
    }).notNull(),
    usernameLower: varchar('username_lower', {
        length: 32,
    }).notNull(),
    email: varchar('email', {
        length: 255,
    })
        .unique()
        .notNull(),
    emailVerified: boolean('email_verified').notNull().default(false),
    // other user attributes
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const key = pgTable(
    'user_key',
    {
        id: varchar('id', {
            length: 255,
        }).primaryKey(),
        userId: varchar('user_id', {
            length: 15,
        })
            .notNull()
            .references(() => user.id, {
                onDelete: 'cascade',
            }),
        hashedPassword: varchar('hashed_password', {
            length: 255,
        }),
    },
    (table) => {
        return {
            userIdIdx: index('user_key_user_id_idx').on(table.userId),
        };
    },
);

export const emailVerification = pgTable(
    'email_verification_token',
    {
        id: varchar('id', {
            length: 128,
        }).primaryKey(), // Token to send inside the verification link
        userId: varchar('user_id', {
            length: 15,
        })
            .notNull()
            .references(() => user.id, {
                onDelete: 'cascade',
            }),
        expires: bigint('expires', {
            mode: 'number',
        }).notNull(), // Expiration (in milliseconds)
    },
    (table) => {
        return {
            userIdIdx: index('email_verification_user_id_idx').on(table.userId),
        };
    },
);

export const passwordReset = pgTable(
    'password_reset_token',
    {
        id: varchar('id', {
            length: 128,
        }).primaryKey(), // Token to send inside the reset link
        userId: varchar('user_id', {
            length: 15,
        })
            .notNull()
            .references(() => user.id, {
                onDelete: 'cascade',
            }),
        expires: bigint('expires', {
            mode: 'number',
        }).notNull(), // Expiration (in milliseconds)
    },
    (table) => {
        return {
            userIdIdx: index('password_reset_user_id_idx').on(table.userId),
        };
    },
);

export const asset = pgTable(
    'asset',
    {
        id: serial('id').primaryKey(),
        userId: varchar('user_id', {
            length: 15,
        })
            .notNull()
            .references(() => user.id, {
                onDelete: 'cascade',
            }),
        name: varchar('name', {
            length: 255,
        }).notNull(),
        mimeType: varchar('mime_type', {
            length: 255,
        }).notNull(),
        size: bigint('size', { mode: 'number' }).notNull(),
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
        userId: varchar('user_id', {
            length: 15,
        })
            .notNull()
            .references(() => user.id, {
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
        title: varchar('title', {
            length: 255,
        }).notNull(),
        artist: varchar('artist', {
            length: 255,
        }),
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
