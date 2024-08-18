import React from 'react'
import { NavLink } from 'react-router-dom'
import { MdAnalytics } from "react-icons/md";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { RiCoupon2Fill } from "react-icons/ri";
import { TbTruckDelivery } from "react-icons/tb";
import { FaShop, FaSackDollar, FaCreditCard, FaNetworkWired, FaEnvelope, FaUsers } from "react-icons/fa6";
import { FaUserCircle, FaMoneyBill } from "react-icons/fa";
import { BsFileEarmarkRuledFill } from "react-icons/bs";
import { HiUsers } from "react-icons/hi";

function AdminHeader() {

  return (
    <div className='adminHeaderDiv'>
      <section className="section">
        <div className="adminHeaderContent">

          <div className="faithzyLogoDiv">
            <img src="/assets/images/logo.svg" alt="Error" className='faithzyLogo' />
          </div>

          <div className="horizontalLine"></div>

          <ul className="mainMenu">
            <li><NavLink to="/ftzy-admin/dashboard" className={(v)=>`${v.isActive? "activeLi": ""}`}><MdAnalytics className='icon'/>Dashboard</NavLink></li>
            <li><NavLink to="/" className={(v)=>`${v.isActive? "activeLi": ""}`}><BiSolidCategoryAlt className='icon'/>Categories</NavLink></li>
            <li><NavLink to="/" className={(v)=>`${v.isActive? "activeLi": ""}`}><RiCoupon2Fill className='icon'/>Coupons</NavLink></li>
            <li><NavLink to="/" className={(v)=>`${v.isActive? "activeLi": ""}`}><TbTruckDelivery className='icon'/>Orders</NavLink></li>
            <li><NavLink to="/" className={(v)=>`${v.isActive? "activeLi": ""}`}><FaShop className='icon'/>Sellers</NavLink></li>
            <li><NavLink to="/" className={(v)=>`${v.isActive? "activeLi": ""}`}><FaUserCircle className='icon'/>Buyers</NavLink></li>
            <li><NavLink to="/" className={(v)=>`${v.isActive? "activeLi": ""}`}><FaSackDollar className='icon'/>Revenue</NavLink></li>
            <li><NavLink to="/" className={(v)=>`${v.isActive? "activeLi": ""}`}><FaCreditCard className='icon'/>Payments</NavLink></li>
            <li><NavLink to="/" className={(v)=>`${v.isActive? "activeLi": ""}`}><FaNetworkWired className='icon'/>Social Media Links</NavLink></li>
            <li><NavLink to="/" className={(v)=>`${v.isActive? "activeLi": ""}`}><FaMoneyBill className='icon'/>Fee</NavLink></li>
            <li><NavLink to="/ftzy-admin/terms" className={(v)=>`${v.isActive? "activeLi": ""}`}><BsFileEarmarkRuledFill className='icon'/>Terms & Conditions</NavLink></li>
            <li><NavLink to="/" className={(v)=>`${v.isActive? "activeLi": ""}`}><HiUsers className='icon'/>Disputes</NavLink></li>
            <li><NavLink to="/" className={(v)=>`${v.isActive? "activeLi": ""}`}><FaEnvelope className='icon'/>Chats</NavLink></li>
            <li><NavLink to="/ftzy-admin/employees" className={(v)=>`${v.isActive? "activeLi": ""}`}><FaUsers className='icon'/>Employees</NavLink></li>
          </ul>

        </div>
      </section>
    </div>
  )
}

export default AdminHeader