# LJ University Event Management Platform - Setup Guide

This is a comprehensive event management PWA built with Next.js 16, Supabase, and shadcn/ui.

## Features

### Admin Dashboard
- Create and manage events
- Manage teams and team members
- Assign judges/mentors to teams
- Set evaluation criteria
- View real-time scoring updates

### Mentor/Judge Interface
- View assigned teams
- Evaluate teams based on criteria
- Provide scores and feedback
- Track evaluation status

### Student Portal
- View team information
- Submit project work and links
- View real-time leaderboard
- Track team rankings

### PWA Features
- Offline support with service worker
- Push notifications for updates
- Installable on mobile devices
- Real-time score synchronization

## Setup Instructions

### 1. Supabase Authentication Configuration

**IMPORTANT:** Before running the app, disable email confirmation in Supabase:

1. Go to your Supabase Project Dashboard
2. Navigate to **Authentication > Providers > Email**
3. Turn **OFF** the "Confirm email" toggle
4. Save changes

This allows users to sign up and log in immediately without confirming their email first.

### 2. Environment Variables

Your Supabase integration should automatically provide:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `POSTGRES_URL` and other database connection strings

### 3. Database Schema

The database schema includes the following tables:
- `users` - User accounts with roles (admin, mentor, student)
- `events` - Competition events
- `teams` - Team groups participating in events
- `team_members` - Student members of teams
- `team_judges` - Judge assignments to teams
- `evaluation_criteria` - Scoring criteria for events
- `submissions` - Team project submissions
- `scores` - Judge evaluations and scores
- `leaderboard` - Computed rankings

**To create the schema:**

You can execute the SQL scripts in the Supabase SQL editor (under **SQL Editor** in your dashboard):
1. `scripts/01-init-schema.sql` - Creates all tables and indexes
2. `scripts/02-rls-policies.sql` - Sets up Row Level Security policies

Copy the entire content of each SQL file and run it in the Supabase SQL editor.

Or run via the Supabase dashboard SQL editor.

### 3. Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Create Supabase database schema:**
   - Copy the content of `scripts/01-init-schema.sql`
   - Paste it into your Supabase SQL editor and execute
   - Copy the content of `scripts/02-rls-policies.sql`
   - Paste it into your Supabase SQL editor and execute

3. **Create an admin user (optional):**
   You can use the sign-up page to create an account and manually update the role in Supabase:
   - Sign up with an email
   - In Supabase, update the user's role to 'admin' in the `users` table

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open in browser:**
   Navigate to `http://localhost:3000`

## User Roles

### Admin
- Create and manage events
- Create and manage teams
- Assign judges to teams
- Set evaluation criteria
- View all data and analytics

### Mentor/Judge
- View assigned teams
- Evaluate teams based on criteria
- Submit scores and feedback
- View their evaluation status

### Student
- View team information
- Submit team work/projects
- View leaderboard
- Track team rankings

## Workflow

1. **Admin** creates an event with evaluation criteria
2. **Admin** creates teams and assigns them to events
3. **Admin** assigns mentors/judges to evaluate teams
4. **Students** submit their work through the submissions system
5. **Mentors** evaluate teams using the judging interface
6. **All users** can view the live leaderboard with rankings

## Technology Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Database:** Supabase PostgreSQL with Row Level Security
- **Authentication:** Supabase Auth with role-based access control
- **Real-time:** Supabase Realtime subscriptions
- **Styling:** Tailwind CSS v4, shadcn/ui
- **Data Fetching:** SWR for client-side caching
- **PWA:** Service Worker, Web App Manifest

## API Routes

### Events
- `GET /api/events` - List all events (admin only)
- `POST /api/events` - Create new event (admin only)

### Teams
- `GET /api/teams` - List teams (filtered by role)
- `POST /api/teams` - Create new team (admin only)

### Judging
- `GET /api/judging/assignments` - List assigned teams for judge
- `POST /api/judging/scores` - Submit evaluation scores

### Leaderboard
- `GET /api/leaderboard?eventId=<id>` - Get ranked teams

### Submissions
- `GET /api/submissions` - List submissions
- `POST /api/submissions` - Create submission (students only)

## Important Notes

### Row Level Security (RLS)

The database uses RLS policies to ensure:
- Users can only see their own data
- Admins have full access
- Judges can only see and score their assigned teams
- Students can only access their team data
- Leaderboard is publicly viewable

### Real-time Updates

Real-time subscriptions are set up for:
- Score updates affecting leaderboard
- Team ranking changes
- Submission status changes

Components can use the `useRealtimeLeaderboard` hook to automatically refresh when data changes.

## Deployment

This project is ready to deploy on Vercel:

1. Connect your GitHub repository to Vercel
2. Supabase environment variables will be automatically imported
3. Deploy with a single click

## Support

For issues or questions:
- Check the Supabase documentation: https://supabase.com/docs
- Review Next.js documentation: https://nextjs.org/docs
- Check shadcn/ui components: https://ui.shadcn.com
