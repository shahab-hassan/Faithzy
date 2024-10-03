import React, { useContext } from 'react'
import { Link } from 'react-router-dom';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';

import { AuthContext } from "../../utils/AuthContext"
import SellerServiceCard from '../../components/seller/SellerServiceCard';
import { hostNameBack } from '../../utils/constants';

function SellerServices() {

    const { isLogin, user, isTabletPro, isTablet, isMobilePro, isMobile } = useContext(AuthContext);
    const [sellerServices, setSellerServices] = React.useState([]);

    const deleteService = (id) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            const token = localStorage.getItem("token");
            axios.delete(`${hostNameBack}/api/v1/services/seller/service/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then((response) => {
                    enqueueSnackbar(response.data.message, { variant: "success" })
                })
                .catch(e => {
                    console.log(e)
                    enqueueSnackbar(e.response.data.error || "Something went wrong", { variant: "error" })
                })
        }
    }

    React.useEffect(() => {

        const fetchSellerServices = () => {
            const token = localStorage.getItem('token');
            axios.get(`${hostNameBack}/api/v1/services/seller/myServices/all/`, { headers: { Authorization: `Bearer ${token}` } })
                .then(response => {
                    if (response.data.success)
                        setSellerServices(response.data.allServices)
                    else
                        enqueueSnackbar("Something went wrong", { variant: "error" })
                })
                .catch(e => {
                    console.log(e)
                    enqueueSnackbar(e.response.data.error || "Something went wrong", { variant: 'error' })
                })
        }

        if (isLogin && user.role === "seller")
            fetchSellerServices();

    }, [isLogin, user])

    let allSellerServices = sellerServices.map((service, index) => {
        return <SellerServiceCard key={index} service={service} deleteService={deleteService} />
    })

    const maxDisplay = isMobile ? 1 : isMobilePro ? 2 : isTablet ? 3 : isTabletPro ? 4 : 5;

    return (
        <div className='sellerServicesDiv'>
            <section className='section'>

                {isLogin ? user.role === "seller" ?

                    <div className="sellerServicesContent">

                        <div className="sellerServicesHeader">
                            <h2 className="primaryHeading">Your <span>Services</span></h2>
                            <Link to="/seller/postings/managePost/new" className="primaryBtn"><i className="fa-solid fa-plus"></i></Link>
                        </div>

                        <div className={`sellerServices grid-${maxDisplay}`}>
                            {sellerServices.length > 0 ? allSellerServices : <div>Nothing to show here</div>}
                        </div>

                    </div>

                    : <div>You are not a seller... Please create seller account to access this page</div>
                    : <div>Please login to access this page</div>
                }

            </section>
        </div>
    )
}

export default SellerServices