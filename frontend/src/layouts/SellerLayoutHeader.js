import React from 'react'
import { Outlet } from 'react-router-dom'

import SellerHeader from "../components/seller/SellerHeader"

function Layout() {
  return (
    <div>
        <SellerHeader/>
        <Outlet/>
    </div>
  )
}

export default Layout