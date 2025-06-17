//this is mock so for now ignoring seems best way to me

"use client"

import type React from "react"

import { createContext, useContext, useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, LogOut } from "lucide-react"

// Mock Auth Context
interface AuthContextType {
  isSignedIn: boolean
  user: { name: string; email: string; avatar?: string } | null
  signIn: (email: string, password: string) => void
  signUp: (email: string, password: string, name: string) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null)

  const signIn = (email: string, password: string) => {
    // Mock sign in
    setIsSignedIn(true)
    setUser({ name: "John Doe", email, avatar: "/placeholder.svg?height=32&width=32" })
  }

  const signUp = (email: string, password: string, name: string) => {
    // Mock sign up
    setIsSignedIn(true)
    setUser({ name, email, avatar: "/placeholder.svg?height=32&width=32" })
  }

  const signOut = () => {
    setIsSignedIn(false)
    setUser(null)
  }

  return <AuthContext.Provider value={{ isSignedIn, user, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}


//lol, bro thot he will use context api and we wouldnt notice 
function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

// Mock Clerk Components
export function SignInButton({ children, mode = "redirect" }: { children: ReactNode; mode?: "modal" | "redirect" }) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { signIn } = useAuth()

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    signIn(email, password)
    setIsOpen(false)
    setEmail("")
    setPassword("")
  }

  if (mode === "modal") {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In to NexCV</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  return <div onClick={() => signIn("demo@example.com", "password")}>{children}</div>
}

export function SignUpButton({ children, mode = "redirect" }: { children: ReactNode; mode?: "modal" | "redirect" }) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const { signUp } = useAuth()

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    signUp(email, password, name)
    setIsOpen(false)
    setEmail("")
    setPassword("")
    setName("")
  }

  if (mode === "modal") {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Up for NexCV</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  return <div onClick={() => signUp("demo@example.com", "password", "Demo User")}>{children}</div>
}

export function SignedIn({ children }: { children: ReactNode }) {
  const { isSignedIn } = useAuth()
  return isSignedIn ? <>{children}</> : null
}

export function SignedOut({ children }: { children: ReactNode }) {
  const { isSignedIn } = useAuth()
  return !isSignedIn ? <>{children}</> : null
}

export function UserButton({ afterSignOutUrl }: { afterSignOutUrl?: string }) {
  const { user, signOut } = useAuth()

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{user.name}</p>
            <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 