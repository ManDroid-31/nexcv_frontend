import { useState, useEffect } from "react"

interface ToastOptions {
  title?: string
  description?: string
  duration?: number
  variant?: "default" | "destructive" | "success" | "warning"
}

interface Toast extends ToastOptions {
  id: string
  visible: boolean
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const timers = toasts.map((toast) => {
      if (toast.visible) {
        return setTimeout(() => {
          setToasts((prev) =>
            prev.map((t) => (t.id === toast.id ? { ...t, visible: false } : t))
          )
        }, toast.duration || 3000)
      }
      return null
    })

    return () => {
      timers.forEach((timer) => timer && clearTimeout(timer))
    }
  }, [toasts])

  const toast = ({ title, description, duration = 3000, variant = "default" }: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, title, description, duration, variant, visible: true }])
  }

  return { toast, toasts }
} 