
import { firebase } from "@/firebase/config";
import { defineAction, z } from "astro:actions";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";

export const loginWithGoogle = defineAction({
    accept: 'json',
    input: z.any(),
    handler: async(credentials) => {

        const credential = GoogleAuthProvider.credentialFromResult(credentials);

        if(!credential) {
            throw new Error('Google login failed');
        }

        await signInWithCredential(firebase.auth, credential);

        return {ok: true};
    },
});