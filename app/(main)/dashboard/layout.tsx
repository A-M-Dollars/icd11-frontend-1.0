import LeftPart from '@/components/dashboard/leftpart'
import RightPart from '@/components/dashboard/rightpart'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div>
            <div className='grid grid-cols-7 divide-x-1 divide-gray-600 overflow-x-hidden h-screen text-[#ededed]'>
                <div className='col-span-1 h-full bg-[#3F3B3B]'>
                    <LeftPart />
                </div>
                {/* col-span-4 when the rightpart is added back */}
                <div className='col-span-6 h-full bg-[#1A1A1A]'>
                    {children}
                </div>
                {/* <div className='col-span-2 h-full bg-[#3F3B3B]'>
                    <RightPart />
                </div> */}
            </div>
        </div>
    )
}

export default layout