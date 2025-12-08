# NoteUZ — Frontend (Next.js)

Frontowa część aplikacji **NoteUZ** — nowoczesnej platformy do zarządzania notatkami, współdzielenia treści i efektywnej współpracy. Aplikacja korzysta z **Next.js** oraz **TypeScript**, integruje się bezpiecznie z backendem oraz usługami Supabase i oferuje UX klasy premium.

---

## 🚀 Technologie

- **Język:** TypeScript 5.x
- **Framework:** Next.js 14+
- **UI:** React, Tailwind CSS / Mantine UI *(dostosować powyższe jeśli używasz innego systemu komponentów)*
- **Zarządzanie stanem:** React Context, SWR/React Query *(doprecyzować w razie potrzeby)*
- **Autoryzacja:** Supabase Auth (JWT, SSR/CSR cookies)
- **Networking:** REST API do backendu Spring Boot (`/api/`)
- **Calendar Integration:** (jeśli istnieje, np. Google Calendar)
- **Preview Markdown:** *(doprecyzować bibliotekę jeśli używasz np. react-markdown)*
- **Testy:** Jest / React Testing Library

---

## ⚙️ Funkcjonalności

- **Rejestracja i logowanie z weryfikacją hCaptcha/Supabase Auth**
- **Obsługa notatek:** Pełny CRUD notatek w wygodnym edytorze Markdown
- **Udostępnianie i współpraca:** Zapraszanie znajomych, współdzielenie notatek i grup
- **Widoki kalendarza:** Integracja z kalendarzem *(jeśli zaimplementowana)*
- **Responsywny, nowoczesny UX** (tryb jasny/ciemny, adaptacja mobile)
- **Notyfikacje toast/snackbar** (np. sukces, błędy)
- **Profil użytkownika z uploadem awataru**
- **Silna integracja z backendem oraz Supabase (autoryzacja, sesje, dane)**

---

## 🛠️ Instalacja i konfiguracja

### 1. Wymagania

- Node.js 18+
- Yarn lub npm
- Skonfigurowane API backendu (Spring Boot na porcie 8080, jak w backend README)
- Dane dostępowe do Supabase

### 2. Zmienne środowiskowe

Stwórz plik `.env.local` na wzór poniższego:

```env
# --- Backend API ---
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# --- Supabase ---
NEXT_PUBLIC_SUPABASE_URL=https://twoj-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=twoj_anon_key

# --- hCaptcha ---
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=twoj_public_key
```

### 3. Instalacja zależności

```bash
yarn install
# lub
npm install
```

### 4. Uruchomienie lokalne

```bash
yarn dev
# lub
npm run dev
```

Domyślnie frontend startuje na porcie **3000**.  
W ustawieniach CORS backend powinien akceptować pochodzenie `http://localhost:3000`.

---

## 🔌 Struktura aplikacji i główne ścieżki

- `/` — główna tablica notatek
- `/login`, `/register` — autoryzacja
- `/profile` — profil użytkownika (edycja, avatar)
- `/friends` — zarządzanie znajomymi i zaproszeniami
- `/calendar` — widok kalendarza *(jeśli zaimplementowany)*
- `/notes/[id]` — szczegóły/edycja notatki

---

## 🌐 API & Integracje

- **Supabase Auth** (synchronizacja sesji, obsługa JWT)
- **Backend NoteUZ** (wszystkie operacje CRUD, zarządzanie znajomymi)
- **hCaptcha** (weryfikacja podczas rejestracji/logowania)
- **(opcjonalnie)** Google Calendar API, email share itd.

---

## 🧪 Testowanie

```bash
yarn test
# lub
npm run test
```
*(jeśli zintegrowano testy jednostkowe/renderowania)*

---

## 🚀 Deployment

Budowa do deployu (np. Vercel/Netlify/Heroku lub dowolny serwer Node):

```bash
yarn build
yarn start
# lub
npm run build
npm start
```

---

## 🔒 Bezpieczeństwo

- Autoryzacja i autentykacja w oparciu o Supabase, HTTP-only cookies
- Czułe dane wyłącznie przez .env.local / zmienne środowiskowe
- Backend restrykcyjny CORS, frontend nie przechowuje haseł

---

© 2025 NoteUZ Frontend Team