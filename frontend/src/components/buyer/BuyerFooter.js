import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaFacebook, FaInstagram, FaTwitter, FaPinterest, FaTumblr, FaYoutube, FaSnapchatGhost, FaTiktok, FaLinkedin } from "react-icons/fa";

function BuyerFooter() {

  const [socialLinks, setSocialLinks] = useState({});

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/v1/settings/admin/social-links');
        setSocialLinks(data.socialLinks || {});
      } catch (error) {
        console.error("Failed to fetch social links", error);
      }
    };
    fetchLinks();
  }, []);

  return (
    <div className='buyerFooterDiv'>
      <section className='section'>
        <div className="footerContent">

          <div className='footerUpper'>
            {/* <div className="logoDiv"><h2>FAITHZY</h2></div> */}
            <div className="faithzyLogoDiv">
              <img src="/assets/images/logo.svg" alt="Error" className='faithzyLogo' />
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
            <p>Copyright © Faithzy 2024 | All Rights Reserved</p>
            <div className='footerIconsDiv'>
              {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer"><FaFacebook className='icon' /></a>}
              {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"><FaInstagram className='icon' /></a>}
              {socialLinks.twitter && <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"><FaTwitter className='icon' /></a>}
              {socialLinks.pinterest && <a href={socialLinks.pinterest} target="_blank" rel="noopener noreferrer"><FaPinterest className='icon' /></a>}
              {socialLinks.tumblr && <a href={socialLinks.tumblr} target="_blank" rel="noopener noreferrer"><FaTumblr className='icon' /></a>}
              {socialLinks.youtube && <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer"><FaYoutube className='icon' /></a>}
              {socialLinks.snapchat && <a href={socialLinks.snapchat} target="_blank" rel="noopener noreferrer"><FaSnapchatGhost className='icon' /></a>}
              {socialLinks.tiktok && <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer"><FaTiktok className='icon' /></a>}
              {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer"><FaLinkedin className='icon' /></a>}
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}

export default BuyerFooter