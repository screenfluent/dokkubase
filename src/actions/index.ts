import { loginUser, loginWithGoogle, logout, registerUser } from "./auth";

export const server = {
    //actions

    //? Authentication
    registerUser,
    loginUser,
    loginWithGoogle,
    logout,
};