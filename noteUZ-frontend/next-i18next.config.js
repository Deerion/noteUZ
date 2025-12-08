// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

/** @type {import('next-i18next').UserConfig} */
module.exports = {
    i18n: {
        defaultLocale: 'pl',
        locales: ['pl', 'en', 'zh'],
    },
    localePath: path.resolve('./public/locales'),
    reloadOnPrerender: process.env.NODE_ENV === 'development',
};