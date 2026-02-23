import { getCurrentUser } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import { CriteriaBuilder } from '@/components/mentor/criteria-builder'
import { GroupEvaluation } from '@/components/mentor/group-evaluation'
import { Gavel, Settings2, Users } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAssignedGroups } from '@/app/actions/events'
import { CriteriaViewer } from '@/components/mentor/criteria-viewer'

export default async function JudgingPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/dashboard')
  }

  const initialGroups = await getAssignedGroups()
  const isAdmin = user.role === 'admin'

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold">Team Evaluation</h1>
        <p className="text-sm text-muted-foreground">Score teams and view criteria</p>
      </div>

      <Tabs defaultValue="teams" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 h-11">
          <TabsTrigger value="teams" className="gap-2">
            <Users className="h-4 w-4" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="criteria" className="gap-2">
            <Settings2 className="h-4 w-4" />
            Criteria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="mt-6">
          <GroupEvaluation initialGroups={initialGroups} />
        </TabsContent>

        <TabsContent value="criteria" className="mt-6">
          {isAdmin ? <CriteriaBuilder /> : <CriteriaViewer />}
        </TabsContent>
      </Tabs>
    </div>
  )
}
