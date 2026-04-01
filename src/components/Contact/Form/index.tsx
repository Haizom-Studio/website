'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { getImgPath } from '@/utils/image'

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  service: '',
  specialist: '',
  date: '',
  time: '',
}

export type ContactFormVariant = 'page' | 'home'

type ContactFormProps = {
  variant?: ContactFormVariant
}

const ContactForm = ({ variant = 'page' }: ContactFormProps) => {
  const [form, setForm] = useState(initialForm)

  const [loading, setLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (data.success) {
        alert('Appointment submitted successfully!')
        setForm(initialForm)
      } else {
        alert(data.message || 'Something went wrong')
      }
    } catch {
      alert('Network error')
    } finally {
      setLoading(false)
    }
  }

  const idPrefix = variant === 'home' ? 'home' : 'contact'

  const formEl = (
    <form
      onSubmit={handleSubmit}
      className={
        variant === 'home'
          ? 'flex flex-wrap w-full m-auto justify-between gap-4'
          : 'flex flex-wrap w-full m-auto justify-between'
      }>
      <div className={variant === 'home' ? 'flex gap-4 w-full' : 'sm:flex gap-3 w-full'}>
        <div
          className={
            variant === 'home'
              ? 'flex-1 min-w-0'
              : 'mx-0 my-2.5 flex-1'
          }>
          <label
            htmlFor={`${idPrefix}-first-name`}
            className='pb-3 inline-block text-base text-midnight_text dark:text-white'>
            First Name*
          </label>
          <input
            id={`${idPrefix}-first-name`}
            name='firstName'
            value={form.firstName}
            onChange={handleChange}
            className={
              variant === 'home'
                ? 'text-midnight_text w-full text-base transition-[0.5s] bg-transparent dark:border-dark_border dark:text-white px-[0.9375rem] py-[0.830rem] border border-border border-solid focus:border-primary dark:focus:border-primary rounded-lg focus-visible:outline-0'
                : 'w-full text-base px-4 rounded-lg py-2.5 border-border dark:border-dark_border border-solid dark:text-white  dark:bg-darkmode border transition-all duration-500 focus:border-primary dark:focus:border-primary focus:border-solid focus:outline-0'
            }
            type='text'
            required
            autoComplete='given-name'
          />
        </div>
        <div
          className={
            variant === 'home'
              ? 'flex-1 min-w-0'
              : 'mx-0 my-2.5 flex-1'
          }>
          <label
            htmlFor={`${idPrefix}-last-name`}
            className='pb-3 inline-block text-base text-midnight_text dark:text-white'>
            Last Name*
          </label>
          <input
            id={`${idPrefix}-last-name`}
            name='lastName'
            value={form.lastName}
            onChange={handleChange}
            className={
              variant === 'home'
                ? 'text-midnight_text w-full text-base transition-[0.5s] bg-transparent dark:border-dark_border dark:text-white px-[0.9375rem] py-[0.830rem] border border-border border-solid focus:border-primary dark:focus:border-primary rounded-lg focus-visible:outline-0'
                : 'w-full text-base px-4 py-2.5 rounded-lg border-border dark:border-dark_border border-solid dark:text-white  dark:bg-darkmode border transition-all duration-500 focus:border-primary dark:focus:border-primary focus:border-solid focus:outline-0'
            }
            type='text'
            autoComplete='family-name'
          />
        </div>
      </div>
      <div className={variant === 'home' ? 'flex flex-col sm:flex-row gap-4 w-full' : 'sm:flex gap-3 w-full'}>
        <div
          className={
            variant === 'home'
              ? 'w-full sm:flex-1'
              : 'mx-0 my-2.5 flex-1'
          }>
          <label
            htmlFor={`${idPrefix}-email`}
            className='pb-3 inline-block text-base text-midnight_text dark:text-white'>
            Email address*
          </label>
          <input
            id={`${idPrefix}-email`}
            name='email'
            type='email'
            value={form.email}
            onChange={handleChange}
            className={
              variant === 'home'
                ? 'text-midnight_text w-full text-base transition-[0.5s] bg-transparent dark:border-dark_border dark:text-white px-[0.9375rem] py-[0.830rem] border border-border border-solid focus:border-primary dark:focus:border-primary rounded-lg focus-visible:outline-0'
                : 'w-full text-base px-4 py-2.5 rounded-lg border-border dark:border-dark_border border-solid dark:text-white  dark:bg-darkmode border transition-all duration-500 focus:border-primary dark:focus:border-primary focus:border-solid focus:outline-0'
            }
            required
            autoComplete='email'
          />
        </div>
        <div
          className={
            variant === 'home'
              ? 'w-full sm:flex-1'
              : 'mx-0 my-2.5 flex-1'
          }>
          <label
            htmlFor={`${idPrefix}-service`}
            className='pb-3 inline-block text-base text-midnight_text dark:text-white'>
            Service*
          </label>
          <select
            id={`${idPrefix}-service`}
            name='service'
            value={form.service}
            onChange={handleChange}
            required
            className={
              variant === 'home'
                ? 'text-midnight_text w-full h-11 text-base transition-[0.5s] bg-transparent dark:border-dark_border dark:text-white px-[0.9375rem] py-2 border border-border border-solid focus:border-primary dark:focus:border-primary rounded-lg focus-visible:outline-0'
                : 'w-full h-11 text-base px-4 py-2.5 rounded-lg border-border dark:text-white border-solid dark:bg-darkmode border transition-all duration-500 focus:border-primary dark:focus:border-primary dark:border-dark_border focus:border-solid focus:outline-0'
            }>
            <option value=''>Select Service</option>
            <option value='schematic-pcb'>Schematic capture & PCB design</option>
            <option value='prototyping'>Prototyping & bring-up</option>
            <option value='web'>Web development</option>
            <option value='app'>App development</option>
            <option value='ui-ux-dashboards'>UI/UX & dashboards</option>
            <option value='firmware-sensors'>Firmware & sensor fusion</option>
          </select>
        </div>
      </div>
      <div className={variant === 'home' ? 'w-full' : 'mx-0 my-2.5 w-full'}>
        <label
          htmlFor={`${idPrefix}-specialist`}
          className='pb-3 inline-block text-base text-midnight_text dark:text-white'>
          Specialist
        </label>
        <select
          id={`${idPrefix}-specialist`}
          name='specialist'
          value={form.specialist}
          onChange={handleChange}
          className={
            variant === 'home'
              ? 'text-midnight_text w-full h-11 text-base transition-[0.5s] bg-transparent dark:border-dark_border dark:text-white px-[0.9375rem] py-2 border border-border border-solid focus:border-primary dark:focus:border-primary rounded-lg focus-visible:outline-0'
              : 'w-full h-11 text-base px-4 py-2.5 rounded-lg border-border dark:text-white border-solid dark:bg-darkmode border transition-all duration-500 focus:border-primary dark:focus:border-primary dark:border-dark_border focus:border-solid focus:outline-0'
          }>
          <option value=''>Choose a specialist</option>
          <option value='embedded'>Embedded Designer</option>
          <option value='full-stack'>Full Stack Developer</option>
          <option value='firmware'>Firmware Engineer</option>
        </select>
      </div>
      <div className={variant === 'home' ? 'flex flex-col sm:flex-row gap-4 w-full' : 'sm:flex gap-3 w-full'}>
        <div
          className={
            variant === 'home'
              ? 'w-full sm:flex-1'
              : 'mx-0 my-2.5 flex-1'
          }>
          <label
            htmlFor={`${idPrefix}-date`}
            className='pb-3 inline-block text-base text-midnight_text dark:text-white'>
            Date*
          </label>
          <input
            id={`${idPrefix}-date`}
            name='date'
            type='date'
            value={form.date}
            onChange={handleChange}
            className={
              variant === 'home'
                ? 'text-midnight_text w-full text-base transition-[0.5s] bg-transparent dark:border-dark_border dark:text-white px-[0.9375rem] py-[0.830rem] border border-border border-solid focus:border-primary dark:focus:border-primary rounded-lg focus-visible:outline-0'
                : 'w-full text-base px-4 rounded-lg  py-2.5 outline-hidden dark:text-white dark:bg-darkmode border-border border-solid border transition-all duration-500 focus:border-primary dark:focus:border-primary dark:border-dark_border focus:border-solid focus:outline-0'
            }
            required
          />
        </div>
        <div
          className={
            variant === 'home'
              ? 'w-full sm:flex-1'
              : 'mx-0 my-2.5 flex-1'
          }>
          <label
            htmlFor={`${idPrefix}-time`}
            className='pb-3 inline-block text-base text-midnight_text dark:text-white'>
            Time*
          </label>
          <input
            id={`${idPrefix}-time`}
            name='time'
            type='time'
            value={form.time}
            onChange={handleChange}
            className={
              variant === 'home'
                ? 'text-midnight_text w-full text-base transition-[0.5s] bg-transparent dark:border-dark_border dark:text-white px-[0.9375rem] py-[0.830rem] border border-border border-solid focus:border-primary dark:focus:border-primary rounded-lg focus-visible:outline-0'
                : 'w-full text-base px-4 rounded-lg py-2.5 border-border outline-hidden dark:text-white dark:bg-darkmode border-solid border transition-all duration-500 focus:border-primary dark:focus:border-primary dark:border-dark_border focus:border-solid focus:outline-0'
            }
            required
          />
        </div>
      </div>
      <div className={variant === 'home' ? 'w-full' : 'mx-0 my-2.5 w-full'}>
        <button
          type='submit'
          disabled={loading}
          className={
            variant === 'home'
              ? 'w-full bg-primary hover:bg-blue-700 text-white py-3 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed'
              : 'bg-primary rounded-lg text-white py-4 px-8 mt-4 inline-block hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed'
          }>
          {loading ? 'Submitting...' : 'Make an appointment'}
        </button>
      </div>
    </form>
  )

  if (variant === 'home') {
    return formEl
  }

  return (
    <>
      <section className='dark:bg-darkmode md:pb-24 pb-16'>
        <div className='container mx-auto max-w-6xl px-4'>
          <div className='grid md:grid-cols-12 grid-cols-1 gap-8'>
            <div className='col-span-6'>
              <h2 className='max-w-72 text-[40px] leading-tight font-bold mb-9 text-midnight_text dark:text-white'>
                Get Online Consultation
              </h2>
              {formEl}
            </div>
            <div className='col-span-6'>
              <Image
                src={getImgPath('/images/contact-page/contact.jpg')}
                alt='Contact'
                width={1300}
                height={0}
                quality={100}
                style={{ width: '100%', height: 'auto' }}
                className='bg-no-repeat bg-contain'
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default ContactForm
