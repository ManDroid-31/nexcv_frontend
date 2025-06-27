"use client"

//nothing more than just landing page
// you may go net without over-view 


import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  ArrowRight, 
  Sparkles, 
  FileText, 
  Linkedin, 
  Brain, 
  CreditCard, 
  Download,
  Code,
  CheckCircle,
  Mail,
  Github,
  Twitter,
  Users,
  Award,
  Clock,
  Globe
} from "lucide-react"
import Link from "next/link"
import { AuthProvider } from "@/components/mock-auth"
import { ThemeToggle } from "@/components/theme-toggle"
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs'

export default function LandingPage() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        {/* Sticky Navigation */}
        <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">NexCV</span>
            </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <button 
                  onClick={() => scrollToSection('features')}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </button>
                <button 
                  onClick={() => scrollToSection('about')}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  About
                </button>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </button>
              </div>

            <div className="flex items-center space-x-4">
                <ThemeToggle />
                <div className="flex gap-4 items-center">
              <SignedOut>
                    <SignUpButton mode="modal">
                      <button className="btn btn-primary cursor-pointer">Sign Up</button>
                    </SignUpButton>
                <SignInButton mode="modal">
                      <button className="btn btn-secondary cursor-pointer">Log In</button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                    <UserButton afterSignOutUrl="/" />
              </SignedIn>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-4 h-4 mr-1" />
            AI-Powered Resume Builder
          </Badge>
                
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Build a job-ready resume in{" "}
                  <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    minutes
                  </span>
          </h1>
                
                <p className="text-xl text-muted-foreground max-w-2xl">
                  Smart templates. LinkedIn auto-import. AI-enhanced editing. Get 10 free credits to start.
          </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
            <SignedOut>
              <SignUpButton mode="modal">
                <Button size="lg" className="text-lg px-8">
                        Start Free
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
                    Buy Credits
            </Button>
                </div>

                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>10 free credits</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>No credit card required</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="relative z-10 bg-card border rounded-lg shadow-2xl p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
          <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Everything you need to stand out
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                From beautiful templates to AI-powered content enhancement, we&apos;ve got you covered.
            </p>
          </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Beautiful Templates</h3>
                  <p className="text-muted-foreground">
                    Choose from professionally designed templates that make your resume stand out from the crowd.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
                    <Linkedin className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">LinkedIn Auto-Import</h3>
                  <p className="text-muted-foreground">
                    Automatically fetch your experience, education, and skills from your LinkedIn profile.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4">
                    <Brain className="w-6 h-6 text-purple-600" />
                </div>
                  <h3 className="text-xl font-semibold mb-2">AI-Enhanced Editing</h3>
                  <p className="text-muted-foreground">
                  Let AI help you write compelling bullet points, improve tone, and suggest missing sections.
                </p>
              </CardContent>
            </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mb-4">
                    <Code className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">JSON Editing</h3>
                  <p className="text-muted-foreground">
                    Advanced users can edit the raw JSON for complete control over their resume structure.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mb-4">
                    <Download className="w-6 h-6 text-red-600" />
                </div>
                  <h3 className="text-xl font-semibold mb-2">PDF Export</h3>
                  <p className="text-muted-foreground">
                    Export your resume as a high-quality PDF or share with a public URL for easy access.
                </p>
              </CardContent>
            </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center mb-4">
                    <CreditCard className="w-6 h-6 text-indigo-600" />
                </div>
                  <h3 className="text-xl font-semibold mb-2">Credit System</h3>
                  <p className="text-muted-foreground">
                    Start with 10 free credits. Buy more as needed for AI features and premium templates.
                </p>
              </CardContent>
            </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Simple, transparent pricing
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Start free, then pay only for what you need. No hidden fees, no surprises.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <Card className="border-2 border-muted relative">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">Free</CardTitle>
                  <div className="text-3xl font-bold">₹0</div>
                  <p className="text-muted-foreground">Perfect to get started</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>10 free credits</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Basic templates</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>PDF export</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Public sharing</span>
                    </div>
                  </div>
            <SignedOut>
              <SignUpButton mode="modal">
                      <Button className="w-full">Get Started Free</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                      <Button className="w-full">Go to Dashboard</Button>
              </Link>
            </SignedIn>
                </CardContent>
              </Card>

              {/* Basic Plan */}
              <Card className="border-2 border-primary relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">Basic</CardTitle>
                  <div className="text-3xl font-bold">₹299</div>
                  <p className="text-muted-foreground">For job seekers</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>50 credits</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>All templates</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>AI suggestions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>LinkedIn import</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Priority support</span>
                    </div>
                  </div>
                  <Button className="w-full">Buy Basic Plan</Button>
                </CardContent>
              </Card>

              {/* Pro Plan */}
              <Card className="border-2 border-muted relative">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">Pro</CardTitle>
                  <div className="text-3xl font-bold">₹599</div>
                  <p className="text-muted-foreground">For professionals</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>150 credits</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Everything in Basic</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Advanced AI features</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Custom branding</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>24/7 support</span>
                    </div>
                  </div>
                  <Button className="w-full">Buy Pro Plan</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-8">
                Helping developers and professionals get hired faster
              </h2>
              <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
                NexCV was built with one simple mission: to help talented people showcase their skills 
                and experience in the most compelling way possible. Whether you&apos;re a developer looking 
                for your next big opportunity or a professional seeking career growth, we provide the 
                tools you need to create resumes that get noticed.
              </p>
              
              <div className="grid md:grid-cols-3 gap-8 mt-16">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">10,000+ Users</h3>
                  <p className="text-muted-foreground">Trusted by professionals worldwide</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">95% Success Rate</h3>
                  <p className="text-muted-foreground">Users report better interview calls</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">5 Minutes</h3>
                  <p className="text-muted-foreground">Average time to create a resume</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  Get in touch
                </h2>
                <p className="text-xl text-muted-foreground">
                  Have questions? We&apos;d love to hear from you.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Send us a message</h3>
                    <form className="space-y-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Your name" />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="your@email.com" />
                      </div>
                      <div>
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" placeholder="Your message" rows={4} />
                      </div>
                      <Button type="submit" className="w-full">
                        Send Message
                      </Button>
                    </form>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Connect with us</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <span>hello@nexcv.com</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Globe className="w-5 h-5 text-muted-foreground" />
                        <span>nexcv.com</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">Follow us</h3>
                    <div className="flex space-x-4">
                      <Button variant="outline" size="icon">
                        <Twitter className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Github className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Linkedin className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-semibold">NexCV</span>
              </div>
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <span>© 2024 NexCV. All rights reserved.</span>
                <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
                <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  )
}
