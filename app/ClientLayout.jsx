"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, BarChart3, ChevronLeft, ChevronRight } from "lucide-react"
import "./globals.css"

export default function ClientLayout({ children }) {
  const [currentPage, setCurrentPage] = useState("ava")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const navigationItems = [
    {
      id: "ava",
      label: "ava",
      icon: MessageCircle,
    },
    {
      id: "tracker",
      label: "my tracker",
      icon: BarChart3,
    },
  ]

  // Load saved state from localStorage on component mount
  useEffect(() => {
    const savedPage = localStorage.getItem("weightLossCurrentPage")
    const savedSidebarState = localStorage.getItem("weightLossSidebarCollapsed")
    
    if (savedPage && (savedPage === "ava" || savedPage === "tracker")) {
      setCurrentPage(savedPage)
    }
    
    if (savedSidebarState !== null) {
      setSidebarCollapsed(JSON.parse(savedSidebarState))
    }
    
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      const mainContent = document.querySelector("[data-page]")
      if (mainContent) {
        mainContent.setAttribute("data-page", currentPage)
      }
    }
  }, [currentPage, isLoaded])

  const handlePageChange = (pageId) => {
    setCurrentPage(pageId)
    // Save to localStorage
    localStorage.setItem("weightLossCurrentPage", pageId)

    // Dispatch custom event for the main page component
    window.dispatchEvent(
      new CustomEvent("pageChange", {
        detail: { page: pageId },
      }),
    )
  }

  const handleSidebarToggle = () => {
    const newCollapsedState = !sidebarCollapsed
    setSidebarCollapsed(newCollapsedState)
    // Save sidebar state to localStorage
    localStorage.setItem("weightLossSidebarCollapsed", JSON.stringify(newCollapsedState))
  }

  // Don't render until we've loaded the saved state
  if (!isLoaded) {
    return <div className="flex h-screen bg-gray-50 items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex h-screen bg-gray-50 ">
      {/* Left Sidebar */}
      <div
        className={`relative bg-[#946CFC]  border-r border-gray-200 transition-all duration-300 ease-in-out flex-shrink-0 ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Sidebar Toggle Button */}
        <Button
          onClick={handleSidebarToggle}
          variant="ghost"
          size="sm"
          className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full  border border-gray-200 bg-white p-0 shadow-md hover:bg-gray-50"
        >
          {sidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>

        {/* Sidebar Content */}
        <div className="flex h-full flex-col text-white">
          {/* Logo Section */}
          <div className={`flex items-center border-b border-gray-200 p-4 ${sidebarCollapsed && "justify-center p-2"}`}>
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <div>
                  <div className="font-bold text-white ">SlimReset</div>
                  
                </div>
              </div>
            ) : (
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    onClick={() => handlePageChange(item.id)}
                    variant={currentPage === item.id ? "default" : "ghost"}
                    className={`w-full justify-start gap-3 mb-1 ${sidebarCollapsed && "justify-center px-2"} ${
                      currentPage === item.id && "bg-purple-100 text-purple-700 hover:bg-purple-200"
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div data-page={currentPage} className="min-h-full">
          {children}
        </div>
      </div>
    </div>
  )
}