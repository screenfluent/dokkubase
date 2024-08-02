/// <reference path="../.astro/actions.d.ts" />
/// <reference types="astro/client" />

type User = {
    name: string;
    email: string;
    avatar: string;
    emailVerified: boolean;
}

declare namespace App {

    interface Locals {
        isLoggedIn: boolean;
        user: User | null;
    }
}
