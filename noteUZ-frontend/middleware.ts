import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
    locales: ['pl', 'en'],
    defaultLocale: 'pl'
});

export const config = {
    matcher: ['/((?!_next|.*\\..*).*)']
};
