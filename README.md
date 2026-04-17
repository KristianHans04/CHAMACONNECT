# ChamaConnect Transparency and Operations Suite

**Live URL:** [https://chamaconnect.kristianhans.com](https://chamaconnect.kristianhans.com)

---

## Overview

ChamaConnect is a digital chama management platform focused on financial transparency and operational efficiency. Built for the MUIAA LTD x SALAMANDER COMMUNITY: ChamaConnect Virtual Hackathon.

### Core Features

- **Contribution Tracking** - Full CRUD for plans and records with status management
- **Missed Payment Visibility** - Overdue detection, upcoming dues, health summary
- **Member Statements** - Per-member financial statements with date filtering and print support
- **Audit Trail** - Comprehensive logging of all meaningful actions
- **Role-Based Access** - Admin, Treasurer, and Member roles with appropriate permissions
- **Payment Integration** - Paystack support behind environment config
- **Email OTP Auth** - Secure passwordless authentication

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS, TanStack Query, React Router, React Hook Form, Zod, Lucide Icons |
| Backend API | Cloudflare Pages Functions, Hono, D1 (SQLite) |
| Auth | Email OTP with JWT (Web Crypto API) |
| Database | Cloudflare D1 |
| Deployment | Cloudflare Pages |
| Payments | Paystack (optional, behind env config) |

## Project Structure

```
CHAMACONNECT/
├── client/                 # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── api/            # API client
│   │   ├── components/     # UI components and layouts
│   │   ├── hooks/          # Auth context and custom hooks
│   │   ├── lib/            # Utilities
│   │   └── pages/          # All page components
│   │       ├── public/     # Landing, features, legal pages
│   │       ├── auth/       # Login, signup, OTP verification
│   │       └── app/        # Authenticated app pages
│   └── dist/               # Build output
├── functions/              # Cloudflare Pages Functions (API)
│   ├── api/[[route]].ts    # Hono catch-all handler
│   ├── _routes/            # API route modules
│   └── _lib/               # Shared utilities and types
├── migrations/             # D1 database migrations
├── wrangler.toml           # Cloudflare configuration
└── docker-compose.yml      # Local dev infrastructure
```

## Routes

### Public Pages
| Route | Page |
|-------|------|
| `/` | Home / Landing |
| `/features` | Features overview |
| `/how-it-works` | Step-by-step guide |
| `/contact` | Contact form |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/login` | Login |
| `/signup` | Sign up |
| `/verify-otp` | OTP verification |

### Authenticated App
| Route | Page |
|-------|------|
| `/app` | Dashboard |
| `/app/chamas` | Chama list |
| `/app/chamas/new` | Create chama |
| `/app/chamas/:id` | Chama detail |
| `/app/chamas/:id/edit` | Edit chama |
| `/app/chamas/:id/members` | Members list + invites |
| `/app/chamas/:id/members/:memberId` | Member detail |
| `/app/chamas/:id/contributions` | Contributions list |
| `/app/chamas/:id/contributions/new` | Create contribution |
| `/app/chamas/:id/contributions/:id` | Contribution detail |
| `/app/chamas/:id/contributions/:id/edit` | Edit contribution |
| `/app/chamas/:id/overdue` | Overdue / health |
| `/app/chamas/:id/statements` | Statements overview |
| `/app/chamas/:id/statements/:memberId` | Member statement |
| `/app/chamas/:id/audit` | Audit log |
| `/app/settings` | User settings |

## Demo Mode

The app runs in **demo mode** by default (`DEMO_MODE=true`), which returns OTP codes directly in the API response so you can test the full auth flow without email delivery. In production, set `DEMO_MODE=false` and configure a mail service.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | Secret key for JWT signing |
| `DEMO_MODE` | No | Set to `true` to return OTP in API responses (default: true) |
| `PAYSTACK_SECRET_KEY` | No | Paystack secret key for payment processing |
| `PAYSTACK_PUBLIC_KEY` | No | Paystack public key |
| `RESEND_API_KEY` | No | Resend API key for email delivery |
| `EMAIL_FROM` | No | Sender email address |

## Database Schema

The D1 database includes these tables:
- `users` - User accounts
- `otps` - Email OTP verification codes
- `chamas` - Chama groups
- `memberships` - User-chama relationships with roles
- `invites` - Chama invitations
- `contribution_plans` - Recurring contribution configurations
- `contribution_records` - Individual contribution entries
- `payments` - Payment records (Paystack)
- `audit_logs` - Action audit trail

## Currency

All monetary values use **KES (Kenyan Shillings)**.

## License

Built for the ChamaConnect Virtual Hackathon.
