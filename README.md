# NoteUZ

**NoteUZ** to nowoczesna, pełnostackowa aplikacja do zarządzania notatkami, grupową współpracą, integracją kalendarza oraz zaawansowanym udostępnianiem. Łączy solidny backend oparty o **Spring Boot** z szybkim frontendem w **Next.js**. Bezpieczne uwierzytelnianie i zarządzanie danymi zapewniają **PostgreSQL** i **Supabase**.

---

## 🚀 Najważniejsze funkcjonalności

### 1. 🔐 Uwierzytelnianie i bezpieczeństwo
- Rejestracja i logowanie użytkownika z weryfikacją e-mail
- Bezpieczna autoryzacja JWT (ciasteczka HttpOnly)
- Weryfikacja CAPTCHA podczas logowania/rejestracji
- Integracja z Supabase dla zarządzania użytkownikami

### 2. 🎨 Zarządzanie motywem
- Interfejs w trybie jasnym i ciemnym
- Zapamiętywanie wybranego motywu
- Łatwe przełączanie motywów

### 3. 🌍 Obsługa wielu języków
- Interfejs polski
- Interfejs angielski
- Przełącznik języka w ustawieniach
- Zapamiętywanie wybranego języka

### 4. 👨‍💼 Panel administracyjny
- Zarządzanie i moderacja użytkowników
- Statystyki systemowe i analizy
- Uprawnienia oparte o role
- Rejestrowanie aktywności
- Moderacja treści

### 5. 👥 Zarządzanie grupami
- Tworzenie i edytowanie grup współpracy
- Personalizacja ustawień grup
- Zarządzanie członkami i zaproszeniami
- Przypisywanie ról grupowych (Właściciel, Admin, Uczestnik)
- Uprawnienia zależne od roli w grupie

### 6. 📝 Zarządzanie notatkami
- Tworzenie i edycja notatki w edytorze Markdown
- Organizacja notatek za pomocą tagów i folderów
- Wyszukiwanie pełnotekstowe
- Przypinanie/ulubione notatki
- Udostępnianie notatek innym użytkownikom/grupom

### 7. 📄 Eksport PDF
- Eksport notatek do formatu PDF
- Opcje formatowania eksportowanych plików
- Grupowy eksport
- Zarządzanie wygenerowanymi plikami

### 8. 📧 Powiadomienia e-mail
- Wysyłanie notatek e-mailem
- Masowe wysyłanie
- Profesjonalne szablony wiadomości
- Śledzenie dostarczenia
- Zaplanowane powiadomienia

### 9. 📅 Kalendarz i wydarzenia
- Wizualny interfejs kalendarza
- Tworzenie i edycja wydarzeń
- Powiązywanie notatek z wydarzeniem
- Kategorie i kolorystyka wydarzeń
- Przypomnienia oraz powiadomienia o wydarzeniach

### 10. 🗳️ System głosowania w grupach
- Głosowanie na notatki w obrębie grup
- Tablica wyników, rankingi
- Statystyki i analizy głosowań
- Głosowanie anonimowe
- Kampanie głosowań

---

## 📋 Stos technologiczny

### Backend
- **Framework:** Spring Boot 3.x
- **Język:** Java 17+
- **IDE:** IntelliJ IDEA
- **Baza danych:** PostgreSQL (Supabase)
- **Uwierzytelnianie:** Supabase Auth + JWT
- **Serwis e-mail:** JavaMailSender / SendGrid / SMTP
- **Generowanie PDF:** Apache PDFBox / iText
- **Bezpieczeństwo:** Spring Security, hCaptcha

### Frontend
- **Framework:** Next.js 14+
- **Język:** TypeScript
- **IDE:** WebStorm
- **Biblioteka UI:** Material UI / Mantine UI / Tailwind CSS
- **Zarządzanie stanem:** React Context, SWR/React Query
- **Międzynarodowość:** next-i18next
- **Kalendarz:** React Big Calendar
- **Edytor Markdown:** TipTap / react-markdown

### Infrastruktura
- **Przechowywanie plików:** Supabase Storage
- **Uwierzytelnianie:** Supabase Auth
- **CAPTCHA:** hCaptcha
- **Dostawca e-mail:** Gmail SMTP / SendGrid

---

## 🏗️ Struktura projektu

### Frontend (`noteUZ-frontend`)

```
noteUZ-frontend/
├── public/                  # Statyczne pliki (obrazy, ikony, tłumaczenia)
├── src/
│   ├── components/          # Komponenty Reacta (notatki, grupy, kalendarz, panel admina itd.)
│   ├── lib/                 # Warstwa usług/API, funkcje pomocnicze
│   ├── pages/               # Routing Next.js (login, dashboard, notatki, grupy...)
│   └── styles/              # Style globalne i motywy
├── package.json
├── tsconfig.json
├── next.config.ts
├── .env.local               # Zmienne środowiskowe
```

### Backend (`noteUZ-backend`)

```
noteUZ-backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── org/example/noteuzbackend/
│   │   │       ├── config/          # Konfiguracje Springa (security, baza, CORS itd.)
│   │   │       ├── controller/      # Endpointy REST API
│   │   │       ├── service/         # Logika biznesowa
│   │   │       ├── repository/      # Dostęp do bazy
│   │   │       ├── model/           # Modele danych (JPA, DTO)
│   │   │       ├── exception/       # Obsługa błędów
│   │   │       ├── security/        # JWT, filtry uwierzytelniania
│   │   │       ├── util/            # Narzędzia i pomocnicze funkcje
│   │   │       └── NoteUzBackendApplication.java   # Klasa startowa
│   │   └── resources/
│   │       ├── static/              # Statyczne pliki
│   │       ├── templates/           # Szablony e-mail
│   │       ├── application.properties (.dev/.prod) # Konfiguracja
│   └── test/                        # Testy jednostkowe i integracyjne
├── pom.xml                          # Konfiguracja Maven
└── .gitignore
```

---

## 🛠️ Instalacja

### Wymagania wstępne

- **Java 17+** (backend)
- **Node.js 18+** (frontend)
- **PostgreSQL** (baza danych)
- **Supabase** (autoryzacja i przechowywanie)
- **npm/Yarn** (zarządzanie pakietami)
- **IntelliJ/WebStorm** (zalecane IDE)

### Backend

1. Przejdź do katalogu backend:
   ```bash
   cd noteUZ-backend
   ```
2. Skonfiguruj plik `application.properties` zgodnie z danymi środowiskowymi (baza, Supabase, e-mail, JWT, hCaptcha).
3. Zainstaluj zależności i uruchom aplikację:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
   Backend uruchomi się na `http://localhost:8080`

### Frontend

1. Przejdź do katalogu frontend:
   ```bash
   cd noteUZ-frontend
   ```
2. Skonfiguruj plik `.env.local`, podając klucze Supabase, adres backendu i klucz hCaptcha.
3. Zainstaluj zależności oraz uruchom aplikację:
   ```bash
   npm install
   npm run dev
   ```
   Frontend uruchomi się na `http://localhost:3000`

---

## 🔐 Zmienne środowiskowe

### Backend (`application.properties`)
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/noteuz
spring.datasource.username=postgres
spring.datasource.password=twoje_haslo

supabase.url=https://twoj-projekt.supabase.co
supabase.key=twoj_service_role_key
jwt.secret=twoj_jwt_secret
captcha.secret-key=twoj_hcaptcha_secret
spring.mail.username=twoj_email@gmail.com
spring.mail.password=twoje_haslo_aplikacji
server.port=8080
server.servlet.context-path=/api
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_SUPABASE_URL=https://twoj-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=twoj_anon_key
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=twoj_public_key
NEXT_PUBLIC_APP_NAME=NoteUZ
```

---

## 🛠️ Rozwój aplikacji

### Backend
```bash
# Instalacja i start
mvn clean install
mvn spring-boot:run

# Testy
mvn test

# Formatowanie kodu
mvn formatter:format
```

### Frontend
```bash
# Instalacja i start
npm install
npm run dev

# Testy
npm run test

# Lintowanie
npm run lint

# Budowa do produkcji
npm run build
```

---

## 📦 Wdrożenie produkcyjne

### Backend
```bash
mvn clean package -DskipTests
java -jar target/noteUZ-backend.jar
```

### Frontend
```bash
npm run build
npm start
```

---

## 🌍 Tłumaczenia (i18n)

Aplikacja korzysta z biblioteki `next-i18next` (frontend).  
Pliki tłumaczeń w formacie JSON znajdują się w:

- Polski: `noteUZ-frontend/public/locales/pl/common.json`
- Angielski: `noteUZ-frontend/public/locales/en/common.json`

Aby dodać nowy tekst:
1. Dodaj nowy klucz do pliku `common.json` w obu językach.
2. Skorzystaj z `useTranslation` w komponencie Reacta (`t('key')`).

*Więcej szczegółów w [`docs/translations.md`](docs/translations.md).*

---

## 👥 Zespół

**NoteUZ Backend & Frontend Team**

---

**Stworzone z ❤️ przez zespół NoteUZ**

Miłego notowania! 📝