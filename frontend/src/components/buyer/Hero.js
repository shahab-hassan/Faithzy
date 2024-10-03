import React from 'react';
import { Link } from "react-router-dom";
import TradeleadStepper from './TradeleadStepper';

function Hero() {
    return (
        <div className='heroDiv'>
            <section className='section'>
                <div className="heroContent">

                    <div className="heroContentMain">
                        <h1>EMPOWER <span>FAITH</span></h1>
                        <p>Explore a vast selection of religious products and services from trusted sellers. Whether seeking spiritual guidance, artifacts, or events, we've got you covered.</p>
                        <div className="heroBtns">
                            <Link to="/products" className='luxuryBtn'>Explore Products <i className="fa-solid fa-arrow-right"></i></Link>
                            <Link to="/services" className='luxuryBtn'>Find Services <i className="fa-solid fa-arrow-right"></i></Link>
                        </div>
                    </div>

                    <div className="heroTradeleadFormDiv">
                        <TradeleadStepper />
                    </div>

                </div>
            </section>
        </div>
    );
}

export default Hero;
