import React from 'react'
import Dropdown from '../../components/common/Dropdown'
import { useNavigate, useLocation } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';

function SearchBox() {


    const [search, setSearch] = React.useState("");
    const [selectedOption, setSelectedOption] = React.useState("Products");
    const navigate = useNavigate();
    const location = useLocation();


    React.useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const searchQuery = searchParams.get("search");

        if (location.pathname.startsWith("/products") || location.pathname.startsWith("/services")) {
            if (searchQuery)
                setSearch(searchQuery);
            else
                setSearch("");
        }
        else
            setSearch("");
    }, [location]);


    const handleSearch = () => {
        if (search)
            navigate(`/${selectedOption.toLowerCase()}?search=${search}`);
        else
            enqueueSnackbar("Please enter a search term!", { variant: "warning" });
    };


    return (
        <div className='searchBoxDiv'>

            <div className="searchBoxMain">

                <div className="searchBoxLeft">
                    <input
                        type="text"
                        placeholder="Enter what you are looking for?"
                        className="searchInput"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>

                <div className="searchBoxRight">
                    <Dropdown
                        options={["Products", "Services"]}
                        isSimple={true}
                        selected={selectedOption}
                        onSelect={setSelectedOption}
                    />
                </div>

            </div>

            <div className="searchBtnDiv" onClick={handleSearch}>
                <i className="fa-solid fa-magnifying-glass"></i>
            </div>

        </div>
    )
}

export default SearchBox