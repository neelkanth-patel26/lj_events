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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Judging Suite</h2>
          <p className="text-sm text-muted-foreground mt-1">Evaluate teams and view scoring criteria</p>
        </div>
      </div>

      <Tabs defaultValue="groups" className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b overflow-x-auto">
          <TabsList className="bg-transparent h-12 p-0 gap-6">
            <TabsTrigger
              value="groups"
              className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Teams to Evaluate
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="criteria"
              className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Scoring Criteria
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="groups">
          <GroupEvaluation initialGroups={initialGroups} />
        </TabsContent>

        <TabsContent value="criteria">
          {isAdmin ? <CriteriaBuilder /> : <CriteriaViewer />}
        </TabsContent>
      </Tabs>
    </div>
  )
}
