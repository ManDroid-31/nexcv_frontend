import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, FileText, Share2, Zap } from "lucide-react"
import Link from "next/link"
import { AuthProvider, SignInButton, SignUpButton, SignedIn, SignedOut } from "@/components/mock-auth"

export default function LandingPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">NexCV</span>
            </div>
            <div className="flex items-center space-x-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="ghost">Sign In</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button>Get Started</Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button>Dashboard</Button>
                </Link>
              </SignedIn>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-4 h-4 mr-1" />
            AI-Powered Resume Builder
          </Badge>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Create Beautiful Resumes
            <br />
            <span className="text-blue-600">Enhanced by AI</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Build professional resumes with our modern templates and AI-powered content suggestions. Export as PDF or
            share with a public URL.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <SignedOut>
              <SignUpButton mode="modal">
                <Button size="lg" className="text-lg px-8">
                  Start Building Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="lg" className="text-lg px-8">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </SignedIn>
            <Button variant="outline" size="lg" className="text-lg px-8">
              View Templates
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to stand out</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From beautiful templates to AI-powered content enhancement, we've got you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Enhanced Content</h3>
                <p className="text-gray-600">
                  Let AI help you write compelling bullet points, improve tone, and suggest missing sections.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Beautiful Templates</h3>
                <p className="text-gray-600">
                  Choose from professionally designed templates that make your resume stand out.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Share2 className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Sharing</h3>
                <p className="text-gray-600">
                  Export as PDF or share with a public URL. Your resume, accessible anywhere.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gray-900 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to build your perfect resume?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who've landed their dream jobs with NexCV.
            </p>
            <SignedOut>
              <SignUpButton mode="modal">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Get Started for Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </SignedIn>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold">NexCV</span>
              </div>
              <p className="text-gray-600">© 2024 NexCV. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  )
}
