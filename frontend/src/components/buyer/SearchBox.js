import React from 'react'
import Dropdown from '../../components/common/Dropdown'

function SearchBox() {
  return (
    <div className='searchBoxDiv'>
        <div className="searchBoxMain">
            <div className="searchBoxLeft">
                <input type="text" placeholder='Which product you are looking for?' className='searchInput' />
            </div>
            <div className="searchBoxRight">
                <Dropdown options={["Products", "Services"]} isSimple={true} />
            </div>
        </div>
        <div className="searchBtnDiv">
            <i className="fa-solid fa-magnifying-glass"></i>
        </div>
    </div>
  )
}

export default SearchBox