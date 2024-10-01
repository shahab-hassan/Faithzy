import React, { useContext, useRef } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { MdKeyboardArrowDown } from "react-icons/md";
import CatsDropdown from "./CatsDropdown"
import { IoMdMenu, IoMdClose } from "react-icons/io";

import SearchBox from "../SearchBox"
import { AuthContext } from '../../../utils/AuthContext';

function BuyerHeader() {

  const { isLogin, logout, user, isTablet } = useContext(AuthContext);
  const [showOptions, setShowOptions] = React.useState(false);
  const accountRef = useRef(null);
  const servicesRef = useRef(null);
  const productsRef = useRef(null);

  const [showServicesDropdown, setShowServicesDropdown] = React.useState(false);
  const [showProductsDropdown, setShowProductsDropdown] = React.useState(false);

  const location = useLocation();
  const [activeLink, setActiveLink] = React.useState("");

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const drawerRef = useRef(null);


  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  React.useEffect(() => {
    if (location.pathname.startsWith('/services') || showServicesDropdown)
      setActiveLink('services');
    else if (location.pathname.startsWith('/products') || showProductsDropdown)
      setActiveLink('products');
    else
      setActiveLink("");
  }, [location.pathname, showServicesDropdown, showProductsDropdown]);

  const handleClickOutside = (event) => {
    if (accountRef.current && !accountRef.current.contains(event.target))
      setShowOptions(false);
    if (servicesRef.current && !servicesRef.current.contains(event.target))
      setShowServicesDropdown(false);
    if (productsRef.current && !productsRef.current.contains(event.target))
      setShowProductsDropdown(false);
    if (drawerRef.current && !drawerRef.current.contains(event.target))
      setDrawerOpen(false);
  };

  const handleDropdownClick = (e, type) => {
    e.preventDefault();
    if (type === "services")
      setShowServicesDropdown(prev => !prev)
    else
      setShowProductsDropdown(prev => !prev)
    setActiveLink(type)
  }

  const closeDropdowns = () => {
    setShowServicesDropdown(false);
    setShowProductsDropdown(false);
  }

  const toggleMenu = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <div className='buyerHeaderDiv'>
      <section className="section">
        <div className="buyerHeaderContent">

          <div className="buyerHeaderUpper">

            <div className='buyerHeaderUpperLeft'>
              <Link to="/" className="faithzyLogoDiv">
                <img src="/assets/images/logo.svg" className='faithzyLogo' alt="Error" />
              </Link>
              {!isTablet && <SearchBox />}
            </div>

            {!isLogin && <div className="buyerHeaderActionsBefore">
              <NavLink to="/login" className={(v) => `${v.isActive && "active"} luxuryBtn`}>Log In</NavLink>
              <NavLink to="/register" className={(v) => `${v.isActive && "active"} luxuryBtn`}>Register</NavLink>
            </div>}

            {isLogin && <div className="buyerHeaderActions">

              <div className="leftActions">
                <Link to="/chat" className="inboxDiv"><i className="fa-regular fa-envelope"></i></Link>
                <Link to="/orders" className="ordersHeader"><p>Orders</p></Link>
              </div>

              <div className="rightActions">
                <Link to="/cart" className="cartIconDiv"><i className="fa-solid fa-cart-shopping"></i></Link>
                <Link to="/wishlist" className="favoritesIconDiv"><i className="fa-regular fa-heart"></i></Link>
                <div className="accountDiv optionsContainer" onClick={() => setShowOptions(prev => !prev)} ref={accountRef}>
                  <i className="fa-regular fa-circle-user"></i>
                  {showOptions && (
                    <div className='optionsMenu'>
                      {user && user?.role === "seller" ? <Link to="/seller/dashboard">Dashboard</Link> : <Link to="/seller/becomeaseller">Become Seller</Link>}
                      <Link to="/contact">Contact Us</Link>
                      <div className="horizontalLine"></div>
                      <Link to="/settings">Settings</Link>
                      <Link to="/" onClick={logout}>Logout</Link>
                    </div>
                  )}
                </div>
              </div>

            </div>}

            <div className="buyerHeaderDrawer">

              <div className="drawerIconsBuyerHeader">
                {drawerOpen ? <IoMdClose size={28} className='close' onClick={toggleMenu} /> : <IoMdMenu size={28} className='open' onClick={toggleMenu} />}
              </div>

              {isLogin ? <ul className='drawerContent' ref={drawerRef} style={{ display: (drawerOpen ? 'flex' : 'none') }}>
                <li>{user && user?.role === "seller" ? <Link to="/seller/dashboard">Dashboard</Link> : <Link to="/seller/becomeaseller">Become Seller</Link>}</li>
                <li><NavLink style={(v) => v.isActive ? {color: "var(--secondaryCopper)"}:{color: "var(--white)"}} to="/chat" onClick={toggleMenu}>Messages</NavLink></li>
                {isTablet && <li><NavLink style={(v) => v.isActive ? {color: "var(--secondaryCopper)"}:{color: "var(--white)"}} to="/categories" onClick={toggleMenu}>Categories</NavLink></li>}
                {isTablet && <li><NavLink style={(v) => v.isActive ? {color: "var(--secondaryCopper)"}:{color: "var(--white)"}} to="/services" onClick={toggleMenu}>Services</NavLink></li>}
                {isTablet && <li><NavLink style={(v) => v.isActive ? {color: "var(--secondaryCopper)"}:{color: "var(--white)"}} to="/products" onClick={toggleMenu}>Products</NavLink></li>}
                {isTablet && <li><NavLink style={(v) => v.isActive ? {color: "var(--secondaryCopper)"}:{color: "var(--white)"}} to="/postRequest" onClick={toggleMenu}>Post a Request</NavLink></li>}
                <li><NavLink style={(v) => v.isActive ? {color: "var(--secondaryCopper)"}:{color: "var(--white)"}} to="/orders" onClick={toggleMenu}>Orders</NavLink></li>
                <li><NavLink style={(v) => v.isActive ? {color: "var(--secondaryCopper)"}:{color: "var(--white)"}} to="/cart" onClick={toggleMenu}>Cart</NavLink></li>
                <li><NavLink style={(v) => v.isActive ? {color: "var(--secondaryCopper)"}:{color: "var(--white)"}} to="/wishlist" onClick={toggleMenu}>Wishlist</NavLink></li>
                <li><NavLink style={(v) => v.isActive ? {color: "var(--secondaryCopper)"}:{color: "var(--white)"}} to="/contact" onClick={toggleMenu}>Contact Us</NavLink></li>
                <li><NavLink style={(v) => v.isActive ? {color: "var(--secondaryCopper)"}:{color: "var(--white)"}} to="/settings" onClick={toggleMenu}>Settings</NavLink></li>
                <li><Link to="/" onClick={() => { toggleMenu(); logout() }}>Logout</Link></li>
              </ul>
                :
                <ul className='drawerContent' ref={drawerRef} style={{ display: (drawerOpen ? 'flex' : 'none') }}>
                  <li><NavLink style={(v) => v.isActive ? {color: "var(--secondaryCopper)"}:{color: "var(--white)"}} to="/login" onClick={toggleMenu}>Log In</NavLink></li>
                  <li><NavLink style={(v) => v.isActive ? {color: "var(--secondaryCopper)"}:{color: "var(--white)"}} to="/register" onClick={toggleMenu}>Sign Up</NavLink></li>
                  {isTablet && <li><NavLink style={(v) => v.isActive ? {color: "var(--secondaryCopper)"}:{color: "var(--white)"}} to="/categories" onClick={toggleMenu}>Categories</NavLink></li>}
                  {isTablet && <li><NavLink style={(v) => v.isActive ? {color: "var(--secondaryCopper)"}:{color: "var(--white)"}} to="/services" onClick={toggleMenu}>Services</NavLink></li>}
                  {isTablet && <li><NavLink style={(v) => v.isActive ? {color: "var(--secondaryCopper)"}:{color: "var(--white)"}} to="/products" onClick={toggleMenu}>Products</NavLink></li>}
                  {isTablet && <li><NavLink style={(v) => v.isActive ? {color: "var(--secondaryCopper)"}:{color: "var(--white)"}} to="/postRequest" onClick={toggleMenu}>Post a Request</NavLink></li>}
                  <li><NavLink style={(v) => v.isActive ? {color: "var(--secondaryCopper)"}:{color: "var(--white)"}} to="/contact" onClick={toggleMenu}>Contact Us</NavLink></li>
                </ul>}

            </div>


          </div>

          {!isTablet && <div className="buyerHeaderLower">

            <nav className='lowerLeft'>

              <ul>

                <li><NavLink to="/categories" className={(v) => `${v.isActive ? "white" : "darkGray"}`}>Categories<span><i className="fa-solid fa-arrow-right"></i></span></NavLink></li>

                <li>|</li>

                <li><NavLink to="/" className={(v) => `${v.isActive ? "white" : "darkGray"}`}>Home</NavLink></li>

                <li className='catsDropdownLi' ref={servicesRef}>
                  <Link className={activeLink === "services" ? "white" : "darkGray"} onClick={(e) => handleDropdownClick(e, "services")}>
                    Services
                    <MdKeyboardArrowDown className='icon' />
                  </Link>
                  {showServicesDropdown && <CatsDropdown isProduct={false} closeDropdowns={closeDropdowns} />}
                </li>

                <li className='catsDropdownLi' ref={productsRef}>
                  <Link className={activeLink === "products" ? "white" : "darkGray"} onClick={(e) => handleDropdownClick(e, "products")}>
                    Products
                    <MdKeyboardArrowDown className='icon' />
                  </Link>
                  {showProductsDropdown && <CatsDropdown isProduct={true} closeDropdowns={closeDropdowns} />}
                </li>


                <li><NavLink to="/postRequest" className={(v) => `${v.isActive ? "white" : "darkGray"}`}>Post a Request</NavLink></li>

              </ul>

            </nav>

          </div>}

          {isTablet && <SearchBox />}

        </div>
      </section>

    </div>
  )
}

export default BuyerHeader