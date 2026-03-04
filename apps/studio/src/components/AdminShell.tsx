"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createSupabaseBrowser } from "@/lib/supabase-browser"
import { AppSidebar } from "./AppSidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

const PUBLIC_PATHS = ["/auth/login", "/auth/signup", "/auth/callback", "/render"]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  useEffect(() => {
    if (isPublic) {
      setReady(true)
      return
    }

    // DEV BYPASS — remove before production deploy
    if (process.env.NODE_ENV === "development") {
      setIsAdmin(true)
      setReady(true)
      return
    }

    const sb = createSupabaseBrowser()
    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login")
        return
      }
      const { data: profile } = await sb
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
      if (profile?.role === "admin") {
        setIsAdmin(true)
      }
      setReady(true)
    })
  }, [router, isPublic])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (isPublic) {
    return <>{children}</>
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground mb-2">권한 없음</h1>
          <p>어드민 권한이 필요합니다.</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 !h-4" />
          <span className="text-sm text-muted-foreground truncate">{pathname}</span>
        </header>
        <div className="flex-1 px-6 py-6 min-w-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
