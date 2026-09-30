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
- **Panel de Administración Exclusivo (`/admin`):** Gestión integral de usuarios (suspensiones, bloqueos, reactivación, filtros por estado), revisión de identidad documental de profesionales y resolución/descarte de reportes.
- **Accesibilidad de Vanguardia:** Widget flotante con filtros de simulación de daltonismo (*protanopia, deuteranopia, tritanopia, escala de grises*), ajuste dinámico de tamaño de texto, alto contraste y reducción de animaciones (con persistencia en `localStorage`).
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

El código fuente se organiza por **módulos de dominio** independientes (cada uno con sus propios componentes, páginas y servicios) y un módulo `shared/` para utilidades globales:

```text
src/
├── modules/
│   ├── authentication/
│   │   ├── Components/   # LoginForm, RegisterForm, GoogleLoginButton, GithubLoginButton, OAuthConsentCheckbox, etc.
│   │   ├── pages/        # LoginPage, RegisterPage, OtpVerificationPage, SelectRolePage, TermsPage, GithubCallbackPage
│   │   ├── services/     # authService.ts
│   │   └── index.ts      # Barril de exportación pública del módulo
│   ├── dashboard/
│   │   ├── Components/   # ProfileSearchSection, UserProfileCard, ProfileReviews, ReportProfileModal, TaskSectionPlaceholder
│   │   ├── Hooks/        # useProfileSearch
│   │   ├── pages/        # DashboardPage
│   │   ├── services/     # profileService.ts, reviewService.ts
│   │   ├── types/        # profile.ts
│   │   └── index.ts
│   └── admin/
│       ├── Components/   # UsersTab, VerificationsTab, ReportsTab, StatusBadge, ReasonPromptModal
│       ├── pages/        # AdminPage
│       ├── services/     # adminService.ts
│       └── index.ts
├── shared/
│   ├── Components/       # ProtectedRoute, AdminRoute (Guards de navegación)
│   ├── Config/           # env.ts (Lectura centralizada de variables de entorno)
│   ├── accessibility/    # Contexto, widget flotante y filtros SVG
│   ├── layouts/          # AuthLayout
│   ├── services/         # axiosInstance.ts (Interceptors y refresh automático de tokens)
│   └── store/            # authStore.ts (Manejo de estado global y tokens en localStorage)
├── App.tsx, main.tsx, index.css
public/                   # Manifest web, Service Worker e íconos PWA
vercel.json               # Reglas de reescritura SPA (rutas /terms, /auth/github/callback, etc.)
```

> 📌 **Buenas prácticas:** Cada archivo de prueba (`*.test.tsx` / `*.test.ts`) reside junto al archivo que prueba. Para importar entre distintos módulos, utiliza siempre el archivo barril principal (ej. `from './modules/authentication'`).

---

## 🔄 Flujos OAuth

1. **Google:** El botón obtiene el ID Token directamente desde el cliente SDK y lo envía al backend mediante `POST /api/v1/auth/google`.
2. **GitHub:** Redirección a `github.com/login/oauth/authorize` $\rightarrow$ retorno a `/auth/github/callback?code=…` $\rightarrow$ petición `POST /api/v1/auth/github` enviando `{ code }`.

---

## 🧪 Pruebas y Calidad

La cobertura de pruebas unitarias y de integración abarca:
- `authStore` (validación y expiración de tokens JWT).
- `RegisterForm` (validaciones de campos, restricción de aceptaciones de T&C y enlaces de navegación).
- `AccessibilityProvider` (persistencia y aplicación de filtros).
- `TermsPage` (renderizado estático).
- Mocks dedicados para componentes de autenticación externa de Google.

---

## 📝 Notas y Pendientes del Sistema

- **T&C en OAuth:** El frontend envía el parámetro `acceptedTerms` en las peticiones a `/auth/google` y `/auth/github`. El backend lo exige al crear cuentas nuevas y almacena `termsAccepted`, `termsAcceptedAt` y `termsVersion`.
- **Gestión de Tareas:** La sección actual se mantiene en estado de *placeholder*.
- **Creación de Reseñas (`POST /reviews`):** Pendiente de integración con el microservicio *Task & AI Core* para obtener un `taskId` válido.
- **Verificaciones sin Cola:** Actualmente la pestaña de verificaciones en `/admin` busca por nombre al no existir un endpoint para listar solicitudes pendientes (`GET /admin/verification-documents?status=PENDING_REVIEW`).
- **Reportes:** `GET /admin/reports` retorna únicamente `reporterId` y `revieweeId`. Idealmente el backend debería incluir nombres y correos asociados.
- **Filtro de Daltonismo:** Opera como una simulación SVG global en la pantalla para pruebas de usabilidad.
- **Optimización de Bundle:** El peso actual (~520 kB) puede reducirse implementando *code-splitting* dinámico por rutas.