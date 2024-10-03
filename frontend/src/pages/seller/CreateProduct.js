import React, { useContext, useState } from 'react';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { useNavigate, useParams } from 'react-router-dom';
import { FaUpload } from 'react-icons/fa';

import { AuthContext } from '../../utils/AuthContext';
import Gallery from '../../components/seller/Gallery';
import { hostNameBack } from '../../utils/constants';

function CreateProduct() {
  const { isLogin, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();

  const [offerDiscount, setOfferDiscount] = useState(false);
  const [freeShipping, setFreeShipping] = useState(false);
  const [productThumbnail, setProductThumbnail] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [categories, setCategories] = useState([]);

  const crrDate = new Date();
  crrDate.setDate(crrDate.getDate());
  const today = crrDate.toISOString().split('T')[0];

  const [productDetails, setProductDetails] = useState({
    productImages: [],
    title: '',
    description: '',
    category: "",
    stock: 0,
    price: 0,
    discountPercent: 0,
    discountExpiryDate: "",
    salesPrice: 0,
    amountToGet: 0,
    shippingFees: 0,
    tags: ''
  });

  const [feesObj, setFeesObj] = React.useState({
    seller: { product: 0, service: 0 },
    paidSeller: { product: 0, service: 0 },
    buyer: { product: 0, service: 0 }
  });

  React.useEffect(() => {

    axios.get(`${hostNameBack}/api/v1/settings/admin/feesAndMembership`)
      .then(response => {
        if (response.data.success)
          setFeesObj(response.data.fees);
      })
      .catch(e => {
        console.log(e);
        enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", { variant: "error" });
      })

  }, [])

  React.useEffect(() => {
    axios.get(`${hostNameBack}/api/v1/categories/product/all`)
      .then(response => {
        if (response.data.success) {
          let categories = response.data.categories;
          setCategories(categories);
          setProductDetails(prev => ({
            ...prev,
            category: categories[0].name
          }))
        }
        else
          enqueueSnackbar("Something went wrong!", { variant: "error" })
      })
      .catch(e => {
        console.error(e);
        enqueueSnackbar(e.response.data.error || 'Failed to fetch categories', { variant: 'error' });
      });
    if (id) {
      axios.get(`${hostNameBack}/api/v1/products/product/${id}`)
        .then(response => {
          if (response.data.success) {
            const product = response.data.product;
            if (Number(product.discountPercent) !== 0) setOfferDiscount(true);
            if (Number(product.shippingFees) === 0) setFreeShipping(true);
            setProductDetails({
              ...product,
            });
            if (product.productImages.length > 0) {
              setProductThumbnail(`${hostNameBack}/${product.productImages[0]}`);
              setGalleryImages(product.productImages.slice(1).map(image => `${hostNameBack}/${image}`));
            }
          } else {
            enqueueSnackbar("Something went wrong", { variant: "error" });
          }
        })
        .catch(e => {
          console.log(e);
          enqueueSnackbar(e.response.data.error || "Something went wrong", { variant: "error" });
        });
    }
  }, [id]);

  const categoryOptions = categories.map((category, index) => {
    return <option key={index} value={category.name}>{category.name}</option>
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'stock' && (value < 0 || value > 100000))
      return;
    else if (name === 'price' && (value < 0 || value > 1000000))
      return;
    else if (name === 'discountPercent' && (value < 0 || value > 100))
      return;
    else if (name === 'shippingFees' && (value < 0 || value > 1000000))
      return;

    setProductDetails(prevState => ({
      ...prevState,
      [name]: value
    }));

    if (name === 'price' || (name === 'discountPercent' && offerDiscount)) {
      updateSalesPrice(name, value);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductThumbnail(reader.result);
        setProductDetails(prev => ({
          ...prev, productImages: [file, ...prev.productImages.slice(1)]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryChange = (e) => {

    const files = Array.from(e.target.files);

    if (!files.length > 0)
      return;

    const galleryImageUrls = [];

    const newImages = files.map(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        galleryImageUrls.push(reader.result);
        if (galleryImageUrls.length === files.length)
          setGalleryImages(galleryImageUrls);
      };
      reader.readAsDataURL(file);
      return file;
    });

    setProductDetails(prev => ({
      ...prev,
      productImages: [prev.productImages[0], ...newImages]
    }));

  };

  const updateSalesPrice = (name, value) => {
    let price = productDetails.price;
    let discountPercent = productDetails.discountPercent;

    if (name === 'price') {
      price = value;
    } else if (name === 'discountPercent') {
      discountPercent = value;
    }

    const tax = user?.sellerId?.sellerType === "Paid"? Number(feesObj.paidSeller.product) : Number(feesObj.seller.product);

    if (offerDiscount) {
      const salesPrice = price - (price * (discountPercent / 100));
      const amountToGet = salesPrice - (salesPrice * (tax)/100);
      setProductDetails(prevState => ({
        ...prevState,
        salesPrice,
        amountToGet
      }));
    } else {
      setProductDetails(prevState => ({
        ...prevState,
        salesPrice: price,
        amountToGet: price - (price * (tax)/100)
      }));
    }
  };

  const updateDiscount = () => {
    setOfferDiscount(prevState => {
      if (prevState) {
        const tax = user?.sellerId?.sellerType === "Paid"? Number(feesObj.paidSeller.product) : Number(feesObj.seller.product);
        setProductDetails(product => ({
          ...product,
          salesPrice: product.price,
          amountToGet: product.price - (product.price * (tax)/100)
        }));
      }
      setProductDetails(product => ({
        ...product,
        discountPercent: 0,
        discountExpiryDate: ""
      }));
      return !prevState;
    });
  };

  const updateShipping = () => {
    setFreeShipping(prevState => {
      setProductDetails(product => ({
        ...product,
        shippingFees: 0
      }));
      return !prevState;
    });
  };

  const clearProducts = (toBeClear) => {
    if (toBeClear === "thumbnail") {
      setProductThumbnail(null);
      setProductDetails(prev => ({
        ...prev,
        productImages: [null, ...prev.productImages.slice(1)]
      }))
    }

    if (toBeClear === "gallery") {
      setGalleryImages([]);
      setProductDetails(prev => ({
        ...prev,
        productImages: [prev.productImages[0]]
      }))
    }
  }


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (galleryImages.length > 5) {
      enqueueSnackbar("Max '5' images are allowed", { variant: "warning" })
      return;
    }
    if (galleryImages.length === 0) {
      enqueueSnackbar("Atleast '1' galley image is required!", { variant: "warning" })
      return;
    }

    if (productDetails.productImages.length === 0 || productDetails.productImages[0] === null) {
      enqueueSnackbar("Product Thumbnail is required", { variant: "warning" })
      return;
    }
    else if (productDetails.productImages.length < 2 || productDetails.productImages[1] === null) {
      enqueueSnackbar("Atleast one gallery image is required", { variant: "warning" })
      return;
    }

    const formData = new FormData();

    productDetails.productImages.forEach((image, index) => {
      if (index === 0) {
        formData.append('productThumbnail', image);
      } else {
        formData.append('productGallery', image);
      }
    });

    Object.keys(productDetails).forEach(key => {
      if (key !== 'productThumbnail' && key !== "productGallery") {
        formData.append(key, productDetails[key]);
      }
    });

    try {
      const token = localStorage.getItem('token');
      let response;
      if (id) {
        response = await axios.put(`${hostNameBack}/api/v1/products/seller/product/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        response = await axios.post(`${hostNameBack}/api/v1/products/seller/product/new`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
      }

      if (response.data.success) {
        enqueueSnackbar(`Product ${id ? "Updated" : "Created"} successfully`, { variant: 'success' });
        navigate('/seller/products');
      } else {
        enqueueSnackbar('Something went wrong', { variant: 'error' });
      }
    } catch (e) {
      console.error(e);
      enqueueSnackbar(e.response.data.error || 'Something went wrong', { variant: 'error' });
    }
  };

  return (
    <div className='createProductDiv'>
      <section className="section">
        <div className="createProductContent">

          <h1 className="primaryHeading">{id ? "Edit" : "Add New"} <span>Product</span></h1>

          <div className="createProductDetails">

            {isLogin ? user.role === "seller" ? (
              <>
                <form onSubmit={handleSubmit} className='form'>

                  <div className='inputDiv'>
                    <label>Title <span>*</span></label>
                    <input type="text" className='inputField' name="title" value={productDetails.title} onChange={handleChange} placeholder='Enter product title' required />
                  </div>

                  <div className='inputDiv'>
                    <label>Description <span>*</span></label>
                    <textarea name="description" className='inputField' value={productDetails.description} onChange={handleChange} placeholder='Describe your product' required></textarea>
                  </div>

                  <div className='inputDiv'>
                    <div className="inputInnerDiv">
                      <label>Category <span>*</span></label>
                      <select name="category" className='inputField' value={productDetails.category} onChange={handleChange} required>
                        {categoryOptions}
                      </select>
                    </div>
                    <div className='inputInnerDiv'>
                      <label>Stock <span>*</span></label>
                      <input type="number" className='inputField' name="stock" value={productDetails.stock} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className='inputDiv'>
                    <div className="inputInnerDiv">
                      <label>Price ($) <span>*</span></label>
                      <input type="number" className='inputField' name="price" value={productDetails.price} onChange={handleChange} required />
                    </div>
                    <div className="checkboxDiv">
                      <input
                        type="checkbox"
                        className="checkbox"
                        id='checkbox'
                        name="offerDiscount"
                        checked={offerDiscount}
                        onChange={updateDiscount}
                      />
                      <label htmlFor='checkbox'>Offer Discount</label>
                    </div>
                  </div>

                  {offerDiscount && (
                    <div className='inputDiv'>
                      <div className='inputInnerDiv'>
                        <label>Discount (%) <span>*</span></label>
                        <input type="number" className='inputField' name="discountPercent" value={productDetails.discountPercent} onChange={handleChange} required />
                      </div>
                      <div className='inputInnerDiv'>
                        <label>Discount Expiry <span>*</span></label>
                        <input type="date" className='inputField' name="discountExpiryDate" value={productDetails.discountExpiryDate} onChange={handleChange} min={today} required />
                      </div>
                    </div>
                  )}

                  <div className='inputDiv'>
                    <div className="inputInnerDiv">
                      <label>Sales Price ($)</label>
                      <input type="number" className='inputField' name="salesPrice" value={productDetails.salesPrice} readOnly />
                    </div>
                    <div className='inputInnerDiv'>
                      <label>Amount to Get ({user?.sellerId?.sellerType === "Paid"? feesObj.paidSeller.product : feesObj.seller.product}% tax)</label>
                      <input type="number" className='inputField' name="amountToGet" value={productDetails.amountToGet} readOnly />
                    </div>
                  </div>

                  <div className='inputDiv'>
                    <div className="inputInnerDiv">
                      <label>Shipping Fees ($)</label>
                      <input type="number" className='inputField' name="shippingFees" value={productDetails.shippingFees} onChange={handleChange} disabled={freeShipping} />
                    </div>
                    <div className="checkboxDiv">
                      <input type="checkbox" name="freeShipping" className='checkbox' id='freeShipping' checked={freeShipping} onChange={updateShipping} />
                      <label htmlFor='freeShipping'>Free Shipping</label>
                    </div>
                  </div>

                  <div className='inputDiv'>
                    <label>Tags</label>
                    <input type="text" className='inputField' name="tags" value={productDetails.tags} onChange={handleChange} placeholder='Enter tags' />
                  </div>

                  <button type="submit" className='primaryBtn'>{id ? "Update" : "Create"} Product</button>

                </form>

                <div className="createProductGallery">

                  <div className="productThumbnail">

                    <div className="productThumbnailUpper">
                      <label>Product Thumbnail <span>*</span></label>
                      {productThumbnail && <div className='clearBtn' onClick={() => clearProducts("thumbnail")}>Remove</div>}
                    </div>

                    <div className="productThumbnailContent">
                      <label htmlFor="thumbnailUpload" className="uploadLabel">
                        {productThumbnail ? <img src={productThumbnail} alt="Error" className="thumbnailImage" />
                          :
                          <FaUpload className="uploadIcon" />}
                      </label>
                      <input type="file" id="thumbnailUpload" className="inputField" onChange={handleThumbnailChange} required />
                    </div>

                  </div>

                  <Gallery images={galleryImages} setImages={setGalleryImages} handleImageChange={handleGalleryChange} />

                </div>
              </>
            ) : (
              <div>You are not a seller. Please create seller account to access this page</div>
            ) : (
              <div>Please login to create a product</div>
            )}

          </div>

        </div>
      </section>
    </div>
  );
}

export default CreateProduct;
