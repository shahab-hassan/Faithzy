import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

function SellerServiceCard({service, deleteService}) {

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
        <div className='sellerServiceCardDiv'>
          <div className='sellerServiceCardContent'>
            <div className='serviceImgDiv'>
              <img src={`http://localhost:5000/${service.serviceImages[0]}`} alt='Error' />
            </div>
            <div className='serviceUpper'>
              <p className='category'>{service.category}</p>
              <div className='ellipsis' onClick={() => setShowOptions((prev) => !prev)} ref={ellipsisRef}>
                <i className='fa-solid fa-ellipsis'></i>
                {showOptions && (
                  <div className='optionsMenu'>
                    <Link to={`/seller/posting/preview/${service._id}`}>Preview</Link>
                    <Link to={`/seller/postings/managePost/edit/${service._id}`}>Edit</Link>
                    <Link onClick={() => deleteService(service._id)}>Delete</Link>
                  </div>
                )}
              </div>
            </div>
            <h2 className='serviceTitle'>{service.title}</h2>
            <div className='serviceLower'>
              {/* <div className='serviceLowerTop'></div> */}
              <div className='serviceLowerBottom'>
                <p>From</p>
                {/* {service.discountPercent !== 0 && <p className='serviceDiscount'>${service.packages[0].price}</p>} */}
                <h1 className='servicePrice'>{`$${service.discountPercent === 0 ? service.packages[0].price : service.packages[0].salesPrice}`}</h1>
              </div>
            </div>
          </div>
        </div>
      );
}

export default SellerServiceCard