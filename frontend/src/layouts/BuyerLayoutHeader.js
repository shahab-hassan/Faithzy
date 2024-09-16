import React from 'react'
import { Outlet } from 'react-router-dom'

import BuyerHeader from "../components/buyer/Header/BuyerHeader"

function Layout() {
  return (
    <div>
        <BuyerHeader/>
        <Outlet/>
    </div>
  )
}

export default Layout