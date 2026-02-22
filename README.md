# 🎓 LJ University Event Management System

<div align="center">

![LJ Events](https://img.shields.io/badge/LJ-Events-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)
![PWA](https://img.shields.io/badge/PWA-Enabled-purple?style=for-the-badge)

**A comprehensive Progressive Web App for managing university events, teams, judging, and leaderboards**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [API](#-api-routes) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Database Setup](#-database-setup)
- [Usage](#-usage)
- [User Roles](#-user-roles)
- [API Routes](#-api-routes)
- [Project Structure](#-project-structure)
- [PWA Features](#-pwa-features)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

LJ University Event Management System is a modern, full-stack Progressive Web Application designed to streamline event management, team coordination, judging processes, and real-time leaderboard tracking for university events and competitions.

### Key Highlights

- 📱 **Mobile-First PWA** - Install on any device, works offline
- 🔄 **Real-time Updates** - Live leaderboard and score updates
- 👥 **Multi-Role System** - Admin, Mentor, and Student roles
- 📊 **Advanced Analytics** - Comprehensive dashboards and statistics
- 🎯 **Judging System** - Flexible criteria-based evaluation
- 🏆 **Dynamic Leaderboards** - Event-specific rankings with visibility controls

---

## ✨ Features

### 🔐 Authentication & Authorization
- Secure email/password authentication
- Role-based access control (Admin, Mentor, Student)
- Protected routes with middleware
- Session management

### 👨‍💼 Admin Features
- **Event Management**: Create, edit, and manage events with custom settings
- **User Management**: Add/edit/delete students, mentors, and admins
- **Team Management**: Create teams and assign members
- **Bulk Import**: CSV import for students and mentors
- **Judge Assignment**: Assign mentors to evaluate specific teams
- **Leaderboard Control**: Toggle leaderboard visibility per event
- **Analytics Dashboard**: View comprehensive statistics and insights

### 👨‍🏫 Mentor Features
- **Judging Interface**: Evaluate assigned teams with custom criteria
- **Criteria Builder**: Create flexible evaluation criteria
- **Score Management**: Submit and update scores
- **Team Overview**: View assigned teams and their details
- **Profile Management**: Update personal information

### 👨‍🎓 Student Features
- **Team Dashboard**: View team information and members
- **Event Participation**: Track enrolled events
- **Leaderboard Access**: View rankings when unlocked
- **Profile Management**: Update personal details

### 📊 Real-time Features
- Live leaderboard updates using Supabase Realtime
- Instant score reflections
- Real-time team statistics
- Automatic rank calculations

### 📱 PWA Capabilities
- Installable on mobile and desktop
- Offline support with service workers
- Portrait-only orientation lock on mobile
- App shortcuts for quick access
- Native app-like experience

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **State Management**: React Hooks

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **API**: Next.js API Routes
- **File Storage**: Supabase Storage

### DevOps & Tools
- **Version Control**: Git & GitHub
- **Package Manager**: npm
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics

---

## 🚀 Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Git

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/neelkanth-patel26/lj_events.git
cd lj_events
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

4. **Configure environment variables** (see [Environment Setup](#-environment-setup))

5. **Run database migrations**
```bash
# Execute SQL files in supabase/migrations/ in Supabase SQL Editor
```

6. **Start development server**
```bash
npm run dev
```

7. **Open in browser**
```
http://localhost:3000
```

---

## 🔧 Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy the **Project URL** and **API Keys**

---

## 🗄 Database Setup

### Tables Structure

The application uses the following main tables:

- **users** - User accounts and authentication
- **events** - Event information and settings
- **teams** - Team details and event associations
- **team_members** - Student-team relationships
- **mentor_profiles** - Mentor information
- **judging_criteria** - Evaluation criteria
- **scores** - Judging scores
- **team_judges** - Mentor-team assignments
- **leaderboard** - Computed rankings (view)

### Running Migrations

Execute the SQL files in `supabase/migrations/` in order:

1. Navigate to Supabase Dashboard → SQL Editor
2. Run `All.sql` to create all tables and policies
3. Run `enable_rls.sql` to configure security
4. Run `judging_criteria.sql` for judging setup

---

## 📖 Usage

### Creating Your First Event

1. **Login as Admin**
   - Use admin credentials or create admin via SQL

2. **Create Event**
   - Navigate to Events → Add Event
   - Fill in event details
   - Set leaderboard visibility

3. **Add Students**
   - Go to Students → Add Student
   - Or use CSV bulk import

4. **Create Teams**
   - Navigate to Teams → Create Team
   - Assign students to teams

5. **Assign Judges**
   - Go to Event → Teams
   - Assign mentors to evaluate teams

6. **Start Judging**
   - Mentors login and access Judging
   - Evaluate assigned teams

7. **View Leaderboard**
   - Enable leaderboard visibility
   - View real-time rankings

---

## 👥 User Roles

### Admin
- Full system access
- Manage all users, events, and teams
- Configure judging and leaderboards
- View analytics and reports

### Mentor
- Evaluate assigned teams
- Create judging criteria
- Submit and update scores
- View team details

### Student
- View team information
- Access event details
- View leaderboard (when unlocked)
- Update profile

---

## 🔌 API Routes

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - List all events
- `POST /api/events` - Create event
- `GET /api/events/[id]` - Get event details
- `PUT /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event

### Teams
- `GET /api/teams` - List teams
- `POST /api/teams` - Create team
- `GET /api/teams/[id]` - Get team details
- `PUT /api/teams/[id]` - Update team
- `DELETE /api/teams/[id]` - Delete team

### Students
- `GET /api/students` - List students
- `POST /api/students/add` - Add student
- `POST /api/students/bulk-import` - Bulk import
- `DELETE /api/students/delete` - Delete student

### Mentors
- `GET /api/mentors` - List mentors
- `POST /api/mentors/add` - Add mentor
- `POST /api/mentors/bulk-import` - Bulk import
- `PUT /api/mentors/[id]` - Update mentor
- `DELETE /api/mentors/[id]` - Delete mentor

### Judging
- `GET /api/judging/assignments` - Get assignments
- `POST /api/judging/score` - Submit score
- `PUT /api/judging/score/[id]` - Update score

### Leaderboard
- `GET /api/leaderboard/[eventId]` - Get leaderboard

---

## 📁 Project Structure

```
lj-university-pwa/
├── app/
│   ├── actions/          # Server actions
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Dashboard pages
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   ├── ui/               # UI components (Shadcn)
│   ├── admin/            # Admin components
│   ├── mentor/           # Mentor components
│   └── *.tsx             # Shared components
├── lib/
│   ├── supabase/         # Supabase clients
│   └── utils.ts          # Utility functions
├── public/
│   ├── icons/            # App icons
│   ├── templates/        # CSV templates
│   └── manifest.json     # PWA manifest
├── supabase/
│   └── migrations/       # Database migrations
├── middleware.ts         # Auth middleware
└── package.json          # Dependencies
```

---

## 📱 PWA Features

### Installation
- **Desktop**: Click install icon in address bar
- **Mobile**: Add to Home Screen from browser menu

### Offline Support
- Service worker caching
- Offline fallback page
- Background sync

### Mobile Optimizations
- Portrait-only orientation lock
- Touch-optimized UI
- Responsive design
- Bottom navigation bar

### App Shortcuts
- Quick access to Dashboard
- Direct link to Events
- Jump to Leaderboard

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Code Style
- Use TypeScript for type safety
- Follow ESLint rules
- Write meaningful commit messages
- Add comments for complex logic

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Neelkanth Patel**
- GitHub: [@neelkanth-patel26](https://github.com/neelkanth-patel26)  
**Urmi Thakkar**
- Instagram: [@urmi_thakkar26](https://www.instagram.com/urmi_thakkar_26)
**Reese Whiteman**
- Instagram: [@reese_whiteman26](https://www.instagram.com/reese.whiteman28)
**Jay Shah**
- No Public account

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend platform
- [Shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide](https://lucide.dev/) - Icons

---

<div align="center">

**Made with ❤️ for LJ University**

⭐ Star this repo if you find it helpful!

</div>
