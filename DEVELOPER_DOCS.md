# Developer Documentation - Recent Updates

## Table of Contents
1. [Department Management](#department-management)
2. [Mentor Management System](#mentor-management-system)
3. [API Enhancements](#api-enhancements)
4. [UI/UX Updates](#uiux-updates)
5. [Database Schema](#database-schema)
6. [Implementation Details](#implementation-details)

---

## Department Management

### Overview
Added department tracking for all user types (admin, mentor, student) to enable better organization and filtering.

### Database Changes
**File**: `scripts/12-add-department.sql`

```sql
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS department character varying;
```

### Usage
```typescript
// Access department in user object
const user = await getCurrentUser();
console.log(user.department); // e.g., "Computer Science"
```

### Integration Points
- Student upload: Department field in CSV
- Mentor upload: Department field in CSV
- User profile display
- Filtering and analytics

---

## Mentor Management System

### Overview
Complete mentor management interface for bulk importing mentors with CSV/Excel support.

### Files
- **Page**: `app/dashboard/mentors/page.tsx`
- **API**: `app/api/mentors/upload/route.ts`

### Features

#### 1. Bulk Upload
```typescript
// CSV Format
email,full_name,department
mentor1@example.com,John Doe,Computer Science
mentor2@example.com,Jane Smith,Electronics
```

#### 2. Template Download
- Pre-formatted CSV template
- Includes headers and example data
- Prevents formatting errors

#### 3. Duplicate Prevention
- Checks existing emails before creation
- Reports duplicates in response
- Continues processing valid entries

### API Endpoint

**POST** `/api/mentors/upload`

**Request**:
```typescript
FormData {
  file: File // CSV or Excel
}
```

**Response**:
```typescript
{
  success: true,
  created: 5,
  errors: [
    { row: 3, email: "duplicate@example.com", error: "Already exists" }
  ]
}
```

**Authentication**: Admin role required

### Implementation Example
```typescript
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/mentors/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
```

---

## API Enhancements

### 1. Current User Endpoint

**File**: `app/api/auth/me/route.ts`

**GET** `/api/auth/me`

Returns authenticated user details:
```typescript
{
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'mentor' | 'student';
  department?: string;
}
```

**Use Case**: Client-side authentication checks, profile display

### 2. Enhanced Routes

#### Judging Criteria
**File**: `app/api/judging/criteria/route.ts`
- Improved validation
- Better error messages
- Type safety enhancements

#### Judging Scores
**File**: `app/api/judging/scores/route.ts`
- Real-time score updates
- Optimized calculations
- Better conflict handling

#### Leaderboard
**File**: `app/api/leaderboard/route.ts`
- Department filtering support
- Optimized queries
- Reduced response time

#### Students Upload
**File**: `app/api/students/upload/route.ts`
- Department field support
- Enhanced duplicate detection
- Better error reporting

#### Team Members
**File**: `app/api/teams/[id]/members/route.ts`
- Improved member operations
- Better validation
- Enhanced error handling

---

## UI/UX Updates

### Dashboard Layout
**File**: `app/dashboard/layout.tsx`

**Changes**:
- Added Mentors navigation item
- Role-based filtering includes mentor management
- Updated navigation structure

```typescript
const navItems = [
  // ... existing items
  { 
    href: '/dashboard/mentors', 
    label: 'Mentors', 
    icon: User, 
    roles: ['admin'] 
  },
  // ... rest of items
];
```

### Offline Page Redesign
**File**: `public/offline.html`

**Before**: Blue gradient with centered content
**After**: Dashboard-style layout with header and card

**Key Changes**:
- Matches dashboard color scheme
- Uses HSL color system
- Dark mode support
- Responsive design
- Professional appearance

**Color Palette**:
```css
/* Light Mode */
background: hsl(0 0% 100%);
text: hsl(222.2 84% 4.9%);
primary: hsl(221.2 83.2% 53.3%);
border: hsl(214.3 31.8% 91.4%);

/* Dark Mode */
background: hsl(222.2 84% 4.9%);
text: hsl(210 40% 98%);
border: hsl(217.2 32.6% 17.5%);
```

### Component Updates

#### Students Page
**File**: `app/dashboard/students/page.tsx`
- Added department column to table
- Enhanced import UI
- Better feedback messages

#### Leaderboard Page
**File**: `app/dashboard/leaderboard/page.tsx`
- Improved data visualization
- Better loading states
- Enhanced export functionality

---

## Database Schema

### Users Table Structure
```sql
CREATE TABLE public.users (
  id uuid PRIMARY KEY,
  email character varying UNIQUE NOT NULL,
  full_name character varying,
  role character varying NOT NULL,
  department character varying, -- NEW
  created_at timestamp with time zone DEFAULT now()
);
```

### Indexes
```sql
-- Recommended for performance
CREATE INDEX idx_users_department ON public.users(department);
CREATE INDEX idx_users_role ON public.users(role);
```

---

## Implementation Details

### File Upload Processing

**Libraries Used**:
- `xlsx`: Excel file parsing
- `papaparse`: CSV parsing (if used)

**Flow**:
1. Client uploads file
2. Server validates file type
3. Parse file content
4. Validate each row
5. Check for duplicates
6. Create users in Supabase Auth
7. Insert records in database
8. Return results with errors

**Error Handling**:
```typescript
try {
  // Process upload
} catch (error) {
  return NextResponse.json(
    { error: 'Upload failed', details: error.message },
    { status: 500 }
  );
}
```

### Real-time Updates

All pages use Supabase real-time subscriptions:
```typescript
useEffect(() => {
  const channel = supabase
    .channel('table-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'users' },
      () => mutate()
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, []);
```

### Authentication Flow

1. User logs in via Supabase Auth
2. Session stored in cookies
3. Server actions validate session
4. Role-based access control applied
5. API routes check authentication

**Example**:
```typescript
const user = await getCurrentUser();
if (!user || user.role !== 'admin') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}
```

---

## Testing

### Manual Testing Checklist

#### Department Management
- [ ] Add department to existing user
- [ ] Create new user with department
- [ ] Filter by department
- [ ] Display department in UI

#### Mentor Upload
- [ ] Upload valid CSV
- [ ] Upload Excel file
- [ ] Handle duplicates
- [ ] Validate required fields
- [ ] Download template
- [ ] Check error reporting

#### Offline Page
- [ ] View in light mode
- [ ] View in dark mode
- [ ] Test on mobile
- [ ] Test on desktop
- [ ] Verify "Try Again" button

### API Testing

```bash
# Test mentor upload
curl -X POST http://localhost:3000/api/mentors/upload \
  -H "Cookie: session=..." \
  -F "file=@mentors.csv"

# Test current user
curl http://localhost:3000/api/auth/me \
  -H "Cookie: session=..."
```

---

## Deployment

### Pre-deployment Checklist
- [ ] Run database migration
- [ ] Test all API endpoints
- [ ] Verify file uploads work
- [ ] Check authentication
- [ ] Test role-based access
- [ ] Validate UI changes
- [ ] Test offline page

### Deployment Steps

1. **Database Migration**
   ```sql
   -- Run in Supabase SQL Editor
   \i scripts/12-add-department.sql
   ```

2. **Build Application**
   ```bash
   npm run build
   ```

3. **Deploy to Vercel**
   ```bash
   git push origin main
   # Auto-deploys via Vercel
   ```

4. **Verify Deployment**
   - Check all pages load
   - Test mentor upload
   - Verify offline page
   - Test authentication

---

## Troubleshooting

### Common Issues

#### 1. Department Not Showing
**Solution**: Run migration script, clear cache

#### 2. Mentor Upload Fails
**Causes**:
- Invalid file format
- Missing required fields
- Duplicate emails
- Authentication issues

**Debug**:
```typescript
console.log('File type:', file.type);
console.log('File size:', file.size);
console.log('Parsed data:', data);
```

#### 3. Offline Page Not Updating
**Solution**: Clear service worker cache
```javascript
navigator.serviceWorker.getRegistrations()
  .then(registrations => {
    registrations.forEach(reg => reg.unregister());
  });
```

---

## Best Practices

### Code Style
- Use TypeScript for type safety
- Follow existing naming conventions
- Add error handling to all API routes
- Validate user input
- Use server actions for mutations

### Security
- Always check user authentication
- Validate role-based access
- Sanitize file uploads
- Prevent SQL injection
- Use parameterized queries

### Performance
- Optimize database queries
- Use indexes on filtered columns
- Implement pagination for large datasets
- Cache frequently accessed data
- Minimize API calls

---

## Future Enhancements

### Planned Features
1. **Department Analytics**
   - Department-wise performance
   - Comparative analysis
   - Export reports

2. **Advanced Filtering**
   - Multi-department selection
   - Date range filters
   - Custom criteria

3. **Bulk Operations**
   - Bulk edit departments
   - Bulk role changes
   - Batch deletions

4. **Audit Logging**
   - Track all changes
   - User activity logs
   - System events

---

## Support

### Resources
- **README.md**: Installation and setup
- **CHANGELOG.md**: Version history
- **REALTIME_IMPLEMENTATION.md**: Real-time features

### Contact
- Developer: Neelkanth Patel
- GitHub: [@neelkanth-patel26](https://github.com/neelkanth-patel26)
- Repository: [lj_events](https://github.com/neelkanth-patel26/lj_events)
