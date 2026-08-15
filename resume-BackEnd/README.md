# ResumeFlow API

Express.js and MySQL backend for ResumeFlow. It stores authenticated users,
documents, structured resume sections, templates, versions, share links and job
applications.

## Current scope

Implemented:

- JWT register and login
- Profile read/update, password change and account deletion
- Per-user document ownership checks
- Resume, CV and cover-letter document types
- Dynamic starter sections based on the selected template
- Main-column and sidebar sections through isSidebar
- Section and item CRUD with ordering
- Atomic full-document auto-save through PUT /api/documents/:id
- Document duplicate and structured import
- Version save, list and restore
- Application tracker with status and application date
- Default template seed data
- Public read-only share links
- CORS allowlist, security headers, request limits and auth rate limiting
- Railway-compatible database and process configuration

Intentionally deferred:

- Real AI provider calls
- PDF and DOCX generation
- Password-reset email delivery
- Uploaded-file parsing

Deferred endpoints return 501 Not Implemented; they do not create fake data.

## Requirements

- Node.js 18 or newer
- MySQL 8

## Local setup

From CMD or PowerShell:

    npm install
    copy .env.example .env
    npm run db:migrate
    npm run db:seed
    npm start

Edit .env before migrating:

    NODE_ENV=development
    PORT=3000
    CLIENT_URL=http://localhost:4200
    JWT_SECRET=replace-this-with-a-long-random-value
    JWT_EXPIRES_IN=7d

    DATABASE_HOST=127.0.0.1
    DATABASE_PORT=3306
    DATABASE_USER=root
    DATABASE_PASSWORD=your_mysql_password
    DATABASE_NAME=resume_db
    DATABASE_SSL=false

Health check:

    GET http://localhost:3000/api/health

A successful response confirms both the API and MySQL connection.

## Authentication

Protected routes require:

    Authorization: Bearer YOUR_JWT_TOKEN
    Content-Type: application/json

Register with POST /api/auth/register:

    {
      "name": "Ayush Joshi",
      "email": "ayush@example.com",
      "password": "strong-password"
    }

Login uses POST /api/auth/login.

## Main endpoints

| Resource | Method and path | Purpose |
| --- | --- | --- |
| Health | GET /api/health | API and database status |
| Users | GET /api/users/me | Current profile |
| Users | PUT /api/users/me | Update name or email |
| Users | PUT /api/users/me/password | Change password |
| Documents | GET /api/documents | Current user's documents |
| Documents | POST /api/documents | Create a document |
| Documents | GET /api/documents/:id | Document with sections/items |
| Documents | PUT /api/documents/:id | Save settings or all sections |
| Documents | POST /api/documents/:id/duplicate | Duplicate content |
| Documents | POST /api/documents/import | Import structured JSON |
| Documents | DELETE /api/documents/:id | Delete owned document |
| Sections | POST /api/sections | Create section |
| Sections | GET /api/sections/document/:documentId | List sections |
| Sections | PUT /api/sections/:id | Reorder, rename or toggle sidebar |
| Items | POST /api/items | Create section item |
| Items | GET /api/items/section/:sectionId | List items |
| Items | PUT /api/items/:id | Update or reorder item |
| Templates | GET /api/templates | Public template catalogue |
| Versions | POST /api/documents/:documentId/versions | Save version |
| Versions | GET /api/documents/:documentId/versions | List versions |
| Versions | POST /api/documents/:documentId/versions/:versionId/restore | Restore |
| Applications | GET /api/applications | List tracker entries |
| Applications | POST /api/applications | Track an application |
| Applications | PATCH /api/applications/:id | Update tracker entry |
| Shares | POST /api/documents/:documentId/share | Create public link |
| Shares | GET /api/shares | List owned links |
| Shares | GET /api/shares/public/:slug | Public read-only document |

## Create a template-backed document

POST /api/documents:

    {
      "title": "Frontend Developer Resume",
      "type": "resume",
      "template": "Sidebar Gold"
    }

The backend creates starter sections. For sidebar templates, Contact, Technical
Skills and Languages receive isSidebar: true.

## Atomic editor save

The editor may save the document and all sections in one transaction:

    PUT /api/documents/12

    {
      "title": "Frontend Developer Resume",
      "sections": [
        {
          "heading": "Contact",
          "isSidebar": true,
          "items": [
            { "content": "Dehradun, Uttarakhand" },
            { "content": "ayush@example.com" }
          ]
        },
        {
          "heading": "Projects",
          "isSidebar": false,
          "items": [
            { "content": "Built ResumeFlow with Angular and Express." }
          ]
        }
      ]
    }

If a database write fails, the transaction rolls back and the previous document
remains intact.

## Tests

    npm test

The included tests cover API security/error behaviour, model associations,
password hashing, shared validation and rate limiting. Database flows should
additionally be checked using Postman after migrations.

## Railway deployment

The included railway.json runs migrations before starting the API. Configure:

- NODE_ENV=production
- JWT_SECRET
- CLIENT_URL with the deployed Angular URL
- DATABASE_URL supplied by Railway MySQL

Railway uses /api/health as the health-check path.

## Project structure

    controllers/   Request handling and ownership checks
    middleware/    JWT auth, validation and rate limiting
    models/        Sequelize models and associations
    migrations/    Versioned MySQL schema changes
    routes/        REST resource routes
    seeders/       Default resume templates
    tests/         Node test runner tests
    utils/         Shared validation and document helpers

## Author

Ayush Joshi
