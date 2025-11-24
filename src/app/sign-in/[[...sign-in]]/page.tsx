'use client'

import { SignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-semibold text-center mb-8 text-gray-900">Log in</h1>
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "bg-white border-2 border-gray-300 hover:bg-[#E8E4F3]/20 hover:border-[#E8E4F3] text-gray-900 font-medium rounded-xl",
              formButtonPrimary: "bg-[#E8E4F3] hover:bg-[#d8d0ed] text-gray-900 font-medium rounded-xl",
              formFieldInput: "border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-[#E8E4F3] focus:ring-[#E8E4F3]",
              footerActionLink: "text-gray-900 hover:text-gray-700 font-medium underline",
              dividerLine: "bg-gray-300",
              dividerText: "text-gray-600",
            },
          }}
          redirectUrl="/select-role"
          signUpUrl="/sign-up"
          forceRedirectUrl="/select-role"
        />

        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="mt-8 flex items-center justify-center gap-2 text-gray-700 hover:text-gray-900 transition mx-auto cursor-pointer"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      </div>
    </div>
  )
}