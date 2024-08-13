import React from 'react'
import axios from "axios"
import {enqueueSnackbar} from "notistack"
import { Link } from 'react-router-dom';

function Categories() {

    const [productCats, setProductCats] = React.useState(null);
    const [serviceCats, setServiceCats] = React.useState(null);

    React.useEffect(()=>{

        axios.get("http://localhost:5000/api/v1/categories/all")
        .then(response => {
            if(response.data.success){
                setProductCats(response.data.productCategories);
                setServiceCats(response.data.serviceCategories);
            }
            else    
                enqueueSnackbar("Something went wrong!", {variant: "error"});
        })
        .catch(e => {
            console.log(e);
            enqueueSnackbar(e.response.data.error || "Something went wrong!", {variant: "error"})
        })
        
    }, [])

    const allProductCats = productCats? productCats.map((category, index) => {
        return <Link key={index} to={`/products/${category.name}`} className='category'>
                    <p>{category.name} <span className='count'>({category.count})</span></p>
                    <i className="fa-solid fa-arrow-right"></i>
                </Link>
    }) : [];

    const allServiceCats = serviceCats? serviceCats.map((category, index) => {
        return <Link key={index} to={`/services/${category.name}`} className='category'>
                    <p>{category.name} <span className='count'>({category.count})</span></p>
                    <i className="fa-solid fa-arrow-right"></i>
                </Link>
    }): [];

  return (
    <div className='categoriesDiv'>
        <section className="section">
            <div className="categoriesContent">

                <div className="productCatsDiv">
                    <h1 className="primaryHeading"><span>Product</span> Categories</h1>
                    <div className="categories">
                        {allProductCats}
                    </div>
                </div>

                <div className="serviceCatsDiv">
                    <h1 className="primaryHeading"><span>Service</span> Categories</h1>
                    <div className="categories">
                        {allServiceCats}
                    </div>
                </div>

            </div>
        </section>
    </div>
  )
}

export default Categories