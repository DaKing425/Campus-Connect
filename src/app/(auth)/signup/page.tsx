'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/hooks/useAuth'
import { uwEmailSchema, displayNameSchema } from '@/lib/utils/validation'
import { Mail, User, ArrowLeft } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [consentPersonalization, setConsentPersonalization] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const { signInWithEmail } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    // Validate inputs
    const emailValidation = uwEmailSchema.safeParse(email)
    const nameValidation = displayNameSchema.safeParse(displayName)

    if (!emailValidation.success) {
      setError('Please enter a valid UW email address (@uw.edu)')
      setLoading(false)
      return
    }

    if (!nameValidation.success) {
      setError('Please enter a valid display name (2-50 characters)')
      setLoading(false)
      return
    }

    try {
      const result = await signInWithEmail(email)
      if (result.success) {
        setMessage('Check your email for the magic link to complete your account setup!')
      } else {
        setError(result.error || 'Failed to send magic link')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 bg-husky-purple rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">CC</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Join CampusConnect
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Connect with your campus community
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Get started with your UW email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">UW Email Address</Label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="yourname@uw.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <div className="mt-1 relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="consent"
                    checked={consentPersonalization}
                    onCheckedChange={(checked) => setConsentPersonalization(checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="consent"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Enable personalized recommendations
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Allow CampusConnect to use your activity to suggest relevant events and clubs. You can change this later.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full uw"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {message && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">{message}</p>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-husky-purple hover:underline">
                <ArrowLeft className="inline h-4 w-4 mr-1" />
                Back to home
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-husky-purple hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
