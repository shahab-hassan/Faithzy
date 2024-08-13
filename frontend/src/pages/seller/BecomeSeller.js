import React, { useContext, useState } from 'react';
import axios from 'axios';
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { FaUpload } from 'react-icons/fa';

import { AuthContext } from "../../utils/AuthContext";

function BecomeSeller({sellerId}) {
  const { isLogin, fetchUserData } = useContext(AuthContext);
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState(null);

  const [sellerDetails, setSellerDetails] = useState({
    profileImage: '',
    firstName: '',
    lastName: '',
    companyName: '',
    displayName: '',
    country: '',
    description: '',
    selling: 'both',
    languages: '',
  });
  
  React.useEffect(()=>{
    if(sellerId){
      const token = localStorage.getItem("token")
      axios.get(`http://localhost:5000/api/v1/sellers/seller/${sellerId}`, {
        headers: {Authorization: `Bearer ${token}`}
      })
      .then(response => {
        if(response.data.success){
          const seller = response.data.seller;
          setPreviewImage(`http://localhost:5000/${seller.profileImage}`);
          setSellerDetails({
            profileImage: seller.profileImage,
            firstName: seller.fullName.split(" ")[0].trim(),
            lastName: seller.fullName.split(" ")[1].trim(),
            companyName: seller.companyName,
            displayName: seller.displayName,
            country: seller.country,
            description: seller.description,
            selling: seller.selling,
            languages: seller.languages
          })
        }
        else
          enqueueSnackbar("Something went wrong!", {variant: "error"})
      })
      .catch(e => {
        console.log(e)
        enqueueSnackbar(e.response.data.error || "Something went wrong!", {variant: "error"})
      })
    }
  }, [sellerId])


  const handleChange = (e) => {
    const { name, value } = e.target;
    setSellerDetails(prevState => ({
      ...prevState, [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSellerDetails(prevState => ({
      ...prevState, profileImage: file
    }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(sellerDetails).forEach(key => {
      formData.append(key, sellerDetails[key]);
    });

    try {
      const token = localStorage.getItem('token');
      let response;
      if(sellerId){
        response = await axios.put(`http://localhost:5000/api/v1/sellers/seller/${sellerId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
      }
      else{
        response = await axios.post(`http://localhost:5000/api/v1/sellers/seller/new`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
      }
      if (response.data.message) {
        enqueueSnackbar(response.data.message, { variant: "success" });
        await fetchUserData();
        if(!sellerId) navigate("/seller/dashboard");
      } else{
        enqueueSnackbar('Something went wrong', { variant: "error" });
      }

    } catch (e) {
      console.log(e)
      enqueueSnackbar(e.response.data.error || 'Something went wrong', { variant: "error" });
    }
  };

  return (
    <div className='becomeSellerDiv'>
      <section className="section">
        <div className="becomeSellerContent">
          <section className="section">

            {!sellerId && <h1 className="primaryHeading">Become a <span>Seller</span></h1>}

            {isLogin ? <form onSubmit={handleSubmit} className='form'>

              <div className='inputDiv'>
                <label>Profile Picture <span>*</span></label>
                <label className='uploadDiv' htmlFor="profileImageInput">
                  {previewImage ? (
                    <img src={previewImage} alt="Profile Preview" />
                  ) : (
                    <FaUpload className='uploadIcon' />
                  )}
                </label>
                <input
                  type="file"
                  id="profileImageInput"
                  className='uploadInput'
                  name="profileImage"
                  onChange={handleFileChange}
                />
              </div>

              <div className='inputDiv'>
                <div className="inputInnerDiv">
                  <label>First Name <span>*</span></label>
                  <input type="text" className='inputField' name="firstName" value={sellerDetails.firstName} onChange={handleChange} placeholder='Enter first name' required />
                </div>
                <div className="inputInnerDiv">
                  <label>Last Name <span>*</span></label>
                  <input type="text" className='inputField' name="lastName" value={sellerDetails.lastName} onChange={handleChange} placeholder='Enter last name' required />
                </div>
                <div className="inputInnerDiv">
                  <label>Company Name</label>
                  <input type="text" className='inputField' name="companyName" value={sellerDetails.companyName} onChange={handleChange} placeholder='Enter company name (optional)' />
                </div>
              </div>

              <div className='inputDiv'>
                <div className="inputInnerDiv">
                  <label>Display Name <span>*</span></label>
                  <input type="text" className='inputField' name="displayName" value={sellerDetails.displayName} onChange={handleChange} placeholder='Enter name to be displayed' required />
                </div>
                <div className="inputInnerDiv">
                  <label>Country <span>*</span></label>
                  <input type="text" className='inputField' name="country" value={sellerDetails.country} onChange={handleChange} placeholder='Enter your country' required />
                </div>
                <div className="inputInnerDiv">
                  <label>What do you want to sell? <span>*</span></label>
                  <select className='inputField' name="selling" value={sellerDetails.selling} onChange={handleChange} required>
                    <option value="products">Products</option>
                    <option value="services">Services</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>

              <div className='inputDiv'>
                <label>Description <span>*</span></label>
                <textarea className='inputField' name="description" value={sellerDetails.description} onChange={handleChange} placeholder='Introduce yourself' required></textarea>
              </div>

              <div className='inputDiv'>
                <label>Languages <span>*</span></label>
                <input className='inputField' type="text" name="languages" value={sellerDetails.languages} onChange={handleChange} placeholder='Enter languages, separated by commas' required />
              </div>

              <button type="submit" className='primaryBtn'>{sellerId? "Update" : "Continue"}</button>

            </form> : <div>Please login to create seller account</div>}

          </section>
        </div>
      </section>
    </div>
  );
}

export default BecomeSeller;
