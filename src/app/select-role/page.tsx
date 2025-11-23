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
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-semibold text-center mb-12 text-gray-900">Choose your role</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Option */}
          <button
            onClick={() => selectRole('user')}
            disabled={loading}
            className="group relative bg-white border-2 border-gray-200 rounded-3xl p-8 hover:border-[#E8E4F3] hover:bg-[#E8E4F3]/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-[#E8E4F3] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <User size={36} className="text-gray-700" />
              </div>
              <div>
                <h3 className="font-semibold text-2xl text-gray-900 mb-2">User</h3>
                <p className="text-sm text-gray-600">Access AI chat features and conversations</p>
              </div>
            </div>
          </button>

          {/* Admin Option */}
          <button
            onClick={() => selectRole('admin')}
            disabled={loading}
            className="group relative bg-white border-2 border-gray-200 rounded-3xl p-8 hover:border-[#E8E4F3] hover:bg-[#E8E4F3]/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-[#E8E4F3] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield size={36} className="text-gray-700" />
              </div>
              <div>
                <h3 className="font-semibold text-2xl text-gray-900 mb-2">Admin</h3>
                <p className="text-sm text-gray-600">Manage settings and user permissions</p>
              </div>
            </div>
          </button>
        </div>

        {/* Back Button */}
        <button
          onClick={() => signOut(() => router.push('/'))}
          className="mt-12 flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 transition mx-auto"
        >
          <ArrowLeft size={20} />
          <span>Back to home</span>
        </button>
      </div>
    </div>
  )
}