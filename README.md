# 🎓 LJ University Event Management System

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-2.97.0-3ECF8E?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2.0-38B2AC?style=for-the-badge&logo=tailwind-css)

**A comprehensive Progressive Web App for managing university events, teams, judging, and leaderboards with real-time updates.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Documentation](#-documentation)

</div>

---

## ✨ Features

### 🎯 Core Functionality
- **Event Management** - Create, edit, and manage events with detailed information
- **Team Management** - Organize teams with member assignments and team details
- **Student Management** - Bulk import students via CSV/Excel with automatic team creation
- **Judging System** - Comprehensive scoring system with customizable criteria
- **Real-time Leaderboard** - Live rankings with PDF export functionality
- **Role-Based Access** - Separate dashboards for Admin and Mentor roles

### 🚀 Advanced Features
- **Real-time Updates** - Automatic data refresh using Supabase subscriptions
- **Progressive Web App** - Installable, offline-capable mobile experience
- **CSV Import** - Bulk student import with duplicate prevention
- **PDF Export** - Generate professional leaderboard reports
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Dark Mode Support** - Theme switching with next-themes

### 👥 User Roles

#### Admin
- Full system access and control
- Event creation and management
- Student and team management
- Criteria configuration
- System-wide analytics

#### Mentor
- View events and teams
- Evaluate teams with scoring
- View leaderboards
- Access judging suite

#### Student
- View assigned events
- Team participation
- Profile management

---

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 16.1.6 (App Router)
- **UI Library:** React 19.2.4
- **Language:** TypeScript 5.7.3
- **Styling:** Tailwind CSS 4.2.0
- **Components:** Radix UI + shadcn/ui
- **Icons:** Lucide React
- **State Management:** SWR for data fetching

### Backend
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Real-time:** Supabase Realtime subscriptions
- **Storage:** Supabase Storage
- **API:** Next.js API Routes

### Additional Tools
- **PDF Generation:** jsPDF + jspdf-autotable
- **Form Handling:** React Hook Form + Zod
- **Date Handling:** date-fns
- **Analytics:** Vercel Analytics

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/neelkanth-patel26/lj_events.git
cd lj-university-pwa
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database Configuration (Optional)
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_prisma_url
POSTGRES_URL_NON_POOLING=your_non_pooling_url
```

4. **Set up the database**

Run the SQL migrations in your Supabase SQL Editor:
```bash
# Located in /supabase/migrations/
- All.sql (Main schema)
- judging_criteria.sql (Judging system)
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
lj-university-pwa/
├── app/                          # Next.js App Router
│   ├── actions/                  # Server actions
│   ├── api/                      # API routes
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Dashboard pages
│   │   ├── events/              # Event management
│   │   ├── students/            # Student management
│   │   ├── teams/               # Team management
│   │   ├── judging/             # Judging suite
│   │   ├── leaderboard/         # Leaderboard
│   │   └── criteria/            # Scoring criteria
│   └── layout.tsx               # Root layout
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── admin/                   # Admin components
│   └── mentor/                  # Mentor components
├── hooks/                        # Custom React hooks
├── lib/                          # Utility functions
│   └── supabase/                # Supabase clients
├── public/                       # Static assets
├── supabase/                     # Database migrations
└── styles/                       # Global styles
```

---

## 📚 Documentation

### Key Features Documentation

#### Real-time Updates
All pages automatically refresh when data changes using Supabase real-time subscriptions. See [REALTIME_IMPLEMENTATION.md](./REALTIME_IMPLEMENTATION.md) for details.

#### CSV Import
Import students in bulk with automatic team creation:
- Download template from Students page
- Fill in student details with group numbers
- Upload CSV/Excel file
- System creates users and teams automatically

#### Judging System
- Admin configures scoring criteria (max 100 points each)
- Mentors select events and evaluate teams
- Scores automatically update team rankings
- Real-time leaderboard updates

#### PDF Export
Generate professional leaderboard PDFs with:
- Team rankings with colored badges
- All team members listed
- Event information
- Copyright footer

---

## 🔐 Authentication

The system uses Supabase authentication with custom user management:

- **Sign Up:** Create account with email/password
- **Login:** Authenticate with credentials
- **Roles:** Assigned during account creation (admin/mentor/student)
- **Session:** Managed via Supabase Auth

---

## 🎨 UI Components

Built with **shadcn/ui** and **Radix UI** for:
- Accessible components
- Consistent design system
- Responsive layouts
- Smooth animations

---

## 📱 Progressive Web App

The application is a full PWA with:
- **Installable** on mobile and desktop
- **Offline support** with service workers
- **App manifest** for native-like experience
- **Responsive design** for all screen sizes

---

## 🔄 Real-time Features

Powered by Supabase Realtime:
- Live event updates
- Team score changes
- Member additions/removals
- Leaderboard rankings
- Criteria modifications

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is private and proprietary to LJ University.

---

## 👨‍💻 Developer

**Neelkanth Patel**
- GitHub: [@neelkanth-patel26](https://github.com/neelkanth-patel26)

---

## 🙏 Acknowledgments

- **LJ University** for project requirements
- **Supabase** for backend infrastructure
- **Vercel** for hosting platform
- **shadcn/ui** for component library

---

<div align="center">

**Built with ❤️ for LJ University**

[Report Bug](https://github.com/neelkanth-patel26/lj_events/issues) • [Request Feature](https://github.com/neelkanth-patel26/lj_events/issues)

</div>
