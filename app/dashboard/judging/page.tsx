import { getCurrentUser } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import { CriteriaBuilder } from '@/components/mentor/criteria-builder'
import { GroupEvaluation } from '@/components/mentor/group-evaluation'
import { Gavel, Settings2, Users } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAssignedGroups } from '@/app/actions/events'

export default async function JudgingPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'mentor') {
    redirect('/dashboard')
  }

  const initialGroups = await getAssignedGroups()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
          <Gavel className="h-8 w-8" />
          Judging Suite
        </h2>
        <p className="text-muted-foreground max-w-2xl">
          Evaluate assigned groups, manage your custom rubrics, and track your grading progress.
        </p>
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
                Groups to Evaluate
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="criteria"
              className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Judging Rubric
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="groups">
          <GroupEvaluation initialGroups={initialGroups} />
        </TabsContent>

        <TabsContent value="criteria">
          <div className="max-w-3xl mx-auto">
            <CriteriaBuilder />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
