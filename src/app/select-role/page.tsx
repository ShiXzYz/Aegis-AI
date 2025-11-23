'use client'

import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { User, Shield, ArrowLeft } from 'lucide-react'
import { useState } from 'react'

export default function SelectRolePage() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const selectRole = async (role: 'user' | 'admin') => {
    console.log('selectRole called with:', role)
    if (!user) {
      console.log('No user found')
      return
    }

    setLoading(true)
    try {
      console.log('Setting role to:', role, 'for user:', user.id)

      // Update user metadata with role via API
      const response = await fetch('/api/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers.get('content-type'))

      const responseText = await response.text()
      console.log('Response text:', responseText)

      if (!response.ok) {
        console.error('Error response:', responseText)
        throw new Error('Failed to update role')
      }

      let data
      try {
        data = JSON.parse(responseText)
        console.log('Success response:', data)
      } catch (e) {
        console.error('Failed to parse JSON:', e)
        throw new Error('Invalid response from server')
      }

      console.log('Reloading user session...')
      // Reload the user session to get updated metadata
      try {
        await user.reload()
        console.log('User reload successful')
      } catch (reloadError) {
        console.error('Error reloading user:', reloadError)
      }

      // Wait a bit longer for the session to fully update
      console.log('Waiting for session to propagate...')
      await new Promise(resolve => setTimeout(resolve, 500))

      console.log('User session reloaded, redirecting to:', role === 'admin' ? '/admin?role-set=true' : '/chat?role-set=true')

      // Force a full page reload to ensure middleware picks up new role
      // Add query param to bypass middleware role check on first load
      const redirectUrl = role === 'admin' ? '/admin?role-set=true' : '/chat?role-set=true'
      console.log('Calling window.location.replace with:', redirectUrl)
      window.location.replace(redirectUrl)
      console.log('Redirect called')
    } catch (error) {
      console.error('Error setting role:', error)
      alert('Failed to set role. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-semibold text-center mb-8 text-gray-900">Log in as...</h1>

        <div className="space-y-4">
          {/* User Option */}
          <button
            onClick={() => selectRole('user')}
            disabled={loading}
            className="w-full bg-white border-2 border-gray-300 rounded-2xl p-6 hover:border-[#E8E4F3] hover:bg-[#E8E4F3]/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#E8E4F3] rounded-full flex items-center justify-center flex-shrink-0">
                <User size={28} className="text-gray-900" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg text-gray-900">User</h3>
                <p className="text-sm text-gray-700">AI Chat Feature</p>
              </div>
            </div>
          </button>

          {/* Admin Option */}
          <button
            onClick={() => selectRole('admin')}
            disabled={loading}
            className="w-full bg-white border-2 border-gray-300 rounded-2xl p-6 hover:border-[#E8E4F3] hover:bg-[#E8E4F3]/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#E8E4F3] rounded-full flex items-center justify-center flex-shrink-0">
                <Shield size={28} className="text-gray-900" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg text-gray-900">Admin</h3>
                <p className="text-sm text-gray-700">Management Settings</p>
              </div>
            </div>
          </button>
        </div>

        {/* Back Button */}
        <button
          onClick={() => signOut(() => router.push('/'))}
          className="mt-8 flex items-center justify-center gap-2 text-gray-700 hover:text-gray-900 transition mx-auto"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      </div>
    </div>
  )
}