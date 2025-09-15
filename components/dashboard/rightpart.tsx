import React from 'react'
import Rightfirstsection from '../rightpart/firstsection'
import Rightsecondsection from '../rightpart/secondsection'

const RightPart = () => {
    return (
        <div>
            {/* <div className='firstsection p-2'>
                <Rightfirstsection />
            </div>
            <hr className='mt-2 border-gray-600' /> */}
            <div className='secondsection p-2'>
                <Rightsecondsection />
            </div>
        </div>
    )
}

export default RightPart