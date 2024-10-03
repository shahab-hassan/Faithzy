/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '../../utils/AuthContext';
import { useSearchParams, Link } from 'react-router-dom';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { CgAttachment } from "react-icons/cg";
import { FaUsersSlash } from "react-icons/fa";
import { IoIosChatboxes, IoMdStopwatch } from "react-icons/io";
import { TbInboxOff, TbTruckDelivery } from "react-icons/tb";
import { FaStar } from "react-icons/fa";
import SampleProvisions from '../../components/buyer/SampleProvisions';
import { IoIosCloseCircleOutline, IoIosCloseCircle } from "react-icons/io";
import { FaFilePdf, FaFileWord, FaFileAlt } from "react-icons/fa";
import { MdOutlineLocalOffer } from "react-icons/md";
import { FaBasketShopping } from "react-icons/fa6";
import { hostNameBack } from '../../utils/constants';


let socket;

const ChatPage = () => {
    const { user, admin } = useContext(AuthContext);
    const [chats, setChats] = useState([]);
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [isParticipantAdmin, setIsParticipantAdmin] = useState(false);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [searchParams] = useSearchParams();
    const messagesEndRef = useRef(null);
    const [file, setFile] = useState(null);
    const [showImageModel, setShowImageModel] = useState(null);
    const [showQuoteModel, setShowQuoteModel] = useState(false);
    const [quoteType, setQuoteType] = useState('product');
    const [quoteItems, setQuoteItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [offerDetails, setOfferDetails] = useState({
        productId: '',
        serviceId: '',
        title: '',
        description: '',
        offerAmount: '',
        quantity: 1,
        shippingFee: 0,
        duration: 1,
    });
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');

    React.useEffect(() => {
        let userId = null;
        if (token || adminToken) {
            const decodedToken = jwtDecode(token || adminToken);
            userId = decodedToken.id;
        }

        socket = io(`${hostNameBack}`, {
            query: { userId }
        });
        
    }, [token, adminToken])

    useEffect(() => {
        const paramsId = searchParams.get("p");
        if (paramsId) {
            axios.get(`${hostNameBack}/api/v1/auth/getUser/${paramsId}`)
                .then(response => {
                    if (response.data.success) {
                        setSelectedParticipant(response.data.user);
                    }
                })
                .catch(e => {
                    console.log(e);
                    enqueueSnackbar(e?.response?.data?.error || "Failed to fetch user!", { variant: "error" });
                });
        }
    }, [searchParams]);

    useEffect(() => {
        if (!user && !admin) return;

        axios.get(`${hostNameBack}/api/v1/chats/${user ? "userChats" : "adminChats"}/${user ? user._id : admin._id}`, { headers: { Authorization: `Bearer ${user ? token : adminToken}` } })
            .then(response => {
                if (response.data.success) {
                    const chatsFetched = response.data.chats;
                    if (selectedParticipant) {
                        const dbChats = chatsFetched.find(c => (c.participantId?._id || c.adminParticipantId?._id) === selectedParticipant?._id);
                        const localChats = chats.find(c => (c.participantId?._id || c.participantId?._id) === selectedParticipant?._id);
                        if (!dbChats && !localChats)
                            setChats([{ adminParticipantId: isParticipantAdmin ? selectedParticipant : null, participantId: isParticipantAdmin ? null : selectedParticipant, messages: [] }, ...chatsFetched]);
                    }
                    else
                        setChats(chatsFetched);
                }
            })
            .catch(e => {
                console.log(e);
                enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", { variant: "error" });
            });

    }, [user]);

    useEffect(() => {
        socket.on('receiveMessage', (newMessage) => {
            if (selectedParticipant && selectedParticipant._id === newMessage.senderId) {
                setMessages(prevMessages => [...prevMessages, newMessage]);
            }
        });

        return () => {
            socket.off('receiveMessage');
        };
    }, [selectedParticipant]);

    useEffect(() => {
        if (!user && !admin) return;
        if (selectedParticipant) {
            axios.get(`${hostNameBack}/api/v1/chats/${user ? "userChats" : "adminChats"}/${user ? user._id : admin._id}`, { headers: { Authorization: `Bearer ${user ? token : adminToken}` } })
                .then(response => {
                    if (response.data.success) {
                        const updatedChats = response.data.chats;
                        const dbChats = updatedChats.find(c => (c.participantId?._id || c.adminParticipantId?._id) === selectedParticipant?._id);
                        const localChats = updatedChats.find(c => (c.participantId?._id || c.adminParticipantId?._id) === selectedParticipant?._id);
                        if (!dbChats && !localChats) {
                            setChats([{ adminParticipantId: isParticipantAdmin ? selectedParticipant : null, participantId: isParticipantAdmin ? null : selectedParticipant, messages: [] }, ...chats, ...updatedChats]);
                            setMessages([]);
                        } else {
                            setChats(updatedChats);
                            setMessages(dbChats.messages);
                        }
                    }
                })
                .catch(e => {
                    console.log(e);
                    enqueueSnackbar(e?.response?.data?.error || "Failed to fetch messages!", { variant: "error" });
                });
        }
    }, [user, selectedParticipant]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!message.trim() && !file) return;

        setLoading(true);

        const formData = new FormData();
        formData.append('senderId', user ? user?._id : admin?._id);
        formData.append('receiverId', selectedParticipant._id);
        formData.append('receiverEmail', selectedParticipant?.email);
        formData.append('text', message);
        formData.append('isParticipantAdmin', isParticipantAdmin);
        if (file)
            formData.append('file', file);

        try {
            const response = await axios.post(`${hostNameBack}/api/v1/chats/sendMessage/${user ? "user" : "admin"}`, formData, {
                headers: {
                    Authorization: `Admin ${user ? token : adminToken}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setMessages(prevMessages => [...prevMessages, response.data.message]);
                setChats(prevChats => {
                    const updatedChats = prevChats.map(chat => {
                        if ((chat.participantId?._id || chat.adminParticipantId?._id) === selectedParticipant._id) {
                            return { ...chat, messages: [...chat.messages, response.data.message] };
                        }
                        return chat;
                    });
                    return updatedChats;
                });
                setMessage("");
                setFile(null);
                socket.emit('sendMessage', response.data.message);
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.log(error);
            enqueueSnackbar(error?.response?.data?.error || "Failed to send message!", { variant: "error" });
        }
        setLoading(false);
    };

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const removeFile = () => {
        setFile(null);
    };

    const selectChat = (chat) => {
        setSelectedParticipant(chat.participantId || chat.adminParticipantId);
        if (chat.adminParticipantId && chat.isParticipantAdmin)
            setIsParticipantAdmin(true);
        else
            setIsParticipantAdmin(false);
    };

    const formatDate = (date) => {
        const newDate = new Date(date);

        const options = { month: 'long', year: '2-digit' };
        return newDate.toLocaleDateString(undefined, options);
    };
    const formatDateTime = (date) => {
        const options = { month: 'short', day: 'numeric', year: '2-digit' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
        const formattedDate = new Date(date).toLocaleDateString(undefined, options);
        const formattedTime = new Date(date).toLocaleTimeString(undefined, timeOptions);
        return `${formattedTime} - ${formattedDate}`;
    };

    const renderDocumentIcon = (fileType) => {
        if (fileType === 'application/pdf')
            return <FaFilePdf size={24} />;
        else if (fileType === 'application/msword' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
            return <FaFileWord size={24} />;
        else
            return <FaFileAlt size={24} />;
    };

    const fetchQuoteItems = async (quoteType) => {
        await axios.get(`${hostNameBack}/api/v1/${quoteType + "s"}/seller/${quoteType === "product" ? "myProducts" : "myServices"}/all`, { headers: { Authorization: `Bearer ${token}` } })
            .then(response => {
                if (response.data.success) {
                    if (quoteType === "product") {
                        setOfferDetails(prev => ({
                            ...prev,
                            productId: response.data.allProducts[0]?._id,
                            title: response.data.allProducts[0]?.title
                        }))
                        setQuoteItems(response.data.allProducts)
                    }
                    else {
                        setOfferDetails(prev => ({
                            ...prev,
                            serviceId: response.data?.allServices[0]?._id,
                            title: response.data?.allServices[0]?.title
                        }))
                        setQuoteItems(response.data.allServices)
                    }
                }
            })
            .catch(e => {
                console.log(e);
                enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", { variant: "error" });
            });
    }

    const handleOpenQuoteModel = () => {
        setShowQuoteModel(true);
        fetchQuoteItems("product");
    }

    const handleQuoteTypeChange = (e) => {
        setQuoteType(e.target.value);
        fetchQuoteItems(e.target.value);
    }

    const handleOfferChange = (e) => {
        if (e.target.name === "productId" || e.target.name === "serviceId") {
            const item = JSON.parse(e.target.value);
            setOfferDetails({ ...offerDetails, [e.target.name]: item._id, title: item.title });
        }
        else
            setOfferDetails({ ...offerDetails, [e.target.name]: e.target.value });
    };

    const handleSendOffer = (e) => {
        e.preventDefault();
        const offer = {
            ...offerDetails,
            quoteType,
        };

        if (quoteType === 'product') {
            delete offer.serviceId;
        } else if (quoteType === 'service') {
            delete offer.productId;
        }

        const formData = new FormData();
        formData.append('senderId', user._id);
        formData.append('receiverId', selectedParticipant._id);
        formData.append('receiverEmail', selectedParticipant?.email);
        formData.append('offer', JSON.stringify(offer));
        formData.append('isParticipantAdmin', isParticipantAdmin);

        axios.post(`${hostNameBack}/api/v1/chats/sendMessage/user`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(response => {
                if (response.data.success) {
                    setMessages([...messages, response.data.message]);
                    setShowQuoteModel(false);
                    setOfferDetails({
                        productId: '',
                        serviceId: '',
                        title: '',
                        description: '',
                        offerAmount: '',
                        quantity: 1,
                        shippingFee: 0,
                        duration: 1,
                    })
                    setQuoteType("product");
                }
            })
            .catch(error => {
                console.log(error);
                enqueueSnackbar(error?.response?.data?.error || "Failed to send offer!", { variant: "error" });
            });
    };

    if (!user && !admin) return <div>Loading</div>

    return (
        <div className="chatDiv commonChatDiv">
            <section className={!admin && "section"}>
                <div className="chatContent">

                    <div className="chatsList">
                        <div className="header">
                            <div>Inbox</div>
                            <div className="highlight">{chats.length < 10 ? "0" + chats.length : chats.length}</div>
                        </div>
                        <div className="chatBoxes content">
                            {chats.length > 0 ? chats.map(chat => (
                                <div
                                    key={chat.participantId?._id || chat.adminParticipantId?._id}
                                    className={`chatBox ${(selectedParticipant && (chat.participantId?._id === selectedParticipant?._id || chat.adminParticipantId?._id === selectedParticipant?._id)) ? "active" : ""}`}
                                    onClick={() => selectChat(chat)}
                                >
                                    <div className="imgDiv">
                                        <img src={chat.participantId?.role === "seller" ? `${hostNameBack}/${chat?.participantId.sellerId?.profileImage}` : chat.adminParticipantId ? "/assets/images/logo.svg" : "/assets/images/seller.png"} alt="Profile" />
                                    </div>
                                    <div>
                                        <div className='fw600'>{chat.participantId?._id === user?._id ? "You - Personal Chat" : chat.participantId ? chat.participantId?.username : "Admin"}</div>
                                        <p className='lastMessage singleLineText'>
                                            {messages.length > 0 && (chat.participantId?._id === selectedParticipant?._id || chat.adminParticipantId?._id === selectedParticipant?._id) ?
                                                messages[messages.length - 1]?.offer ? "Custom Offer" : messages[messages.length - 1]?.text !== "" ? messages[messages.length - 1]?.text : "File" :
                                                chat.messages[chat.messages.length - 1]?.offer ? "Custom Offer" : chat.messages[chat.messages.length - 1]?.text !== "" ? chat.messages[chat.messages.length - 1]?.text : "File"}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div className='nothingFound'>
                                    <TbInboxOff className='icon' />
                                    <div>No Conversation yet!</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="chatRoom">
                        {selectedParticipant ? (
                            <>
                                <div className="header">
                                    <img src={selectedParticipant?.role === "seller" ? `${hostNameBack}/${selectedParticipant?.sellerId?.profileImage}` : isParticipantAdmin ? "/assets/images/logo.svg" : "/assets/images/seller.png"} alt="Profile" />
                                    <Link to={!isParticipantAdmin && `/${user ? "profile" : "ftzy-admin/sellers"}/${selectedParticipant?.sellerId?._id}`} >{selectedParticipant?._id === user?._id ? "You - Personal Chat" : isParticipantAdmin ? "Admin" : selectedParticipant?.username}</Link>
                                </div>
                                <div className="messages content">
                                    {messages.map((msg, index) => (
                                        <div key={index} className={msg.senderId === (user ? user?._id : admin?._id) ? "message sent" : "message received"}>
                                            <div className='senderName fw600 lightBlackPrimary fs09'>
                                                <div>{msg.senderId === (user ? user?._id : admin?._id) ? "You" : isParticipantAdmin ? "Admin" : selectedParticipant.username}</div>
                                                <span className='messageTime'>{formatDateTime(msg.timestamp)}</span>
                                            </div>
                                            <div>{msg.offer ? "Custom Offer:" : msg.text}</div>
                                            {msg.fileUrl && (
                                                <div className="fileBox">
                                                    {msg.fileType.startsWith('image/') && (
                                                        <img src={`${hostNameBack}/${msg.fileUrl}`} alt="Attachment" style={{ maxWidth: '100px', maxHeight: '100px', cursor: "pointer" }} onClick={() => setShowImageModel(msg.fileUrl)} />
                                                    )}
                                                    {msg.fileType.startsWith('video/') && (
                                                        <video controls style={{ maxWidth: '100%', maxHeight: '100%' }}>
                                                            <source src={`${hostNameBack}/${msg.fileUrl}`} type={msg.fileType} />
                                                            Your browser does not support the video tag.
                                                        </video>
                                                    )}
                                                    {msg.fileType.startsWith('application/') && (
                                                        <div className="documentBox">
                                                            {renderDocumentIcon(msg.fileType)}
                                                            <div className="fileInfo">
                                                                <a href={`${hostNameBack}/${msg.fileUrl}`} download>Download</a>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>)}
                                            {msg.offer && (
                                                <div className="offerMessage">
                                                    <div className="upper">
                                                        <p className="singleLineText">{msg.offer.title}</p>
                                                        <p className="price">${msg.offer.offerAmount}</p>
                                                    </div>
                                                    <div className="middle">{msg.offer.description}</div>
                                                    <div className="bottom">
                                                        <div className='row'><MdOutlineLocalOffer className='icon' />{msg.offer.quoteType.charAt(0).toUpperCase() + msg.offer.quoteType.slice(1)}</div>
                                                        {msg.offer.quoteType === "product" && <div className='row'><FaBasketShopping className='icon' />{(msg.offer.quantity < 10 && "0") + msg.offer.quantity} (Quantity)</div>}
                                                        {msg.offer.quoteType === "product" && <div className='row'><TbTruckDelivery className='icon' />{Number(msg.offer.shippingFee) === 0 ? "Free Shipping" : "$" + msg.offer.shippingFee + " Shipping Fees"}</div>}
                                                        {msg.offer.quoteType === "service" && <div className='row'><IoMdStopwatch className='icon' />{(msg.offer.duration < 10 && "0") + msg.offer.duration} delivery days</div>}
                                                    </div>
                                                    {msg.senderId !== (user ? user?._id : admin?._id) && <div className="buttonsDiv">
                                                        <Link to={`/checkout?c=${msg._id}`} className="primaryBtn2">Place Order</Link>
                                                    </div>}
                                                </div>
                                            )}
                                        </div>
                                    ))}
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
                                            {user && user?.role === "seller" && !isParticipantAdmin && <button className='secondaryBtn' onClick={handleOpenQuoteModel}>Create an offer</button>}
                                        </div>
                                        <div className="right">
                                            <button className='primaryBtn' disabled={loading} onClick={sendMessage}>Send</button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className='nothingFound'>
                                <IoIosChatboxes className='icon' />
                                <div>Select a Conversation to start Chat</div>
                            </div>
                        )}
                    </div>

                    <div className="otherInfo">
                        {selectedParticipant ? (
                            <>
                                <div className="header">
                                    <div>Other Info</div>
                                    {/* <FaEllipsisV className='icon' /> */}
                                </div>
                                <div className="participantDetails content">
                                    {!isParticipantAdmin && <><h2 className="secondaryHeading">About <Link to={`/${user ? "profile" : "ftzy-admin/sellers"}/${selectedParticipant?.sellerId?._id}`}>@{selectedParticipant.username}</Link></h2>
                                        {selectedParticipant.role === "seller" && <><div className="row"><p>Name</p><div className='fw600'>{selectedParticipant.sellerId.fullName}</div></div>
                                            <div className="row"><p>Ratings</p><div className='fw600 ratingsDiv'>
                                                <FaStar className='starIconFilled' />
                                                <span>{`${selectedParticipant.sellerId.rating} (${selectedParticipant.sellerId.noOfReviews})`}</span>
                                            </div></div>
                                            <div className="row"><p>From</p><div className='fw600'>{selectedParticipant.sellerId.country}</div></div></>}
                                        <div className="row"><p>Role</p><div className='fw600'>{selectedParticipant.role}</div></div>
                                        <div className="row"><p>Member Since</p><div className='fw600'>
                                            {formatDate(selectedParticipant?.role === "seller" ? selectedParticipant?.sellerId?.createdAt : selectedParticipant?.createdAt)}
                                        </div></div>
                                        <div className="horizontalLine"></div></>}
                                    {user && <SampleProvisions pre="chat" />}
                                </div>
                            </>
                        ) : (
                            <div className='nothingFound'>
                                <FaUsersSlash className='icon' />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {showImageModel &&
                <div className="popupDiv">
                    <div className="popupContent">

                        <div className="form">

                            <h2 className="secondaryHeading"><span>Preview</span> Image</h2>

                            <div className="horizontalLine"></div>

                            <div className="imgDiv previewImgDiv">
                                <img src={`${hostNameBack}/${showImageModel}`} alt="Error" />
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

            {showQuoteModel &&
                <div className="popupDiv">
                    <div className="popupContent showQuoteModelContent">

                        <form className="form" onSubmit={handleSendOffer}>
                            <h2 className="secondaryHeading">Create <span>Offer</span></h2>

                            <div className="horizontalLine"></div>

                            <div className="inputDiv">
                                <label>Quote Type</label>
                                <select name="quoteType" className='inputField' value={quoteType} onChange={(e) => handleQuoteTypeChange(e)}>
                                    <option value="product">Product</option>
                                    <option value="service">Service</option>
                                </select>
                            </div>

                            {quoteType === 'product' && quoteItems && quoteItems.length > 0 && (
                                <div className="inputDiv">
                                    <label>Select Product</label>
                                    <select name="productId" className='inputField' onChange={handleOfferChange}>
                                        {quoteItems.map((item, index) => {
                                            return <option key={index} value={JSON.stringify(item)} className='quoteItem'>{item.title}</option>
                                        })}
                                    </select>
                                </div>
                            )}

                            {quoteType === 'service' && quoteItems && quoteItems.length > 0 && (
                                <div className="inputDiv">
                                    <label>Select Service</label>
                                    <select name="serviceId" className='inputField' onChange={handleOfferChange}>
                                        {quoteItems && quoteItems.length > 0 && quoteItems.map((item, index) => {
                                            return <option key={index} value={JSON.stringify(item)} className='quoteItem'>{item.title}</option>
                                        })}
                                    </select>
                                </div>
                            )}

                            {quoteItems && quoteItems.length > 0 ? <><div className="inputDiv">
                                <label>Description <span>*</span></label>
                                <textarea name="description" className='inputField' value={offerDetails.description} onChange={handleOfferChange} placeholder='Explain your offer...' required />
                            </div>

                                <div className="inputDiv">
                                    <div className="inputInnerDiv">
                                        <label>Offer Amount ($) <span>*</span></label>
                                        <input type="number" name="offerAmount" className='inputField' value={offerDetails.offerAmount} onChange={handleOfferChange} placeholder='Enter Amount' required />
                                    </div>
                                    {quoteType === 'product' && (<>
                                        <div className="inputInnerDiv">
                                            <label>Shipping Fee ($)</label>
                                            <input type="number" name="shippingFee" className='inputField' value={offerDetails.shippingFee} onChange={handleOfferChange} />
                                        </div>
                                        <div className="inputInnerDiv">
                                            <label>Quantity</label>
                                            <input type="number" name="quantity" className='inputField' value={offerDetails.quantity} onChange={handleOfferChange} />
                                        </div>
                                    </>)}
                                    {quoteType === 'service' && (
                                        <div className="inputInnerDiv">
                                            <label>Duration (in days)</label>
                                            <input type="number" name="duration" className='inputField' value={offerDetails.duration} onChange={handleOfferChange} placeholder='Enter Days' />
                                        </div>
                                    )}
                                </div></> : `You currently don't have active ${quoteType} to send offer!`}

                            <div className="buttonsDiv">
                                <button className='primaryBtn' type='submit' disabled={!(quoteItems && quoteItems.length > 0)}>Send Offer</button>
                                <button className='secondaryBtn' onClick={() => setShowQuoteModel(false)}>Close</button>
                            </div>
                        </form>

                        <div className="popupCloseBtn">
                            <IoIosCloseCircleOutline className='icon' onClick={() => setShowQuoteModel(false)} />
                        </div>
                    </div>
                </div>
            }

        </div>
    );
};

export default ChatPage;