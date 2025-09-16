'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { Magic } from 'magic-sdk'

export default function LoginPage() {
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setIsLoading(true)
    setErrorMsg('')

    const formData = new FormData(event.target as HTMLFormElement)
    const email = formData.get('email') as string

    if (!email) {
      setErrorMsg('Email is required.')
      setIsLoading(false)
      return
    }

    try {
      const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY!)
      const didToken = await magic.auth.loginWithMagicLink({ email })

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + didToken,
        },
      })

      if (res.status === 200) {
        router.push('/buyers')
      } else {
        throw new Error(await res.text())
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error)
      setErrorMsg((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    // Centering container
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      {/* Form card */}
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email to receive a magic link.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending Link...' : 'Send Magic Link'}
            </button>
          </div>
        </form>

        {errorMsg && <p className="mt-4 text-center text-sm text-red-600">{errorMsg}</p>}
      </div>
    </div>
  )
}