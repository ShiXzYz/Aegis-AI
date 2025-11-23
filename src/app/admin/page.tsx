import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/logs">
            <div className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">Event Logs</h3>
              <p className="text-gray-600">View all user queries and AI responses</p>
            </div>
          </Link>

          <Link href="/admin/users">
            <div className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">User Management</h3>
              <p className="text-gray-600">Manage users and groups</p>
            </div>
          </Link>

          <Link href="/admin/rules">
            <div className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">Rules Configuration</h3>
              <p className="text-gray-600">Configure AI routing rules</p>
            </div>
          </Link>

          <Link href="/admin/groups">
            <div className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">Groups</h3>
              <p className="text-gray-600">Manage user groups</p>
            </div>
          </Link>

          <Link href="/chat">
            <div className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">Chat Interface</h3>
              <p className="text-gray-600">Access the AI chat</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}