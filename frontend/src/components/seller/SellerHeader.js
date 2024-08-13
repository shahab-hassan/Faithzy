import React from 'react'
import { NavLink, Link } from 'react-router-dom'

// import { AuthContext } from '../../utils/AuthContext';

function SellerHeader() {

//   const { isLogin, logout } = useContext(AuthContext);

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
                <li><NavLink to="/seller/dashboard" className={(v)=>`${v.isActive? "white": "darkGray"}`}>Dashboard</NavLink></li>
                <li><NavLink to="/seller/products" className={(v)=>`${v.isActive? "white": "darkGray"}`}>Products</NavLink></li>
                <li><NavLink to="/seller/postings" className={(v)=>`${v.isActive? "white": "darkGray"}`}>Postings</NavLink></li>
                <li><NavLink to="/seller/tradeleads" className={(v)=>`${v.isActive? "white": "darkGray"}`}>TradeLead</NavLink></li>
                <li><NavLink to="/" className={(v)=>`${v.isActive? "white": "darkGray"}`}>Upgrade</NavLink></li>
                <li><NavLink to="/" className={(v)=>`${v.isActive? "white": "darkGray"}`}>Earnings</NavLink></li>
                <li><NavLink to="/seller/orders" className={(v)=>`${v.isActive? "white": "darkGray"}`}>Orders</NavLink></li>
              </ul>
            </nav>
            <div className="sellerHeaderActions">
                <div className="leftActions">
                    <div className="notificationsDiv"><i className="fa-regular fa-bell"></i></div>
                    <div className="inboxDiv"><i className="fa-regular fa-envelope"></i></div>
                </div>
                <div className="rightActions">
                    <div className="cartIconDiv"><i className="fa-solid fa-rocket"></i></div>
                    <div className="accountDiv"><i className="fa-regular fa-circle-user"></i></div>
                </div>
            </div>

        </div>
      </section>
    </div>
  )
}

export default SellerHeader