# Developer Documentation: Incremental Team Member Import

## Overview
This document describes the implementation of the incremental team member import feature, which allows adding new students to existing teams when importing CSV files with matching group numbers.

## Problem Statement
Previously, when importing students via CSV:
- New teams were always created, even if a team with the same group number existed
- Students couldn't be added to existing teams through CSV import
- Re-importing with additional members for the same group would create duplicate teams

## Solution
Implemented logic to check for existing teams by group number and event, then either:
1. Add new members to existing teams
2. Create new teams if they don't exist

---

## Changes Made

### 1. Student Bulk Import API (`/app/api/students/bulk/route.ts`)

**File**: `d:\lj-university-pwa\app\api\students\bulk\route.ts`

**Changes**:
- Added team existence check using `maybeSingle()` instead of always creating new teams
- Update existing team's `team_size` when adding new members
- Filter members by group before processing to avoid empty inserts

**Key Code**:
```typescript
// Check if team exists
const { data: existingTeam } = await supabase
  .from('teams')
  .select('id, team_size')
  .eq('event_id', eventId)
  .eq('team_name', `Team ${groupNum}`)
  .maybeSingle()

if (existingTeam) {
  // Update team size
  const newSize = (existingTeam.team_size || 0) + newMembersForGroup.length
  await supabase
    .from('teams')
    .update({ team_size: newSize })
    .eq('id', existingTeam.id)
} else {
  // Create new team
  const { data: team } = await supabase
    .from('teams')
    .insert({ ... })
}
```

### 2. Student Upload API (`/app/api/students/upload/route.ts`)

**File**: `d:\lj-university-pwa\app\api\students\upload\route.ts`

**Changes**:
- Added same team existence check logic
- Prevents duplicate team creation
- Checks for existing team members before inserting

**Key Code**:
```typescript
// Check if team exists
const { data: existingTeam } = await supabase
  .from('teams')
  .select('id, team_size')
  .eq('event_id', eventId)
  .eq('team_name', `Team ${groupNum}`)
  .maybeSingle()

// Check if member already exists
const { data: existing } = await supabase
  .from('team_members')
  .select('id')
  .eq('team_id', teamId)
  .eq('user_id', memberId)
  .maybeSingle()
```

---

## Database Schema

### Relevant Tables

**teams**
- `id` (uuid, primary key)
- `event_id` (uuid, foreign key to events)
- `team_name` (text) - Format: "Team {group_number}"
- `team_size` (integer) - Updated when members are added
- `school_name`, `domain`, `stall_no` (text)

**team_members**
- `id` (uuid, primary key)
- `team_id` (uuid, foreign key to teams)
- `user_id` (uuid, foreign key to users)
- `role` (text) - 'member' or 'lead'

**Unique Constraint**: No duplicate constraint on (team_id, user_id), allowing the check to be done programmatically

---

## API Behavior

### POST `/api/students/bulk`
**Request**:
```json
{
  "students": [
    {
      "email": "student@example.com",
      "fullName": "John Doe",
      "password": "password123",
      "groupNumber": "1",
      "schoolName": "Engineering School"
    }
  ],
  "eventId": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "count": 1
}
```

**Behavior**:
1. Creates users
2. Groups by `groupNumber`
3. Checks if team exists for event + group number
4. If exists: adds members to existing team, updates team_size
5. If not: creates new team with members

### POST `/api/students/upload`
**Request**: FormData with `file` (CSV) and `eventId`

**CSV Format**:
```csv
email,full_name,password,group_number,school_name,domain,stall_no,enrollment_number,department
student1@example.com,John Doe,password123,1,Engineering School,AI/ML,A1,2024001,Computer Engineering
```

**Response**:
```json
{
  "success": true,
  "users": 5,
  "teams": 2,
  "updated": 3,
  "message": "Created 5 new users, updated 3 existing users, created 2 teams"
}
```

**Behavior**: Same as bulk import, but parses CSV first

---

## Usage Example

### Scenario: Adding Members to Existing Team

**Initial Import** (CSV 1):
```csv
email,full_name,password,group_number,school_name
alice@example.com,Alice,pass1,1,Engineering
bob@example.com,Bob,pass2,1,Engineering
```
**Result**: Creates "Team 1" with 2 members

**Second Import** (CSV 2):
```csv
email,full_name,password,group_number,school_name
charlie@example.com,Charlie,pass3,1,Engineering
diana@example.com,Diana,pass4,1,Engineering
```
**Result**: Adds Charlie and Diana to existing "Team 1", updates team_size to 4

---

## Error Handling

### Duplicate Prevention
- Uses `maybeSingle()` instead of `single()` to avoid errors when team doesn't exist
- Checks for existing team members before inserting
- Skips insertion if member already exists in team

### Edge Cases Handled
1. **Empty group number**: Skipped (not added to any team)
2. **User already exists**: Updates user info, doesn't create duplicate
3. **Member already in team**: Skips team_members insertion
4. **No team exists**: Creates new team
5. **Team exists**: Adds to existing team

---

## Testing Checklist

- [ ] Import CSV with new group numbers → Creates new teams
- [ ] Import CSV with existing group numbers → Adds to existing teams
- [ ] Import same student twice → Updates user, doesn't duplicate
- [ ] Import student already in team → Doesn't duplicate team membership
- [ ] Verify team_size updates correctly
- [ ] Check team members appear in `/dashboard/teams/[id]/members`
- [ ] Verify teams page shows correct member count

---

## Related Files

### Modified Files
1. `/app/api/students/bulk/route.ts` - Bulk import logic
2. `/app/api/students/upload/route.ts` - CSV upload logic

### Related UI Files
1. `/app/dashboard/students/page.tsx` - Student import interface
2. `/app/dashboard/teams/page.tsx` - Teams listing
3. `/app/dashboard/teams/[id]/members/page.tsx` - Team members view

---

## Future Improvements

1. **Batch Operations**: Use batch inserts for better performance
2. **Transaction Support**: Wrap operations in database transactions
3. **Validation**: Add more robust CSV validation
4. **Conflict Resolution**: UI to handle conflicts when updating existing users
5. **Audit Log**: Track who added members and when
6. **Team Merge**: Allow merging teams with different group numbers

---

## Migration Notes

### Database Migration Required
No schema changes required. This is a logic-only update.

### Backward Compatibility
✅ Fully backward compatible. Existing teams and members are not affected.

### Deployment Steps
1. Deploy updated API routes
2. No database migration needed
3. Test with sample CSV import
4. Monitor for any duplicate team creation

---

## Support & Troubleshooting

### Common Issues

**Issue**: Members not showing in team
- **Check**: Verify team_id matches in team_members table
- **Fix**: Re-import CSV or manually add via UI

**Issue**: Duplicate teams created
- **Check**: Ensure team_name format is exactly "Team {number}"
- **Fix**: Delete duplicate teams, re-import

**Issue**: Team size not updating
- **Check**: Verify team_size column is being updated
- **Fix**: Manually update team_size or re-import

### Debug Queries

```sql
-- Check team members
SELECT t.team_name, u.full_name, tm.role
FROM team_members tm
JOIN teams t ON tm.team_id = t.id
JOIN users u ON tm.user_id = u.id
WHERE t.event_id = 'event-uuid'
ORDER BY t.team_name;

-- Check team sizes
SELECT team_name, team_size, 
  (SELECT COUNT(*) FROM team_members WHERE team_id = teams.id) as actual_count
FROM teams
WHERE event_id = 'event-uuid';
```

---

## Author
Development Team - LJ University Event Management System

**Last Updated**: 2024
**Version**: 1.0
