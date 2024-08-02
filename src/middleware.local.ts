//THIS is just a sample code this middleware wont work due to file name

import type { MiddlewareNext } from 'astro';
import { defineMiddleware } from 'astro:middleware';

const privateRoutes = ['/protected'];

export const onRequest = defineMiddleware(({ url, request }, next) => {
  const authHeaders = request.headers.get('Authorization') ?? '';
  console.log('authHeaders', authHeaders);


  if (privateRoutes.includes(url.pathname)) {
    return checkLocalAuth(authHeaders, next);
  }

    return next();
});

const checkLocalAuth = (authHeaders: string, next: MiddlewareNext) => {
    if(authHeaders) {
        const authValue = authHeaders.split(' ').at(-1) ?? 'user:pass';
        const decodedValue = atob(authValue).split(':');
        const [user, pass] = decodedValue;
    
        if(user === 'admin' && pass === 'admin') {
            return next();
        };
        
    }
    
    return new Response('Auth required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic real="Secure Area"' },
      });

};