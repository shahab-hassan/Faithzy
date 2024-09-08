import React, { useContext, useState } from 'react';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { useNavigate, useParams } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';

import { AuthContext } from '../../utils/AuthContext';
import Gallery from '../../components/seller/Gallery';

function CreateService() {

    const { isLogin, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { id } = useParams();

    const [offerDiscount, setOfferDiscount] = useState(false);
    const [serviceImages, setServiceImages] = useState([]);
    const [newQuestion, setNewQuestion] = useState("");
    const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
    const [categories, setCategories] = useState([]);
    const [packages, setPackages] = useState([
        { name: 'BASIC', title: '', description: '', price: 0, deliveryDays: 1, salesPrice: 0, amountToGet: 0 },
        { name: 'STANDARD', title: '', description: '', price: 0, deliveryDays: 1, salesPrice: 0, amountToGet: 0 },
        { name: 'ULTIMATE', title: '', description: '', price: 0, deliveryDays: 1, salesPrice: 0, amountToGet: 0 }
    ]);

    const [serviceDetails, setServiceDetails] = useState({
        serviceImages: [],
        title: '',
        description: '',
        category: "",
        discountPercent: 0,
        discountExpiryDate: 0,
        tags: '',
        questions: []
    });

    const [feesObj, setFeesObj] = React.useState({
        seller: { product: 0, service: 0 },
        paidSeller: { product: 0, service: 0 },
        buyer: { product: 0, service: 0 }
    });

    const crrDate = new Date();
    crrDate.setDate(crrDate.getDate());
    const today = crrDate.toISOString().split('T')[0];

    React.useEffect(() => {

        axios.get("http://localhost:5000/api/v1/settings/admin/feesAndMembership")
            .then(response => {
                if (response.data.success)
                    setFeesObj(response.data.fees);
            })
            .catch(e => {
                console.log(e);
                enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", { variant: "error" });
            })

    }, [])

    React.useEffect(() => {
        axios.get('http://localhost:5000/api/v1/categories/service/all')
            .then(response => {
                if (response.data.success) {
                    let categories = response.data.categories;
                    setCategories(categories);
                    setServiceDetails(prev => ({
                        ...prev,
                        category: categories[0].name
                    }))
                }
                else
                    enqueueSnackbar("Something went wrong!", { variant: "error" })
            })
            .catch(e => {
                console.error(e);
                enqueueSnackbar(e.response.data.error || 'Failed to fetch categories', { variant: 'error' });
            });

        if (id) {
            axios.get(`http://localhost:5000/api/v1/services/service/${id}`)
                .then(response => {
                    if (response.data.success) {
                        const service = response.data.service;
                        setServiceDetails({
                            serviceImages: service.serviceImages,
                            title: service.title,
                            description: service.description,
                            category: service.category,
                            discountPercent: service.discountPercent,
                            discountExpiryDate: "",
                            tags: service.tags,
                            questions: service.questions
                        });
                        if (Number(service.discountPercent) !== 0) setOfferDiscount(true);
                        setServiceImages(service.serviceImages.map(image => `http://localhost:5000/${image}`));
                        setPackages(service.packages);
                    }
                    else
                        enqueueSnackbar("Something went wrong", { variant: "error" });
                })
                .catch(e => {
                    console.log(e)
                    enqueueSnackbar(e.response.data.error || "Something went wrong", { variant: "error" })
                })
        }
    }, [id])

    const categoryOptions = categories.map((category, index) => {
        return <option key={index} value={category.name}>{category.name}</option>
    });

    const addedQuestions = serviceDetails.questions.map((question, index) => {
        return <>
            <div className="reqQuestion">
                <p>{question}</p>
                <div className="icons">
                    <FaEdit className='icon' onClick={() => handleEditQuestion(index)} />
                    <FaTrash className='icon' onClick={() => handleDeleteQuestion(index)} />
                </div>
            </div>
            <div className="horizontalLine"></div>
        </>
    });

    const servicePackages = packages.map((name, index) => {
        return <><div className="servicePackage">
            <h1
                className="secondaryHeading"
                style={index === 0 ? { color: "var(--danger)" } : index === 1 ? { color: "var(--secondaryBlue)" } : { color: "var(--warning)" }}
            >
                {name.name}
            </h1>
            <div className="horizontalLine"></div>
            <div className="form">
                <div className="inputDiv">
                    <label>Package Title <span>*</span></label>
                    <input type="text" name='title' className="inputField" placeholder='Name your package' value={packages[index].title} onChange={e => handlePackageChange(index, e)} required />
                </div>
                <div className="inputDiv">
                    <label>Package Description <span>*</span></label>
                    <textarea name='description' className='inputField' placeholder='Describe your package' value={packages[index].description} onChange={e => handlePackageChange(index, e)} required></textarea>
                </div>
                <div className="inputDiv">
                    <div className="inputInnerDiv">
                        <label>Price ($) <span>*</span></label>
                        <input type='number' name='price' className='inputField' placeholder='Price' value={packages[index].price} onChange={e => handlePackageChange(index, e)} required />
                    </div>
                    <div className="inputInnerDiv">
                        <label>Delivery Time (days) <span>*</span></label>
                        <input type='number' name='deliveryDays' className='inputField' placeholder='Enter delivery days' value={packages[index].deliveryDays} onChange={e => handlePackageChange(index, e)} required />
                    </div>
                </div>
                <div>Sales Price: {packages[index].salesPrice}</div>
                <div>Amount to Get: {packages[index].amountToGet}</div>
            </div>
        </div>
            {index !== 2 && <div className="verticalLine"></div>}
        </>
    })

    const handlePackageChange = (index, e) => {
        const { name, value } = e.target;

        if (name === 'price' && (value < 0 || value > 1000000))
            return;
        else if (name === 'deliveryDays' && (value < 0 || value > 1000))
            return;

        const updatedPackages = [...packages];
        updatedPackages[index][name] = value;
        if (name === 'price')
            updateSalesPriceAndAmount(updatedPackages, index, name, value);
        else
            setPackages(updatedPackages);
    };

    const updateSalesPriceAndAmount = (updatedPackages, index, name, value) => {
        let discountPercent = offerDiscount ? serviceDetails.discountPercent : 0;
        if (name === 'discountPercent') discountPercent = value;

        const tax = user?.sellerId?.sellerType === "Paid" ? Number(feesObj.paidSeller.service) : Number(feesObj.seller.service);

        updatedPackages.forEach((pkg, idx) => {
            pkg.salesPrice = pkg.price - (pkg.price * (discountPercent / 100));
            pkg.amountToGet = pkg.salesPrice - (pkg.salesPrice * (tax / 100));
        });

        setPackages(updatedPackages);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'discountPercent' && (value < 0 || value > 100))
            return;

        setServiceDetails(prevState => ({
            ...prevState,
            [name]: value
        }));
        if (name === 'discountPercent' && offerDiscount)
            updateSalesPriceAndAmount(packages, null, name, value);
    };

    const handleDiscountChange = (e) => {
        setOfferDiscount(e.target.checked);
        if (!e.target.checked) {
            setServiceDetails(prevState => ({
                ...prevState,
                discountPercent: 0,
                discountExpiryDate: new Date()
            }));
            updateSalesPriceAndAmount(packages, null, 'discountPercent', 0);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const galleryImageUrls = [];

        const newImages = files.map(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                galleryImageUrls.push(reader.result);
                if (galleryImageUrls.length === files.length)
                    setServiceImages(galleryImageUrls);
            };
            reader.readAsDataURL(file);
            return file;
        });

        setServiceDetails(prev => ({
            ...prev,
            serviceImages: [...newImages]
        }));
    };


    const handleAddQuestion = (e) => {
        e.preventDefault();
        if (newQuestion.trim() !== "") {
            const updatedQuestions = [...serviceDetails.questions];
            if (editingQuestionIndex !== null) {
                updatedQuestions[editingQuestionIndex] = newQuestion;
                setEditingQuestionIndex(null);
            } else {
                updatedQuestions.push(newQuestion);
            }
            setServiceDetails(prevState => ({
                ...prevState,
                questions: updatedQuestions
            }));
            setNewQuestion("");
        }
    };

    const handleEditQuestion = (index) => {
        setNewQuestion(serviceDetails.questions[index]);
        setEditingQuestionIndex(index);
    };

    const handleDeleteQuestion = (index) => {
        const updatedQuestions = serviceDetails.questions.filter((_, i) => i !== index);
        setServiceDetails(prevState => ({
            ...prevState,
            questions: updatedQuestions
        }));
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (serviceImages.length > 5) {
            enqueueSnackbar("Max '5' images are allowed", { variant: "warning" })
            return;
        }
        if (serviceImages.length === 0) {
            enqueueSnackbar("Atleast '1' galley image is required!", { variant: "warning" })
            return;
        }
        if (serviceDetails.questions.length < 1) {
            enqueueSnackbar("Atleast add 1 Question!", { variant: "warning" })
            return;
        }

        const formData = new FormData();

        Object.keys(serviceDetails).forEach(key => {
            if (key !== "serviceImages" && key !== "questions" && key !== "packages")
                formData.append(key, serviceDetails[key]);
        });

        serviceDetails.serviceImages.forEach(file => {
            formData.append('serviceImages', file);
        });

        formData.append("questions", JSON.stringify(serviceDetails.questions));

        formData.append("packages", JSON.stringify(packages));

        try {
            const token = localStorage.getItem("token");
            if (id) {
                await axios.put(`http://localhost:5000/api/v1/services/seller/service/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                });
            }
            else {
                await axios.post("http://localhost:5000/api/v1/services/seller/service/new", formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                });
            }
            enqueueSnackbar(`Post ${id ? "updated" : "created"} successfully!`, { variant: 'success' });
            navigate('/seller/postings');
        } catch (error) {
            console.log(error);
            enqueueSnackbar(error.response.data.error || 'Something went wrong!', { variant: 'error' });
        }
    }

    return (
        <div className='createServiceDiv'>
            <section className="section">
                <div className="createServiceContent">

                    <h1 className="primaryHeading">{id ? "Update" : "Add New"} <span>Post</span></h1>

                    {isLogin ? user.role === "seller" ?
                        <form className='form' onSubmit={handleSubmit}>

                            <div className='inputDiv'>
                                <label>Title <span>*</span></label>
                                <input type="text" className='inputField' name="title" value={serviceDetails.title} onChange={handleChange} placeholder='Enter post title' required />
                            </div>

                            <div className='inputDiv'>
                                <label>Category <span>*</span></label>
                                <select name="category" className='inputField' value={serviceDetails.category} onChange={handleChange} required>
                                    {categoryOptions}
                                </select>
                            </div>

                            <div className="servicePackagesDiv">
                                {servicePackages}
                            </div>

                            <div className='inputDiv'>
                                <div className="checkboxDiv">
                                    <input
                                        type="checkbox"
                                        className="checkbox"
                                        id='checkbox'
                                        name="offerDiscount"
                                        checked={offerDiscount}
                                        onChange={handleDiscountChange}
                                    />
                                    <label htmlFor='checkbox'>Offer Discount</label>
                                </div>
                            </div>

                            {offerDiscount && (
                                <div className='inputDiv'>
                                    <div className='inputInnerDiv'>
                                        <label>Discount (%) <span>*</span></label>
                                        <input type="number" className='inputField' name="discountPercent" value={serviceDetails.discountPercent} onChange={handleChange} required />
                                    </div>
                                    <div className='inputInnerDiv'>
                                        <label>Discount Expiry <span>*</span></label>
                                        <input type="date" className='inputField' name="discountExpiryDate" value={serviceDetails.discountExpiryDate} onChange={handleChange} min={today} required />
                                    </div>
                                </div>
                            )}

                            <div className='inputDiv'>
                                <label>Description <span>*</span></label>
                                <textarea name="description" className='inputField' value={serviceDetails.description} onChange={handleChange} placeholder='Describe your posting' required></textarea>
                            </div>

                            <Gallery images={serviceImages} setImages={setServiceImages} handleImageChange={handleImageChange} />

                            <div className="inputDiv">
                                <label>Requirements <span>*</span></label>
                                {serviceDetails.questions.length > 0 && <div className="reqQuestions">
                                    {addedQuestions}
                                </div>}
                                <div className="addReq">
                                    <input
                                        type="text"
                                        className="inputField"
                                        placeholder='Enter question'
                                        value={newQuestion}
                                        onChange={(e) => setNewQuestion(e.target.value)}
                                    />
                                    <button className='secondaryBtn' onClick={handleAddQuestion}>{editingQuestionIndex === null ? "Add" : "Update"}</button>
                                </div>
                            </div>

                            <div className='inputDiv'>
                                <label>Tags</label>
                                <input type="text" className='inputField' name="tags" value={serviceDetails.tags} onChange={handleChange} placeholder='Enter tags' />
                            </div>

                            <button type="submit" className='primaryBtn'>{id ? "Update" : "Create"} Post</button>
                        </form>

                        :
                        <div>You are not a seller. Please create seller account to access this page</div>
                        :
                        <div>Please login to create a Post</div>
                    }

                </div>
            </section>
        </div>
    )
}

export default CreateService