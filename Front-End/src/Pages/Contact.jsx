import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-10 text-gray-500'>
        <p>CONTACT <span className='text-gray-700 font-semibold'>US</span></p>
      </div>
    <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 text-sm'>
<img className='w-full md:max-w-[360px]' src={assets.contact_image} alt="" />
<div className='flex flex-col justify-center items-start gap-6'>
  <p className='font-semibold text-lg text-gray-600'>OUR OFFICE</p>
  <p className='text-gray-500'>388,KHAWAJ BAKHSH NEAR MUSLIM FUND <br /> DEOBAND, SRE, INDIA</p>
  <p className='text-gray-500'>Tel: +91 6397648153 <br />
    Email: m.sameeranjumsiddiqui@gmail.com
  </p>
  <p className='font-semibold text-lg text-gray-600'>Learn more about me and my work at my Linkedin</p>
<p className='text-gray-500'>Github Profile: <a href="https://github.com/samanjum" class="text-[15px] text-primary hover:text-blue-700 underline font-semibold"> Click Here</a> </p>
<a href="https://www.linkedin.com/in/sameer-anjum-1551b2208/?originalSubdomain=in">
<button  className='border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500'>My Linkedin</button>
</a>
 
</div>
    </div>

    </div>
  )
}

export default Contact
