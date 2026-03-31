'use client'

import React, { useState } from 'react'

const NewsletterForm = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (data.success) {
        alert('Thanks for subscribing!')
        setEmail('')
      } else {
        alert(data.message || 'Something went wrong')
      }
    } catch {
      alert('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='newsletter-form flex rounded-lg sm:w-full w-3/4 sm:mx-0 mx-auto'>
      <input
        type='email'
        name='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder='Email*'
        required
        autoComplete='email'
        className='p-4 text-base border-transparent rounded-s-lg rounded-e-none! outline-0 focus:border-primary dark:focus:border-primary w-[calc(100%_-_137px)] flex bg-white dark:bg-midnight_text dark:text-white dark:border-solid dark:border dark:border-border_color'
      />
      <button
        type='submit'
        disabled={loading}
        className='p-[0.625rem] text-base font-medium bg-primary text-white border-none cursor-pointer rounded-e-lg outline-0 text-center w-[8.5625rem] hover:bg-blue-700 hover:shadow-none disabled:opacity-60 disabled:cursor-not-allowed'>
        {loading ? 'Submitting...' : 'Subscribe'}
      </button>
    </form>
  )
}

export default NewsletterForm
