"use client"

import { useState, useEffect } from "react"
import AvaPage from "./pages/ava-page"
import MyTrackerPage from "./pages/my-tracker-page"

export default function WeightLossChat() {
  const [currentPage, setCurrentPage] = useState("ava")

  useEffect(() => {
    // Listen for custom events from the layout
    const handlePageChange = (event) => {
      console.log("Page change event received:", event.detail.page)
      setCurrentPage(event.detail.page)
    }

    window.addEventListener("pageChange", handlePageChange)

    return () => {
      window.removeEventListener("pageChange", handlePageChange)
    }
  }, [])

  console.log("Current page state:", currentPage)

  // Render the appropriate page based on currentPage state
  return (
    <div className="h-full w-full">
      {currentPage === "tracker" ? <MyTrackerPage /> : <AvaPage />}
    </div>
  )
}