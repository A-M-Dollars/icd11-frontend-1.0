import Link from 'next/link'
import React from 'react'
import { ourGifts } from '@/public/svgs/svgs'


const Rightsecondsection = () => {
  return (
    <div className=''>
      <div className='pb-2'>
        <p className='flex gap-2 place-items-center'>
          {ourGifts} ICD-11 Information on Diagnosis
        </p>
      </div>
      <div>
        <p>
          ICD11 info goes here
        </p>
      </div>
    </div>
  )
}

export default Rightsecondsection