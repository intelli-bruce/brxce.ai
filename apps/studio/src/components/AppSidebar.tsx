"use client"

import React from "react"
import Link from "next/link"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { createSupabaseBrowser } from "@/lib/supabase-browser"
import {
  BarChart3,
  BookOpen,
  Calendar,
  Clapperboard,
  FileText,
  FolderOpen,
  Image,
  Lightbulb,
  LogOut,
  Mail,
  Map,
  Megaphone,
  Newspaper,
  Palette,
  Rocket,
  Scissors,
  Smartphone,
  Theater,
  Video,
  type LucideIcon,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"

type NavLink = {
  href: string
  label: string
  icon: LucideIcon
  children?: { href: string; label: string; icon?: LucideIcon; group?: string }[]
}

type NavSection = {
  title: string
  items: NavLink[]
}

const navSections: NavSection[] = [
  {
    title: "CMS",
    items: [
      { href: "/", label: "대시보드", icon: BarChart3 },
      { href: "/contents", label: "콘텐츠", icon: FileText },
      { href: "/ideas", label: "아이디어", icon: Lightbulb },
      { href: "/publications", label: "발행", icon: Megaphone },
      { href: "/showcase", label: "쇼케이스", icon: Palette },
      {
        href: "/newsletter",
        label: "뉴스레터",
        icon: Newspaper,
        children: [
          { href: "/email-templates", label: "이메일 템플릿" },
        ],
      },
    ],
  },
  {
    title: "제작 (Studio)",
    items: [
      {
        href: "/studio",
        label: "스튜디오",
        icon: Clapperboard,
        children: [
          { href: "/carousel", label: "캐러셀", group: "캐러셀" },
          { href: "/studio/templates", label: "템플릿: 이미지", group: "캐러셀" },
          { href: "/studio/references", label: "레퍼런스 : 캐러셀", group: "캐러셀" },
          { href: "/studio/video-edit", label: "영상 편집", icon: Scissors, group: "영상" },
          { href: "/studio/templates?tab=video", label: "템플릿: 영상", group: "영상" },
          { href: "/studio/references/video", label: "레퍼런스 : 영상", group: "영상" },
        ],
      },
      { href: "/media", label: "미디어 라이브러리", icon: FolderOpen },
    ],
  },
  {
    title: "캠페인",
    items: [
      {
        href: "/campaigns",
        label: "캠페인",
        icon: Rocket,
        children: [
          { href: "/campaigns/calendar", label: "캘린더" },
          { href: "/campaigns/series", label: "시리즈" },
        ],
      },
      { href: "/analytics", label: "성과", icon: BarChart3 },
      { href: "/style-profiles", label: "스타일 프로필", icon: Theater },
    ],
  },
  {
    title: "전략",
    items: [
      { href: "/studio/funnel", label: "퍼널 맵", icon: Map },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    // query param이 있는 경우 (e.g. ?tab=video)
    if (href.includes("?")) {
      const [hrefPath, hrefQuery] = href.split("?")
      if (!pathname.startsWith(hrefPath)) return false
      const params = new URLSearchParams(hrefQuery)
      for (const [key, value] of params.entries()) {
        if (searchParams.get(key) !== value) return false
      }
      return true
    }
    // query param 없는 일반 경로
    if (pathname === href) {
      // 같은 pathname을 쓰는 ?tab= 링크가 있을 수 있으므로, tab이 있으면 비활성
      if (searchParams.get("tab")) return false
      return true
    }
    // 하위 세그먼트 매칭은 하지 않음 (prefix 겹침 방지)
    return false
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Clapperboard className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">BrxceStudio</span>
                  <span className="text-xs text-sidebar-foreground/50">CMS + Studio</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navSections.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.children && (
                      <SidebarMenuSub>
                        {(() => {
                          let lastGroup: string | undefined
                          return item.children.map((child) => {
                            const showGroupHeader = child.group && child.group !== lastGroup
                            lastGroup = child.group
                            return (
                              <React.Fragment key={child.href}>
                                {showGroupHeader && (
                                  <li className="px-2 pt-3 pb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#555]">
                                      {child.group}
                                    </span>
                                  </li>
                                )}
                                <SidebarMenuSubItem>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isActive(child.href)}
                                  >
                                    <Link href={child.href}>
                                      <span>{child.label}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              </React.Fragment>
                            )
                          })
                        })()}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="로그아웃"
              onClick={async () => {
                const sb = createSupabaseBrowser()
                await sb.auth.signOut()
                router.push("/auth/login")
              }}
            >
              <LogOut />
              <span>로그아웃</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
