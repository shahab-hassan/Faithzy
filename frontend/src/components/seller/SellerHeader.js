import React, { useContext, useRef } from 'react'
import { NavLink, Link } from 'react-router-dom'

import { AuthContext } from '../../utils/AuthContext';

function SellerHeader() {

  const { logout } = useContext(AuthContext);
  const [showOptions, setShowOptions] = React.useState(false);
  const accountRef = useRef(null);

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (accountRef.current && !accountRef.current.contains(event.target))
      setShowOptions(false);
  };

  return (
    <div className='sellerHeaderDiv'>
      <section className="section">
        <div className="sellerHeaderContent">

          {/* <Link to="/" style={{color: "white"}}><div className="logoDiv"><h2>FAITHZY</h2></div></Link> */}
          <Link to="/" className="faithzyLogoDiv">
            <img src="/assets/images/logo.svg" alt="Error" className='faithzyLogo' />
          </Link>
          <nav>
            <ul>
              <li><NavLink to="/seller/dashboard" className={(v) => `${v.isActive ? "white" : "darkGray"}`}>Dashboard</NavLink></li>
              <li><NavLink to="/seller/products" className={(v) => `${v.isActive ? "white" : "darkGray"}`}>Products</NavLink></li>
              <li><NavLink to="/seller/postings" className={(v) => `${v.isActive ? "white" : "darkGray"}`}>Postings</NavLink></li>
              <li><NavLink to="/seller/tradeleads" className={(v) => `${v.isActive ? "white" : "darkGray"}`}>TradeLead</NavLink></li>
              <li><NavLink to="/seller/upgrade" className={(v) => `${v.isActive ? "white" : "darkGray"}`}>Upgrade</NavLink></li>
              <li><NavLink to="/seller/earnings" className={(v) => `${v.isActive ? "white" : "darkGray"}`}>Earnings</NavLink></li>
              <li><NavLink to="/seller/orders" className={(v) => `${v.isActive ? "white" : "darkGray"}`}>Orders</NavLink></li>
            </ul>
          </nav>
          <div className="sellerHeaderActions">
            <div className="leftActions">
              {/* <div className="notificationsDiv"><i className="fa-regular fa-bell"></i></div> */}
              <Link to="/chat" className="inboxDiv"><i className="fa-regular fa-envelope"></i></Link>
            </div>
            <div className="rightActions">
              {/* <div className="cartIconDiv"><i className="fa-solid fa-rocket"></i></div> */}
              <div className="accountDiv optionsContainer" onClick={() => setShowOptions(prev => !prev)} ref={accountRef}>
                <i className="fa-regular fa-circle-user"></i>
                {showOptions && (
                  <div className='optionsMenu'>
                    <Link to="/">Switch to Buying</Link>
                    <Link to="/contact">Contact Us</Link>
                    <div className="horizontalLine"></div>
                    <Link to="/settings">Settings</Link>
                    <Link onClick={logout}>Logout</Link>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}

export default SellerHeader