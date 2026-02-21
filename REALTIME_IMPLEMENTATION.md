# Real-time Data Updates Implementation

## Overview
Implemented Supabase real-time subscriptions across all admin and mentor pages to automatically refresh data without manual page refresh.

## Implementation Details

### 1. Created Reusable Hook
**File**: `hooks/useRealtimeData.ts`
- Subscribes to multiple Supabase table changes
- Triggers callback when any subscribed table changes
- Automatically cleans up subscriptions on unmount
- Default tables: events, teams, users, team_members, judging_criteria

### 2. Pages Updated with Real-time

#### Admin Pages:
1. **Dashboard** (`app/dashboard/page.tsx`)
   - Already using `useRealtime` hook from realtime-provider
   - Automatically updates stats, events, teams, and students

2. **Events Page** (`app/dashboard/events/page.tsx`)
   - Already using `useRealtime` hook
   - Auto-refreshes event list and stats

3. **Students Page** (`app/dashboard/students/page.tsx`)
   - Added `useRealtimeData` hook
   - Subscribes to: users, events
   - Auto-refreshes student list and event dropdown

4. **Teams Page** (`app/dashboard/teams/page.tsx`)
   - Already using `useRealtime` hook
   - Auto-refreshes team list grouped by events

5. **Leaderboard Page** (`app/dashboard/leaderboard/page.tsx`)
   - Added `useRealtimeData` hook
   - Subscribes to: teams, leaderboard
   - Auto-refreshes rankings when scores change

6. **Criteria Page** (`app/dashboard/criteria/page.tsx`)
   - Uses CriteriaBuilder component with realtime

7. **Event Details** (`app/dashboard/events/[id]/page.tsx`)
   - Added `useRealtimeData` hook
   - Subscribes to: events, teams
   - Auto-refreshes event stats and details

8. **Team Members** (`app/dashboard/teams/[id]/members/page.tsx`)
   - Added `useRealtimeData` hook
   - Subscribes to: teams, team_members, users, events
   - Auto-refreshes member list and team details

#### Mentor Pages:
1. **Judging Page** (`app/dashboard/judging/page.tsx`)
   - Uses GroupEvaluation and CriteriaBuilder components with realtime

2. **Components**:
   - **CriteriaBuilder** (`components/mentor/criteria-builder.tsx`)
     - Added `useRealtimeData` hook
     - Subscribes to: judging_criteria
     - Auto-refreshes criteria list
   
   - **GroupEvaluation** (`components/mentor/group-evaluation.tsx`)
     - Added `useRealtimeData` hook
     - Subscribes to: teams, team_members, judging_criteria, events
     - Auto-refreshes team list and scores

## How It Works

1. **Subscription**: Each page subscribes to relevant Supabase tables
2. **Change Detection**: When any INSERT, UPDATE, or DELETE occurs on subscribed tables
3. **Callback Trigger**: The callback function is executed
4. **Data Refresh**: SWR mutate() or refreshData() is called to fetch fresh data
5. **UI Update**: React re-renders with new data

## Benefits

- **No Manual Refresh**: Users see updates automatically
- **Real-time Collaboration**: Multiple users see changes instantly
- **Better UX**: Seamless experience without page reloads
- **Efficient**: Only subscribes to relevant tables per page
- **Clean Code**: Reusable hook pattern

## Tables Monitored

- `events` - Event creation, updates, status changes
- `teams` - Team creation, score updates, details changes
- `users` - Student/mentor additions, profile updates
- `team_members` - Member additions/removals
- `judging_criteria` - Criteria configuration changes
- `leaderboard` - Ranking calculations

## Usage Example

```typescript
import { useRealtimeData } from '@/hooks/useRealtimeData'
import { useCallback } from 'react'

const handleDataChange = useCallback(() => {
  mutate() // Refresh data
}, [mutate])

useRealtimeData(handleDataChange, ['teams', 'events'])
```

## Notes

- Existing `useRealtime` hook from realtime-provider already handles dashboard, events, and teams pages
- New `useRealtimeData` hook added for pages using SWR directly
- All subscriptions are automatically cleaned up on component unmount
- No authentication required for subscriptions (handled by RLS policies)
