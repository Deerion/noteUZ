// src/pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html>
            <Head>
                {/* Tutaj przenosimy czcionki z index.tsx, aby zniknął błąd ESLint */}
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"/>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"/>
            </Head>
            <body>
            {/* Skrypt zapobiegający mruganiu (Flash of Unstyled Content) */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `
              (function() {
                try {
                  var storageKey = 'theme-preference';
                  var d = document.documentElement;
                  var localStorageTheme = localStorage.getItem(storageKey);
                  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var mode = 'light';
                  if (localStorageTheme === 'dark') { mode = 'dark'; }
                  else if (localStorageTheme === 'light') { mode = 'light'; }
                  else if (systemTheme) { mode = 'dark'; }
                  d.setAttribute('data-theme', mode);
                } catch (e) {}
              })();
            `,
                }}
            />
            <Main />
            <NextScript />
            </body>
        </Html>
    );
}