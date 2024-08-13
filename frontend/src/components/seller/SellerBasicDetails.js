import React from 'react'
import { Link } from 'react-router-dom'
import { FaStar } from "react-icons/fa";

function SellerBasicDetails({sellerDetails}) {

    const date = new Date(sellerDetails.createdAt);
    const monthName = date.toLocaleString('default', { month: 'long' });
    const joined = `${monthName}, ${date.getFullYear()}`;

  return (
    <div className='sellerBasicDetailsDiv'>
        <section className="section">
            <div className="sellerBasicDetailsContent">

                <div className="profileImageDiv">
                    <img src={`http://localhost:5000/${sellerDetails.profileImage}`} alt="Error" />
                </div>

                <div className="upper">
                    <div className="upperLeft">
                        <h2 className="secondaryHeading">{sellerDetails.displayName}</h2>
                        <p>@{sellerDetails.userId.username}</p>
                        <p><FaStar className='starIconFilled' /> <span>{sellerDetails.rating + " (" + sellerDetails.noOfReviews + ")"}</span> </p>
                        <Link to={`/profile/${sellerDetails._id}`} className="primaryBtn2 previewProfileBtn">Preview Profile</Link>
                        <Link to="/settings" className="primaryBtn">Edit Profile</Link>
                    </div>
                    <div className="verticalLine"></div>
                    <div className="upperRight">
                        <div><p>Seller Type</p><strong>{sellerDetails.sellerType}</strong></div>
                        <div className="horizontalLine"></div>
                        <div><p>From</p><strong>{sellerDetails.country}</strong></div>
                        <div><p>Joined</p><strong>{joined}</strong></div>
                        <div><p>Earned in April</p><strong>$2000</strong></div>
                        <div className="horizontalLine"></div>
                        <div><p>Languages</p><strong>{sellerDetails.languages.join(", ")}</strong></div>
                    </div>
                </div>

                <div className="horizontalLine"></div>

                <div className="lower">
                    <h2 className="primaryHeading">About <span>Me</span></h2>
                    <p>{sellerDetails.description}</p>
                </div>

            </div>
        </section>
    </div>
  )
}

export default SellerBasicDetails