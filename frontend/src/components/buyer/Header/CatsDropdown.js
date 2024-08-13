import React from 'react';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

function CatsDropdown({ isProduct, closeDropdowns }) {
  const [categories, setCategories] = React.useState([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    axios.get(`http://localhost:5000/api/v1/categories/${isProduct ? "product" : "service"}/all`)
      .then(response => {
        if (response.data.success)
          setCategories(response.data.categories);
        else
          enqueueSnackbar("Something went wrong!", { variant: "error" });
      })
      .catch(e => {
        enqueueSnackbar(e.response.data.error || "Something went wrong!", { variant: "error" });
      });
  }, [isProduct]);

  const handleCategoryClick = (categoryName) => {
    navigate(`/${isProduct ? "products" : "services"}/${categoryName}`);
    closeDropdowns();
  };

  const categoriesElems = categories.map((category, index) => {
    return <div key={index} className='cat' onClick={() => handleCategoryClick(category.name)}>
      {category.name}
      <MdKeyboardArrowRight />
    </div>;
  });

  return (
    <div className='catsDropdownDiv'>
      <div className="catsDropdownContent">
        {categoriesElems}
      </div>
    </div>
  );
}

export default CatsDropdown;
