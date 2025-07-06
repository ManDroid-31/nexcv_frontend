"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
  CheckCircle,
  Mail,
  Github,
  Twitter,
  Users,
  Award,
  Clock,
  Globe,
  Crown,
  User,
  ShieldCheck,
  CloudLightning,
  LogIn,
  UserPlus,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LandingPage() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const { toast } = useToast()

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setMobileMenuOpen(false)
  }

  const handleGetStarted = () => {
    if (isSignedIn) {
      router.push("/dashboard")
    } else {
      toast({
        title: "Sign up to get started",
        description: "Create an account to start building your resume",
      })
    }
  }

  const handleBuyCredits = () => {
    toast({
      title: "Purchase successful!",
      description: "Credits will be available shortly.",
    })
  }

  const toggleTheme = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 dark:from-background dark:via-background dark:to-muted/20">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-sky-500 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
                NexCV
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                {!isSignedIn ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setIsSignedIn(true)}>
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                    <Button size="sm" onClick={() => setIsSignedIn(true)}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Sign Up
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => setIsSignedIn(false)}>
                    <User className="w-4 h-4 mr-2" />
                    Account
                  </Button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t">
              <div className="flex flex-col space-y-4 pt-4">
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </button>
                <button
                  onClick={() => scrollToSection("about")}
                  className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  About
                </button>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </button>
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  <Button variant="ghost" size="icon" onClick={toggleTheme}>
                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </Button>
                  {!isSignedIn ? (
                    <>
                      <Button variant="ghost" size="sm" className="justify-start" onClick={() => setIsSignedIn(true)}>
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </Button>
                      <Button size="sm" className="justify-start" onClick={() => setIsSignedIn(true)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Sign Up
                      </Button>
                    </>
                  ) : (
                    <Button variant="ghost" size="sm" className="justify-start" onClick={() => setIsSignedIn(false)}>
                      <User className="w-4 h-4 mr-2" />
                      Account
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-sky-100/50 dark:from-blue-950/20 dark:to-sky-950/20" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Resume Builder
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-sky-600 dark:from-white dark:via-blue-200 dark:to-sky-300 bg-clip-text text-transparent leading-tight">
              Build Resumes That Get You Hired
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Create professional, ATS-friendly resumes in minutes with our AI-powered tools. Import from LinkedIn, get
              smart suggestions, and land your dream job.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {!isSignedIn ? (
                <Button
                  size="lg"
                  className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={handleGetStarted}
                >
                  Start Building Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => router.push("/dashboard")}
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}

              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4 border-2 hover:bg-muted/50 bg-transparent"
                onClick={() => scrollToSection("features")}
              >
                Learn More
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>ATS-friendly</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Everything you need to create the perfect resume</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform provides all the tools you need to build, enhance, and optimize your resume for
              success.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-8 hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200 dark:hover:border-blue-800">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-sky-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-xl mb-3">AI Resume Enhancement</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our AI analyzes your resume and provides intelligent suggestions to improve content, formatting, and
                keyword optimization.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200 dark:hover:border-blue-800">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Linkedin className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-xl mb-3">LinkedIn Import</h3>
              <p className="text-muted-foreground leading-relaxed">
                Instantly import your LinkedIn profile data and transform it into a professional resume with one click.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200 dark:hover:border-blue-800">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Smart Suggestions</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get AI-powered tips for skills, achievements, and summary sections. Never miss an important detail
                again.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200 dark:hover:border-blue-800">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-xl mb-3">ATS Optimization</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ensure your resume passes Applicant Tracking Systems with our built-in ATS compatibility checker.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200 dark:hover:border-blue-800">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <CloudLightning className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Instant Export</h3>
              <p className="text-muted-foreground leading-relaxed">
                Download your resume as PDF or share a public link. Apply for jobs instantly with professional
                formatting.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200 dark:hover:border-blue-800">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <User className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Multiple Templates</h3>
              <p className="text-muted-foreground leading-relaxed">
                Choose from a variety of professional templates designed by experts and optimized for different
                industries.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create your professional resume in just three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-sky-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="font-semibold text-xl mb-3">Import & Input</h3>
              <p className="text-muted-foreground leading-relaxed">
                Import from LinkedIn or start fresh. Add your experience, skills, and achievements with our intuitive
                interface.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="font-semibold text-xl mb-3">AI Enhancement</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our AI analyzes and enhances your content, suggests improvements, and optimizes for ATS compatibility.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="font-semibold text-xl mb-3">Export & Apply</h3>
              <p className="text-muted-foreground leading-relaxed">
                Download as PDF or share a public link. Apply for your dream job with confidence and professional
                formatting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 border-0 shadow-2xl overflow-hidden">
              <div className="p-8 md:p-12 text-center text-white relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-sky-400/20 backdrop-blur-sm" />
                <div className="relative z-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Build Your Dream Resume?</h2>
                  <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                    Join thousands of professionals using NexCV to land their next job. Start for free and unlock the
                    power of AI for your career.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {!isSignedIn ? (
                      <Button
                        size="lg"
                        className="text-lg px-10 py-4 bg-white text-blue-700 font-bold shadow-lg hover:bg-blue-50 transition-all duration-200"
                        onClick={handleGetStarted}
                      >
                        Get Started Now
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        className="text-lg px-10 py-4 bg-white text-blue-700 font-bold shadow-lg hover:bg-blue-50 transition-all duration-200"
                        onClick={() => router.push("/dashboard")}
                      >
                        Go to Dashboard
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="lg"
                      className="text-lg px-8 py-4 border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm bg-transparent"
                      onClick={() => scrollToSection("pricing")}
                    >
                      View Pricing
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free, then pay only for what you need. No hidden fees, no surprises.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* Starter Plan */}
              <Card className="text-center p-8 border-2 hover:border-green-200 dark:hover:border-green-800 transition-all duration-200 hover:shadow-lg">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Starter</h3>
                <div className="text-4xl font-bold text-primary mb-4">Free</div>
                <p className="text-muted-foreground mb-6">Perfect for getting started</p>

                <ul className="space-y-3 text-sm mb-8 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span>10 free credits</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span>Basic templates</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span>Resume builder</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span>PDF export</span>
                  </li>
                </ul>

                {!isSignedIn ? (
                  <Button onClick={() => setIsSignedIn(true)} className="w-full">
                    Get Started Free
                  </Button>
                ) : (
                  <Link href="/dashboard">
                    <Button className="w-full">Go to Dashboard</Button>
                  </Link>
                )}
              </Card>

              {/* Pro Plan */}
              <Card className="text-center p-8 border-2 border-primary relative hover:shadow-xl transition-all duration-200 scale-105">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">Most Popular</Badge>
                </div>

                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <div className="text-4xl font-bold text-primary mb-4">Pay as you go</div>
                <p className="text-muted-foreground mb-6">Buy credits when you need them</p>

                <ul className="space-y-3 text-sm mb-8 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span>All Starter features</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span>AI resume enhancement</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span>LinkedIn import</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span>Premium templates</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span>Priority support</span>
                  </li>
                </ul>

                <Button className="w-full" onClick={handleBuyCredits}>
                  Buy Credits
                </Button>
              </Card>

              {/* Enterprise Plan */}
              <Card className="text-center p-8 border-2 hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-200 hover:shadow-lg">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Crown className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-primary mb-4">Custom</div>
                <p className="text-muted-foreground mb-6">For teams and organizations</p>

                <ul className="space-y-3 text-sm mb-8 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span>All Pro features</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span>Team management</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span>Custom branding</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span>API access</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span>Dedicated support</span>
                  </li>
                </ul>

                <Button variant="outline" className="w-full bg-transparent">
                  Contact Sales
                </Button>
              </Card>
            </div>

            <div className="text-center">
              <p className="text-muted-foreground mb-6">All plans include secure payment processing via Stripe</p>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>No setup fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>30-day money back</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-8">
              Helping developers and professionals get hired faster
            </h2>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              NexCV was built with one simple mission: to help talented people showcase their skills and experience in
              the most compelling way possible. Whether you&apos;re a developer looking for your next big opportunity or a
              professional seeking career growth, we provide the tools you need to create resumes that get noticed.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">10,000+</h3>
                <p className="text-muted-foreground">Users worldwide</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">95%</h3>
                <p className="text-muted-foreground">Success rate for interviews</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">5 min</h3>
                <p className="text-muted-foreground">Average time to create</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Get in touch</h2>
              <p className="text-xl text-muted-foreground">Have questions? We&apos;d love to hear from you.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-6">Send us a message</h3>
                  <form className="space-y-6">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Your name" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="your@email.com" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" placeholder="Your message" rows={4} className="mt-2" />
                    </div>
                    <Button type="submit" className="w-full">
                      Send Message
                    </Button>
                  </form>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-6">Connect with us</h3>
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
                  <h3 className="text-xl font-semibold mb-6">Follow us</h3>
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
      <footer className="border-t bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-sky-500 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg">NexCV</span>
            </div>

            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>© 2024 NexCV. All rights reserved.</span>
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
