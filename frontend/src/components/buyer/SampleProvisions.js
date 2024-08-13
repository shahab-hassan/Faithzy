import React, { useContext, useState, useEffect } from 'react';
import axios from "axios";
import { useSnackbar } from "notistack";

import Dropdown from "../../components/common/Dropdown";
import ProductCard from '../../components/buyer/ProductCard';
import ServiceCard from '../../components/buyer/ServiceCard';
import { AuthContext } from '../../utils/AuthContext';

function SampleProvisions({ pre, openedProduct, openedService }) {

  const { enqueueSnackbar } = useSnackbar();
  const { isLogin } = useContext(AuthContext);

  const [allProvisions, setAllProvisions] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedType, setSelectedType] = useState(openedService? "Services":"Products");

  useEffect(() => {

    const endpoint = selectedType === 'Products' ? 'products' : 'services';

    axios.get(`http://localhost:5000/api/v1/${endpoint}/all`)
      .then((response) => setAllProvisions(response.data.allProducts || response.data.allServices))
      .catch(e => enqueueSnackbar(e.response.data.error || "Something went wrong!", { variant: "error" }));

    if (pre === 'recents' && isLogin) {
      const token = localStorage.getItem('token');
      axios.get(`http://localhost:5000/api/v1/${endpoint}/user/recentlyViewed/`, { headers: { Authorization: `Bearer ${token}` } })
        .then((response) => {
          if (response.data.recentlyViewed)
            selectedType === "Products"? setRecentlyViewed(response.data.recentlyViewed.viewedProducts) : setRecentlyViewed(response.data.recentlyViewed.viewedServices)
        })
        .catch((e) => {
          enqueueSnackbar(e.response.data.error || "Something went wrong!", { variant: "error" });
        })
    }
  }, [isLogin, pre, selectedType]);

  let provisionItems = [];
  let relatedItems = [];

  const CardComponent = selectedType === 'Products' ? ProductCard : ServiceCard;

  if (pre === "recents" && recentlyViewed) {
    provisionItems = recentlyViewed.map((item, index) => (
      <CardComponent key={index} item={item} />
    ));
  } 
  if(pre !== "recents") {
    provisionItems = allProvisions.map((item, index) => {
      if (pre === "discounted" && !item.status.includes("discounted"))
        return null;
      if (pre === "related" && openedProduct) {
        if (item.category === openedProduct.category && item._id !== openedProduct._id)
          relatedItems.unshift(<CardComponent key={index} item={item} />);
        else if (item._id !== openedProduct._id)
          relatedItems.push(<CardComponent key={index} item={item} />);
        return null;
      }
      else if (pre === "related" && openedService) {
        if (item.category === openedService.category && item._id !== openedService._id)
          relatedItems.unshift(<CardComponent key={index} item={item} />);
        else if (item._id !== openedService._id)
          relatedItems.push(<CardComponent key={index} item={item} />);
        return null;
      }
      return <CardComponent key={index} item={item} />;
    });
  }

  provisionItems = provisionItems.filter(value => value != null);

  if (pre === "related")
    provisionItems = [...relatedItems];

  const maxVisible = pre === "chat"? 1 : 5;
  const totalItems = provisionItems.length;

  const handleScrollLeft = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalItems) % totalItems);
  };

  const handleScrollRight = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalItems);
  };

  const visibleItems = provisionItems.slice(currentIndex, currentIndex + maxVisible);

  return (
    <div className='sampleProvisionsDiv'>
      <div className="sampleProvisionsContent">
        <div className="sampleProvisionsUpper">
          <h1 className={pre === "chat"? "secondaryHeading" : `primaryHeading`}>
            {pre === "discounted" ? "Discounted" : (pre === "recents" ? "Recently Viewed" : pre === "related" ? "Related" : "Top")}
            <span> {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}</span>
          </h1>
          <div className='sampleProvisionsUpperRight'>
            <Dropdown selected={selectedType} onSelect={setSelectedType} options={["Products", "Services"]} />
            {/* <Link className="secondaryBtn">View All<i className="fa-solid fa-arrow-right"></i></Link> */}
          </div>
        </div>
        <div className="sampleProvisionsLower">
          <div className="productsDiv">
            {visibleItems.length>0? visibleItems : "Nothing to show here..."}
            {totalItems > maxVisible && (
              <>
                {currentIndex !== 0 && <div className="slideLeftBtn" onClick={handleScrollLeft}>
                  <i className="fa-solid fa-arrow-left"></i>
                </div>}
                {(totalItems - currentIndex) !== maxVisible && <div className="slideRightBtn" onClick={handleScrollRight}>
                  <i className="fa-solid fa-arrow-right"></i>
                </div>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SampleProvisions;
