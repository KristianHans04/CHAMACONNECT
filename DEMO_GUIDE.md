# ChamaConnect Demo Guide

## Live URL
**https://chamaconnect.kristianhans.com** (Also available at https://chamaconnect.pages.dev)

---

## Demo Credentials

### Demo User
- **Email:** user@example.com
- **Password:** DemoPass123!

> OTP will be sent via Resend email to verify account (Cloudflare Resend integration)

---

## Demo Flow - End to End

### 1. Authentication (OTP Email Flow)
1. Navigate to https://chamaconnect.kristianhans.com
2. Click "Sign In"
3. Enter `user@example.com` and any password
4. You'll receive an OTP via email from `chamaconnect@scrapifie.com`
5. Enter OTP to complete authentication

**What This Tests:**
- Email authentication system
- Resend API integration
- JWT token generation
- Protected route access

### 2. Dashboard Overview
After login, you'll see:
- **Total Chamas:** Count of all chamas user is part of
- **Total Members:** Aggregated member count across all chamas
- **Quick Actions:** Create new chama, View all chamas
- **Chama Cards:** Overview of each chama (expandable)

**What This Tests:**
- Data aggregation and display
- Role-based content visibility

### 3. Chamas Management
#### Browse Chamas
- Click "View Chamas" to see all chamas
- See chama name, description, member count, creation date

**What This Tests:**
- List rendering
- Data from D1 database

#### Create New Chama
- Click "Create Chama"
- Enter name and description
- Set currency (KES default)
- Submit to create

**What This Tests:**
- Form validation with Zod
- POST API endpoint
- Database write
- Audit logging

#### View Chama Details
- Click on any chama card
- See chama information, members, roles
- Edit chama (if Admin)
- Delete chama (if Admin)

**What This Tests:**
- GET endpoints
- Authorization checks
- Conditional rendering based on role

### 4. Member Management
#### Add Members to Chama
- In chama detail view, click "Invite Member"
- Enter member email and select role (Admin/Treasurer/Member)
- Invitation sent
- Member can accept via email invite link

**What This Tests:**
- Member invitation flow
- Email integration
- Token-based invite validation

#### Manage Member Roles
- View all members in chama
- Change member roles (Admin/Treasurer/Member)
- Remove members

**What This Tests:**
- PATCH endpoints for role changes
- DELETE endpoints for member removal
- Audit logging of role changes

### 5. Contribution Tracking
#### Create Contribution Plan
- In chama detail, go to "Contribution Plans"
- Click "Create Plan"
- Set name, amount, frequency (Weekly/Monthly/Quarterly/etc)
- Set start and end dates
- Submit

**What This Tests:**
- Plan creation
- Frequency options handling
- Date validation

#### Record Contributions
- Go to "Contributions" section
- Click "Create Contribution Record"
- Select plan and member
- Enter amount, expected amount, due date
- Set status (UPCOMING/PAID/PARTIALLY_PAID/OVERDUE)

**What This Tests:**
- Multi-step form with dependent selects
- Contribution record creation
- Status tracking

#### View Contribution Details
- Click on any contribution record
- See full details including:
  - Linked plan and member
  - Payment records (if any)
  - Due date and status
  - Notes

**What This Tests:**
- Complex data relationships
- Nested component rendering

### 6. Payment Tracking
#### Add Payment to Contribution
- In contribution detail, click "Add Payment"
- Enter amount, payment method
- Confirm

**What This Tests:**
- Payment endpoint
- Relationship creation
- Status updates on parent contribution

### 7. Financial Statements
#### Member Statements
- Go to "Statements" section
- Select date range (optional)
- View member-specific statement showing:
  - Total contributed
  - Total expected
  - Balance
  - Overdue amounts
  - Payment history

**What This Tests:**
- Aggregation and calculation
- Date filtering
- Financial calculations

#### Print Statement
- Click "Print" to generate PDF in browser
- Verify all data is correctly formatted

**What This Tests:**
- Print stylesheet
- PDF generation in browser

### 8. Overdue Management
#### View Overdue Contributions
- Go to "Overdue" section
- See all contributions past due date with status PENDING/PARTIALLY_PAID
- Sort by member, amount, date
- Click to view/edit details

**What This Tests:**
- Overdue detection logic
- Status filtering
- Data aggregation by status

### 9. Audit Trail
#### View Audit Logs
- Go to "Audit" section
- See all logged actions including:
  - User who performed action
  - Action type (CREATE, UPDATE, DELETE, etc)
  - Entity affected
  - Timestamp

**What This Tests:**
- Audit logging functionality
- Event tracking
- Data history

### 10. Settings
#### Update Profile
- Go to "Settings"
- Update name, phone, email
- View account information

**What This Tests:**
- User profile management
- Settings page rendering

---

## Data Structure Verified

### Users
- Main demo user: user@example.com
- 8-10 members per chama with Kenyan names
- Assigned roles (Admin, Treasurer, Member)

### Chamas (3 Total)
1. **Nairobi Office Savings Group** - Weekly savings focus
2. **Westlands Investment Club** - Monthly investment focus  
3. **Community Welfare Fund** - Community support focus

### Contribution Plans
- 2-3 plans per chama
- Different frequencies: Weekly, Monthly, Quarterly
- Amounts in KES (1,000 - 15,000)

### Contribution Records
- 50+ records per chama
- Mixed statuses: UPCOMING, PAID, PARTIALLY_PAID, OVERDUE
- Realistic date distribution (past and future)
- Sample overdue records for testing

### Payments
- Payment records linked to paid/partially paid contributions
- Paystack provider reference format
- Status tracking (SUCCESS, FAILED, PENDING)

### Audit Logs
- Chama creation events
- Member actions
- Generic action types (CREATE, UPDATE, DELETE, LOGIN, VIEW)

---

## API Endpoints Tested

### Authentication
- `POST /api/auth/signup` - Create account, send OTP
- `POST /api/auth/verify-otp` - Verify OTP, get JWT
- `POST /api/auth/login` - Send OTP for existing account
- `POST /api/auth/resend-otp` - Resend OTP

### Chamas
- `GET /api/chamas` - List all chamas for user
- `GET /api/chamas/:id` - Get chama details
- `POST /api/chamas` - Create chama
- `PUT /api/chamas/:id` - Update chama
- `DELETE /api/chamas/:id` - Delete chama

### Members
- `GET /api/chamas/:chamaId/members` - List members
- `GET /api/chamas/:chamaId/members/:memberId` - Member details
- `PATCH /api/chamas/:chamaId/members/:memberId/role` - Update role
- `DELETE /api/chamas/:chamaId/members/:memberId` - Remove member
- `POST /api/chamas/:chamaId/invites` - Send invite
- `GET /api/chamas/:chamaId/invites` - List invites
- `POST /api/invites/:token/accept` - Accept invite

### Contributions
- `GET /api/chamas/:chamaId/plans` - List plans
- `POST /api/chamas/:chamaId/plans` - Create plan
- `GET /api/chamas/:chamaId/contributions` - List contributions
- `POST /api/chamas/:chamaId/contributions` - Create contribution
- `PATCH /api/chamas/:chamaId/contributions/:id` - Update contribution
- `DELETE /api/chamas/:chamaId/contributions/:id` - Delete contribution

### Payments
- `POST /api/chamas/:chamaId/contributions/:contribId/payments` - Add payment

### Statements
- `GET /api/chamas/:chamaId/statements` - List statements by member
- `GET /api/chamas/:chamaId/statements/:memberId` - Member statement

### Audit
- `GET /api/chamas/:chamaId/audit` - Chama audit logs
- `GET /api/audit` - User's all audit logs

### Seed (Development Only)
- `POST /api/seed` - Seed demo database (DEMO_MODE=true only)

---

## Local Development Setup

### Build
```bash
npm run build
```

### Local Dev Server
```bash
# Sets up Wrangler with local D1 database
npm run dev
# Runs on http://localhost:8788
```

### Database Migrations (Local)
```bash
npm run db:migrate:local
```

### Database Migrations (Production)
```bash
npm run db:migrate:remote
```

---

## Environment Variables

### Production (Cloudflare Pages)
- `DEMO_MODE=false` - Uses real Resend email for OTP
- `RESEND_API_KEY` - Resend API key for email
- `EMAIL_FROM=chamaconnect@scrapifie.com` - OTP sender email
- `JWT_SECRET` - JWT signing key
- `DB` - D1 database binding (set in wrangler.toml)

### Local Development (.env)
- `DEMO_MODE=true` - Returns OTP in API response (no email needed)
- `RESEND_API_KEY` - (Optional) Can use real Resend locally
- `EMAIL_FROM` - (Optional) Custom sender email

---

## Known Limitations & Testing Notes

1. **Email OTP Flow**: In production, OTP is sent via Resend. Check spam folder if email not received immediately.

2. **Local OTP Testing**: Set `DEMO_MODE=true` in local .env to get OTP codes in API response without needing email.

3. **Paystack Integration**: Payment provider is behind `PAYSTACK_SECRET_KEY` env var. In demo, payments are recorded but not actually processed through Paystack.

4. **Role Permissions**: 
   - Members can only view data they're part of
   - Treasurers can modify contributions for their chama
   - Admins have full control over chama data

5. **Audit Logging**: All create/update/delete operations are logged. Login/view operations are logged at the chama level.

---

## Troubleshooting

### OTP Not Received
- Check spam folder
- Wait 30 seconds (Resend API may be slow)
- Try resend OTP button
- In production: Check RESEND_API_KEY is set correctly in Cloudflare Pages

### Can't See Members in Dropdown
- Members must exist and be part of the chama already
- Create members first via invite flow
- Check member's status is active (not removed)

### Can't Create Contributions
- Ensure chama has at least one plan
- Ensure chama has at least one active member
- Verify you're logged in as Admin or Treasurer

### Database Out of Sync
- Manually seed: `curl -X POST https://chamaconnect.kristianhans.com/api/seed`
- Or run migrations: `npm run db:migrate:remote`

---

## Performance Notes

- D1 queries optimized with indexes on chama_id, membership status, due dates
- React Query client-side caching reduces API calls
- Vite builds with code splitting (main bundle ~506KB gzipped)
- Cloudflare Pages automatically caches static assets

---

## Security

- JWT tokens: 7-day expiry, signed with Web Crypto API
- Passwords: bcrypt hashed (handled by auth middleware)
- OTP: 10-minute expiry, single-use
- API endpoints: Protected with userId extraction from JWT
- Role checks: Enforced server-side on every write operation
- Audit logs: Immutable records of all meaningful actions
