import React from 'react'
import { Outlet } from 'react-router-dom'

import AdminHeader from "../components/admin/AdminHeader.js"

function Layout() {
  return (
    <div className='admin'>
        <AdminHeader/>
        <div className="adminDiv">
          <Outlet/>
        </div>
    </div>
  )
}

export default Layout