import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';
import { IoIosCloseCircleOutline } from "react-icons/io";

function AdminSendEmail() {
    const [receiverEmail, setReceiverEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [buttons, setButtons] = useState([{ title: '', url: '' }]);
    const { id } = useParams();
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        axios
            .get(`http://localhost:5000/api/v1/auth/getUser/${id}`)
            .then((response) => {
                if (response.data.success)
                    setReceiverEmail(response.data.user.email);
            })
            .catch((error) => {
                console.log(error);
                enqueueSnackbar(error.response?.data?.error || 'Something went wrong.', { variant: 'error' });
            });
    }, [id])

    const addButton = () => {
        setButtons([...buttons, { title: '', url: '' }]);
    };

    const removeButton = (index) => {
        setButtons(buttons.filter((_, i) => i !== index));
    };

    const handleSendEmail = (e) => {
        e.preventDefault();
        if (!subject || !message) {
            enqueueSnackbar('Subject and Message are required!', { variant: 'error' });
            return;
        }

        for (let btn of buttons) {
            if (btn.title === '' || btn.url === '') {
                enqueueSnackbar('Each button must have both a title and a URL!', { variant: 'error' });
                return;
            }
        }

        const emailData = {
            receiverEmail,
            subject,
            message,
            buttons,
        };

        setLoading(true);

        axios
            .post('http://localhost:5000/api/v1/settings/admin/send/email', emailData)
            .then((response) => {
                if (response.data.success)
                    enqueueSnackbar('Email sent successfully!', { variant: 'success' });
                else
                    enqueueSnackbar('Failed to send the email.', { variant: 'error' });
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                enqueueSnackbar(error.response?.data?.error || 'Something went wrong.', { variant: 'error' });
                setLoading(false);
            });
    };

    return (
        <div className="adminSendEmailDiv">
            <div className="adminSendEmailContent">

                <form onSubmit={handleSendEmail} className='form'>

                    <h2 className="secondaryHeading">Send Email to: <span>{receiverEmail}</span></h2>

                    <div className="horizontalLine"></div>

                    <div className="inputDiv">
                        <label htmlFor="subject">Subject <span>*</span></label>
                        <input
                            type="text"
                            name="subject"
                            className="inputField"
                            placeholder="Enter Subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                        />
                    </div>

                    <div className="inputDiv">
                        <label htmlFor="message">Message <span>*</span></label>
                        <textarea
                            name="message"
                            className="inputField"
                            placeholder="Enter Message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        />
                    </div>

                    <div className="buttonsSection inputDiv">
                        <div className='upper'>
                            <div>Buttons</div>
                            <button type="button" className='addBtn secondaryBtn' onClick={addButton}>Add Button</button>
                        </div>
                        {buttons.map((button, index) => (
                            <div key={index} className="buttonInputDiv">
                                <input
                                    type="text"
                                    className="inputField btnTitleInput"
                                    placeholder="Button Title"
                                    value={button.title}
                                    onChange={(e) =>
                                        setButtons(
                                            buttons.map((btn, i) =>
                                                i === index ? { ...btn, title: e.target.value } : btn
                                            )
                                        )
                                    }
                                    required
                                />
                                <input
                                    type="url"
                                    className="inputField btnUrlInput"
                                    placeholder="Button URL"
                                    value={button.url}
                                    onChange={(e) =>
                                        setButtons(
                                            buttons.map((btn, i) =>
                                                i === index ? { ...btn, url: e.target.value } : btn
                                            )
                                        )
                                    }
                                    required
                                />
                                <div className="removeBtnDiv">
                                    <IoIosCloseCircleOutline className='removeBtn' onClick={() => removeButton(index)} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <button type="submit" className="primaryBtn" disabled={loading}>Send Email</button>

                </form>
            </div>
        </div>
    );
}

export default AdminSendEmail;
