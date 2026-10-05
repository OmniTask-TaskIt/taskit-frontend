<div align="center">

# TaskIt Frontend

✨ **Marketplace bilateral de servicios operado por OmniTask Solutions S.A.** ✨  
*Aplicación web moderna y PWA instalable desarrollada con el más alto estándar tecnológico.*

[Funcionalidades](#-funcionalidades) · [Puesta en Marcha](#-puesta-en-marcha) · [Variables de Entorno](#-variables-de-entorno) · [Arquitectura](#-arquitectura-del-proyecto)

</div>

---

## 🛠️ Stack Tecnológico

<p align="center">
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/Vitest-729B1B?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest" />
</p>

---

## 🚀 Funcionalidades Principales

- **Autenticación Robusta:** Registro con verificación OTP, validación estricta de contraseñas, roles configurables (Demandante / Prestador) e integración fluida con **Google** y **GitHub** OAuth.
- **Cumplimiento Legal (T&C):** Aceptación explícita de Términos, Condiciones y Política de Privacidad v1.0 integrada antes de cualquier acceso o registro mediante redes sociales.
- **Directorio y Reputación:** Búsqueda avanzada de perfiles profesionales, visualización de reseñas paginadas y sistema completo de reportes de perfiles con motivos y comentarios.
- **Panel de Administración Exclusivo (`/admin`):** Gestión integral de usuarios (suspensiones, bloqueos, reactivación, filtros por estado), **cola de verificaciones de identidad** (pendientes, verificadas y rechazadas, con paginación) y resolución/descarte de reportes.
- **Accesibilidad:** Widget flotante con **corrección de daltonismo** (*protanopia, deuteranopia, tritanopia*, método de daltonización), escala de grises, tamaño de texto, alto contraste y reducción de animaciones, con persistencia en `localStorage`. Incluye además una **simulación de daltonismo para diseño** (no es una ayuda para el usuario).
- **Experiencia Móvil y PWA:** Interfaz adaptativa con barra superior y pestañas inferiores optimizadas para pantallas menores a 768px, además de soporte para instalación nativa vía `manifest.webmanifest` y `sw.js`.

---

## ⚙️ Puesta en Marcha

Clona el repositorio e inicia tu entorno de desarrollo local con los siguientes comandos:

```bash
npm install
cp .env.example .env   # Completa los valores requeridos
npm run dev            # Inicia en http://localhost:5173
```

### Comandos Disponibles

| Script | Descripción |
| :--- | :--- |
| `npm run dev` | Servidor de desarrollo local |
| `npm run build` | Type-check + build optimizado de producción |
| `npm run lint` | Análisis estático de código con ESLint |
| `npm test` / `npm run test:watch` | Ejecución de pruebas unitarias con Vitest |

---

## 🔐 Variables de Entorno

Configura las siguientes variables en tu archivo `.env` o en el panel de despliegue (**Vercel**):

| Variable | Descripción |
| :--- | :--- |
| `VITE_API_URL` | URL base del backend sin `/api/v1` (*Obligatoria en Vercel*, por defecto `localhost:8080`). |
| `VITE_GOOGLE_CLIENT_ID` | Client ID de autenticación de Google Cloud. |
| `VIT_GITHUB_CLIENT_ID` | Client ID de GitHub (`VIT_` usado por restricciones de nombre en Vercel; expuesto en `vite.config.ts`). |
| `VITE_GITHUB_REDIRECT_URI` | Opcional. Por defecto `<origin>/auth/github/callback`. |

> ⚠️ **Nota:** Tras actualizar o modificar variables en Vercel, es indispensable **redesplegar** para que se inyecten correctamente durante la fase de build.

### Configuración Externa Requerida

- **Google Cloud Console:** Agregar el dominio de Vercel y `http://localhost:5173` dentro de *Authorized JavaScript origins*.
- **GitHub OAuth App:** Configurar la *Authorization callback URL* apuntando a `https://<tu-dominio>/auth/github/callback` (y `http://localhost:5173/auth/github/callback` para desarrollo local).
- **Backend (CORS):** Permitir el origen del dominio de producción en la configuración de Spring Boot.

---

## 📂 Arquitectura del Proyecto

El código se organiza por **módulos de dominio**. El módulo `authentication` corresponde al backend **AuthAndProfiles** e incluye autenticación, perfiles, reseñas, reportes y panel de administración. Los demás equipos organizan sus módulos a su manera dentro de `src/modules/`.

```text
src/
├── assets/                       # Imágenes (FondoP.jpeg, Logo.jpeg, ...)
├── modules/
│   └── authentication/           # Backend AuthAndProfiles
│       ├── Components/
│       │   ├── auth/             # LoginForm, GoogleLoginButton, GithubLoginButton, OAuthConsentCheckbox, ProtectedRoute, AdminRoute
│       │   ├── register/         # RegisterForm, PasswordField, RoleSelector
│       │   ├── profile/          # UserProfileCard, DeleteAccountSection, ProfileSearchSection, ProfileReviews, ReportProfileModal
│       │   ├── admin/            # UsersTab, VerificationsTab, ReportsTab
│       │   └── ui/               # AuthLayout, StatusBadge, ReasonPromptModal, TaskSectionPlaceholder
│       ├── Config/               # axios.ts (interceptores + refresh de tokens), env.ts (variables de entorno)
│       ├── Hooks/                # useLogin, useRegister, useProfileSearch
│       ├── pages/                # Login, Register, OtpVerification, SelectRole, Terms, GithubCallback, Dashboard, Admin
│       ├── services/             # authService, profileService, reviewService, adminService, authStore
│       ├── styles/index.css      # Tailwind + estilos globales
│       ├── types/                # auth.types.ts, profile.types.ts, admin.types.ts
│       └── index.ts              # API pública del módulo (lo único que se importa desde fuera)
├── shared/
│   └── accessibility/            # Contexto, widget flotante y filtros SVG (afecta a toda la app)
├── test/                         # setup.ts y helpers de pruebas (makeJwt, makeAxiosError)
├── utils/navigation.ts           # redirectTo / redirectToLogin (aislados para poder probarlos)
├── App.tsx
└── main.tsx
public/                           # Manifest web, Service Worker e íconos PWA
.github/workflows/ci.yml          # CI: lint + pruebas + build en cada push/PR
vercel.json                       # Reglas de reescritura SPA
```

> 📌 **Buenas prácticas:** cada archivo de prueba (`*.test.tsx` / `*.test.ts`) vive junto al archivo que prueba. Desde fuera del módulo importa siempre su barril: `from './modules/authentication'`.

---

## 🔄 Flujos OAuth

1. **Google:** El botón obtiene el ID Token directamente desde el cliente SDK y lo envía al backend mediante `POST /api/v1/auth/google`.
2. **GitHub:** Redirección a `github.com/login/oauth/authorize` $\rightarrow$ retorno a `/auth/github/callback?code=…` $\rightarrow$ petición `POST /api/v1/auth/github` enviando `{ code }`.

---

## 🧪 Pruebas y Calidad

```bash
npm run lint            # ESLint
npm test                # Vitest (una pasada)
npm run test:coverage   # Cobertura (requiere @vitest/coverage-v8)
```

El CI (`.github/workflows/ci.yml`) ejecuta lint, pruebas y build en cada push y pull request.

**Qué se prueba**
- **Contrato HTTP** (`services/services.test.ts`): rutas, verbos y dónde viaja cada dato hacia el backend (p. ej. `PATCH /profiles/{id}` envía *query params*, no body).
- **Sesión:** `authStore` (JWT, expiración, base64url) y el interceptor de `axios` (renovación de token enviando `email` + `refreshToken`, reintento, limpieza de sesión).
- **Flujos de autenticación:** login, registro, OTP, selección de rol, callback de GitHub, botones de Google/GitHub y el bloqueo por Términos y Condiciones.
- **Perfiles y dashboard:** mi perfil (edición, foto, documento), directorio, reseñas, reportes y navegación.
- **Admin:** usuarios, cola de verificaciones y reportes.
- **Accesibilidad:** filtros, persistencia y la eficacia de la corrección de daltonismo (`colorMatrices.test.ts`).

---

## 📝 Notas y Pendientes del Sistema

- **T&C en OAuth:** el frontend envía `acceptedTerms` a `/auth/google` y `/auth/github`; en Login y Registro los botones sociales permanecen bloqueados hasta aceptar los Términos. El backend lo exige al crear cuentas y guarda `termsAccepted`, `termsAcceptedAt` y `termsVersion`.
- **Daltonismo:** los modos *Protanopia / Deuteranopia / Tritanopia* **corrigen** el color (daltonización: `C = I + M·(I − S)`, ver `colorMatrices.ts`). Los modos *Simular …* reproducen cómo ve una persona daltónica y son solo para el equipo de diseño.
- **Cola de verificaciones:** la pestaña *Verificaciones* usa `GET /admin/verification-documents` (por defecto `PENDING_REVIEW`, de la más antigua a la más reciente).
- **Móvil:** una sola base de código responsive (barra superior y pestañas inferiores bajo 768 px) más PWA instalable; no se mantiene una app móvil separada.
- **Gestión de Tareas:** la sección sigue como *placeholder* (módulo de otro equipo).
- **Creación de reseñas (`POST /reviews`):** pendiente de integración con *Task & AI Core* para obtener un `taskId` válido.
- **Contrato front↔back:** los tipos de `types/` son espejo de los DTOs del backend (`ProfileResponseDTO`, `AdminReportDTO`, ...). El backend **no envía la URL del documento de identidad**: el panel de verificación depende solo de `identityVerificationStatus`. Las categorías del perfil viajan como `categories=a&categories=b` (`paramsSerializer: { indexes: null }`), que es lo que Spring bindea.
- **Eliminar cuenta:** en *Mi perfil → Zona de peligro*. Llama a `DELETE /profiles/{email}` (borrado permanente en el backend) y exige escribir el correo para confirmar.
- **Reportes (admin):** `GET /admin/reports` devuelve `AdminReportDTO` con nombre y correo de reportante y reportado; si una cuenta ya no existe se muestra su ID.
- **Seguridad OAuth (GitHub):** el botón envía un `state` aleatorio de un solo uso (`services/oauthState.ts`) y el callback lo verifica antes de llamar al backend (protección CSRF).
- **Optimización de bundle:** el peso (~550 kB) puede reducirse con *code-splitting* por rutas.
