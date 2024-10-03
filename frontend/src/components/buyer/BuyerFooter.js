/* eslint-disable jsx-a11y/anchor-is-valid */
import axios from 'axios';
import React, { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { FaFacebook, FaInstagram, FaTwitter, FaPinterest, FaTumblr, FaYoutube, FaSnapchatGhost, FaTiktok, FaLinkedin } from "react-icons/fa";
import { AuthContext } from '../../utils/AuthContext';
import { hostNameBack } from '../../utils/constants';

function BuyerFooter() {


  const [socialLinks, setSocialLinks] = useState({});
  const { isLogin, user, isTabletPro } = useContext(AuthContext);

  axios.defaults.withCredentials = true;
  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const { data } = await axios.get(`${hostNameBack}/api/v1/settings/admin/social-links`);
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

            <div className='footerUpperLeft column'>
              <div className="faithzyLogoDiv">
                <img src="/assets/images/logo.svg" alt="Error" className='faithzyLogo' />
              </div>
              <p>Faith is strength by which a shattered world shall emerge into the light</p>
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

            <div className='column'>
              <h4>Useful Links</h4>
              <Link to="/categories">Categories</Link>
              {!isTabletPro && <Link to="/chat">Inbox</Link>}
              <Link to="/cart">Cart</Link>
              <Link to="/wishlist">Wishlist</Link>
            </div>

            <div className='column'>
              <h4>Support</h4>
              <Link to="/contact">Contact Us</Link>
              <Link to="/postRequest">Post a Request</Link>
              <Link to="/terms">Terms and Conditions</Link>
              <Link to="/settings">Settings</Link>
            </div>

            <div className='column'>
              <h4>Account</h4>
              <Link to="/orders">Orders as Buyer</Link>
              {user && user?.role === "seller" ? <Link to="/seller/dashboard">Dashboard</Link> : <Link to="/seller/becomeaseller">Become Seller</Link>}
              {!isLogin && <><Link to="/login">Login</Link>
                <Link to="/register">Register</Link></>}
              {isLogin && <><Link to="/seller/earnings">Earnings</Link>
                <Link to="/seller/upgrade">Upgrade</Link></>}
            </div>

          </div>

          <div className="horizontalLine"></div>

          <div className='footerLower'>
            <p>Copyright © Faithzy 2024 | All Rights Reserved</p>
          </div>

        </div>
      </section>

    </div>
  )
}

export default BuyerFooter