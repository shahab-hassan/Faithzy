import React from 'react'
import {useParams} from "react-router-dom"
import axios from "axios"
import {enqueueSnackbar} from "notistack";
import { FaStar } from "react-icons/fa";
import Pagination from "../../components/common/Pagination"

function Profile() {

    const {id} = useParams();
    const [seller, setSeller] = React.useState(null);
    const [services, setServices] = React.useState(null);
    const [products, setProducts] = React.useState(null);

    React.useEffect(()=>{

        axios.get(`http://localhost:5000/api/v1/sellers/profile/${id}`)
        .then(response => {
            if(response.data.success)
                setSeller(response.data.seller);
        })
        .catch(e => {
            console.log(e);
            enqueueSnackbar("Something went wrong!", {variant: "error"})
        })

        axios.get(`http://localhost:5000/api/v1/services/profile/myServices/${id}`)
        .then(response => {
            if(response.data.success)
                setServices(response.data.allServices);
        })
        .catch(e => {
            console.log(e);
            enqueueSnackbar("Something went wrong!", {variant: "error"})
        })

        axios.get(`http://localhost:5000/api/v1/products/profile/myProducts/${id}`)
        .then(response => {
            if(response.data.success)
                setProducts(response.data.allProducts);
        })
        .catch(e => {
            console.log(e);
            enqueueSnackbar("Something went wrong!", {variant: "error"})
        })

    }, [id])

    console.log(seller);

  return (
    <div className='profileDiv'>
        <section className="bg">
            <img src={`http://localhost:5000/${seller?.profileImage}`} alt="Error" />
        </section>
        <section className="section">
            <div className="profileContent">

                <div className="upper">
                    <div className="sellerInfo">
                        <div className="row"><span>Name</span><span className='fw600'>{seller?.displayName}</span></div>
                        <div className="row"><span>Username</span><span className='fw600'>{seller?.userId?.username}</span></div>
                        <div className="row"><span>Rating</span><div className='ratingsDiv'>
                            <FaStar className='starIconFilled' />
                            <span className='fw600'>{`${4.8} (${108})`}</span>
                        </div></div>
                        <div className="horizontalLine"></div>
                        <div className="row"><span>Country</span><span className='fw600'>{seller?.country}</span></div>
                        <div className="row"><span>Joined</span><span className='fw600'>{"hello"}</span></div>
                        <div className="horizontalLine"></div>
                        <div className="row"><span>Languages</span><span className='fw600'>{seller?.languages}</span></div>
                    </div>
                    <div className="aboutSeller">
                        <h2 className="secondaryHeading"><span>About</span> Me</h2>
                        <div className="horizontalLine"></div>
                        <p>{seller?.description}</p>
                    </div>
                </div>

                {/* <div className="sellerServices">
                    <h2 className="secondaryHeading">My Services</h2>
                    <div className="services"></div>
                    <Pagination />
                </div>

                <div className="sellerProducts">
                    <h2 className="secondaryHeading">My Products</h2>
                    <div className="products"></div>
                    <Pagination />
                </div> */}

            </div>
        </section>
    </div>
  )
}

export default Profile