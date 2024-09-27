import React, { useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from '../../utils/AuthContext';
import { FaFileAlt, FaFilePdf, FaFileWord } from 'react-icons/fa';
import { enqueueSnackbar } from 'notistack';
import axios from 'axios';
import { formatDateTime } from '../../utils/utilFuncs';
import { IoIosChatboxes, IoIosCloseCircle, IoIosCloseCircleOutline } from 'react-icons/io';
import { CgAttachment } from 'react-icons/cg';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';

function DisputeChatRoom({ disputeId, isSourceAdmin }) {

    const { user, admin } = useContext(AuthContext);
    const [message, setMessage] = useState("");
    const messagesEndRef = useRef(null);
    const [file, setFile] = useState(null);
    const [showImageModel, setShowImageModel] = useState(null);
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');

    const [dispute, setDispute] = useState(null);
    // const [subOrder, setSubOrder] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {

        axios.get(`http://localhost:5000/api/v1/disputes/dispute/${disputeId}`, { headers: { Authorization: `${isSourceAdmin ? "Admin" : "Bearer"} ${isSourceAdmin ? adminToken : token}` } })
            .then(response => {
                if (response.data.success) {
                    setDispute(response.data.dispute)
                    // setSubOrder(response.data.subOrder)
                    setMessages(response.data.dispute.messages)
                }
            })
            .catch(e => {
                console.log(e);
                enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", { variant: "error" });
            });

    }, [adminToken, disputeId, isSourceAdmin, token])

    useEffect(() => {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {

        let userId = null;
        if (token || adminToken) {
            const decodedToken = jwtDecode(token || adminToken);
            userId = decodedToken.id;
        }

        const socket = io('http://localhost:5000', {
            query: { userId }
        });

        socket.on('receiveDisputeMessage', (newMessage) => {
            setMessages(prevMessages => [...prevMessages, newMessage]);
        });

        return () => {
            socket.off('receiveDisputeMessage');
        };
    }, [adminToken, messages, token]);

    const renderDocumentIcon = (fileType) => {
        if (fileType === 'application/pdf')
            return <FaFilePdf size={24} />;
        else if (fileType === 'application/msword' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
            return <FaFileWord size={24} />;
        else
            return <FaFileAlt size={24} />;
    };

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const removeFile = () => {
        setFile(null);
    };

    const sendMessage = async () => {
        if (!message.trim() && !file) return;

        const formData = new FormData();
        formData.append('disputeId', dispute._id);
        formData.append('senderId', user ? user?._id : admin._id);
        formData.append('receiverIds', JSON.stringify([dispute.buyerId._id, dispute.sellerId.userId._id]));
        formData.append('text', message);
        if (file) formData.append('file', file);

        try {
            const response = await axios.post(`http://localhost:5000/api/v1/disputes/sendMessage`, formData, { headers: { Authorization: `${isSourceAdmin ? "Admin" : "Bearer"} ${isSourceAdmin ? adminToken : token}` } });
            if (response.data.success) {
                setMessages(prevMessages => [...prevMessages, response.data.message]);
                setMessage("");
                setFile(null);
            }
        } catch (error) {
            console.error(error);
            enqueueSnackbar(error?.response?.data?.error || "Something went wrong!", { variant: "error" });
        }
    };


    return (
        <div className={`disputeChatDiv ${isSourceAdmin && "adminManageDisputeContainer"}`}>
            <div className="chatRoom">

                <div className="messages content">
                    {messages.length > 0 ? messages.map((msg, index) => (
                        <div key={index} className={msg.senderId === (user ? user?._id : admin?._id) ? "message sent" : "message received"}>
                            <div className='senderName fw600 lightBlackPrimary fs09'>
                                <div>{msg.senderId === (user?._id || admin?._id)? "You" : msg.senderId === dispute.buyerId?._id ? dispute.buyerId?.username + " - Buyer" : msg.senderId === dispute.sellerId?.userId?._id ? dispute.sellerId?.userId?.username + " - Seller" : "Admin"}</div>
                                <span className='messageTime'>{formatDateTime(msg.timestamp)}</span>
                            </div>
                            <div>{msg.text}</div>
                            {msg.fileUrl && (
                                <div className="fileBox">
                                    {msg.fileType.startsWith('image/') && (
                                        <img src={`http://localhost:5000/${msg.fileUrl}`} alt="Attachment" style={{ maxWidth: '100px', maxHeight: '100px', cursor: "pointer" }} onClick={() => setShowImageModel(msg.fileUrl)} />
                                    )}
                                    {msg.fileType.startsWith('video/') && (
                                        <video controls style={{ maxWidth: '100%', maxHeight: '100%' }}>
                                            <source src={`http://localhost:5000/${msg.fileUrl}`} type={msg.fileType} />
                                            Your browser does not support the video tag.
                                        </video>
                                    )}
                                    {msg.fileType.startsWith('application/') && (
                                        <div className="documentBox">
                                            {renderDocumentIcon(msg.fileType)}
                                            <div className="fileInfo">
                                                <a href={`http://localhost:5000/${msg.fileUrl}`} download>Download</a>
                                            </div>
                                        </div>
                                    )}
                                </div>)}
                        </div>
                    )) : <div className='nothingFound'>
                        <IoIosChatboxes className='icon' />
                        <div>Start the conversation to resolve the dispute!</div>
                    </div>}
                    <div ref={messagesEndRef} />
                </div>

                <div className="writeMessageDiv">
                    <div className="upper">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder='Type a Message'
                        />
                    </div>
                    {file && (
                        <div className="filePreview">
                            <p>{file.name}</p>
                            <IoIosCloseCircle className='removeFileIcon' onClick={removeFile} />
                        </div>
                    )}
                    <div className="lower">
                        <div className='left'>
                            <div>
                                <label htmlFor='fileInput'><CgAttachment className='attachIcon icon' /></label>
                                <input
                                    type="file"
                                    className="hidden"
                                    id="fileInput"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>
                        <div className="right">
                            <button className='primaryBtn' onClick={sendMessage}>Send</button>
                        </div>
                    </div>
                </div>

            </div>
            {showImageModel &&
                <div className="popupDiv">
                    <div className="popupContent">

                        <div className="form">

                            <h2 className="secondaryHeading"><span>Preview</span> Image</h2>

                            <div className="horizontalLine"></div>

                            <div className="imgDiv previewImgDiv">
                                <img src={`http://localhost:5000/${showImageModel}`} alt="Error" />
                            </div>

                            <div className="buttonsDiv">
                                <button className='secondaryBtn' onClick={() => setShowImageModel(null)}>Close</button>
                            </div>

                        </div>

                        <div className="popupCloseBtn">
                            <IoIosCloseCircleOutline className='icon' onClick={() => setShowImageModel(null)} />
                        </div>

                    </div>
                </div>
            }
        </div>
    )
}

export default DisputeChatRoom