import React from 'react'
import { IoIosCloseCircleOutline } from "react-icons/io";

function RequestDetails({showDetailsModel, setShowDetailsModel}) {
  return (
    <div className="requestDetailsModelDiv popupDiv">
                <div className="requestDetailsModelContent popupContent">
                    <div>
                        <strong>Title</strong>
                        <p>{showDetailsModel.title}</p>
                    </div>
                    <div className="horizontalLine"></div>
                    <div>
                        <strong>Description</strong>
                        <p>{showDetailsModel.description}</p>
                    </div>
                    <div className="horizontalLine"></div>
                    <div>
                        <strong>Category - </strong>
                        <span className='categorySpan'>{showDetailsModel.category}</span>
                    </div>
                    <div className="horizontalLine"></div>
                    <div>
                        <strong>Budget - </strong>
                        <span>${showDetailsModel.budget}</span>
                    </div>
                    <div className="horizontalLine"></div>
                    <div>
                        <strong>Duration - </strong>
                        <span>{showDetailsModel.duration} days</span>
                    </div>
                    <div className="horizontalLine"></div>
                    <div>
                        <strong>Posted At - </strong>
                        <span>{new Date(showDetailsModel.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="horizontalLine"></div>
                    <div>
                        <strong>Expiring At - </strong>
                        <span>{new Date(showDetailsModel.expiryDate).toLocaleDateString()}</span>
                    </div>
                    <div className="buttonsDiv">
                        <button className='secondaryBtn' onClick={()=>setShowDetailsModel(null)}>Close</button>
                    </div>  
                </div>
                <div className="popupCloseBtn">
                    <IoIosCloseCircleOutline className='icon' onClick={() => setShowDetailsModel(null)} />
                </div>
            </div>
  )
}

export default RequestDetails