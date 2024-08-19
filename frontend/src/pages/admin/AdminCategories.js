import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { enqueueSnackbar } from 'notistack';
import Dropdown from '../../components/common/Dropdown';
import { IoIosCloseCircleOutline } from 'react-icons/io';

function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showAddNewModal, setShowAddNewModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', type: 'product' });
    const [filterType, setFilterType] = useState('All');



    useEffect(() => {

        const fetchCategories = () => {
            const token = localStorage.getItem('adminToken');
            let url = 'http://localhost:5000/api/v1/categories/';
            if (filterType === 'Products') {
                url = 'http://localhost:5000/api/v1/categories/product/all';
            } else if (filterType === 'Services') {
                url = 'http://localhost:5000/api/v1/categories/service/all';
            }
            axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then((response) => {
                    if (response.data.success) setCategories(response.data.categories || response.data.productCategories || response.data.serviceCategories);
                })
                .catch((e) => {
                    enqueueSnackbar(e.response?.data?.error || 'Something went wrong!', { variant: 'error' });
                });
        };

        fetchCategories();
    }, [filterType]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCategory({ ...newCategory, [name]: value });
    };

    const handleAddNewCategory = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('adminToken');
        axios.post('http://localhost:5000/api/v1/categories/category/new', newCategory, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((response) => {
                if (response.data.success) {
                    setCategories([response.data.category, ...categories]);
                    enqueueSnackbar('Category added successfully!', { variant: 'success' });
                    setShowAddNewModal(false);
                }
            })
            .catch((e) => {
                enqueueSnackbar(e.response?.data?.error || 'Something went wrong!', { variant: 'error' });
            });
    };

    const handleEditCategory = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('adminToken');
        axios.put(`http://localhost:5000/api/v1/categories/category/${selectedCategory._id}`, newCategory, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((response) => {
                if (response.data.success) {
                    const updatedCategory = response.data.category;

                    const updatedCategories = categories.filter(cat => cat._id !== selectedCategory._id);
                    updatedCategories.unshift(updatedCategory);

                    setCategories(updatedCategories);
                    enqueueSnackbar('Category updated successfully!', { variant: 'success' });
                    setShowAddNewModal(false);
                    setIsEditing(false);
                }
            })
            .catch((e) => {
                enqueueSnackbar(e.response?.data?.error || 'Something went wrong!', { variant: 'error' });
            });
    };


    const handleDeleteCategory = (categoryId) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        const token = localStorage.getItem('adminToken');
        axios.delete(`http://localhost:5000/api/v1/categories/category/${categoryId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((response) => {
                if (response.data.success) {
                    setCategories(categories.filter(cat => cat._id !== categoryId));
                    enqueueSnackbar('Category deleted successfully!', { variant: 'success' });
                }
            })
            .catch((e) => {
                enqueueSnackbar(e.response?.data?.error || 'Something went wrong!', { variant: 'error' });
            });
    };

    const openEditModal = (category) => {
        setSelectedCategory(category);
        setNewCategory({ name: category.name, type: category.type });
        setIsEditing(true);
        setShowAddNewModal(true);
    };

    const openAddNewModal = () => {
        setNewCategory({ name: '', type: 'product' });
        setIsEditing(false);
        setShowAddNewModal(true);
    };

    const categoryElems = categories.length > 0 ? categories.map((item, index) => (
        <div key={index}>
            <div className="requestRow row">
                <div className="titleField field">
                    <p className="title">{item.name}</p>
                </div>
                <p className="idField field">#{item._id}</p>
                <p className="typeField field">{item.type}</p>
                <p className="countField field">{item.count}</p>
                <div className="actionsField field">
                    <FaEdit className="icon" onClick={() => openEditModal(item)} />
                    <FaTrash className="icon" onClick={() => handleDeleteCategory(item._id)} />
                </div>
            </div>
            {categories.length > 1 && categories.length - 1 !== index && <div className="horizontalLine"></div>}
        </div >
    ))
        : <div className="row">Nothing to show here...</div>;

    return (
        <div className='adminCategoriesDiv'>
            <div className="adminCategoriesContent">
                <div className="tableDiv">
                    <div className="tableContent">
                        <div className="upper">
                            <h2 className="secondaryHeading">
                                <span>All </span>Categories
                                <span className="totalRows">- {(categories.length < 10 && '0') + categories.length}</span>
                            </h2>
                            <div className="upperRight">
                                <Dropdown options={["All", "Products", "Services"]} onSelect={setFilterType} selected={filterType} />
                                <button className="primaryBtn2" onClick={openAddNewModal}>Add Category</button>
                            </div>
                        </div>
                        <div className="header">
                            <p className="title">Name</p>
                            <p className="id">Category ID</p>
                            <p>Type</p>
                            <p>Total Items</p>
                            <p>Actions</p>
                        </div>
                        <div className="rows">{categoryElems}</div>
                    </div>
                </div>
            </div>

            {showAddNewModal && (
                <div className="popupDiv addNewModelDiv">
                    <div className="popupContent">
                        <form className="form" onSubmit={isEditing ? handleEditCategory : handleAddNewCategory}>
                            <div className="inputDiv">
                                <label>Name <span>*</span></label>
                                <input
                                    type="text"
                                    className="inputField"
                                    name="name"
                                    value={newCategory.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter Category Name"
                                    required
                                />
                            </div>
                            <div className="inputDiv">
                                <label>Type</label>
                                <Dropdown
                                    options={['product', 'service']}
                                    selected={newCategory.type}
                                    onSelect={(value) => setNewCategory({ ...newCategory, type: value })}
                                />
                            </div>
                            <div className="buttonsDiv">
                                <button className="primaryBtn" type="submit">
                                    {isEditing ? 'Save Changes' : 'Add Category'}
                                </button>
                                <button className="secondaryBtn" type="button" onClick={() => setShowAddNewModal(false)}>
                                    Close
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="popupCloseBtn">
                        <IoIosCloseCircleOutline className="icon" onClick={() => setShowAddNewModal(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminCategories;
