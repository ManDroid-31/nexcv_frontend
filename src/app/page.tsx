"use client"

//nothing more than just landing page
// you may go net without over-view 


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
  CloudLightning
} from "lucide-react"
import Link from "next/link"
import { AuthProvider } from "@/components/mock-auth"
import { ThemeToggle } from "@/components/theme-toggle"
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { CreditPurchaseModal } from '@/components/credit-purchase-modal'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

export default function LandingPage() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const toast = useToast();

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 dark:from-background dark:to-muted/60">
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
        <section className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 flex flex-col gap-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-2 leading-tight">
              Build Stunning Resumes <span className="inline-block text-blue-600 dark:text-blue-400 animate-pulse">with AI</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mb-4">
              NexCV is your all-in-one AI-powered resume builder. Effortlessly create, enhance, and export beautiful resumes. Unlock premium templates, LinkedIn import, and smart AI suggestions.
            </p>
            <div className="flex gap-4 mt-2">
              <Button size="lg" className="text-lg px-8 py-4 shadow-lg" onClick={() => window.location.href = '/dashboard'}>
                Get Started <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 shadow-lg" onClick={() => window.location.href = '#features'}>
                Learn More
              </Button>
            </div>
          </div>
          <div className="flex-1 flex justify-center md:justify-end">
            {/* Hero Illustration */}
            <Image src="/globe.svg" alt="AI Resume Builder" width={400} height={400} className="w-80 h-80 object-contain drop-shadow-xl" />
          </div>
        </section>

        {/* Floating LinkedIn Import Card */}
        <section className="max-w-4xl mx-auto px-6 -mt-12 z-20 relative">
          <div className="flex justify-center">
            <div className="w-full md:w-2/3 lg:w-1/2">
              <div className="relative bg-gradient-to-r from-blue-100 to-sky-100 dark:from-blue-950/40 dark:to-sky-950/40 rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center border-2 border-blue-300 dark:border-blue-800 mb-12 animate-float-up">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white animate-pulse">New</Badge>
                </div>
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Linkedin className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-2xl mb-2 text-blue-800 dark:text-blue-200">Import from LinkedIn</h3>
                <p className="text-muted-foreground mb-4">Save time by importing your LinkedIn profile in one click. Instantly create a resume with your latest experience and skills.</p>
                <Button size="lg" className="bg-blue-600 text-white font-bold px-8 py-3 shadow-lg hover:bg-blue-700 transition-colors" onClick={() => window.location.href = '/dashboard'}>
                  Import Now <Linkedin className="w-5 h-5 ml-2" />
                </Button>
                <div className="text-xs text-blue-700 dark:text-blue-300 mt-2">Requires 7 credits</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-center mb-10 text-primary">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white dark:bg-muted/80 rounded-xl shadow-lg p-8 flex flex-col items-center text-center border border-border">
              <Sparkles className="w-12 h-12 text-blue-500 mb-4 animate-bounce" />
              <h3 className="font-semibold text-xl mb-2">AI Resume Enhancement</h3>
              <p className="text-muted-foreground mb-2">Get instant, personalized suggestions to improve your resume content and structure using advanced AI.</p>
            </div>
            <div className="bg-white dark:bg-muted/80 rounded-xl shadow-lg p-8 flex flex-col items-center text-center border border-border">
              <FileText className="w-12 h-12 text-green-500 mb-4 animate-bounce" />
              <h3 className="font-semibold text-xl mb-2">Premium Templates</h3>
              <p className="text-muted-foreground mb-2">Choose from a curated collection of modern, professional templates. Stand out with unique designs.</p>
            </div>
            <div className="bg-white dark:bg-muted/80 rounded-xl shadow-lg p-8 flex flex-col items-center text-center border border-border">
              <Linkedin className="w-12 h-12 text-blue-700 mb-4 animate-bounce" />
              <h3 className="font-semibold text-xl mb-2">LinkedIn Import</h3>
              <p className="text-muted-foreground mb-2">Import your LinkedIn profile in one click. Save time and get started instantly.</p>
            </div>
            <div className="bg-white dark:bg-muted/80 rounded-xl shadow-lg p-8 flex flex-col items-center text-center border border-border">
              <Brain className="w-12 h-12 text-purple-500 mb-4 animate-bounce" />
              <h3 className="font-semibold text-xl mb-2">Smart Suggestions</h3>
              <p className="text-muted-foreground mb-2">AI-powered tips for skills, achievements, and summary. Never miss an important detail.</p>
            </div>
            <div className="bg-white dark:bg-muted/80 rounded-xl shadow-lg p-8 flex flex-col items-center text-center border border-border">
              <CloudLightning className="w-12 h-12 text-sky-500 mb-4 animate-bounce" />
              <h3 className="font-semibold text-xl mb-2">Cloud Sync</h3>
              <p className="text-muted-foreground mb-2">Your resumes are securely saved in the cloud. Access and edit from any device, anytime.</p>
            </div>
            <div className="bg-white dark:bg-muted/80 rounded-xl shadow-lg p-8 flex flex-col items-center text-center border border-border">
              <ShieldCheck className="w-12 h-12 text-emerald-500 mb-4 animate-bounce" />
              <h3 className="font-semibold text-xl mb-2">Privacy & Security</h3>
              <p className="text-muted-foreground mb-2">Your data is encrypted and never shared. You control your privacy and visibility.</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-center mb-10 text-primary">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center">
              <User className="w-14 h-14 text-blue-500 mb-4 animate-fade-in" />
              <h3 className="font-semibold text-lg mb-2">1. Sign Up & Personalize</h3>
              <p className="text-muted-foreground">Create your account and personalize your profile. Your journey to a better resume starts here.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <FileText className="w-14 h-14 text-green-500 mb-4 animate-fade-in" />
              <h3 className="font-semibold text-lg mb-2">2. Build & Enhance</h3>
              <p className="text-muted-foreground">Use our intuitive editor and AI tools to build, enhance, and customize your resume.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <CheckCircle className="w-14 h-14 text-emerald-500 mb-4 animate-fade-in" />
              <h3 className="font-semibold text-lg mb-2">3. Export & Share</h3>
              <p className="text-muted-foreground">Export your resume as PDF or share a public link. Apply for your dream job with confidence!</p>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-sky-400 rounded-2xl shadow-xl p-12 flex flex-col items-center gap-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Ready to Build Your Dream Resume?</h2>
            <p className="text-lg text-blue-100 mb-4">Join thousands of professionals using NexCV to land their next job. Start for free and unlock the power of AI for your career.</p>
            <Button size="lg" className="text-lg px-10 py-4 bg-white text-blue-700 font-bold shadow-lg hover:bg-blue-50" onClick={() => window.location.href = '/dashboard'}>
              Get Started Now <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
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
            
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <Card className="text-center p-8 border-2 hover:border-primary transition-colors">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Starter</h3>
                  <div className="text-3xl font-bold text-primary mb-2">Free</div>
                  <p className="text-muted-foreground mb-6">10 free credits to get started</p>
                  <ul className="space-y-2 text-sm mb-8">
                    <li>✓ Basic templates</li>
                    <li>✓ Resume builder</li>
                    <li>✓ PDF export</li>
                    <li>✓ 10 free credits</li>
                  </ul>
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
                </Card>

                <Card className="text-center p-8 border-2 border-primary relative">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Pro</h3>
                  <div className="text-3xl font-bold text-primary mb-2">Pay as you go</div>
                  <p className="text-muted-foreground mb-6">Buy credits when you need them</p>
                  <ul className="space-y-2 text-sm mb-8">
                    <li>✓ All Starter features</li>
                    <li>✓ AI resume enhancement</li>
                    <li>✓ LinkedIn import</li>
                    <li>✓ Premium templates</li>
                    <li>✓ Priority support</li>
                  </ul>
                  <CreditPurchaseModal 
                    trigger={<Button className="w-full">Buy Credits</Button>}
                    onSuccess={() => toast.toast({ title: 'Purchase successful!', description: 'Credits will be available shortly.', variant: 'success' })}
                  />
                </Card>

                <Card className="text-center p-8 border-2 hover:border-primary transition-colors">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                  <div className="text-3xl font-bold text-primary mb-2">Custom</div>
                  <p className="text-muted-foreground mb-6">For teams and organizations</p>
                  <ul className="space-y-2 text-sm mb-8">
                    <li>✓ All Pro features</li>
                    <li>✓ Team management</li>
                    <li>✓ Custom branding</li>
                    <li>✓ API access</li>
                    <li>✓ Dedicated support</li>
                  </ul>
                  <Button variant="outline" className="w-full">Contact Sales</Button>
                </Card>
              </div>

              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  All plans include secure payment processing via Stripe
                </p>
                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
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
