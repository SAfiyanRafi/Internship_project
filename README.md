# 🕋 THABBA Travel & Tour — Modern Full-Stack CRM & Public Portal

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma_ORM-6.4-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=flat-square&logo=sqlite)](https://www.sqlite.org/)

A full-stack Travel & Tour management system built for **THABBA Travel & Tour Pvt Ltd**. Rebuilt from the ground up to replace legacy procedural PHP with a modern enterprise tech stack.

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
| **Database & ORM** | [Prisma ORM](https://www.prisma.io/) with SQLite (Zero-config local setup, PostgreSQL/MySQL ready) |
| **Authentication** | HTTP-Only JWT Session Cookies (`jose` + `bcryptjs`) |
| **Data Export** | Native CSV Stream Generator (`/api/export`) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.x` or higher (`v24.x` recommended)
- **npm**: `v9.x` or higher

### Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/SAfiyanRafi/Internship_project.git
   cd Internship_project
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Database Setup & Seeding**:
   Push the Prisma schema to create the SQLite database (`dev.db`) and seed initial data:
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Access Application**:
   - **Public Website**: [http://localhost:3000](http://localhost:3000)
   - **Staff CRM Login**: [http://localhost:3000/login](http://localhost:3000/login)

---

## 🔑 Default Credentials

| Field | Details |
| :--- | :--- |
| **Email** | `admin@thabba.local` |
| **Password** | `1193` |
| **Role** | Super Admin |

*Note: You can change the password or add new staff members via the Staff & Permissions module in the CRM.*

---

## 📁 Directory Structure

```text
├── app/
│   ├── admin/                # Staff CRM pages & dashboard routes
│   │   ├── bookings/
│   │   ├── branches/
│   │   ├── customers/
│   │   ├── dashboard/
│   │   ├── enquiries/
│   │   ├── expenses/
│   │   ├── flights/
│   │   ├── groups/
│   │   ├── hotels/
│   │   ├── packages/
│   │   ├── payments/
│   │   ├── reports/
│   │   ├── settings/
│   │   ├── users/
│   │   └── visas/
│   ├── api/                  # REST API Endpoints (Auth, Exports, CRUD)
│   ├── login/                # Staff authentication page
│   ├── receipt/[id]/         # Print-optimized receipt page
│   ├── globals.css           # Tailwind CSS directives & global utilities
│   ├── layout.tsx            # App root layout
│   └── page.tsx              # Public Landing Page
├── components/               # Client UI components
├── lib/                      # Auth, Prisma instance & formatters
├── prisma/
│   ├── schema.prisma         # Prisma database schema
│   └── seed.ts               # Initial database seeder
├── public/                   # Static assets & document uploads
└── package.json
```

---

## 📄 License & Credits

Developed for **THABBA Travel & Tour Pvt Ltd**. All rights reserved.
