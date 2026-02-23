'use client'

import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import TeamJudgeAssignment from '@/components/admin/team-judge-assignment'

export default function AssignJudgesPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()} size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold dark:text-white">Assign Mentors to Teams</h1>
      </div>
      
      <TeamJudgeAssignment eventId={eventId} />
    </div>
  )
}
