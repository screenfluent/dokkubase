declare namespace App {
    interface Locals {
        user: {
            username: string;
            isLoggedIn: boolean;
        } | null;
        getUser: () => Locals['user'];
        logout: () => void;
    }
} 