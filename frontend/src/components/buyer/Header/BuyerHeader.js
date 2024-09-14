import React, {useContext, useRef} from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { MdKeyboardArrowDown } from "react-icons/md";
import CatsDropdown from "./CatsDropdown"

import SearchBox from "../SearchBox"
import { AuthContext } from '../../../utils/AuthContext';

function BuyerHeader() {

  const { isLogin, logout } = useContext(AuthContext);
  const [showOptions, setShowOptions] = React.useState(false);
  const accountRef = useRef(null);
  const servicesRef = useRef(null);
  const productsRef = useRef(null);

  const [showServicesDropdown, setShowServicesDropdown] = React.useState(false);
  const [showProductsDropdown, setShowProductsDropdown] = React.useState(false);

  const location = useLocation();
  const [activeLink, setActiveLink] = React.useState("");

  
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
    if(servicesRef.current && !servicesRef.current.contains(event.target))
      setShowServicesDropdown(false);
    if(productsRef.current && !productsRef.current.contains(event.target))
      setShowProductsDropdown(false);
  };

  const handleDropdownClick = (e, type)=>{
    e.preventDefault();
    if(type === "services")
      setShowServicesDropdown(prev => !prev)
    else
      setShowProductsDropdown(prev => !prev)
    setActiveLink(type)
  }

  const closeDropdowns = ()=>{
    setShowServicesDropdown(false);
    setShowProductsDropdown(false);
  }

  return (
    <div className='buyerHeaderDiv'>
      <section className="section">
        <div className="buyerHeaderContent">

          <div className="buyerHeaderUpper">
            <div className='buyerHeaderUpperLeft'>
              {/* <Link to="/" style={{color: "white"}}><div className="logoDiv"><h2>FAITHZY</h2></div></Link> */}
              <Link to="/" className="faithzyLogoDiv">
                <img src="/assets/images/logo.svg" className='faithzyLogo' alt="Error" />
              </Link>
              <SearchBox/>
            </div>
            <div className="buyerHeaderActions">
              <div className="leftActions">
                <div className="notificationsDiv"><i className="fa-regular fa-bell"></i></div>
                <Link to="/chat" className="inboxDiv"><i className="fa-regular fa-envelope"></i></Link>
                {isLogin && <Link to="/orders" className="ordersHeader"><p>Orders</p></Link>}
              </div>
              <div className="rightActions">
                {isLogin && <Link to="/cart" className="cartIconDiv"><i className="fa-solid fa-cart-shopping"></i></Link>}
                {isLogin && <Link to="/wishlist" className="favoritesIconDiv"><i className="fa-regular fa-heart"></i></Link>}
                <div className="accountDiv optionsContainer" onClick={()=> setShowOptions(prev => !prev)} ref={accountRef}>
                  <i className="fa-regular fa-circle-user"></i>
                  {showOptions && (
                    <div className='optionsMenu'>
                      <Link to="/settings">Settings</Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="buyerHeaderLower">

            <nav className='lowerLeft'>

              <ul>

                <li><NavLink to="/categories" className={(v)=>`${v.isActive? "white": "darkGray"}`}>Categories<span><i className="fa-solid fa-arrow-right"></i></span></NavLink></li>

                <li>|</li>

                <li><NavLink to="/" className={(v)=>`${v.isActive? "white": "darkGray"}`}>Home</NavLink></li>

                <li className='catsDropdownLi' ref={servicesRef}>
                  <Link className={activeLink === "services" ? "white" : "darkGray"} onClick={(e)=>handleDropdownClick(e, "services")}>
                    Services
                    <MdKeyboardArrowDown className='icon' />
                  </Link>
                  {showServicesDropdown && <CatsDropdown isProduct={false} closeDropdowns={closeDropdowns} />}
                </li>

                <li className='catsDropdownLi' ref={productsRef}>
                  <Link className={activeLink === "products" ? "white" : "darkGray"} onClick={(e)=>handleDropdownClick(e, "products")}>
                    Products
                    <MdKeyboardArrowDown className='icon' />
                  </Link>
                  {showProductsDropdown && <CatsDropdown isProduct={true} closeDropdowns={closeDropdowns} />}
                </li>

                {isLogin && <li><NavLink to="/postRequest" className={(v)=>`${v.isActive? "white": "darkGray"}`}>Post a Request</NavLink></li>}

                <li><NavLink to="/contact" className={(v)=>`${v.isActive? "white": "darkGray"}`}>Contact</NavLink></li>

              </ul>

            </nav>
            
            <div className="lowerRight">
              <ul>
                {!isLogin && <li><NavLink to="/register" className={(v)=>`${v.isActive? "white": "darkGray"}`}><i className="fa-solid fa-user-plus"></i>Register</NavLink></li>}
                {!isLogin && <li><NavLink to="/login" className={(v)=>`${v.isActive? "white": "darkGray"}`}><i className="fa-solid fa-arrow-right-to-bracket"></i>Login</NavLink></li>}
                {isLogin && <li><NavLink to="/seller/dashboard" className="darkGray"><i className="fa-solid fa-coins"></i>Dashboard</NavLink></li>}
                {isLogin && <li onClick={logout}><NavLink className="darkGray"><i className="fa-solid fa-arrow-right-from-bracket"></i>Logout</NavLink></li>}
              </ul>
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}

export default BuyerHeader