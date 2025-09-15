import React from 'react'
import Firstsection from '../middlepart/firstsection'
import Secondsection from '../middlepart/secondsection'

const MiddlePart = () => {
    return (
        <div className='relative h-full'>
            <div className='secondsection p-2'>
                <Secondsection />
            </div>
            <div className='absolute bottom-0 left-0 right-0'>
                <hr className='border-gray-600' />
                <div className='firstsection p-2'>
                    <Firstsection />
                </div>
            </div>
        </div>
    )
}

export default MiddlePart