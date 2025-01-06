export type User = {
    username: string;
    isLoggedIn: boolean;
} | null;

export type AppLocals = {
    user: User;
    getUser: () => User;
    logout: () => void;
};

declare namespace App {
    interface Locals extends AppLocals {}
} 