'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Search,
    Plus,
    Building2,
    Mail,
    Phone,
    Banknote,
    ChevronRight,
    MoreVertical,
    User
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface Mentor {
    id: string
    name: string
    company: string
    domain: string
    email: string
    banking: {
        bank: string
        acc: string
        ifsc: string
        branch: string
    }
}

export function MentorManagement({ initialMentors = [] }: { initialMentors?: Mentor[] }) {
    const [mentors] = useState<Mentor[]>(initialMentors)
    const [searchTerm, setSearchTerm] = useState('')

    const filteredMentors = mentors.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.domain.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="search"
                        placeholder="Search mentors..."
                        className="w-full bg-background border rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button className="w-full sm:w-auto gap-2">
                    <Plus className="h-4 w-4" />
                    Add Mentor
                </Button>
            </div>

            <div className="grid gap-4">
                {filteredMentors.map((mentor) => (
                    <Card key={mentor.id} className="overflow-hidden">
                        <CardContent className="p-0">
                            <div className="flex flex-col sm:flex-row sm:items-center p-4 gap-4">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <User className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-sm font-bold truncate">{mentor.name}</h3>
                                        <Badge variant="secondary" className="text-[10px] px-1.5 h-4 shrink-0">
                                            {mentor.domain}
                                        </Badge>
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Building2 className="h-3 w-3" />
                                            {mentor.company}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            {mentor.email}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 ml-auto">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="gap-2">
                                                <Banknote className="h-4 w-4" />
                                                <span className="hidden sm:inline">Details</span>
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Mentor & Banking Details</DialogTitle>
                                                <DialogDescription>
                                                    Comprehensive information for {mentor.name}.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
                                                    <div>
                                                        <p className="text-muted-foreground mb-1 text-xs">Domain</p>
                                                        <p className="font-medium text-primary">{mentor.domain}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground mb-1 text-xs">Experience</p>
                                                        <p className="font-medium">8+ Years</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                        <Banknote className="h-3 w-3" />
                                                        Secure Banking Information
                                                    </h4>
                                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                                                        <div>
                                                            <p className="text-muted-foreground text-[10px]">Bank Name</p>
                                                            <p className="font-semibold">{mentor.banking.bank}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-muted-foreground text-[10px]">Account No</p>
                                                            <p className="font-semibold">{mentor.banking.acc}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-muted-foreground text-[10px]">IFSC Code</p>
                                                            <p className="font-semibold">{mentor.banking.ifsc}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-muted-foreground text-[10px]">Branch</p>
                                                            <p className="font-semibold">{mentor.banking.branch}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
