import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from "../../utils/AuthContext";
import { enqueueSnackbar } from 'notistack';
import {Link} from "react-router-dom"

import SellerBasicDetails from "../../components/seller/SellerBasicDetails"
import Orders from '../common/Orders';
import { hostNameBack } from '../../utils/constants';

function SellerDashboard() {
  const { isLogin, user } = useContext(AuthContext);
  const [sellerDetails, setSellerDetails] = useState(null);

  useEffect(() => {
    const fetchSellerDetails = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`${hostNameBack}/api/v1/sellers/seller/${user.sellerId._id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }); 
        setSellerDetails(response.data.seller);
      } catch (error) {
        console.log(error);
        enqueueSnackbar("Something went wrong", { variant: "error" });
      }
    };

    if (isLogin && user.role === "seller") {
      fetchSellerDetails();
    }
  }, [isLogin, user]);

  if (!sellerDetails && isLogin && user.role==="seller") {
    return <div>Loading...</div>;
  }

  return (
    <div className="sellerDashboard" style={{margin: "50px 0px"}}>
      <div className="sellerDashboardContent">

        {isLogin? user.role==="seller"? 
        <>
          <SellerBasicDetails sellerDetails={sellerDetails} />
          <Orders pageType="dashboard" />
        </>
        : <>
                <div>You are not a seller. Please create seller account to access this page</div>
                <Link to="/seller/becomeaseller">Become a Seller</Link>
              </>
        : <div>Please login to access this page</div>}
    
      </div>
    </div>
  );
}

export default SellerDashboard;
