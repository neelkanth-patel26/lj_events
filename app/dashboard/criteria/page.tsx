import { getCurrentUser } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import { CriteriaBuilder } from '@/components/mentor/criteria-builder'
import { Settings2 } from 'lucide-react'

export default async function CriteriaPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight dark:text-white">Scoring Criteria</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage evaluation criteria for judging</p>
        </div>
      </div>

      <CriteriaBuilder />
    </div>
  )
}
