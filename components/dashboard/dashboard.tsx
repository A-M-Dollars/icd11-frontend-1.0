import React from 'react'
import LeftPart from './leftpart'
import MiddlePart from './middlepart'
import RightPart from './rightpart'

const Dashboard = () => {
    return (
        <div className='grid grid-cols-7 divide-x-1 divide-gray-600 overflow-x-hidden h-screen text-[#ededed]'>
            <div className='col-span-1 h-full bg-[#3F3B3B]'>
                <LeftPart />
            </div>
            <div className='col-span-4 h-full bg-[#1A1A1A]'>
                <MiddlePart />
            </div>
            <div className='col-span-2 h-full bg-[#3F3B3B]'>
                <RightPart />
            </div>
        </div>
    )
}

export default Dashboard