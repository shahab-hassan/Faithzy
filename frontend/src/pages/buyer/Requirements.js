import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function Requirements() {

    const { orderId } = useParams();
    const [order, setOrder] = React.useState(null);
    const token = localStorage.getItem("token");
    const [answers, setAnswers] = React.useState([]);

    const navigate = useNavigate();

    React.useEffect(() => {
        axios.get(`http://localhost:5000/api/v1/orders/buyer/service/${orderId}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(response => {
                if (response.data.success)
                    setOrder(response.data.order);
            })
            .catch(e => {
                console.log(e);
                enqueueSnackbar(e.response.data.error || "Something went wrong!", { variant: "error" });
            })
    }, [orderId, token])

    const questions = order && order.service.serviceId.questions.map((question, index) => {
        return <div className='inputDiv' key={index}>
            <label>{question} <span>*</span></label>
            <textarea
                type="text"
                className='inputField'
                placeholder='Enter Answer...'
                value={answers[index] || ''}
                onChange={(e) => handleChange(index, e.target.value)}
                required
            />
        </div>
    })

    const handleChange = (index, value) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (answers.length !== order.service.serviceId.questions.length) {
            enqueueSnackbar("Please answer all Questions", { variant: "warning" })
            return;
        }

        try {
            await axios.put(`http://localhost:5000/api/v1/orders/buyer/service/answers/${orderId}`, { answers }, { headers: { Authorization: `Bearer ${token}` } });
            enqueueSnackbar("Answers submitted successfully!", { variant: 'success' });
            navigate("/orders?s=t")
        } catch (e) {
            console.error(e);
            enqueueSnackbar(e?.response?.data?.error || "Failed to submit answers", { variant: 'error' });
        }
    }

    return (
        <div className='requirementsDiv'>
            <section className="section">
                <div className="requirementsContent">

                    <form className="form" onSubmit={handleFormSubmit}>
                        <h1 className="primaryHeading"><span>Req</span>uirements</h1>
                        <p>{order?.service?.serviceId?.sellerId?.fullName} has some questions for you to answer. Answer them and let's get started...</p>
                        {questions}
                        <button type='submit' className='primaryBtn'>Submit</button>
                    </form>

                </div>
            </section>
        </div>
    )
}

export default Requirements