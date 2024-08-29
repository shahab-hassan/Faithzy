import React from 'react'
import { FaRegCircleCheck } from "react-icons/fa6";
import { IoCloseCircleOutline } from "react-icons/io5";

function Upgrade() {
    return (
        <div className='upgradeDiv'>
            <section className="section">
                <div className="upgradeContent">

                    <h1 className="primaryHeading"><span>UPGRADE</span> YOUR ACCOUNT</h1>

                    <div className="timeLine">
                        <div>
                            <input type="radio" id="3months" name='planTimeline' checked />
                            <label htmlFor="3months">3 Months</label>
                        </div>
                        <div>
                            <input type="radio" id="6months" name='planTimeline' />
                            <label htmlFor="6months">6 Months</label>
                        </div>
                        <div>
                            <input type="radio" id="9months" name='planTimeline' />
                            <label htmlFor="9months">9 Months</label>
                        </div>
                    </div>

                    <div className="plans">
                        <div className="freePlan plan">
                            <h2 className="secondaryHeading">Basic</h2>
                            <div className="price">$0</div>
                            <div className="rows">
                                <div className="row">
                                    <FaRegCircleCheck className='icon' />
                                    <span>Streamlined Business Tools</span>
                                </div>
                                <div className="row">
                                    <FaRegCircleCheck className='icon' />
                                    <span>Post Service Postings</span>
                                </div>
                                <div className="row">
                                    <FaRegCircleCheck className='icon' />
                                    <span>Post Product Listings</span>
                                </div>
                                <div className="row notIncluded">
                                    <IoCloseCircleOutline className='icon' />
                                    <span>Access to Tradelead Section</span>
                                </div>
                                <div className="row notIncluded">
                                    <IoCloseCircleOutline className='icon' />
                                    <span>Less Deduction on Service Orders</span>
                                </div>
                                <div className="row notIncluded">
                                    <IoCloseCircleOutline className='icon' />
                                    <span>Less Deduction on Product Sales</span>
                                </div>
                                <div className="row notIncluded">
                                    <IoCloseCircleOutline className='icon' />
                                    <span>Service Listing on Top of Pages</span>
                                </div>
                            </div>
                        </div>
                        <div className="premiumPlan plan">
                            <h2 className="secondaryHeading">Premium</h2>
                            <div className="price">$20 <span>/ month</span></div>
                            <div className="rows">
                                <div className="row">
                                    <FaRegCircleCheck className='icon' />
                                    <span>Streamlined Business Tools</span>
                                </div>
                                <div className="row">
                                    <FaRegCircleCheck className='icon' />
                                    <span>Post Service Postings</span>
                                </div>
                                <div className="row">
                                    <FaRegCircleCheck className='icon' />
                                    <span>Post Product Listings</span>
                                </div>
                                <div className="row">
                                    <FaRegCircleCheck className='icon' />
                                    <span>Access to Tradelead Section</span>
                                </div>
                                <div className="row">
                                    <FaRegCircleCheck className='icon' />
                                    <span>Less Deduction on Service Orders</span>
                                </div>
                                <div className="row">
                                    <FaRegCircleCheck className='icon' />
                                    <span>Less Deduction on Product Sales</span>
                                </div>
                                <div className="row">
                                    <FaRegCircleCheck className='icon' />
                                    <span>Service Listing on Top of Pages</span>
                                </div>
                            </div>
                            <div className="buttonDiv">
                                <button className='primaryBtn2'>Buy Now</button>
                                <button className='dangerBtn'>Cancel Membership</button>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    )
}

export default Upgrade