
# Buyer Lead Intake App

A full-stack Next.js app for managing real estate buyer leads, with secure ownership, admin controls, CSV import/export, and production-quality features.

## Setup

### 1. Clone & Install
```sh
git clone <repo-url>
cd buyer-lead-app
npm install
```

### 2. Environment Variables
Create a `.env` file:
```
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/buyer_leads
SESSION_PASSWORD=your-strong-session-secret
```

### 3. Database Migrate & Seed
```sh
npx prisma migrate dev
npx prisma db seed
```

### 4. Run Locally
```sh
npm run dev
```
App runs at http://localhost:3000

## Design Notes

- **Validation:**
	- All form and API validation is handled with Zod schemas in `src/lib/validators.ts`.
	- Client forms use React Hook Form + Zod for instant feedback.
	- Server routes re-validate all input before DB writes.

- **SSR vs Client:**
	- Buyers list, filters, and pagination are SSR for fast load and SEO.
	- Status quick-actions, tag chips, and file upload are client components for interactivity.

- **Ownership Enforcement:**
	- Only the owner or admin can edit/delete a buyer lead (enforced in API and UI).
	- Imported leads are assigned to the importing user as owner.
	- UI hides edit/delete for non-owners/admins.

## Features: Done vs Skipped

### Done
- Buyer creation/editing forms with validation
- SSR buyers list with filters, search, pagination
- View/edit page with history tracking
- CSV import/export with error table
- Ownership/auth logic, admin role
- Tag chips/typeahead, status quick-actions
- Rate limiting on create/update
- Error boundary, empty state, accessibility basics
- Jest unit test for budget validator

### Skipped / Deferred
- File upload for attachments (planned, not yet implemented)


**Why Skipped?**
- File upload: requires additional storage setup and UI polish

