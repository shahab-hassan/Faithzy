import React from 'react'
import { Link } from 'react-router-dom';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';

function CategoryFilter({ isProduct, categoryName }) {

  const [categories, setCategories] = React.useState([]);
  const [catsShown, setCatsShown] = React.useState(10);


  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/v1/categories/${isProduct ? "product" : "service"}/all`);
        if (response.data.success)
          setCategories(response.data.categories);
        else
          enqueueSnackbar("Something went wrong!", { variant: "error" });
      } catch (e) {
        console.log(e);
        enqueueSnackbar(e.response.data.error || "Something went wrong!", { variant: "error" });
      }
    };
    fetchCategories();
  }, [categoryName, isProduct])


  let categoryElems = categories.length > 0 ? categories.map(category => (
    <Link
      key={category.name}
      to={`/${isProduct ? "products" : "services"}?category=${category.name}`}
      className={`category row ${category.name === categoryName ? "active" : ""}`}
    >
      <input type="radio" name="category" checked={category.name === categoryName} readOnly />
      {category.name}
    </Link>
  )) : [];


  return (
    <div className="categoryFilter filter">
      <h2 className="secondaryHeading">CATEGORY</h2>
      {categoryElems.slice(0, catsShown)}
      {categories.length > catsShown && <p className='seeMore' onClick={() => setCatsShown(prev => prev + 10)}>+ See More</p>}
    </div>
  )
}

export default CategoryFilter