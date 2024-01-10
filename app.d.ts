/// <reference types="lucia" />
declare namespace Lucia {
    type Auth = import('@/src/app/_server/auth').Auth;
    type DatabaseUserAttributes = {
        username: string;
        username_lower: string;
        email: string;
        email_verified: boolean;
    };
    type DatabaseSessionAttributes = {};
}
