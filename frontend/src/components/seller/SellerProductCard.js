import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

function SellerProductCard({ product, deleteProduct }) {
  const [showOptions, setShowOptions] = React.useState(false);
  const ellipsisRef = useRef(null);

  const handleClickOutside = (event) => {
    if (ellipsisRef.current && !ellipsisRef.current.contains(event.target))
      setShowOptions(false);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='sellerProductCardDiv'>
      <div className='sellerProductCardContent'>
        <div className='productImgDiv'>
          <img src={`http://localhost:5000/${product.productImages[0]}`} alt='Error' />
        </div>
        <div className='productUpper'>
          <p className='category'>{product.category}</p>
          <div className='ellipsis' onClick={() => setShowOptions((prev) => !prev)} ref={ellipsisRef}>
            <i className='fa-solid fa-ellipsis'></i>
            {showOptions && (
              <div className='optionsMenu'>
                <Link to={`/seller/product/preview/${product._id}`}>Preview</Link>
                <Link to={`/seller/products/manageProduct/edit/${product._id}`}>Edit</Link>
                <Link onClick={() => deleteProduct(product._id)}>Delete</Link>
              </div>
            )}
          </div>
        </div>
        <h2 className='productTitle'>{product.title}</h2>
        <div className='productLower'>
          <div className='productLowerTop'>
            <p>{product.sold}</p>
            <span>sold</span>
            <p>- {product.stock}</p>
            <span>in stock</span>
          </div>
          <div className='productLowerBottom'>
            {product.discountPercent !== 0 && <p className='productDiscount'>{`$${product.price}`}</p>}
            <h1 className='productPrice'>{`$${product.discountPercent === 0 ? product.price : product.salesPrice}`}</h1>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerProductCard;
