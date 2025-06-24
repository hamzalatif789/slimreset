"use client"

import { useState, useEffect } from "react"
import AvaPage from "./pages/ava-page"
import MyTrackerPage from "./pages/my-tracker-page"

export default function WeightLossChat() {
  const [currentPage, setCurrentPage] = useState("ava")
  const [trackerKey, setTrackerKey] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load the saved page from localStorage on component mount
  useEffect(() => {
    const savedPage = localStorage.getItem("weightLossCurrentPage")
    if (savedPage && (savedPage === "ava" || savedPage === "tracker")) {
      setCurrentPage(savedPage)
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    // Listen for custom events from the layout
    const handlePageChange = (event) => {
      console.log("Page change event received:", event.detail.page)
      const newPage = event.detail.page
      
      // If switching to tracker, increment the key to force re-render
      if (newPage === "tracker") {
        setTrackerKey(prev => prev + 1)
      }
      
      setCurrentPage(newPage)
      // Save the current page to localStorage
      localStorage.setItem("weightLossCurrentPage", newPage)
    }

    window.addEventListener("pageChange", handlePageChange)

    return () => {
      window.removeEventListener("pageChange", handlePageChange)
    }
  }, [])

  console.log("Current page state:", currentPage)

  // Don't render until we've loaded the saved state
  if (!isLoaded) {
    return <div className="h-full w-full flex items-center justify-center">ava loading...</div>
  }

  // Render the appropriate page based on currentPage state
  return (
    <div className="h-full w-full">
      {currentPage === "tracker" ? (
        <MyTrackerPage key={trackerKey} />
      ) : (
        <AvaPage />
      )}
    </div>
  )
}