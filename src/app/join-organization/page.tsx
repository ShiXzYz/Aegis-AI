'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Building2, ArrowRight } from 'lucide-react'

export default function JoinOrganizationPage() {
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { user } = useUser()

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!joinCode.trim()) {
      setError('Please enter a join code')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/join-organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joinCode: joinCode.toUpperCase() })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to join organization')
        setLoading(false)
        return
      }

      // Success! Redirect to select-role
      router.push('/select-role')
    } catch (error) {
      console.error('Error joining organization:', error)
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const handleSkip = () => {
    // Skip and go to select-role with default organization
    router.push('/select-role')
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#E8E4F3] rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} className="text-black" />
          </div>
          <h1 className="text-3xl font-semibold text-black mb-2">Join an Organization</h1>
          <p className="text-black">Enter the code provided by your organization admin</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Organization Code
            </label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g., A3K9X2B1"
              maxLength={8}
              className="w-full px-6 py-4 bg-[#E8E4F3] rounded-full focus:outline-none border-none text-black placeholder:text-black/50 text-center text-2xl font-bold font-mono tracking-wider"
              disabled={loading}
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !joinCode.trim()}
            className="w-full px-6 py-4 bg-[#E8E4F3] text-black rounded-full hover:bg-[#d8d0ed] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? 'Joining...' : 'Join Organization'}
            {!loading && <ArrowRight size={20} />}
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="w-full px-6 py-3 text-black hover:text-black transition font-medium"
          >
            Skip for now
          </button>
        </form>

        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-black">
            <strong>Don't have a code?</strong> Ask your organization admin to create an organization and share the join code with you.
          </p>
        </div>
      </div>
    </div>
  )
}
