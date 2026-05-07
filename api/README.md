# AtelIA API Backend

AtelIA API is the backend for a SaaS platform that helps creators and companies prepare product launches with AI-assisted marketing content and visual assets.

This backend intentionally replaces the previous Supabase-centered approach with a classic API architecture:

- Node.js + ExpressJS for HTTP routing.
- PostgreSQL for durable relational data.
- Prisma ORM for schema, migrations and type-safe database access.
- JWT authentication for private API routes.
- bcrypt for password hashing.
- Zod for payload validation.
- Docker Compose for a local PostgreSQL database.

> The frontend is not part of this backend migration. Every business operation is exposed through Express routes and persisted through Prisma/PostgreSQL.

## 1. Folder structure

```txt
api/
├── docker-compose.yml              # Local PostgreSQL service
├── prisma.config.ts                # Prisma 7 config, including DATABASE_URL and migrations path
├── prisma/
│   ├── schema.prisma               # Data model and SQL relations
│   ├── seed.ts                     # Optional local demo data
│   └── migrations/                 # SQL migrations committed to the repo
├── src/
│   ├── app.ts                      # Express app factory, global middleware and route mounting
│   ├── server.ts                   # HTTP server startup and graceful shutdown
│   ├── config/
│   │   ├── env.ts                  # Environment variable validation with Zod
│   │   └── prisma.ts               # Prisma client and PostgreSQL adapter setup
│   ├── middlewares/
│   │   ├── auth.middleware.ts      # JWT route protection
│   │   ├── error.middleware.ts     # Centralized error formatting
│   │   └── validate.ts             # Zod request validation middleware
│   ├── modules/
│   │   ├── auth/                   # Register, login, current user
│   │   ├── projects/               # Project and brief use cases
│   │   ├── products/               # Product use cases
│   │   ├── generated-contents/     # Generated text content use cases
│   │   ├── generated-visuals/      # Generated visual use cases
│   │   └── shared.schemas.ts       # Shared route param schemas
│   ├── routes/
│   │   └── index.ts                # Main API router
│   ├── types/                      # Express request typing helpers
│   └── utils/                      # Error, JWT, password and async helpers
└── .env.example                    # Environment variable template
```

### Why this architecture?

The API is organized by business module instead of by technical layer only. Each module owns its route, controller, service and schema files. This keeps related code close together, makes testing easier, and allows future modules such as `automations` to be added without touching unrelated features.

The controller layer only translates HTTP requests/responses. The service layer owns business rules and database calls. Middlewares handle cross-cutting concerns such as authentication, validation and error formatting.

## 2. Local setup

### 2.1 Install dependencies

```bash
npm install
```

### 2.2 Configure environment

```bash
cp .env.example .env
```

For local development the default database URL is:

```env
DATABASE_URL="postgresql://atelia:atelia_password@localhost:5432/atelia?schema=public"
```

Set a long random value for `JWT_SECRET` before production use.

### 2.3 Start PostgreSQL

```bash
docker compose up -d
```

### 2.4 Run Prisma migrations

```bash
npm run db:migrate
```

### 2.5 Generate Prisma Client

```bash
npm run db:generate
```

### 2.6 Optional seed

```bash
npm run db:seed
```

The seed creates a demo account:

```txt
email: demo@atelia.ai
password: Password123!
```

### 2.7 Start the API

```bash
npm run dev
```

The server starts on:

```txt
http://localhost:4000/api/v1
```

## 3. Prisma models and SQL relations

### User

A `User` represents an account that can own multiple launch projects. Passwords are never stored in clear text; only `passwordHash` is stored.

Relation:

- `User 1 -> N Project`

### Project

A `Project` belongs to one user. It represents a product launch workspace.

Relations:

- `Project N -> 1 User`
- `Project 1 -> 1 Brief`
- `Project 1 -> N Product`

Deleting a project cascades to its brief, products and generated assets through SQL relations.

### Brief

A `Brief` stores marketing context for a project. It is one-to-one with `Project`, enforced by a unique `projectId`.

Relation:

- `Brief 1 -> 1 Project`

### Product

A `Product` belongs to one project and can have many generated contents and visuals.

Relations:

- `Product N -> 1 Project`
- `Product 1 -> N GeneratedContent`
- `Product 1 -> N GeneratedVisual`

### GeneratedContent

A `GeneratedContent` belongs to one product. Supported types are represented by the `GeneratedContentType` enum:

- `LANDING_PAGE`
- `EMAIL`
- `SOCIAL_POST`
- `OFFER`

Relation:

- `GeneratedContent N -> 1 Product`

### GeneratedVisual

A `GeneratedVisual` belongs to one product and stores the final image URL, visual style and prompt used to produce it.

Relation:

- `GeneratedVisual N -> 1 Product`

## 4. API conventions

### Base URL

```txt
/api/v1
```

### Authentication

Private endpoints require this header:

```http
Authorization: Bearer <jwt_token>
```

### Error response shape

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload",
    "details": []
  }
}
```

Common errors:

- `400 VALIDATION_ERROR` for invalid body, params or query.
- `401 UNAUTHORIZED` for missing or invalid JWT.
- `404 NOT_FOUND` for resources that do not exist or do not belong to the current user.
- `409 CONFLICT` for duplicate email registration.
- `500 INTERNAL_SERVER_ERROR` for unexpected server errors.

## 5. Endpoints

### Health

#### `GET /api/v1/health`

Checks that the API process is running.

Response `200`:

```json
{
  "status": "ok",
  "service": "atelia-api"
}
```

---

## Auth

### Register

#### `POST /api/v1/auth/register`

Body:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "Password123!"
}
```

Response `201`:

```json
{
  "user": {
    "id": "uuid",
    "email": "ada@example.com",
    "name": "Ada Lovelace",
    "createdAt": "date",
    "updatedAt": "date"
  },
  "token": "jwt"
}
```

Possible errors:

- `400 VALIDATION_ERROR`
- `409 CONFLICT` if the email is already registered.

### Login

#### `POST /api/v1/auth/login`

Body:

```json
{
  "email": "ada@example.com",
  "password": "Password123!"
}
```

Response `200`:

```json
{
  "user": {
    "id": "uuid",
    "email": "ada@example.com",
    "name": "Ada Lovelace",
    "createdAt": "date",
    "updatedAt": "date"
  },
  "token": "jwt"
}
```

Possible errors:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED` if credentials are invalid.

### Current user

#### `GET /api/v1/auth/me`

Private route.

Response `200`:

```json
{
  "user": {
    "id": "uuid",
    "email": "ada@example.com",
    "name": "Ada Lovelace",
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

Possible errors:

- `401 UNAUTHORIZED`

---

## Projects

### Create project

#### `POST /api/v1/projects`

Private route.

Body:

```json
{
  "name": "Spring Launch",
  "description": "Launch workspace for our new offer",
  "status": "DRAFT",
  "brief": {
    "targetAudience": "Small SaaS founders",
    "brandTone": "Premium and clear",
    "marketContext": "Crowded productivity market",
    "launchGoal": "Collect first 100 beta users",
    "keyMessage": "Launch faster with AI",
    "offerDescription": "An AI launch workspace",
    "competitors": "Notion, Jasper, Canva"
  }
}
```

Response `201`:

```json
{
  "project": {
    "id": "uuid",
    "userId": "uuid",
    "name": "Spring Launch",
    "description": "Launch workspace for our new offer",
    "status": "DRAFT",
    "brief": {},
    "products": []
  }
}
```

Possible errors:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`

### Get all projects

#### `GET /api/v1/projects`

Private route.

Response `200`:

```json
{
  "projects": []
}
```

Possible errors:

- `401 UNAUTHORIZED`

### Get single project

#### `GET /api/v1/projects/:id`

Private route.

Response `200`:

```json
{
  "project": {
    "id": "uuid",
    "brief": {},
    "products": []
  }
}
```

Possible errors:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`

### Update project

#### `PATCH /api/v1/projects/:id`

Private route.

Body:

```json
{
  "name": "Updated Launch",
  "status": "ACTIVE",
  "brief": {
    "targetAudience": "Creators and indie founders"
  }
}
```

Response `200`:

```json
{
  "project": {}
}
```

Possible errors:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`

### Delete project

#### `DELETE /api/v1/projects/:id`

Private route.

Response `204` with no body.

Possible errors:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`

---

## Products

### Add product

#### `POST /api/v1/products`

Private route.

Body:

```json
{
  "projectId": "uuid",
  "name": "AtelIA Launch Kit",
  "description": "AI workspace for product launch teams",
  "price": "$49/month",
  "targetSegment": "Small SaaS teams",
  "uniqueValueProposition": "Generate all launch assets from one brief",
  "status": "ACTIVE"
}
```

Response `201`:

```json
{
  "product": {}
}
```

Possible errors:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND` if the project does not belong to the current user.

### Get product

#### `GET /api/v1/products/:id`

Private route.

Response `200`:

```json
{
  "product": {
    "id": "uuid",
    "generatedContents": [],
    "generatedVisuals": []
  }
}
```

Possible errors:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`

### Update product

#### `PATCH /api/v1/products/:id`

Private route.

Body:

```json
{
  "name": "Updated Product Name",
  "status": "ACTIVE"
}
```

Response `200`:

```json
{
  "product": {}
}
```

Possible errors:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`

### Delete product

#### `DELETE /api/v1/products/:id`

Private route.

Response `204` with no body.

Possible errors:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`

---

## Generated contents

### Create generated content

#### `POST /api/v1/generated-contents`

Private route.

Body:

```json
{
  "productId": "uuid",
  "type": "LANDING_PAGE",
  "title": "Hero section v1",
  "content": "Launch faster with AtelIA...",
  "promptUsed": "Write a premium landing page hero..."
}
```

Response `201`:

```json
{
  "generatedContent": {}
}
```

Possible errors:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND` if the product does not belong to the current user.

### List generated contents

#### `GET /api/v1/generated-contents?productId=:productId&type=EMAIL`

Private route. `type` is optional.

Response `200`:

```json
{
  "generatedContents": []
}
```

Possible errors:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`

---

## Generated visuals

### Create generated visual

#### `POST /api/v1/generated-visuals`

Private route.

Body:

```json
{
  "productId": "uuid",
  "imageUrl": "https://cdn.example.com/image.png",
  "style": "minimal studio product photo",
  "promptUsed": "Create a premium minimalist product photo..."
}
```

Response `201`:

```json
{
  "generatedVisual": {}
}
```

Possible errors:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND` if the product does not belong to the current user.

### List generated visuals

#### `GET /api/v1/generated-visuals?productId=:productId`

Private route.

Response `200`:

```json
{
  "generatedVisuals": []
}
```

Possible errors:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`

## 6. Future module: Automation

Automation is intentionally not implemented yet. The current module structure is ready to add it later as `src/modules/automations` with its own routes, schemas, controller and service.
