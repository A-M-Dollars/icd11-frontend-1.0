import React from 'react'
import Firstsection from '../leftpart/firstsection'
import Secondsection from '../leftpart/secondsection'

const LeftPart = () => {
    return (
        <div>
            <div className='firstsection p-2'>
                <Firstsection />
            </div>
            <hr className='mt-2 border-gray-600' />
            <div className='secondsection p-2'>
                <Secondsection />
            </div>
        </div>
    )
}

export default LeftPart