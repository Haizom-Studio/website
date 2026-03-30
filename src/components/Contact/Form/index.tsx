// import React from 'react'
// import Link from 'next/link'
// import Image from 'next/image'
// import { getImgPath } from '@/utils/image'

// const ContactForm = () => {
//   return (
//     <>
//       <section className='dark:bg-darkmode md:pb-24 pb-16'>
//         <div className='container mx-auto max-w-6xl px-4'>
//           <div className='grid md:grid-cols-12 grid-cols-1 gap-8'>
//             <div className='col-span-6'>
//               <h2 className='max-w-72 text-[40px] leading-tight font-bold mb-9 text-midnight_text dark:text-white'>
//                 Get Online Consultation
//               </h2>
//               <form className='flex flex-wrap w-full m-auto justify-between'>
//                 <div className='sm:flex gap-3 w-full'>
//                   <div className='mx-0 my-2.5 flex-1'>
//                     <label
//                       htmlFor='first-name'
//                       className='pb-3 inline-block text-base'>
//                       First Name*
//                     </label>
//                     <input
//                       className='w-full text-base px-4 rounded-lg py-2.5 border-border dark:border-dark_border border-solid dark:text-white  dark:bg-darkmode border transition-all duration-500 focus:border-primary dark:focus:border-primary focus:border-solid focus:outline-0'
//                       type='text'
//                     />
//                   </div>
//                   <div className='mx-0 my-2.5 flex-1'>
//                     <label
//                       htmlFor='last-name'
//                       className='pb-3 inline-block text-base'>
//                       Last Name*
//                     </label>
//                     <input
//                       className='w-full text-base px-4 py-2.5 rounded-lg border-border dark:border-dark_border border-solid dark:text-white  dark:bg-darkmode border transition-all duration-500 focus:border-primary dark:focus:border-primary focus:border-solid focus:outline-0'
//                       type='text'
//                     />
//                   </div>
//                 </div>
//                 <div className='sm:flex gap-3 w-full'>
//                   <div className='mx-0 my-2.5 flex-1'>
//                     <label
//                       htmlFor='email'
//                       className='pb-3 inline-block text-base'>
//                       Email address*
//                     </label>
//                     <input
//                       type='email'
//                       className='w-full text-base px-4 py-2.5 rounded-lg border-border dark:border-dark_border border-solid dark:text-white  dark:bg-darkmode border transition-all duration-500 focus:border-primary dark:focus:border-primary focus:border-solid focus:outline-0'
//                     />
//                   </div>
//                   <div className='mx-0 my-2.5 flex-1'>
//                     <label
//                       htmlFor='Specialist'
//                       className='pb-3 inline-block text-base'>
//                       Specialist*
//                     </label>
//                     <select className='w-full h-11 text-base px-4 py-2.5 rounded-lg border-border dark:text-white border-solid dark:bg-darkmode border transition-all duration-500 focus:border-primary dark:focus:border-primary dark:border-dark_border focus:border-solid focus:outline-0'>
//                       <option value=''>Choose a specialist</option>
//                       <option value='embedded'>Embedded Designer</option>
//                       <option value='full-stack'>Full Stack Developer</option>
//                       <option value='firmware'>Firmware Engineer</option>
//                     </select>
//                   </div>
//                 </div>
//                 <div className='sm:flex gap-3 w-full'>
//                   <div className='mx-0 my-2.5 flex-1'>
//                     <label
//                       htmlFor='date'
//                       className='pb-3 inline-block text-base'>
//                       Date*
//                     </label>
//                     <input
//                       className='w-full text-base px-4 rounded-lg  py-2.5 outline-hidden dark:text-white dark:bg-darkmode border-border border-solid border transition-all duration-500 focus:border-primary dark:focus:border-primary dark:border-dark_border focus:border-solid focus:outline-0'
//                       type='date'
//                     />
//                   </div>
//                   <div className='mx-0 my-2.5 flex-1'>
//                     <label
//                       htmlFor='time'
//                       className='pb-3 inline-block text-base'>
//                       Time*
//                     </label>
//                     <input
//                       className='w-full text-base px-4 rounded-lg py-2.5 border-border outline-hidden dark:text-white dark:bg-darkmode border-solid border transition-all duration-500 focus:border-primary dark:focus:border-primary dark:border-dark_border focus:border-solid focus:outline-0'
//                       type='time'
//                     />
//                   </div>
//                 </div>
//                 <div className='mx-0 my-2.5 w-full'>
//                   <Link
//                     href='#'
//                     className='bg-primary rounded-lg text-white py-4 px-8 mt-4 inline-block hover:bg-blue-700'
//                     type='submit'>
//                     Make an appointment
//                   </Link>
//                 </div>
//               </form>
//             </div>
//             <div className='col-span-6'>
//               <Image
//                 src={getImgPath('/images/contact-page/contact.jpg')}
//                 alt='Contact'
//                 width={1300}
//                 height={0}
//                 quality={100}
//                 style={{ width: '100%', height: 'auto' }}
//                 className='bg-no-repeat bg-contain'
//               />
//             </div>
//           </div>
//         </div>
//       </section>
//     </>
//   )
// }

// export default ContactForm


'use client';

import React, { useState } from 'react';

const ContactForm = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    service: '',
    specialist: '',
    date: '',
    time: '',
  });

  const [loading, setLoading] = useState(false);

  // ✅ FIXED TYPE
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ FIXED TYPE
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        alert('Appointment submitted successfully!');
        setForm({
          firstName: '',
          lastName: '',
          email: '',
          service: '',
          specialist: '',
          date: '',
          time: '',
        });
      } else {
        alert(data.message || 'Something went wrong');
      }
    } catch (err) {
      alert('Network error');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* First Name */}
      <input
        name="firstName"
        value={form.firstName}
        onChange={handleChange}
        placeholder="First Name"
        required
      />

      {/* Last Name */}
      <input
        name="lastName"
        value={form.lastName}
        onChange={handleChange}
        placeholder="Last Name"
      />

      {/* Email */}
      <input
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        required
      />

      {/* Service */}
      <select
        name="service"
        value={form.service}
        onChange={handleChange}
        required
      >
        <option value="">Select Service</option>
        <option value="web">Web Development</option>
        <option value="mobile">Mobile App Development</option>
        <option value="embedded">Embedded Systems</option>
        <option value="firmware">Firmware Development</option>
        <option value="uiux">UI/UX Design</option>
      </select>

      {/* Specialist */}
      <select
        name="specialist"
        value={form.specialist}
        onChange={handleChange}
      >
        <option value="">Choose Specialist</option>
        <option value="embedded">Embedded Designer</option>
        <option value="full-stack">Full Stack Developer</option>
        <option value="firmware">Firmware Engineer</option>
      </select>

      {/* Date */}
      <input
        name="date"
        type="date"
        value={form.date}
        onChange={handleChange}
        required
      />

      {/* Time */}
      <input
        name="time"
        type="time"
        value={form.time}
        onChange={handleChange}
        required
      />

      {/* Submit */}
      <button type="submit">
        {loading ? 'Submitting...' : 'Make an appointment'}
      </button>

    </form>
  );
};

export default ContactForm;