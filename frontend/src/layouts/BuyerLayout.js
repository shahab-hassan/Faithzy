import React from 'react'
import { Outlet } from 'react-router-dom'

import BuyerHeader from "../components/buyer/Header/BuyerHeader"
import BuyerFooter from "../components/buyer/BuyerFooter"

function Layout() {
  return (
    <div>
        <BuyerHeader/>
        <Outlet/>
        <BuyerFooter/>
    </div>
  )
}

export default Layout