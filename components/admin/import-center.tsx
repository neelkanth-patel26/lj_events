'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react'

export function ImportCenter() {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')

    const handleUpload = (type: 'mentors' | 'students') => {
        setIsUploading(true)
        setUploadStatus('idle')

        // Mock upload delay
        setTimeout(() => {
            setIsUploading(false)
            setUploadStatus('success')
        }, 1500)
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5 text-primary" />
                        Bulk Import Mentors
                    </CardTitle>
                    <CardDescription>
                        Upload a CSV or Excel file containing mentor details.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="mentor-file">Select File</Label>
                        <Input id="mentor-file" type="file" accept=".csv,.xlsx" />
                    </div>
                    <Button
                        className="w-full"
                        onClick={() => handleUpload('mentors')}
                        disabled={isUploading}
                    >
                        {isUploading ? 'Processing...' : 'Upload Mentors'}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                        Required headers: Name, Email, Company, Domain
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5 text-primary" />
                        Bulk Import Students
                    </CardTitle>
                    <CardDescription>
                        Upload a CSV or Excel file containing student and team data.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="student-file">Select File</Label>
                        <Input id="student-file" type="file" accept=".csv,.xlsx" />
                    </div>
                    <Button
                        className="w-full"
                        onClick={() => handleUpload('students')}
                        disabled={isUploading}
                    >
                        {isUploading ? 'Processing...' : 'Upload Students'}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                        Required headers: Name, Enrollment, Team, Domain
                    </p>
                </CardContent>
            </Card>

            {uploadStatus === 'success' && (
                <Card className="md:col-span-2 border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/20">
                    <CardContent className="flex items-center gap-3 py-4">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                            Data successfully imported and synchronized!
                        </span>
                    </CardContent>
                </Card>
            )}

            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Download Templates</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                        <a href="/templates/mentor-template.csv" download>
                            <FileSpreadsheet className="h-4 w-4" />
                            Mentor Template
                        </a>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                        <a href="/templates/student-template.csv" download>
                            <FileSpreadsheet className="h-4 w-4" />
                            Student Template
                        </a>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
