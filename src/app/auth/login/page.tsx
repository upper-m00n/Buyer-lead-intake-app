'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { Magic } from 'magic-sdk'

export default function LoginPage() {
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setErrorMsg('')

    const formData = new FormData(event.target as HTMLFormElement)
    const email = formData.get('email') as string

    if (!email) {
      setErrorMsg('Email is required.')
      return
    }

    try {
      // 1. Initialize Magic client-side
      const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY!)

      // 2. Trigger the magic link email
      const didToken = await magic.auth.loginWithMagicLink({ email })

      // 3. Send the token to our own server to create a session
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + didToken,
        },
      })

      if (res.status === 200) {
        // 4. Redirect to the buyers page on success
        router.push('/buyers')
      } else {
        throw new Error(await res.text())
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error)
      setErrorMsg((error as Error).message)
    }
  }

  return (
    <div>
      <h1>Sign In</h1>
      <p>Enter your email to receive a magic link.</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input name="email" type="email" required />
        <button type="submit">Send Magic Link</button>
      </form>
      {errorMsg && <p>{errorMsg}</p>}
    </div>
  )
}