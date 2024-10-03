import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import React, { useState } from 'react'
import { hostNameBack } from '../../utils/constants';
// import Gallery from "../../components/seller/Gallery"

function Contact() {

  const [emailData, setEmailData] = useState({
    fullName: "",
    email: "",
    country: "",
    phoneNumber: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSendEmail = (e) => {

    e.preventDefault();

    if (!emailData.subject || !emailData.message) {
      enqueueSnackbar('Subject and Message are required!', { variant: 'error' });
      return;
    }

    setLoading(true);

    axios.post(`${hostNameBack}/api/v1/settings/admin/receive/email`, emailData)
      .then((response) => {
        if (response.data.success)
          enqueueSnackbar('Email sent successfully!', { variant: 'success' });
        else
          enqueueSnackbar('Failed to send the email.', { variant: 'error' });
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        enqueueSnackbar(error.response?.data?.error || 'Something went wrong.', { variant: 'error' });
        setLoading(false);
      });

  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmailData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className='contactDiv'>
      <section className="section">
        <div className="contactContent">
          <form className="form" onSubmit={handleSendEmail}>
            <h2 className="primaryHeading">Contact <span>Us</span></h2>
            <div className="horizontalLine"></div>

            <div className="inputDiv">
              <div className="inputInnerDiv">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  id="fullName"
                  className="inputField"
                  placeholder="Enter Full Name"
                  value={emailData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="inputInnerDiv">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="inputField"
                  placeholder="Enter Email"
                  value={emailData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="inputDiv">
              <div className="inputInnerDiv">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  name="country"
                  id="country"
                  className="inputField"
                  placeholder="Enter Country"
                  value={emailData.country}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="inputInnerDiv">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  id="phoneNumber"
                  className="inputField"
                  placeholder="Enter Phone Number"
                  value={emailData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="inputDiv">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                name="subject"
                id="subject"
                className="inputField"
                placeholder="Enter Subject"
                value={emailData.subject}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="inputDiv">
              <label htmlFor="message">Message</label>
              <textarea
                name="message"
                id="message"
                className="inputField"
                placeholder="Write your Message"
                value={emailData.message}
                onChange={handleInputChange}
                required
              />
            </div>

            <button type="submit" className='primaryBtn' disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Contact