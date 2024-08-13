import React from 'react'
import { MdKeyboardArrowLeft } from "react-icons/md";
import { MdKeyboardArrowRight } from "react-icons/md";

function Pagination({pages, crrPage, setCrrPage}) {

    const handleLeftArrowClick = ()=>{
        if(crrPage !== 1)
            setCrrPage(prev => prev-=1)
    }
    const handleRightArrowClick = ()=>{
        if(crrPage !== pages)
            setCrrPage(prev => prev+=1)
    }

  return (
    <div className="pagination">
        <button className="leftArrow" disabled={crrPage===1} onClick={handleLeftArrowClick}>
            <MdKeyboardArrowLeft className='arrowIcon'/>
        </button>
        {[...Array(pages)].map((_, index) => (
            <button
                key={index}
                className={`pageBtn ${crrPage === index + 1 ? 'active' : ''}`}
                onClick={() => setCrrPage(index + 1)}
            >
                {(index+1)<10? "0"+(index + 1):(index + 1)}
            </button>
        ))}
        <button className="rightArrow" disabled={crrPage===pages} onClick={handleRightArrowClick}>
            <MdKeyboardArrowRight className='arrowIcon'/>
        </button>
    </div>
  )
}

export default Pagination