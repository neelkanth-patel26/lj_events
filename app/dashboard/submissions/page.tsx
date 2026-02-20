'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Submission {
  id: string
  submission_title: string
  submission_description: string
  submission_url?: string
  file_url?: string
  status: string
  submitted_at: string
}

export default function SubmissionsPage() {
  const { data: submissions, mutate } = useSWR('/api/submissions', fetcher)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
  })

  const handleCreateSubmission = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionTitle: formData.title,
          submissionDescription: formData.description,
          submissionUrl: formData.url,
        }),
      })

      if (!response.ok) throw new Error('Failed to create submission')

      setFormData({ title: '', description: '', url: '' })
      setShowForm(false)
      mutate()
    } catch (error) {
      console.error('Error creating submission:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Team Submissions</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Submit Work'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Submit Team Work</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSubmission} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Submission Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Science Project Report"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  placeholder="Describe your submission"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="url">URL (optional)</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com/project"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {submissions && submissions.length > 0 ? (
          submissions.map((submission: Submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <CardTitle>{submission.submission_title}</CardTitle>
                <CardDescription>
                  Status: <span className="capitalize font-semibold">{submission.status}</span>
                  {' • '}
                  {new Date(submission.submitted_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {submission.submission_description}
                </p>
                {submission.submission_url && (
                  <div className="mb-4">
                    <a
                      href={submission.submission_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Submission
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No submissions yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
