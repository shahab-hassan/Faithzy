import React, { useContext } from 'react'
import axios from 'axios';
import { Link } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';

import {AuthContext} from "../../utils/AuthContext"
import SellerProductCard from '../../components/seller/SellerProductCard';

function SellerProducts() {

    const [sellerProducts, setSellerProducts] = React.useState([]);
    const {isLogin, user, isTabletPro, isTablet, isMobilePro, isMobile} = useContext(AuthContext);
    
    const deleteProduct = (id)=>{
        if(window.confirm('Are you sure you want to delete this product?')){
            const token = localStorage.getItem("token");
            axios.delete(`http://localhost:5000/api/v1/products/seller/product/${id}`, {
                headers: {Authorization: `Bearer ${token}`}
            })
            .then((response)=>{
                enqueueSnackbar(response.data.message, {variant: "success"})
            })
            .catch(e => {
                console.log(e)
                enqueueSnackbar("Something went wrong", {variant: "error"})
            })
        }
    }

    React.useEffect(()=>{

        const fetchSellerProducts = ()=>{
            const token = localStorage.getItem('token');
            axios.get("http://localhost:5000/api/v1/products/seller/myProducts/all/", { headers: { Authorization: `Bearer ${token}` } })
            .then(response => {
                if(response.data.success)
                    setSellerProducts(response.data.allProducts)
                else
                    enqueueSnackbar("Something went wrong", {variant: "error"})
            })
            .catch(e => {
                console.log(e)
                enqueueSnackbar("Something went wrong", {variant: 'error'})
            })
        }

        if(isLogin && user.role === "seller")
            fetchSellerProducts();

    }, [isLogin, user])


    let allSellerProducts = sellerProducts.map((product, index) => {
        return <SellerProductCard key={index} product={product} deleteProduct={deleteProduct} />
    })

    const maxDisplay = isMobile ? 1 : isMobilePro ? 2 : isTablet ? 3 : isTabletPro ? 4 : 5;

    return (
        <div className='sellerProductsDiv'>
            <section className='section'>

                {isLogin? user.role === "seller"?

                    <div className="sellerProductsContent">

                        <div className="sellerProductsHeader">
                            <h2 className="primaryHeading">Your <span>Products</span></h2>
                            <Link to="/seller/products/manageProduct/new" className="primaryBtn"><i className="fa-solid fa-plus"></i></Link>
                        </div>

                        <div className={`sellerProducts grid-${maxDisplay}`}>
                            {sellerProducts.length > 0? allSellerProducts: <div>Nothing to show here</div>}
                        </div>
            
                    </div>

                    : <div>You are not a seller... Please create seller account to access this page</div>
                    : <div>Please login to access this page</div>
                }

            </section>
        </div>
    )
}

export default SellerProducts