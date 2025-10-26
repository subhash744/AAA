"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"
import "leaflet.markercluster"
import type { UserProfile } from "@/lib/storage"

interface MapComponentProps {
  users: UserProfile[]
  selectedUserId: string | null
  onPinClick: (userId: string) => void
}

export default function MapComponent({ users, selectedUserId, onPinClick }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())

  useEffect(() => {
    if (!mapRef.current) {
      // Initialize map with vertical bounds only (allow horizontal looping)
      mapRef.current = L.map("map", {
        center: [20, 0],
        zoom: 2,
        maxBounds: [[-85, -Infinity], [85, Infinity]], // Only vertical bounds
        maxBoundsViscosity: 1.0,
        minZoom: 2,
        maxZoom: 18,
        worldCopyJump: true, // Enable horizontal wrapping
        attributionControl: false, // Remove attribution text
      })

      // Add CartoDB Positron tiles with horizontal wrapping enabled
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '', // Remove attribution
        subdomains: "abcd",
        maxZoom: 20,
        noWrap: false, // Enable tile wrapping horizontally
      }).addTo(mapRef.current)
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      mapRef.current?.removeLayer(marker)
    })
    markersRef.current.clear()

    // Add user markers with clustering
    const markerGroup = L.markerClusterGroup()

    users.forEach((user) => {
      if (user.location && (user.location.lat !== 0 || user.location.lng !== 0)) {
        const marker = L.marker([user.location.lat, user.location.lng], {
          title: user.displayName,
        })

        const popupContent = `
          <div class="p-3 min-w-48">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-sm font-semibold">
                ${user.displayName.charAt(0)}
              </div>
              <div>
                <p class="font-semibold text-sm">${user.displayName}</p>
                <p class="text-xs text-gray-600">@${user.username}</p>
              </div>
            </div>
            <p class="text-xs text-gray-600 mb-2">${user.location.city}, ${user.location.country}</p>
            <div class="grid grid-cols-2 gap-2 mb-3">
              <div class="bg-gray-100 p-2 rounded">
                <p class="text-xs text-gray-600">Views</p>
                <p class="font-semibold text-sm">${user.views}</p>
              </div>
              <div class="bg-gray-100 p-2 rounded">
                <p class="text-xs text-gray-600">Upvotes</p>
                <p class="font-semibold text-sm">${user.upvotes}</p>
              </div>
            </div>
            <button onclick="window.location.href='/profile/${user.id}'" class="w-full px-3 py-1 bg-gray-800 text-white rounded text-xs font-medium hover:bg-gray-700">
              View Profile
            </button>
          </div>
        `

        marker.bindPopup(popupContent)
        marker.on("click", () => onPinClick(user.id))

        markersRef.current.set(user.id, marker)
        markerGroup.addLayer(marker)
      }
    })

    mapRef.current?.addLayer(markerGroup)

    // Highlight selected marker
    if (selectedUserId && markersRef.current.has(selectedUserId)) {
      const marker = markersRef.current.get(selectedUserId)
      marker?.openPopup()
    }
  }, [users, selectedUserId, onPinClick])

  return <div id="map" className="w-full h-full" style={{ minHeight: "600px" }} />
}
