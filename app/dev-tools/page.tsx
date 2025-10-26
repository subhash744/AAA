"use client"

import { useState, useEffect } from "react"
import {
  getAllUsers,
  resetAllData,
  getStorageSchema,
  getFeaturedBuilders,
  addUpvote,
  incrementViewCount,
  getCurrentUser,
} from "@/lib/storage"
import { initializeMockData } from "@/lib/init-mock-data"
import Navigation from "@/components/navigation"

export default function DevToolsPage() {
  const [schema, setSchema] = useState<any>(null)
  const [featured, setFeatured] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    setMounted(true)
    updateSchema()
    setFeatured(getFeaturedBuilders())
  }, [])

  const updateSchema = () => {
    const schemaData = getStorageSchema()
    setSchema(schemaData)
  }

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const handleSeedMockData = () => {
    resetAllData()
    initializeMockData()
    updateSchema()
    setFeatured(getFeaturedBuilders())
    addLog("Mock data seeded successfully")
  }

  const handleResetData = () => {
    if (confirm("Are you sure? This will delete all data.")) {
      resetAllData()
      updateSchema()
      setFeatured([])
      addLog("All data reset")
    }
  }

  const handleSimulateTraffic = () => {
    const users = getAllUsers()
    if (users.length === 0) {
      addLog("No users to simulate traffic for")
      return
    }

    const currentUser = getCurrentUser()
    const visitorId = currentUser?.id || "simulator"
    let eventCount = 0

    for (let i = 0; i < 100; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)]
      if (Math.random() > 0.5) {
        incrementViewCount(randomUser.id)
        eventCount++
      } else {
        addUpvote(randomUser.id, visitorId)
        eventCount++
      }
    }

    updateSchema()
    addLog(`Simulated ${eventCount} traffic events`)
  }

  if (!mounted) return null

  return (
    <div className="w-full min-h-screen bg-[#F7F5F3]">
      <Navigation />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-serif text-[#37322F] mb-8">Developer Tools</h1>

        {/* Schema Info */}
        <div className="bg-white p-6 rounded-lg border border-[#E0DEDB] mb-8">
          <h2 className="text-xl font-semibold text-[#37322F] mb-4">LocalStorage Schema</h2>
          {schema && (
            <div className="space-y-2 text-sm font-mono text-[#605A57]">
              <p>Schema Version: {schema.schemaVersion}</p>
              <p>Total Users: {schema.totalUsers}</p>
              <p>Storage Size: {(schema.storageSize / 1024).toFixed(2)} KB</p>
              {schema.sampleUser && (
                <details className="mt-4">
                  <summary className="cursor-pointer font-semibold">Sample User Schema</summary>
                  <pre className="mt-2 bg-[#F7F5F3] p-4 rounded overflow-auto text-xs">
                    {JSON.stringify(schema.sampleUser, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>

        {/* Featured Builders */}
        <div className="bg-white p-6 rounded-lg border border-[#E0DEDB] mb-8">
          <h2 className="text-xl font-semibold text-[#37322F] mb-4">Today's Featured Builders</h2>
          <div className="space-y-2 text-sm">
            {featured.length > 0 ? (
              featured.map((user) => (
                <div key={user.id} className="p-3 bg-[#F7F5F3] rounded">
                  <p className="font-semibold text-[#37322F]">{user.displayName}</p>
                  <p className="text-[#605A57]">ID: {user.id}</p>
                </div>
              ))
            ) : (
              <p className="text-[#605A57]">No featured builders</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white p-6 rounded-lg border border-[#E0DEDB] mb-8">
          <h2 className="text-xl font-semibold text-[#37322F] mb-4">Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleSeedMockData}
              className="px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
            >
              Seed Mock Data
            </button>
            <button
              onClick={handleSimulateTraffic}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Simulate Traffic (100 events)
            </button>
            <button
              onClick={handleResetData}
              className="px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
            >
              Reset All Data
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white p-6 rounded-lg border border-[#E0DEDB]">
          <h2 className="text-xl font-semibold text-[#37322F] mb-4">Activity Log</h2>
          <div className="bg-[#F7F5F3] p-4 rounded h-48 overflow-y-auto font-mono text-xs text-[#605A57]">
            {logs.length > 0 ? (
              logs.map((log, idx) => (
                <div key={idx} className="mb-1">
                  {log}
                </div>
              ))
            ) : (
              <p>No activity yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
