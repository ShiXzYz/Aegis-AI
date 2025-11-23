import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md px-8">
        <h1 className="text-3xl font-semibold text-center mb-8">Sign up</h1>
        <SignUp
          forceRedirectUrl="/chat"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700",
              formButtonPrimary: "bg-[#E8E4F3] hover:bg-[#d8d0ed] text-gray-900 font-medium",
              formFieldInput: "border border-gray-300 rounded-lg px-4 py-3",
              footerActionLink: "text-primary-600 hover:text-primary-700",
            },
          }}
          signInUrl="/sign-in"
          initialValues={{
            strategy: 'oauth_google',
          }}
        />
      </div>
    </div>
  )
}