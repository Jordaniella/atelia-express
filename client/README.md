# AtelIA Frontend

This Vite/React app now talks to the Express + PostgreSQL + Prisma backend through a small REST API layer. Supabase is no longer used by the frontend.

## Environment variables

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

If the variable is missing, the app falls back to `http://localhost:4000/api/v1`.

## API layer structure

The REST client is centralized in `src/lib/api.ts`.

It contains:

- `API_BASE_URL`: backend base URL.
- `tokenStorage`: localStorage helper for the JWT.
- `request<T>()`: fetch wrapper that:
  - prefixes routes with the backend URL,
  - adds `Authorization: Bearer <token>` automatically,
  - sends JSON bodies,
  - normalizes API errors into `ApiError`.
- typed API groups:
  - `authApi`
  - `projectsApi`
  - `productsApi`
  - `generatedContentsApi`
  - `generatedVisualsApi`

## Endpoints consumed

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Projects and brief

- `POST /projects`
- `GET /projects`
- `GET /projects/:id`
- `PATCH /projects/:id`
- `DELETE /projects/:id`

Project brief data is sent through the `brief` object on project create/update because the current backend stores a one-to-one `Brief` through the Project endpoints.

### Products

- `POST /products`
- `GET /products/:id`
- `PATCH /products/:id`
- `DELETE /products/:id`

Product lists are loaded from `GET /projects/:id`, because the project detail response includes its products.

### Generated contents

- `POST /generated-contents`
- `GET /generated-contents?productId=:productId`

Generated contents are linked to a product. The UI asks the user to select a product before saving content.

### Generated visuals

- `POST /generated-visuals`
- `GET /generated-visuals?productId=:productId`

Generated visuals are linked to a product. The UI asks the user to select a product before saving a visual.

## MVP limitations intentionally shown in the UI

The backend MVP does not yet expose endpoints for:

- persisted subscriptions/usage,
- language preferences,
- automations,
- milestones/calendar,
- updating/deleting generated content,
- updating/deleting generated visuals.

The frontend neutralizes these features rather than calling Supabase. Where relevant, the UI shows a toast explaining that the action is not available in the backend MVP yet.

## How to run locally

From `api/`:

```bash
cp .env.example .env
docker compose up -d
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

From `client/`:

```bash
cp .env.example .env # if you keep a local env template, otherwise create .env manually
npm install
npm run dev
```

Open the frontend at the Vite URL, usually `http://localhost:5173`.

## Manual MVP test flow

1. Register a new account from `/register`.
2. Confirm that the app stores the JWT and redirects to `/dashboard`.
3. Create a project from `/dashboard/new`.
4. Open the project detail page and update the brief/project details.
5. Open Products and add at least one product.
6. Open Content Agents, select the product, generate content and save it.
7. Open Content Library and confirm that saved content appears.
8. Open Visual Studio, select the product, generate a visual and save it.
9. Open Gallery and confirm that saved visuals appear under the product folder.
10. Logout and login again to confirm `/auth/me` restores the current user from the JWT.
