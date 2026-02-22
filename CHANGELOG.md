# Changelog

## [Latest Updates] - 2024

### Added

#### Department Management
- **Department Field**: Added department column to users table
  - Location: `scripts/12-add-department.sql`
  - Allows tracking user departments across the system
  - Applied to admin, mentor, and student roles

#### Mentor Management System
- **Mentor Upload Page**: Bulk import mentors via CSV/Excel
  - Location: `app/dashboard/mentors/page.tsx`
  - Features:
    - CSV/Excel file upload with template download
    - Bulk mentor creation with email and department
    - Duplicate prevention
    - Real-time feedback on import status
  - API: `app/api/mentors/upload/route.ts`

#### Authentication Enhancement
- **Current User API**: Get authenticated user details
  - Location: `app/api/auth/me/route.ts`
  - Returns user profile with role and department
  - Used for client-side authentication checks

### Modified

#### API Routes
- **Judging Criteria Route** (`app/api/judging/criteria/route.ts`)
  - Enhanced error handling
  - Improved validation

- **Judging Scores Route** (`app/api/judging/scores/route.ts`)
  - Better score calculation
  - Real-time updates support

- **Leaderboard Route** (`app/api/leaderboard/route.ts`)
  - Optimized queries
  - Added department filtering

- **Students Upload Route** (`app/api/students/upload/route.ts`)
  - Added department field support
  - Enhanced duplicate detection

- **Team Members Route** (`app/api/teams/[id]/members/route.ts`)
  - Improved member management
  - Better error responses

#### Dashboard Components
- **Dashboard Layout** (`app/dashboard/layout.tsx`)
  - Added Mentors navigation item for admin role
  - Updated role-based navigation filtering

- **Leaderboard Page** (`app/dashboard/leaderboard/page.tsx`)
  - Enhanced UI/UX
  - Better data visualization

- **Students Page** (`app/dashboard/students/page.tsx`)
  - Added department column
  - Improved import functionality

#### Mentor Components
- **Criteria Builder** (`components/mentor/criteria-builder.tsx`)
  - Enhanced validation
  - Better user feedback

- **Group Evaluation** (`components/mentor/group-evaluation.tsx`)
  - Improved scoring interface
  - Real-time score updates

### UI/UX Improvements

#### Offline Page Redesign
- **Location**: `public/offline.html`
- **Changes**:
  - Matches dashboard design system
  - Uses same color scheme and typography
  - Added header with LJ University branding
  - Card-based layout with proper shadows
  - Dark mode support
  - Responsive design

### Documentation
- **README.md**: Updated with comprehensive project documentation
  - Features overview
  - Tech stack details
  - Installation guide
  - Project structure
  - Deployment instructions

---

## Database Schema Changes

### Users Table
```sql
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS department character varying;
```

**Impact**: All user roles can now have an associated department

---

## API Endpoints

### New Endpoints

#### POST `/api/mentors/upload`
Upload mentors in bulk via CSV/Excel
- **Body**: FormData with file
- **Response**: Success count and error details
- **Auth**: Admin only

#### GET `/api/auth/me`
Get current authenticated user
- **Response**: User object with role and department
- **Auth**: Required

---

## Migration Guide

### For Existing Installations

1. **Run Database Migration**
   ```bash
   # Execute in Supabase SQL Editor
   scripts/12-add-department.sql
   ```

2. **Update Environment Variables**
   - No new variables required

3. **Deploy Changes**
   ```bash
   npm run build
   npm start
   ```

### For New Installations
- Follow standard installation in README.md
- All migrations included in setup

---

## Breaking Changes
None - All changes are backward compatible

---

## Security Updates
- Enhanced input validation on all upload endpoints
- Improved authentication checks
- Better error handling to prevent information leakage

---

## Performance Improvements
- Optimized database queries in leaderboard
- Reduced API response times
- Better caching strategies

---

## Known Issues
None

---

## Future Enhancements
- Department-based analytics
- Advanced mentor assignment
- Department leaderboards
- Bulk edit functionality
