# NoteUZ — Backend API

Backendowa część aplikacji **NoteUZ** – platformy do zarządzania notatkami, udostępniania treści i interakcji ze znajomymi. Aplikacja została zbudowana w oparciu o framework **Spring Boot** (Java) i udostępnia REST API dla frontendu.

---

## 🚀 Technologie

Projekt wykorzystuje nowoczesny stos technologiczny zapewniający wydajność i bezpieczeństwo:

- **Język:** Java 17+
- **Framework:** Spring Boot 3.x
- **Baza danych:** PostgreSQL
- **ORM:** Hibernate / Spring Data JPA
- **Autoryzacja:** Supabase Auth (integracja) + JWT (HttpOnly Cookies)
- **Bezpieczeństwo:** Spring Security, hCaptcha
- **E-mail:** JavaMailSender (SMTP)

---

## ⚙️ Funkcjonalności

Backend obsługuje kluczowe procesy biznesowe aplikacji:

### Autentykacja i Autoryzacja

- Rejestracja i logowanie użytkowników (proxy do Supabase Auth).
- Zarządzanie sesją poprzez bezpieczne ciasteczka (Access Token + Refresh Token).
- Weryfikacja **hCaptcha** podczas logowania i rejestracji.

### Zarządzanie Notatkami

- Pełny CRUD (Tworzenie, Odczyt, Aktualizacja, Usuwanie) notatek.
- Obsługa treści w formacie Markdown.
- Wysyłanie treści notatek na e-mail (format HTML).

### System Znajomych

- Wysyłanie zaproszeń do znajomych (po adresie e-mail).
- Akceptacja i odrzucanie zaproszeń.
- Listowanie znajomych i oczekujących zaproszeń.

### Profil Użytkownika

- Przechowywanie i serwowanie awatarów użytkowników (BLOB w bazie PostgreSQL).
- Pobieranie informacji o zalogowanym użytkowniku.

---

## 🛠️ Konfiguracja i Instalacja

### 1. Wymagania wstępne

- JDK 17 lub nowsze
- Maven
- Baza danych PostgreSQL
- Konto w Supabase (do obsługi Auth)

### 2. Zmienne środowiskowe

Aplikacja korzysta z pliku konfiguracyjnego `application.properties`, który pobiera wartości ze zmiennych środowiskowych.  
Utwórz plik `.env` w katalogu głównym lub skonfiguruj zmienne w swoim IDE/systemie:

```properties
# --- Baza Danych ---
DB_URL=jdbc:postgresql://localhost:5432/twoja_baza_danych
# (Użytkownik i hasło do bazy, jeśli nie są zawarte w URL)

# --- Supabase Auth ---
SUPABASE_AUTH_URL=https://twoj-projekt.supabase.co/auth/v1
SUPABASE_SERVICE_KEY=twoj_service_role_key

# --- JWT (Ciasteczka) ---
APP_JWT_COOKIE=sb-access-token
APP_JWT_MAX_AGE=3600
APP_JWT_REFRESH_COOKIE=sb-refresh-token
APP_JWT_REFRESH_MAX_AGE=604800

# --- Bezpieczeństwo ---
HCAPTCHA_SECRET_KEY=twoj_hcaptcha_secret_key

# --- E-mail (Gmail SMTP) ---
# Zaleca się użycie haseł aplikacji (App Passwords)
MAIL_USERNAME=twoj_email@gmail.com
MAIL_PASSWORD=twoje_haslo_aplikacji
```

### 3. Uruchomienie aplikacji

Możesz uruchomić aplikację używając Mavena:

```bash
mvn spring-boot:run
```

Serwer domyślnie wystartuje na porcie **8080**.

Konfiguracja CORS jest ustawiona tak, aby akceptować żądania z `http://localhost:3000` (domyślny port frontendu Next.js).

---

## 🔌 API Endpoints

**Skrócona lista dostępnych endpointów:**

### Auth (`/api/auth`)

- `POST   /login`         – Logowanie użytkownika (z weryfikacją hCaptcha)
- `POST   /register`      – Rejestracja nowego konta
- `POST   /logout`        – Wylogowanie (czyszczenie ciasteczek)
- `POST   /refresh`       – Odświeżenie tokena sesji
- `GET    /me`            – Pobranie danych aktualnie zalogowanego użytkownika

### Notatki (`/api/notes`)

- `GET    /`              – Pobierz wszystkie notatki użytkownika
- `GET    /{id}`          – Pobierz szczegóły notatki
- `POST   /`              – Utwórz nową notatkę
- `PUT    /{id}`          – Zaktualizuj notatkę
- `DELETE /{id}`          – Usuń notatkę
- `POST   /{id}/email`    – Wyślij notatkę na podany adres e-mail

### Znajomi (`/api/friends`)

- `GET    /`              – Lista znajomych i zaproszeń
- `POST   /invite`        – Wyślij zaproszenie do znajomych
- `PUT    /{id}/accept`   – Zaakceptuj zaproszenie
- `DELETE /{id}`          – Usuń znajomego lub odrzuć zaproszenie

### Użytkownicy (`/api/users`)

- `POST   /avatar`            – Wgraj awatar (Multipart File)
- `GET    /{userId}/avatar`   – Pobierz awatar użytkownika

---

## 🔒 Bezpieczeństwo

- **CSRF:** Wyłączone (aplikacja używa REST API i nie jest podatna w tej konfiguracji przy odpowiednim użyciu SameSite cookies).
- **CORS:** Skonfigurowane dla konkretnego pochodzenia (Origin) frontendu.
- **Hasła:** Nie są przechowywane w lokalnej bazie danych (obsługiwane przez Supabase).

---

© 2025 NoteUZ Backend Team