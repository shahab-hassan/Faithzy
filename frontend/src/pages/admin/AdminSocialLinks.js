import React, { useState, useEffect } from 'react';
import { FaFacebook, FaInstagram, FaTwitter, FaPinterest, FaTumblr, FaYoutube, FaSnapchatGhost, FaTiktok, FaLinkedin } from "react-icons/fa";
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';

const socialMediaPlatforms = [
    { name: 'facebook', label: 'Facebook', icon: <FaFacebook className='icon' /> },
    { name: 'instagram', label: 'Instagram', icon: <FaInstagram className='icon' /> },
    { name: 'twitter', label: 'Twitter', icon: <FaTwitter className='icon' /> },
    { name: 'pinterest', label: 'Pinterest', icon: <FaPinterest className='icon' /> },
    { name: 'tumblr', label: 'Tumblr', icon: <FaTumblr className='icon' /> },
    { name: 'youtube', label: 'YouTube', icon: <FaYoutube className='icon' /> },
    { name: 'snapchat', label: 'Snapchat', icon: <FaSnapchatGhost className='icon' /> },
    { name: 'tiktok', label: 'TikTok', icon: <FaTiktok className='icon' /> },
    { name: 'linkedin', label: 'LinkedIn', icon: <FaLinkedin className='icon' /> },
];

function AdminSocialLinks() {
    const [links, setLinks] = useState({});
    const [checked, setChecked] = useState({});

    useEffect(() => {

        const fetchLinks = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/v1/settings/admin/social-links');
                setLinks(data.socialLinks || {});
                setChecked(data.socialLinks || {});
            } catch (error) {
                console.error("Failed to fetch social links", error);
            }
        };
        fetchLinks();
    }, []);

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setChecked(prev => ({ ...prev, [name]: checked }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLinks(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const filteredLinks = Object.keys(links)
            .filter(key => checked[key])
            .reduce((obj, key) => {
                obj[key] = links[key];
                return obj;
            }, {});

        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.post('http://localhost:5000/api/v1/settings/admin/social-links', { socialLinks: filteredLinks }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success)
                enqueueSnackbar('Links updated Successfully!', { variant: "success" });
        } catch (e) {
            console.error(e);
            enqueueSnackbar(e?.reponse?.data?.error || "Something went wrong!", { variant: "error" })
        }
    };

    return (
        <div className='socialLinksDiv'>
            <div className="socialLinksContent">
                <form onSubmit={handleSubmit} className='form'>

                    <h2 className="secondaryHeading"><span>Social</span> Links</h2>

                    <div className="horizontalLine"></div>

                    {socialMediaPlatforms.map(platform => (
                        <div key={platform.name} className="row">
                            <input
                                type="checkbox"
                                name={platform.name}
                                checked={checked[platform.name] || false}
                                onChange={handleCheckboxChange}
                                className='socialCheckInput'
                            />
                            <div className='platformName'>
                                <div>{platform.icon}</div>
                                <div>{platform.label}</div>
                            </div>
                            <input
                                type="text"
                                name={platform.name}
                                value={links[platform.name] || ''}
                                onChange={handleInputChange}
                                disabled={!checked[platform.name]}
                                placeholder={`Enter ${platform.label} link`}
                                className='socialInput'
                            />
                        </div>
                    ))}

                    <button type="submit" className='primaryBtn'>Save</button>
                </form>
            </div>
        </div>
    );
}

export default AdminSocialLinks;
