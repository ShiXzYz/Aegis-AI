import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-900 mb-4">Aegis AI</h1>
        <p className="text-xl text-gray-700 mb-8">Smart AI routing for secure conversations</p>
        
        <SignedOut>
          <div className="space-x-4">
            <SignInButton mode="modal">
              <button className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-white text-primary-600 px-8 py-3 rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </SignedOut>
        
        <SignedIn>
          <Link
            href="/chat"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition"
          >
            Go to Chat
          </Link>
        </SignedIn>
      </div>
    </div>
  )
}