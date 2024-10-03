import React from 'react'
import axios from "axios"
import { enqueueSnackbar } from "notistack"
import AdminOrders from "./AdminOrders"
import { hostNameBack } from '../../utils/constants';

function AdminDashboard() {

  const [generalInfo, setGeneralInfo] = React.useState({});

  React.useEffect(() => {
    axios.get(`${hostNameBack}/api/v1/settings/admin/dashboard/general`)
      .then(res => {
        if (res.data.success)
          setGeneralInfo(res.data?.generalInfo);
      })
      .catch(e => {
        console.error(e);
        enqueueSnackbar(e?.reponse?.data?.error || "Something went wrong!", { variant: "error" })
      });
  }, [])


  return (
    <div className='adminDashboardDiv'>
      <div className="adminDashboardContent">

        <div className="dashboardOverview">

          <div className="left">

            <div className="overviewBoxA overviewBox">
              <h2 className="secondaryHeading">Completed Orders</h2>
              <div className='value'>{(generalInfo.completedOrders<10 && "0") + generalInfo.completedOrders}</div>
              <div className="horizontalLine"></div>
              <div className="row">
                <div>Products Sold</div>
                <div className='fw600'>{(generalInfo.productsSold<10 && "0") + generalInfo.productsSold}</div>
              </div>
              <div className="row">
                <div>Services Done</div>
                <div className='fw600'>{(generalInfo.servicesDone<10 && "0") + generalInfo.servicesDone}</div>
              </div>
            </div>

            <div className="leftBottom">
              <div className="overviewBoxB overviewBox">
                <h2 className="secondaryHeading">Active Orders</h2>
                <div className="value">{(generalInfo.activeOrders<10 && "0") + generalInfo.activeOrders}</div>
              </div>
              <div className="overviewBoxB overviewBox">
                <h2 className="secondaryHeading">Cancelled Orders</h2>
                <div className="value">{(generalInfo.cancelledOrders<10 && "0") + generalInfo.cancelledOrders}</div>
              </div>
            </div>

          </div>

          <div className="right">

            <div className="rightTop">
              <div className="overviewBoxB overviewBox">
                <h2 className="secondaryHeading">Active Services</h2>
                <div className="value">{(generalInfo.activeServices<10 && "0") + generalInfo.activeServices}</div>
              </div>
              <div className="overviewBoxB overviewBox">
                <h2 className="secondaryHeading">Active Products</h2>
                <div className="value">{(generalInfo.activeProducts<10 && "0") + generalInfo.activeProducts}</div>
              </div>
            </div>
            <div className="overviewBoxA overviewBox">
              <h2 className="secondaryHeading">Registered Users</h2>
              <div className='value'>{(generalInfo.registeredUsers<10 && "0") + generalInfo.registeredUsers}</div>
              <div className="horizontalLine"></div>
              <div className="row">
                <div>Total Sellers</div>
                <div className='fw600'>{(generalInfo.totalSellers<10 && "0") + generalInfo.totalSellers}</div>
              </div>
              <div className="row">
                <div>Paid Sellers</div>
                <div className='fw600'>{(generalInfo.paidSellers<10 && "0") + generalInfo.paidSellers}</div>
              </div>
            </div>

          </div>

        </div>

        <AdminOrders pre="dashboard" />

      </div>
    </div>
  )
}

export default AdminDashboard