import React from 'react'
// import Gallery from "../../components/seller/Gallery"

function Contact() {
  return (
    <div className='contactDiv'>
      <section class="section">

        <div className="contactContent">

          <form className="form">

            <h2 class="primaryHeading">Contact <span>Us</span></h2>

            <div class="horizontalLine"></div>

            <div class="inputDiv">
              <div class="inputInnerDiv">
                <label for="fullName">Full Name</label>
                <input type="text" name='fullName' id='fullName' class="inputField" placeholder='Enter Full Name' required />
              </div>
              <div class="inputInnerDiv">
                <label for="email">Email</label>
                <input type="email" name='email' id='email' class="inputField" placeholder='Enter Email' required />
              </div>
            </div>

            <div class="inputDiv">
              <div class="inputInnerDiv">
                <label for="country">Country</label>
                <input type="text" name='country' id='country' class="inputField" placeholder='Enter Country' required />
              </div>
              <div class="inputInnerDiv">
                <label for="phone">Phone Number</label>
                <input type="number" name='phone' id='phone' class="inputField" placeholder='Enter Phone Number' required />
              </div>
            </div>

            <div class="inputDiv">
              <label for="subject">Subject</label>
              <input type="text" name='subject' id='subject' class="inputField" placeholder='Enter Subject' required />
            </div>

            <div class="inputDiv">
              <label for="message">Message</label>
              <textarea name='message' id='message' class="inputField" placeholder='Write your Message' required />
            </div>

            <button type="submit" className='primaryBtn'>Send Message</button>

            {/* <Gallery /> */}

          </form>

        </div>
      </section>
    </div>
  )
}

export default Contact