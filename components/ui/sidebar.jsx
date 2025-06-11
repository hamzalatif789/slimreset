"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function Sidebar({ children, isCollapsed, onToggle, className }) {
  return (
    <div
      className={cn(
        "relative bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {/* Sidebar Toggle Button */}
      <Button
        onClick={onToggle}
        variant="ghost"
        size="sm"
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border border-gray-200 bg-white p-0 shadow-md hover:bg-gray-50"
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      {/* Sidebar Content */}
      <div className="flex h-full flex-col">{children}</div>
    </div>
  )
}

export function SidebarHeader({ children, isCollapsed }) {
  return (
    <div className={cn("flex items-center border-b border-gray-200 p-4", isCollapsed && "justify-center p-2")}>
      {children}
    </div>
  )
}

export function SidebarContent({ children }) {
  return <div className="flex-1 overflow-y-auto p-2">{children}</div>
}

export function SidebarItem({ icon: Icon, label, isActive, onClick, isCollapsed }) {
  return (
    <Button
      onClick={onClick}
      variant={isActive ? "default" : "ghost"}
      className={cn(
        "w-full justify-start gap-3 mb-1",
        isCollapsed && "justify-center px-2",
        isActive && "bg-purple-100 text-purple-700 hover:bg-purple-200",
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!isCollapsed && <span className="truncate">{label}</span>}
    </Button>
  )
}
