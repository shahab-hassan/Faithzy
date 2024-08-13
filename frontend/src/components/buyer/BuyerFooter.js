import React from 'react'
import { Link } from 'react-router-dom'

function BuyerFooter() {
  return (
    <div className='buyerFooterDiv'>
      <section className='section'>
        <div className="footerContent">

          <div className='footerUpper'>
            {/* <div className="logoDiv"><h2>FAITHZY</h2></div> */}
            <div className="faithzyLogoDiv">
                <img src="/assets/images/logo.svg" alt="Error" className='faithzyLogo'/>
              </div>
            <p>Faith is strength by which a shattered world shall emerge into the light</p>
          </div>

          <div className='horizontalLine'></div>

          <div className='footerMiddle'>
            <div>
              <h4>Product</h4>
              <Link>Top Products</Link>
              <Link>New Arrivals</Link>
              <Link>Discounted Products</Link>
              <Link>Product Categories</Link>
            </div>
            <div>
              <h4>Support</h4>
              <Link>Contact Us</Link>
              <Link>Orders</Link>
              <Link>Become a Seller</Link>
              <Link>Post a Request</Link>
              <Link>Pricing</Link>
              <Link>Terms and Conditions</Link>
            </div>
            <div>
              <h4>Services</h4>
              <Link>Top Services</Link>
              <Link>New Arrivals</Link>
              <Link>Discounted Services</Link>
              <Link>Service Categories</Link>
            </div>
            <div>
              <h4>Account</h4>
              <Link>Login</Link>
              <Link>Register</Link>
            </div>
          </div>

          <div className='footerCategoriesBtn'><Link to="/categories">All Categories<i className="fa-solid fa-arrow-right"></i></Link></div>
          
          <div className="horizontalLine"></div>

          <div className='footerLower'>
            <p>Copyright &copy; 2024 | All Rights Reserved</p>
            <div className="socialIcons">
              <i className="fa-brands fa-facebook"></i>
              <i className="fa-brands fa-instagram"></i>
              <i className="fa-brands fa-x-twitter"></i>
              <i className="fa-brands fa-youtube"></i>
              <i className="fa-brands fa-linkedin-in"></i>
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}

export default BuyerFooter