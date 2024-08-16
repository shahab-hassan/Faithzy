import React from 'react'
import { Outlet } from 'react-router-dom'

import AdminHeader from "../components/admin/AdminHeader.js"

function Layout() {
  return (
    <div>
        <AdminHeader/>
        <Outlet/>
    </div>
  )
}

export default Layout