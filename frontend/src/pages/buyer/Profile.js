import React, {useContext} from 'react';
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { FaStar } from "react-icons/fa";
import Pagination from "../../components/common/Pagination";
import ServiceCard from "../../components/buyer/ServiceCard";
import ProductCard from "../../components/buyer/ProductCard";
import { AuthContext } from '../../utils/AuthContext';

function Profile() {
    const { id } = useParams();
    const [seller, setSeller] = React.useState(null);
    const [services, setServices] = React.useState([]);
    const [products, setProducts] = React.useState([]);
    const [totalServicePages, setTotalServicePages] = React.useState(1);
    const [totalProductPages, setTotalProductPages] = React.useState(1);
    const [crrServicePage, setCrrServicePage] = React.useState(1);
    const [crrProductPage, setCrrProductPage] = React.useState(1);
    const [isUpdated, setIsUpdated] = React.useState(false);

    const {isAdminLogin} = useContext(AuthContext);

    console.log(services.length);

    React.useEffect(() => {

        axios.get(`http://localhost:5000/api/v1/sellers/profile/${id}`)
            .then(response => {
                if (response.data.success)
                    setSeller(response.data.seller);
            })
            .catch(e => {
                console.log(e);
                enqueueSnackbar("Something went wrong!", { variant: "error" });
            });

    }, [id, isAdminLogin, isUpdated]);

    React.useEffect(() => {
        axios.get(`http://localhost:5000/api/v1/services/profile/myServices/${id}`, {
            params: { page: crrServicePage, isAdminLogin },
        })
            .then(response => {
                if (response.data.success) {
                    setServices(response.data.allServices);
                    setTotalServicePages(response.data.totalPages);
                }
            })
            .catch(e => {
                console.log(e);
                enqueueSnackbar("Something went wrong!", { variant: "error" });
            });
    }, [id, isAdminLogin, crrServicePage]);
    
    React.useEffect(() => {

        axios.get(`http://localhost:5000/api/v1/products/profile/myProducts/${id}`, {
            params: { page: crrProductPage, isAdminLogin },
        })
            .then(response => {
                if (response.data.success){
                    setProducts(response.data.allProducts);
                    setTotalProductPages(response.data.totalPages);
                }
            })
            .catch(e => {
                console.log(e);
                enqueueSnackbar("Something went wrong!", { variant: "error" });
            });

    }, [id, isAdminLogin, crrProductPage]);


    const formatJoinedDate = (date)=>{
        const d = new Date(date);
        const monthName = d.toLocaleString('default', { month: 'long' });
        return `${monthName}, ${d.getFullYear()}`;
    }


    const handleBlockUser = async (userId, isBlocked) => {

        if (!window.confirm(isBlocked ? "Are you sure you want to unblock this user?" : `You are blocking user... Are you sure you want to block?`))
            return;

        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.put(
                `http://localhost:5000/api/v1/auth/block/`,
                { userId, isBlocked },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setIsUpdated(prev => !prev)
                enqueueSnackbar(isBlocked ? "User has been UnBlocked!" : 'User has been blocked!', { variant: 'success' });
            }
        } catch (e) {
            console.log(e);
            enqueueSnackbar(e.response?.data?.error || 'Something went wrong!', { variant: 'error' });
        }
    };

    
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
                            <div className="row"><span>Joined</span><span className='fw600'>{formatJoinedDate(seller?.createdAt)}</span></div>
                            <div className="horizontalLine"></div>
                            <div className="row"><span>Languages</span><span className='fw600'>{seller?.languages}</span></div>
                            <div className='buttonsDiv'>
                                {isAdminLogin? <div className='btnsForAdmin'>
                                    <Link class="primaryBtn">Contact Seller</Link>
                                    <div>
                                        <Link class="primaryBtn2">Send Email</Link>
                                        <div onClick={() => handleBlockUser(seller?.userId?._id, seller?.userId?.userStatus === "Blocked")} class="secondaryBtn">{seller?.userId?.userStatus === "Blocked"? "UnBlock Seller" : "Block Seller"}</div>
                                    </div>
                                </div>
                                : <Link to={`/chat?p=${seller?.userId?._id}`} class="primaryBtn">Contact Me</Link>}
                            </div>
                        </div>
                        <div className="aboutSeller">
                            <h2 className="secondaryHeading"><span>About</span> Me</h2>
                            <div className="horizontalLine"></div>
                            <p>{seller?.description}</p>
                        </div>
                    </div>

                    <div className="sellerServices">
                        <h2 className="secondaryHeading">My <span>Services</span></h2>
                        <div className="services" style={isAdminLogin? {gridTemplateColumns: "repeat(4, 1fr)"} : {gridTemplateColumns: "repeat(5, 1fr)"}}>
                            {services && services.map((service, index) => {
                                return <ServiceCard key={index} item={service} />
                            })}
                        </div>
                        <Pagination pages={totalServicePages} crrPage={crrServicePage} setCrrPage={setCrrServicePage} />
                    </div>

                    <div className="sellerProducts">
                        <h2 className="secondaryHeading">My <span>Products</span></h2>
                        <div className="products" style={isAdminLogin? {gridTemplateColumns: "repeat(4, 1fr)"} : {gridTemplateColumns: "repeat(5, 1fr)"}}>
                            {products && products.map((product, index) => {
                                return <ProductCard key={index} item={product} />
                            })}
                        </div>
                        <Pagination pages={totalProductPages} crrPage={crrProductPage} setCrrPage={setCrrProductPage} />
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Profile;
