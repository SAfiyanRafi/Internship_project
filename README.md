# 🕋 THABBA Travel & Tour — Modern Full-Stack CRM & Public Portal

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma_ORM-6.4-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Vercel Ready](https://img.shields.io/badge/Vercel-Deployment_Ready-000000?style=flat-square&logo=vercel)](https://vercel.com/)

A full-stack Travel & Tour management system built for **THABBA Travel & Tour Pvt Ltd**. Rebuilt from the ground up to replace legacy procedural PHP with a modern enterprise tech stack ready for 1-click deployment on **Vercel** with **PostgreSQL**.

---

## ✨ Features Overview

### 🌐 Public Website (`/`)
- **Hero & Branding Banner**: Customizable company tagline and quick action CTAs.
- **Hajj & Umrah Packages**: Live database packages grid displaying room sharing, inclusions, days, pricing, and inquiry buttons.
- **Service Offerings**: Detailed cards for Hajj/Umrah, Air Tickets, Hotel Reservations, and Visa Processing.
- **Public Accommodation & Flight Directory**: Published notices for hotels (with Haram distance) and upcoming flight schedules.
- **Interactive Contact/Enquiry Form**: Submits pilgrim leads directly to the CRM with instant status feedback.

### 🔒 Password-Protected Staff CRM (`/admin`)
- **Role-Based Access Control (RBAC)**: Supports *Super Admin*, *Manager*, *Accountant*, and *Staff* roles with branch-scoping.
- **Dashboard Analytics**: Real-time metrics for Total Customers, Active Bookings, Total Sales, Collected Payments, Outstanding Balances, and Pending Visas.
- **Customer Directory & Profiling**: Search & filter by passport, CNIC, or phone. File upload dropzone for Passport/CNIC documents with full dossier views.
- **Package Management**: Create/Edit Hajj & Umrah packages, pricing, inclusions, and website publication toggles.
- **Bookings Builder**: Manage pilgrim bookings, discounts, status lifecycles (*Booked*, *Visa Processing*, *Ticket Issued*, *Completed*, etc.), PNRs, and flight numbers.
- **Family & Travel Groups**: Group management for linking pilgrim family members under a designated group leader.
- **Payments & Receipts**: Record installment payments, calculate net remaining balance, and generate print-ready numbered receipts (`RCPT-YYYY-XXXXX`).
- **Visa Pipeline Tracker**: Track visa application milestones from document collection to submission and decision.
- **Hotels & Flights Directories**: Internal directory with website publishing switches.
- **Expenses & Cash Flow Profit**: Track agency operational costs and calculate net cash flow (Collected Revenue - Expenses).
- **Public Lead Tracker**: Process website enquiries with status updates (*New* ➔ *Contacted* ➔ *Converted* ➔ *Closed*).
- **Financial Audit & Reports**: Comprehensive revenue analytics and dedicated Outstanding Pilgrim Balances report.
- **CSV Data Exports**: One-click CSV export across all data tables.
- **Company Settings**: Update contact information, physical address, currency symbol, and landing page headlines.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, Server Components & API Routes) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + Lucide Icons + Glassmorphism UI |
| **Database & ORM** | [Prisma ORM](https://www.prisma.io/) with **PostgreSQL** (Vercel Postgres, Neon, Supabase, Aiven) |
| **Authentication** | HTTP-Only JWT Session Cookies (`jose` + `bcryptjs`) |
| **Data Export** | Native CSV Stream Generator (`/api/export`) |

---

## ⚡ Deployment to Vercel (Step-by-Step)

### Step 1: Create a PostgreSQL Database
Create a free PostgreSQL database on **Vercel Postgres**, **Neon**, **Supabase**, or **Aiven**. Copy your database connection URL (starts with `postgresql://...`).

### Step 2: Import Project into Vercel
1. Go to [Vercel.com](https://vercel.com/) and click **Add New Project**.
2. Select your repository: `SAfiyanRafi/Internship_project`.
3. Under **Environment Variables**, add:
   - `DATABASE_URL`: `postgresql://user:password@your-db-host.com:5432/thabba_travel`
   - `JWT_SECRET`: `thabba_crm_secure_jwt_secret_key_2026_super_secret`
4. Click **Deploy**.

### Step 3: Run Database Migrations & Seed
Run `npx prisma db push` and `npx tsx prisma/seed.ts` against your production PostgreSQL database:
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

---

## 💻 Local Development

1. **Clone & Install**:
   ```bash
   git clone https://github.com/SAfiyanRafi/Internship_project.git
   cd Internship_project
   npm install
   ```

2. **Setup `.env`**:
   Copy `.env.example` to `.env` and set your local or remote `DATABASE_URL`:
   ```bash
   cp .env.example .env
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Access Portal**:
   - **Public Website**: [http://localhost:3000](http://localhost:3000)
   - **Staff CRM Login**: [http://localhost:3000/login](http://localhost:3000/login)

---

## 🔑 Default Credentials

| Field | Details |
| :--- | :--- |
| **Email** | `admin@thabba.local` |
| **Password** | `1193` |
| **Role** | Super Admin |

---

## 📄 License & Credits

Developed for **THABBA Travel & Tour Pvt Ltd**. All rights reserved.
