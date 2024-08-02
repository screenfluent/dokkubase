import { defineAction, z } from 'astro:actions';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  type AuthError,
} from 'firebase/auth';

import { firebase } from '@/firebase/config';

export const registerUser = defineAction({
  accept: 'form',
  input: z.object({
    username: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    remember_me: z.boolean().optional(),
  }),
  handler: async ({ username, password, remember_me, email }, { cookies }) => {
    //? Cookies
    if (remember_me) {
      cookies.set('email', email, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year
        path: '/',
      });
    } else {
      cookies.delete('email', {
        path: '/',
      });
    }

    //? User creation
    try {
      const user = await createUserWithEmailAndPassword(
        firebase.auth,
        email,
        password
      );

      // Update name (displayName)
      updateProfile(firebase.auth.currentUser!, {
        displayName: username,
      });

      //Verify email
      await sendEmailVerification(firebase.auth.currentUser!, {
        url: `${import.meta.env.WEBSITE_URL}}/protected?emailVerified=true`,
      });

      return user;
    } catch (error) {
      const firebaseError = error as AuthError;

      if (firebaseError.code === 'auth/email-already-in-use') {
        throw new Error('Email already in use');
      }

      throw new Error('Failed to register user');
    }

    return {
      ok: true,
      message: 'User registered successfully',
    };
  },
});
