import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'

export default async function Home() {
  const { userId } = await auth()
  
  if (userId) {
    redirect('/chat')
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-7xl font-bold text-gray-900 mb-4">Aegis AI</h1>
        <p className="text-xl text-gray-600 mb-12">
          Smart AI routing for secure conversations
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link href="/sign-in">
            <button className="bg-transparent text-gray-900 border-2 border-gray-300 px-8 py-3 rounded-xl hover:bg-gray-50 transition font-medium">
              Sign In
            </button>
          </Link>
          <Link href="/sign-up">
            <button className="bg-[#E8E4F3] text-gray-900 px-8 py-3 rounded-xl hover:bg-[#d8d0ed] transition font-medium">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}