// This file should not contain any runtime logic besides defining the schema.
// See https://orm.drizzle.team/docs/migrations#quick-start
import {
    bigint,
    boolean,
    index,
    pgTable,
    timestamp,
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
