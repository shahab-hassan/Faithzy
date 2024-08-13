import React from 'react'
import {Link} from "react-router-dom"

function Hero() {
  return (
    <div className='heroDiv'>
        <section className='section'>

            <div className="heroContent">

                <div className="heroContentMain">
                    <h1>NEW COLLECTION <span>"TASBIH"</span></h1>
                    <p>Explore beautiful tasbih for mindful dhikr and luxurious prayer rugs for comfort and focus in your Salah...</p>
                </div>
                <div className="heroBtns">
                    <Link to="/" className='primaryBtn'>Shop Now <i className="fa-solid fa-arrow-right"></i></Link>
                    <Link to="/" className='primaryBtn'>Discover More <i className="fa-solid fa-arrow-right"></i></Link>
                </div>
                
            </div>

            {/* <div className="heroBgs">
                <div className="leftBox">
                    <div className="box"></div>
                </div>
                <div className="rightImgDiv">
                    <div className="box"></div>
                    <img src="/assets/images/heroBg.jpg" alt="Error" />
                </div>
            </div> */}

        </section>
    </div>
  )
}

export default Hero