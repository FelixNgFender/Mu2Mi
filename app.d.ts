/// <reference types="lucia" />
declare namespace Lucia {
    type Auth = import('@/lib/auth').Auth;
    type DatabaseUserAttributes = {
        username: string;
        username_lower: string;
        email: string;
        email_verified: boolean;
    };
    type DatabaseSessionAttributes = {};
}
