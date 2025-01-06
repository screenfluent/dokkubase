export type User = {
    username: string;
    isLoggedIn: boolean;
} | null;

declare namespace App {
    interface Locals {
        user: User;
        getUser: () => User;
        logout: () => void;
    }
} 