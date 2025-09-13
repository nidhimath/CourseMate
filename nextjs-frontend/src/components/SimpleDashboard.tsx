'use client'

import React, { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { LogOut, Upload, GraduationCap } from 'lucide-react'
import TranscriptUpload from './TranscriptUpload'
import PersonalizedCurriculum from './PersonalizedCurriculum'

export default function SimpleDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [hasTranscript, setHasTranscript] = useState(false)

  const handleTranscriptUpload = (data: any) => {
    setHasTranscript(true)
    console.log('Transcript uploaded:', data)
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h1 className="text-xl text-blue-900">Coursemate</h1>
              <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">UC Berkeley</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-blue-700">{session?.user?.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-blue-700 hover:bg-blue-100"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl text-blue-900">Welcome back, {session?.user?.name?.split(' ')[0]}!</h2>
            <p className="text-blue-700 max-w-2xl mx-auto">
              {hasTranscript 
                ? "Your personalized curriculum is ready! Explore your recommended courses and learning path."
                : "Upload your transcript to get started with personalized course recommendations and learning paths."
              }
            </p>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue={hasTranscript ? "curriculum" : "upload"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Transcript
              </TabsTrigger>
              <TabsTrigger value="curriculum" className="flex items-center gap-2" disabled={!hasTranscript}>
                <GraduationCap className="h-4 w-4" />
                My Curriculum
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <div className="flex items-center justify-center">
                <div className="flex items-center space-x-2 text-blue-900">
                  <Upload className="h-5 w-5" />
                  <h3 className="text-xl font-semibold">Upload Your Transcript</h3>
                </div>
              </div>
              
              <TranscriptUpload onUploadSuccess={handleTranscriptUpload} />
            </TabsContent>

            <TabsContent value="curriculum" className="space-y-6">
              {hasTranscript ? (
                <PersonalizedCurriculum />
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-gray-600">Please upload your transcript first to view your personalized curriculum.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
