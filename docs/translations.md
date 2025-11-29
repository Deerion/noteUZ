# 🌍 Translation Support (i18n)

This project uses the `next-i18next` library to support multiple languages.
The default language is **Polish (`pl`)**, with additional support for **English (`en`)**.

## 📂 Where are the texts located?

All text strings are stored in JSON files within the `public/locales` directory:

*  Polish: `noteUZ-frontend/public/locales/pl/common.json`
*  English: `noteUZ-frontend/public/locales/en/common.json`

## ➕ How to add new text?

1.  Open the `common.json` file for the **Polish** language and add a new key:
    ```json
    {
      "my_new_button": "Zapisz zmiany"
    }
    ```
2.  Add the same key to the **English** file:
    ```json
    {
      "my_new_button": "Save changes"
    }
    ```
3.  Use it in a React component:

    ```tsx
    import { useTranslation } from 'next-i18next';

    export default function MyComponent() {
        const { t } = useTranslation('common');

        return <button>{t('my_new_button')}</button>;
    }
    ```

## ⚠️ Important Notes

* **Server Restart:** If you add a new key and the page doesn't see it (or shows the key name instead of the text), restart the development server (`CTRL+C` -> `npm run dev`).
* **Pages:** Every page in `src/pages` must use `serverSideTranslations` inside the `getStaticProps` or `getServerSideProps` function for translations to work correctly (see `index.tsx` for an example).