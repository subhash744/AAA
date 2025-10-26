"use client"

import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { getAllUsers } from "@/lib/storage"

// Remove mock data and fetch real data instead
/*
const mockMapUsers = [
  { lat: 40.7128, lng: -74.006, name: "Sarah Chen", tagline: "Full-stack builder" },
  { lat: 51.5074, lng: -0.1278, name: "Alex Rivera", tagline: "Design enthusiast" },
  { lat: 35.6762, lng: 139.6503, name: "Jordan Kim", tagline: "AI researcher" },
  { lat: 19.076, lng: 72.8777, name: "Morgan Lee", tagline: "Product maker" },
  { lat: -33.8688, lng: 151.2093, name: "Taylor Swift", tagline: "Creative coder" },
]
*/

function MapComponent() {
  const mapRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !mapContainerRef.current || mapRef.current) return

    // Dynamic import of Leaflet only on client side
    import("leaflet").then((L) => {
      import("leaflet/dist/leaflet.css")

      // Initialize map
      mapRef.current = L.map(mapContainerRef.current!, {
        center: [20, 0],
        zoom: 2,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        attributionControl: false,
      })

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "",
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(mapRef.current)

      // Get real users with location data
      const allUsers = getAllUsers()
      const realMapUsers = allUsers
        .filter(user => user.location && !user.hideLocation)
        .map(user => ({
          lat: user.location!.lat,
          lng: user.location!.lng,
          name: user.displayName,
          tagline: user.bio.substring(0, 30) + (user.bio.length > 30 ? "..." : "")
        }))

      // Add markers with popup
      realMapUsers.forEach((user) => {
        const icon = L.divIcon({
          className: "custom-map-pin",
          html: `<div class="w-4 h-4 bg-[#37322F] rounded-full border-2 border-white shadow-lg animate-pulse"></div>`,
          iconSize: [16, 16],
        })

        const marker = L.marker([user.lat, user.lng], { icon }).addTo(mapRef.current!)

        marker.bindPopup(
          `<div class="text-center p-2">
            <p class="font-semibold text-[#37322F] text-sm">${user.name}</p>
            <p class="text-xs text-[#605A57]">${user.tagline}</p>
          </div>`,
          {
            className: "custom-popup",
            closeButton: false,
          }
        )
      })
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [mounted])

  // Get real users to check if we have any
  const allUsers = getAllUsers()
  const usersWithLocation = allUsers.filter(user => user.location && !user.hideLocation)

  return (
    <div className="relative">
      {usersWithLocation.length === 0 ? (
        <div className="w-full h-[400px] rounded-lg overflow-hidden border border-[#E0DEDB] shadow-sm flex items-center justify-center bg-[#F7F5F3]">
          <p className="text-[#605A57] text-center p-6">
            No builders on the map yet. Be the first to join and appear here!
          </p>
        </div>
      ) : (
        <div
          ref={mapContainerRef}
          className="w-full h-[400px] rounded-lg overflow-hidden border border-[#E0DEDB] shadow-sm"
        />
      )}
    </div>
  )
}

export default function UserMapSection() {
  const allUsers = getAllUsers()
  const usersWithLocation = allUsers.filter(user => user.location && !user.hideLocation)

  return (
    <section className="py-20 px-6 bg-[#F7F5F3]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl font-serif text-[#37322F] mb-4">Global Community</h2>
          <p className="text-lg text-[#605A57] max-w-xl mx-auto">
            {usersWithLocation.length > 0 
              ? "Connect with builders from around the world" 
              : "Be the first to join our global community!"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeInOut" }}
          className="relative"
        >
          <MapComponent />
        </motion.div>
      </div>
    </section>
  )
}
