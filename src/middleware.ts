import { defineMiddleware } from 'astro:middleware';
import { firebase } from './firebase/config';

const privateRoutes = ['/protected'];
const publicRoutes = ['/login', '/register'];

export const onRequest = defineMiddleware(({ url, request, locals, redirect }, next) => {
  const isLoggedIn = !!firebase.auth.currentUser;
  const user = firebase.auth.currentUser;

  locals.isLoggedIn = isLoggedIn;
  if (user) {
    locals.user = {
      name: user.displayName!,
      email: user.email!,
      avatar: user.photoURL ?? '',
      emailVerified: user.emailVerified,
    };
  }

  //? Redirect to login if user is not logged in
    if (!isLoggedIn && privateRoutes.includes(url.pathname)) {
        return redirect('/');
    }

    //? Redirect to dashboard if user is logged in
    if (isLoggedIn && publicRoutes.includes(url.pathname)) {
        return redirect('/');
    }

  return next();
});
