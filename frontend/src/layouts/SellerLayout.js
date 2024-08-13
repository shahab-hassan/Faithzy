import React from 'react'
import { Outlet } from 'react-router-dom'

import SellerHeader from "../components/seller/SellerHeader"
import BuyerFooter from "../components/buyer/BuyerFooter"

function Layout() {
  return (
    <div>
        <SellerHeader/>
        <Outlet/>
        <BuyerFooter/>
    </div>
  )
}

export default Layout