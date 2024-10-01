import React, { useContext, useRef } from 'react'
import { NavLink, Link } from 'react-router-dom'

import { AuthContext } from '../../utils/AuthContext';
import { IoMdClose, IoMdMenu } from 'react-icons/io';

function SellerHeader() {

  const { logout, isTabletPro } = useContext(AuthContext);
  const [showOptions, setShowOptions] = React.useState(false);
  const accountRef = useRef(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const drawerRef = useRef(null);

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (accountRef.current && !accountRef.current.contains(event.target))
      setShowOptions(false);
    if (drawerRef.current && !drawerRef.current.contains(event.target))
      setDrawerOpen(false);
  };

  const toggleMenu = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <div className='sellerHeaderDiv'>
      <section className="section">
        <div className="sellerHeaderContent">

          <Link to="/" className="faithzyLogoDiv">
            <img src="/assets/images/logo.svg" alt="Error" className='faithzyLogo' />
          </Link>
          {!isTabletPro ? <><nav>
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
            </div></> 
            :
            <div>

              {drawerOpen ? <IoMdClose size={28} className='close' onClick={toggleMenu} /> : <IoMdMenu size={28} className='open' onClick={toggleMenu} />}

              <ul className='drawerContent' ref={drawerRef} style={{ display: (drawerOpen ? 'flex' : 'none') }}>
                <li><NavLink to="/seller/dashboard" style={(v) => v.isActive ? { color: "var(--secondaryCopper)" } : { color: "var(--white)" }} onClick={toggleMenu}>Dashboard</NavLink></li>
                <li><NavLink to="/seller/products" style={(v) => v.isActive ? { color: "var(--secondaryCopper)" } : { color: "var(--white)" }} onClick={toggleMenu}>Products</NavLink></li>
                <li><NavLink style={(v) => v.isActive ? { color: "var(--secondaryCopper)" } : { color: "var(--white)" }} to="/seller/postings" onClick={toggleMenu}>Postings</NavLink></li>
                <li><NavLink style={(v) => v.isActive ? { color: "var(--secondaryCopper)" } : { color: "var(--white)" }} to="/seller/tradeleads" onClick={toggleMenu}>TradeLead</NavLink></li>
                <li><NavLink style={(v) => v.isActive ? { color: "var(--secondaryCopper)" } : { color: "var(--white)" }} to="/seller/upgrade" onClick={toggleMenu}>Upgrade</NavLink></li>
                <li><NavLink style={(v) => v.isActive ? { color: "var(--secondaryCopper)" } : { color: "var(--white)" }} to="/seller/earnings" onClick={toggleMenu}>Earnings</NavLink></li>
                <li><NavLink style={(v) => v.isActive ? { color: "var(--secondaryCopper)" } : { color: "var(--white)" }} to="/seller/orders" onClick={toggleMenu}>Orders</NavLink></li>
                <li><NavLink style={(v) => v.isActive ? { color: "var(--secondaryCopper)" } : { color: "var(--white)" }} to="/contact" onClick={toggleMenu}>Contact Us</NavLink></li>
                <li><NavLink style={(v) => v.isActive ? { color: "var(--secondaryCopper)" } : { color: "var(--white)" }} to="/settings" onClick={toggleMenu}>Settings</NavLink></li>
                <li><Link to="/" onClick={() => { toggleMenu(); logout() }}>Logout</Link></li>
              </ul>

            </div>}

        </div>
      </section>
    </div>
  )
}

export default SellerHeader