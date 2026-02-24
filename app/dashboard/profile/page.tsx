'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { User, Save, Loader2, Moon, Sun, Briefcase, Building2, CreditCard } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [theme, setTheme] = useState('light')
  const [mentorProfile, setMentorProfile] = useState({
    company: '',
    domain: '',
    experience: '',
    designation: '',
    bank_name: '',
    acc_no: '',
    ifsc: '',
    branch: ''
  })
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (!res.ok) throw new Error('Failed to load profile')
      const data = await res.json()
      setUser(data)
      setFullName(data.fullName || '')
      setTheme(data.theme || 'light')
      
      if (data.role === 'mentor') {
        const profileRes = await fetch('/api/mentors/profile')
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setMentorProfile({
            company: profileData.company || '',
            domain: profileData.domain || '',
            experience: profileData.experience || '',
            designation: profileData.designation || '',
            bank_name: profileData.bank_name || '',
            acc_no: profileData.acc_no || '',
            ifsc: profileData.ifsc || '',
            branch: profileData.branch || ''
          })
        }
      }
    } catch (error) {
      console.error('Profile fetch error:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          full_name: fullName, 
          theme,
          ...(user?.role === 'mentor' && { mentorProfile })
        })
      })

      if (!res.ok) throw new Error('Failed to update profile')

      const { user: updatedUser } = await res.json()
      setUser({ ...user, fullName: updatedUser.full_name, theme: updatedUser.theme })
      
      document.documentElement.classList.toggle('dark', theme === 'dark')
      
      toast({ title: 'Success!', description: 'Profile updated successfully' })
      
      setTimeout(() => window.location.reload(), 500)
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update profile', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="space-y-6 pb-6 max-w-2xl">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 dark:bg-neutral-800 rounded w-48 animate-shimmer"></div>
          <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-64 animate-shimmer"></div>
        </div>

        <Card className="border-2 border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <CardHeader className="border-b border-gray-200 dark:border-neutral-800">
            <div className="h-6 bg-gray-200 dark:bg-neutral-800 rounded w-40 animate-shimmer"></div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-24 animate-shimmer"></div>
                <div className="h-10 bg-gray-200 dark:bg-neutral-800 rounded animate-shimmer"></div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <CardHeader className="border-b border-gray-200 dark:border-neutral-800">
            <div className="h-6 bg-gray-200 dark:bg-neutral-800 rounded w-32 animate-shimmer"></div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-24 animate-shimmer"></div>
                <div className="h-3 bg-gray-200 dark:bg-neutral-800 rounded w-32 animate-shimmer"></div>
              </div>
              <div className="h-6 w-11 bg-gray-200 dark:bg-neutral-800 rounded-full animate-shimmer"></div>
            </div>
          </CardContent>
        </Card>

        <div className="h-11 bg-gray-200 dark:bg-neutral-800 rounded w-full md:w-40 animate-shimmer"></div>
        
        <style jsx>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .animate-shimmer {
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Personal Info & Appearance */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <CardHeader className="border-b border-gray-200 dark:border-neutral-800">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                  <Input id="email" value={user?.email || ''} disabled className="bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-gray-400 h-11" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                  <Input 
                    id="fullName" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="border-2 border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-gray-700 dark:text-gray-300">Role</Label>
                  <Input id="role" value={user?.role || ''} disabled className="bg-gray-50 dark:bg-neutral-950 capitalize border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-gray-400 h-11" />
                </div>

                {user?.enrollment_number && (
                  <div className="space-y-2">
                    <Label htmlFor="enrollment" className="text-gray-700 dark:text-gray-300">Enrollment Number</Label>
                    <Input id="enrollment" value={user.enrollment_number} disabled className="bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-gray-400 h-11" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {user?.role === 'mentor' && (
            <>
              <Card className="border-2 border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <CardHeader className="border-b border-gray-200 dark:border-neutral-800">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Briefcase className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    Professional Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-gray-700 dark:text-gray-300">Company</Label>
                      <Input 
                        id="company" 
                        value={mentorProfile.company} 
                        onChange={(e) => setMentorProfile({...mentorProfile, company: e.target.value})}
                        placeholder="Company name"
                        className="border-2 border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="designation" className="text-gray-700 dark:text-gray-300">Designation</Label>
                      <Input 
                        id="designation" 
                        value={mentorProfile.designation} 
                        onChange={(e) => setMentorProfile({...mentorProfile, designation: e.target.value})}
                        placeholder="Job title"
                        className="border-2 border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="domain" className="text-gray-700 dark:text-gray-300">Domain</Label>
                      <Input 
                        id="domain" 
                        value={mentorProfile.domain} 
                        onChange={(e) => setMentorProfile({...mentorProfile, domain: e.target.value})}
                        placeholder="e.g., Web Development"
                        className="border-2 border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience" className="text-gray-700 dark:text-gray-300">Experience</Label>
                      <Input 
                        id="experience" 
                        value={mentorProfile.experience} 
                        onChange={(e) => setMentorProfile({...mentorProfile, experience: e.target.value})}
                        placeholder="e.g., 5 years"
                        className="border-2 border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white h-11"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <CardHeader className="border-b border-gray-200 dark:border-neutral-800">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    Bank Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank_name" className="text-gray-700 dark:text-gray-300">Bank Name</Label>
                      <Input 
                        id="bank_name" 
                        value={mentorProfile.bank_name} 
                        onChange={(e) => setMentorProfile({...mentorProfile, bank_name: e.target.value})}
                        placeholder="Bank name"
                        className="border-2 border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="branch" className="text-gray-700 dark:text-gray-300">Branch</Label>
                      <Input 
                        id="branch" 
                        value={mentorProfile.branch} 
                        onChange={(e) => setMentorProfile({...mentorProfile, branch: e.target.value})}
                        placeholder="Branch name"
                        className="border-2 border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="acc_no" className="text-gray-700 dark:text-gray-300">Account Number</Label>
                      <Input 
                        id="acc_no" 
                        value={mentorProfile.acc_no} 
                        onChange={(e) => setMentorProfile({...mentorProfile, acc_no: e.target.value})}
                        placeholder="Account number"
                        className="border-2 border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ifsc" className="text-gray-700 dark:text-gray-300">IFSC Code</Label>
                      <Input 
                        id="ifsc" 
                        value={mentorProfile.ifsc} 
                        onChange={(e) => setMentorProfile({...mentorProfile, ifsc: e.target.value})}
                        placeholder="IFSC code"
                        className="border-2 border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white h-11"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Right Column - Appearance & Actions */}
        <div className="space-y-6">
          <Card className="border-2 border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <CardHeader className="border-b border-gray-200 dark:border-neutral-800">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                {theme === 'dark' ? <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" /> : <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-gray-700 dark:text-gray-300">Dark Mode</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Toggle dark mode theme</p>
                </div>
                <Switch checked={theme === 'dark'} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} />
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="w-full bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-200 text-white dark:text-gray-900"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
