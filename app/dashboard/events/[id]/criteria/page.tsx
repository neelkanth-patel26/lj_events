'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useState, use } from 'react'
import { ArrowLeft, Plus, Target, Weight, Trophy, X, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

export default function EvaluationCriteriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params)
  const router = useRouter()
  const { data: criteria, mutate, isLoading } = useSWR(`/api/events/${eventId}/criteria`, fetcher)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    criteriaName: '',
    description: '',
    maxScore: '10',
    weight: '1',
  })

  const handleCreateCriteria = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/events/${eventId}/criteria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, eventId }),
      })

      if (!response.ok) throw new Error('Failed to create criteria')

      setFormData({ criteriaName: '', description: '', maxScore: '10', weight: '1' })
      setShowForm(false)
      mutate()
    } catch (error) {
      console.error('Error creating criteria:', error)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading evaluation criteria...</p>
        </div>
      </div>
    )
  }

  const totalWeight = criteria?.reduce((sum: number, item: any) => sum + parseFloat(item.weight || 0), 0) || 0
  const totalMaxScore = criteria?.reduce((sum: number, item: any) => sum + parseInt(item.max_score || 0), 0) || 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-neutral-900 -mx-6 -mt-6 px-6 pt-6 pb-8 dark:border-b dark:border-neutral-800">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => router.back()} className="bg-white dark:bg-neutral-800 dark:text-white dark:border-neutral-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Event
          </Button>
          <Button onClick={() => setShowForm(!showForm)} className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50 dark:bg-white dark:text-gray-900">
            {showForm ? (
              <><X className="h-4 w-4 mr-2" />Cancel</>
            ) : (
              <><Plus className="h-4 w-4 mr-2" />Add Criteria</>
            )}
          </Button>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Evaluation Criteria</h1>
          <div className="flex items-center gap-6 text-gray-600 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              <span className="font-medium">{criteria?.length || 0} Criteria Defined</span>
            </div>
            {totalWeight > 0 && (
              <div className="flex items-center gap-2">
                <Weight className="h-5 w-5" />
                <span className="font-medium">Total Weight: {totalWeight}</span>
              </div>
            )}
            {totalMaxScore > 0 && (
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                <span className="font-medium">Max Score: {totalMaxScore}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Criteria Form */}
      {showForm && (
        <Card className="border-gray-200 dark:bg-neutral-900 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Evaluation Criteria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCriteria} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="criteriaName" className="text-sm font-medium text-gray-700 dark:text-neutral-300">
                    Criteria Name *
                  </Label>
                  <Input
                    id="criteriaName"
                    value={formData.criteriaName}
                    onChange={(e) => setFormData({ ...formData, criteriaName: e.target.value })}
                    placeholder="e.g., Innovation, Technical Implementation, Presentation"
                    className="border-gray-300 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-neutral-300">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this criteria evaluates..."
                    className="border-gray-300 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="maxScore" className="text-sm font-medium text-gray-700 dark:text-neutral-300">
                      Maximum Score *
                    </Label>
                    <Input
                      id="maxScore"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.maxScore}
                      onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                      className="border-gray-300 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-sm font-medium text-gray-700 dark:text-neutral-300">
                      Weight *
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="10"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="border-gray-300 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button type="submit" disabled={loading} className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900">
                  {loading ? 'Creating...' : 'Create Criteria'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Criteria List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Evaluation Criteria</h2>
          {criteria?.length > 0 && (
            <Badge variant="outline" className="text-gray-600 dark:text-neutral-400 dark:border-neutral-700">
              {criteria.length} {criteria.length === 1 ? 'criteria' : 'criteria'}
            </Badge>
          )}
        </div>

        {criteria && criteria.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {criteria.map((item: any, index: number) => (
              <Card key={item.id} className="border-gray-200 hover:shadow-md transition-shadow dark:bg-neutral-900 dark:border-neutral-800">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300 text-sm font-medium px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                        {item.criteria_name}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {item.description && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-neutral-400 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-gray-500 dark:text-neutral-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">Max Score</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {item.max_score}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Weight className="h-4 w-4 text-gray-500 dark:text-neutral-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">Weight</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {item.weight}x
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-100 dark:border-neutral-800">
                      <div className="text-xs text-gray-500 dark:text-neutral-400">
                        Weighted Score: {item.max_score} × {item.weight} = {(item.max_score * item.weight).toFixed(1)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-gray-200 dark:bg-neutral-900 dark:border-neutral-800">
            <CardContent className="py-12">
              <div className="text-center">
                <Target className="h-12 w-12 text-gray-400 dark:text-neutral-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No evaluation criteria defined</h3>
                <p className="text-gray-600 dark:text-neutral-400 mb-6">Set up criteria to help judges evaluate teams consistently.</p>
                <Button onClick={() => setShowForm(true)} className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Criteria
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}