import React from 'react'
import { IoIosCloseCircleOutline } from "react-icons/io";

function RestrictedPopup({onClosePopup}) {
    return <div className="restrictedModelDiv popupDiv">
        <div className="restrictedModelContent popupContent">

            <div>Please Login to access this Page!</div>
            
            <div className="buttonsDiv">
                <button className='secondaryBtn' onClick={onClosePopup}>Close</button>
            </div>
        </div>

        <div className="popupCloseBtn">
            <IoIosCloseCircleOutline className='icon' onClick={onClosePopup} />
        </div>

    </div>
}

export default RestrictedPopup