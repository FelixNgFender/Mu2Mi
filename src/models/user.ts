import { db } from '@/db';
import { user as userTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import 'server-cli-only';

class UserModel {
    /**
     * Will lowercase the email address before searching.
     */
    async findOneByEmail(email: string) {
        return await db
            .select()
            .from(userTable)
            .where(eq(userTable.email, email.toLowerCase()))
            .then((users) => users[0]);
    }
}

export const userModel = new UserModel();
