# NoteUZ

A modern full-stack note management application combining a robust Spring Boot backend with a sleek Next.js frontend. NoteUZ enables seamless note creation, storage, and management with secure user authentication through Supabase, complete with group management, calendar integration, and collaborative features.

---

## 🚀 Core Features

### 1. 🔐 Authentication & Security
- User registration with email verification
- Secure user login with JWT tokens
- CAPTCHA verification for protection
- Supabase integration for user management

### 2. 🎨 Theme Management
- Light mode interface
- Dark mode interface
- Theme persistence
- Seamless theme switching

### 3. 🌍 Multi-language Support
- Polish language interface
- English language interface
- Language switcher in settings
- Persistent language selection

### 4. 👨‍💼 Admin Panel
- User management and moderation
- System statistics and analytics
- Role-based access control
- Activity logging and monitoring
- Content moderation tools

### 5. 👥 Group Management
- Create and manage collaborative groups
- Group settings customization
- Member management and invitations
- Role assignment (Owner, Admin, Member)
- Group-based permissions

### 6. 📝 Notes Management
- Create and edit notes
- Organize notes with tags and folders
- Full-text search functionality
- Pin/favorite important notes
- Share notes with other users

### 7. 📄 PDF Export
- Export notes to PDF format
- Custom formatting options
- Batch export functionality
- File management and download

### 8. 📧 Email Notifications
- Send notes via email
- Bulk email distribution
- Professional email templates
- Delivery tracking
- Scheduled sending

### 9. 📅 Calendar & Events
- Visual calendar interface
- Create and manage events
- Link notes to calendar events
- Event categories and color coding
- Event reminders and notifications

### 10. 🗳️ Group Voting System
- Vote on notes within groups
- Leaderboard with rankings
- Voting statistics and analytics
- Anonymous voting option
- Voting campaign periods

---

## 📋 Tech Stack

### Backend
- **Framework**: Spring Boot
- **Language**: Java 17+
- **IDE**: IntelliJ IDEA
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth + JWT
- **Email Service**: SendGrid / SMTP
- **PDF Generation**: Apache PDFBox / iText
- **Security**: Spring Security, reCAPTCHA

### Frontend
- **Framework**: Next.js
- **Language**: TypeScript (TSX)
- **IDE**: WebStorm
- **UI Library**: Material-UI
- **State Management**: React Context
- **Internationalization**: next-i18next
- **Calendar Library**: React Big Calendar
- **Rich Text Editor**: TipTap

### Infrastructure
- **Database**: PostgreSQL (Supabase)
- **Authentication Provider**: Supabase Auth
- **File Storage**: Supabase Storage
- **CAPTCHA**: Google reCAPTCHA v3
- **Email Provider**: SendGrid

---

## 🏗️ Project Structure

### Frontend Structure (`noteUZ-frontend`)

```
noteUZ-frontend/
├── .idea/                           # WebStorm IDE configuration
├── .next/                           # Next.js build output
├── node_modules/                    # npm packages
├── public/                          # Static assets (images, icons, fonts)
├── src/
│   ├── components/                  # Reusable React components
│   │                               # - Authentication forms
│   │                               # - Note editor and display
│   │                               # - Group management UI
│   │                               # - Calendar components
│   │                               # - Admin panel components
│   │                               # - Layout components
│   │
│   ├── lib/                         # Utility functions and helpers
│   │   └── services/               # API service layer
│   │                               # - API client configuration
│   │                               # - Authentication services
│   │                               # - Notes API calls
│   │                               # - Groups API calls
│   │                               # - Email services
│   │
│   ├── pages/                       # Next.js page-based routing
│   │                               # - Authentication pages (login, register)
│   │                               # - Dashboard pages
│   │                               # - Notes management pages
│   │                               # - Groups pages
│   │                               # - Calendar page
│   │                               # - Admin panel pages
│   │                               # - Settings page
│   │
│   ├── styles/                      # Global and component styles
│   │                               # - Global CSS
│   │                               # - Component-specific styles
│   │                               # - Light/dark theme configuration
│   │
│   ├── api.ts                       # API configuration
│   ├── package.json                 # npm dependencies
│   ├── tsconfig.json                # TypeScript configuration
│   ├── next.config.js               # Next.js configuration
│   └── .env.local                   # Environment variables (local only)
```

**Frontend Directories Overview:**

| Directory | Purpose |
|-----------|---------|
| `components/` | Reusable UI building blocks - forms, cards, buttons, modals, navigation |
| `lib/services/` | Communication layer with backend API - handles all HTTP requests |
| `pages/` | Application routes - each page corresponds to a URL path |
| `styles/` | Styling and theming - CSS files, theme configuration, design tokens |
| `public/` | Static files - directly served without processing |

---

### Backend Structure (`noteUZ-backend`)

```
noteUZ-backend/
├── .idea/                           # IntelliJ IDEA IDE configuration
├── .mvn/                            # Maven wrapper configuration
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── org/example/noteuzbackend/
│   │   │       ├── config/          # Spring configuration classes
│   │   │                           # - Security configuration
│   │   │                           # - CORS settings
│   │   │                           # - Database connection
│   │   │                           # - Email service setup
│   │   │
│   │   │       ├── controller/      # REST API endpoints
│   │   │                           # - Authentication endpoints
│   │   │                           # - Notes endpoints
│   │   │                           # - Groups endpoints
│   │   │                           # - Events endpoints
│   │   │                           # - Voting endpoints
│   │   │                           # - Admin endpoints
│   │   │                           # - Export endpoints
│   │   │
│   │   │       ├── service/         # Business logic layer
│   │   │                           # - Authentication logic
│   │   │                           # - Notes management
│   │   │                           # - Groups management
│   │   │                           # - Event scheduling
│   │   │                           # - Voting system logic
│   │   │                           # - Email handling
│   │   │                           # - PDF generation
│   │   │                           # - Admin operations
│   │   │                           # - CAPTCHA verification
│   │   │
│   │   │       ├── repository/      # Database access layer
│   │   │                           # - User queries
│   │   │                           # - Notes queries
│   │   │                           # - Groups queries
│   │   │                           # - Events queries
│   │   │                           # - Voting queries
│   │   │                           # - Audit logs queries
│   │   │
│   │   │       ├── model/           # Data models
│   │   │       │   ├── entity/      # JPA entities (database models)
│   │   │       │   │               # - User entity
│   │   │       │   │               # - Note entity
│   │   │       │   │               # - Group entity
│   │   │       │   │               # - Group member entity
│   │   │       │   │               # - Event entity
│   │   │       │   │               # - Vote entity
│   │   │       │   │
│   │   │       │   └── dto/         # Data Transfer Objects
│   │   │                           # - Request DTOs (from frontend)
│   │   │                           # - Response DTOs (to frontend)
│   │   │
│   │   │       ├── exception/       # Error handling
│   │   │                           # - Custom exceptions
│   │   │                           # - Global exception handler
│   │   │
│   │   │       ├── security/        # Security utilities
│   │   │                           # - JWT token handling
│   │   │                           # - Authentication filters
│   │   │
│   │   │       ├── util/            # Utility classes
│   │   │                           # - Date/time utilities
│   │   │                           # - Input validation
│   │   │                           # - Helper functions
│   │   │
│   │   │       └── NoteUzBackendApplication.java  # Main application class
│   │   │
│   │   └── resources/
│   │       ├── static/              # Static files
│   │       ├── templates/           # Email templates
│   │       ├── application.properties        # Main configuration
│   │       ├── application-dev.properties   # Development config
│   │       └── application-prod.properties  # Production config
│   │
│   └── test/
│       └── java/
│           └── org/example/noteuzbackend/
│                                   # Unit and integration tests
│
├── pom.xml                          # Maven dependencies and build config
└── .gitignore                       # Git ignore rules
```

**Backend Directories Overview:**

| Directory | Purpose |
|-----------|---------|
| `config/` | Spring framework configuration - security, database, external services |
| `controller/` | HTTP API endpoints - handles incoming requests and sends responses |
| `service/` | Business logic - processes data, implements features, handles calculations |
| `repository/` | Database access - performs queries and data operations |
| `model/entity/` | Database models - Java classes mapped to database tables |
| `model/dto/` | Data transfer objects - communication format between frontend and backend |
| `exception/` | Error handling - custom exceptions and error responses |
| `security/` | Authentication and authorization - JWT tokens, security filters |
| `util/` | Helper functions - utilities for common tasks |

---

## ⚙️ Installation

### Prerequisites

- **Java 17+** (for backend)
- **Node.js 18+** and npm (for frontend)
- **Git** for version control
- **IntelliJ IDEA** or **WebStorm** (recommended IDEs)
- **Supabase Account** with project configured

### Backend Setup

1. **Navigate to the backend directory**
   ```bash
   cd noteUZ-backend
   ```

2. **Configure environment** in `src/main/resources/application-dev.properties`
   ```properties
   spring.datasource.url=jdbc:postgresql://[HOST]/[DATABASE]
   spring.datasource.username=postgres
   spring.datasource.password=[PASSWORD]
   
   supabase.url=[SUPABASE_URL]
   jwt.secret=[YOUR_JWT_SECRET]
   captcha.secret-key=[RECAPTCHA_SECRET]
   spring.mail.password=[EMAIL_PASSWORD]
   ```

3. **Install dependencies and run**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
   Backend will run on `http://localhost:8080`

### Frontend Setup

1. **Navigate to the frontend directory**
   ```bash
   cd noteUZ-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment** in `.env.local`
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=[SITE_KEY]
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:3000`

---

## 🔐 Environment Variables

### Backend (`application-dev.properties`)
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/noteuz
spring.datasource.username=postgres
spring.datasource.password=your_password

supabase.url=your_supabase_url
supabase.key=your_supabase_key

jwt.secret=your_jwt_secret_key
jwt.expiration=86400000

captcha.secret-key=your_recaptcha_secret

spring.mail.host=smtp.sendgrid.net
spring.mail.username=apikey
spring.mail.password=your_sendgrid_key

server.port=8080
server.servlet.context-path=/api
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
NEXT_PUBLIC_APP_NAME=NoteUZ
```

---

## 🛠️ Development

### Backend Development
```bash
cd noteUZ-backend

# Build project
mvn clean install

# Run development server
mvn spring-boot:run

# Run tests
mvn test

# Code formatting
mvn formatter:format
```

### Frontend Development
```bash
cd noteUZ-frontend

# Install dependencies
npm install

# Run development server with hot reload
npm run dev

# Run tests
npm run test

# Lint code
npm run lint

# Build for production
npm run build
```

---

## 📦 Production Deployment

### Backend
```bash
# Build production JAR
mvn clean package -DskipTests

# Run
java -jar target/noteUZ-backend.jar
```

### Frontend
```bash
# Build production bundle
npm run build

# Run production server
npm start
```

---

## 👥 Team

**NoteUZ Development Team**

---

## 🗓️ Changelog

### Version 1.0.0 (Initial Release)
- ✅ Core project structure setup
- ✅ Frontend and Backend integration
- ✅ Basic configurations

---

**Built with ❤️ by NoteUZ Team**

**Happy note-taking! 📝**
