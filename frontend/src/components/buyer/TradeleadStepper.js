import React, { useEffect, useState } from 'react';
import { MdKeyboardArrowLeft } from "react-icons/md";
import { MdKeyboardArrowRight } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import { enqueueSnackbar } from 'notistack';
import axios from 'axios';

function TradeleadStepper() {
    const [currentStep, setCurrentStep] = useState(1);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        budget: 0,
        duration: 1,
        expiryDate: ''
    });

    const crrDate = new Date();
    crrDate.setDate(crrDate.getDate());
    const today = crrDate.toISOString().split('T')[0];

    useEffect(() => {
        axios.get(`http://localhost:5000/api/v1/categories/service/all`)
            .then(response => {
                if (response.data.success) {
                    const fetchedCategories = response.data.categories;
                    setCategories(fetchedCategories);
                    setFormData(prev => ({
                        ...prev,
                        category: fetchedCategories[0].name
                    }))
                }
            })
            .catch(e => {
                enqueueSnackbar(e.response?.data?.error || 'Something went wrong!', { variant: 'error' });
            });
    }, []);

    const handleInputChange = (e) => {

        const {name, value} = e.target;

        if(name === "budget" && (value<0 || value>1000000))
            return;
        else if(name === "duration" && (value<0 || value>1000))
            return;

        setFormData({ ...formData, [name]: value });
    };

    const handleNext = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem('token');
        
        for(let item in formData){
            if(formData[item] === '' || (item === "budget" && formData[item] === 0)){
                enqueueSnackbar("All Fields are Required!", {variant: 'error'});
                return;
            }
        }

        try {
            const response = await axios['post']('http://localhost:5000/api/v1/tradeleads/request', formData, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) {
                enqueueSnackbar(`Request posted' successfully`, { variant: 'success' });
                setFormData({
                    title: '',
                    description: '',
                    category: '',
                    budget: 0,
                    duration: 1,
                    expiryDate: ''
                });
                setCurrentStep(1);
            } else {
                enqueueSnackbar('Something went wrong!', { variant: 'error' });
            }
        } catch (e) {
            console.log(e);
            enqueueSnackbar(e.response?.data?.error || 'Something went wrong!', { variant: 'error' });
        }
    };

    return (
        <div className="tradeleadStepper">

            <div className="stepper">
                <div className={`step ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>1</div>
                <div className={`stepConnector ${currentStep > 1 ? 'active' : ''}`}></div>
                <div className={`step ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>2</div>
                <div className={`stepConnector ${currentStep > 2 ? 'active' : ''}`}></div>
                <div className={`step ${currentStep === 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>3</div>
                <div className={`stepConnector ${currentStep === 4 ? 'active' : ''}`}></div>
                <div className={`step ${currentStep === 4 ? 'active' : ''}`}>4</div>
            </div>

            <div className="stepContent">

                {currentStep === 1 && (
                    <div className="step1 stepInputs">
                        <div className="tradeleadInputDiv">
                            <label>Create an offer, what are you looking for?</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Enter title"
                                className='inputField'
                            />
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="step2 stepInputs">
                        <div className="tradeleadInputDiv">
                            <label>Select Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className='inputField'
                                required
                            >
                                {categories.map((category, index) => (
                                    <option key={index} value={category.name}>{category.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="tradeleadInputDiv">
                            <label>Enter Budget ($)</label>
                            <input
                                type="number"
                                name="budget"
                                value={formData.budget}
                                onChange={handleInputChange}
                                placeholder="Enter budget"
                                className='inputField'
                            />
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="step3 stepInputs">
                        <div className="tradeleadInputDiv">
                            <label>Enter Duration</label>
                            <input
                                type="number"
                                name="duration"
                                value={formData.duration}
                                onChange={handleInputChange}
                                placeholder="Enter duration"
                                className='inputField'
                            />
                        </div>
                        <div className="tradeleadInputDiv">
                            <label>Offer Expiry</label>
                            <input
                                type="date"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleInputChange}
                                className='inputField tradeleadDate'
                                min={today}
                            />
                        </div>
                    </div>
                )}

                {currentStep === 4 && (
                    <div className="step4 stepInputs">
                        <div className="tradeleadInputDiv">
                            <label>Enter Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Enter brief description"
                                className='inputField tradeleadDescription'
                            />
                        </div>
                    </div>
                )}

            </div>

            <div className="stepButtons">
                <button className="leftArrow" onClick={handleBack}>
                    <MdKeyboardArrowLeft className='arrowIcon' />
                </button>
                <button className="rightArrow" onClick={currentStep < 4 ? handleNext : handleSubmit} >
                    {currentStep < 4 && <MdKeyboardArrowRight className='arrowIcon' />}
                    {currentStep === 4 && <FaCheck className='arrowIcon' />}
                </button>
                {/* {currentStep > 1 && <button onClick={handleBack}>Back</button>}
                {currentStep < 4 && <button onClick={handleNext}>Next</button>}
                {currentStep === 4 && <button onClick={handleSubmit}>Submit</button>} */}
            </div>

        </div>
    );
}

export default TradeleadStepper;
