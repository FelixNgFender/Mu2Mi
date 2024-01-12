/// <reference types="lucia" />
declare namespace Lucia {
    type Auth = import('@/server/auth').Auth;
    type DatabaseUserAttributes = {
        username: string;
        username_lower: string;
        email: string;
        email_verified: boolean;
    };
    type DatabaseSessionAttributes = {};
}
