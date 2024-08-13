import React from 'react'
import { FaPlusCircle} from 'react-icons/fa';

function Gallery({images, setImages, handleImageChange}) {
  return (
    <div className="galleryDiv">

        <div className="galleryUpper">
            <label>Gallery<span className='imagesLimit' style={images.length>5? {color: "var(--warning)"} : {color: "var(--darkGray)"}}> ({images.length}/5)</span> <span> *</span></label>
            {images.length>0 && <div className='clearBtn' onClick={()=> setImages([])}>Clear</div>}
        </div>

        <div className="galleryContent">
            <label htmlFor='galleryUpload' className="galleryImages">
                {images.length>0? images.map((image, index) => <img key={index} src={image} alt="Error" className="galleryImage" />) 
                : 
                <FaPlusCircle className="uploadIcon" />}
            </label>
            <input type="file" id="galleryUpload" className="inputField" name='serviceImage' onChange={handleImageChange} multiple/>
        </div>

    </div>
  )
}

export default Gallery