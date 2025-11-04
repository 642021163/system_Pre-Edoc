import React, { useEffect, useState } from 'react';
import { Box, Typography, Link, CircularProgress, Tooltip } from '@mui/material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Navbar from '../../AppBar/Navbar';
import AppBar from '../../AppBar/Appbar';
import Drawer from '../../AppBar/Drawer';

const images = [
    { src: '/asset/0001.png', title: 'เอกสารที่ดำเนินการเรียบร้อย', link: '/track' }, // เปลี่ยนลำดับ
    { src: '/asset/002.png', title: 'เอกสารที่ส่งทั้งหมด', link: '/fileupload' }, // เปลี่ยนลำดับ
];

function HomePage() {
    const [username, setUsername] = useState('');
    const { id } = useParams();
    const [user_fname, setUser_fname] = useState('');
    const [user_lname, setUser_lname] = useState('');
    const [userId, setUserId] = useState('');
    const [menuOpen, setMenuOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [documentCount, setDocumentCount] = useState(null);
    const [successDocumentCount, setSuccessDocumentCount] = useState(null);


    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const storedUser_fname = localStorage.getItem('user_fname');
        const storedUser_lname = localStorage.getItem('user_lname');
        const storedUser_Id = localStorage.getItem('user_id');
        if (!storedUsername) {
            navigate('/loginpage');
        } else {
            setUsername(storedUsername);
            setUser_fname(storedUser_fname || '');
            setUser_lname(storedUser_lname || '');
            setUserId(storedUser_Id);
        }
    }, [navigate]);

    useEffect(() => {
        if (userId) {
            setLoading(true);
            // เรียกใช้ API ทั้งสองเส้นพร้อมกัน
            const fetchDocumentCount = fetch(`http://localhost:3000/api/user-document-count?user_id=${userId}`)
                .then(response => response.json())
                .then(data => data.count)
                .catch(error => {
                    console.error('Error fetching total document count:', error);
                    return 0;
                });

            const fetchSuccessDocumentCount = fetch(`http://localhost:3000/api/user-document-success?user_id=${userId}`)
                .then(response => response.json())
                .then(data => data.count)
                .catch(error => {
                    console.error('Error fetching successful document count:', error);
                    return 0;
                });

            // ใช้ Promise.all เพื่อรอการดึงข้อมูลทั้งสองเส้นให้เสร็จ
            Promise.all([fetchDocumentCount, fetchSuccessDocumentCount])
                .then(([totalCount, successCount]) => {
                    setDocumentCount(totalCount);
                    setSuccessDocumentCount(successCount);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [userId]);


    const handleLinkClick = (link) => {
        setLoading(true);
        setTimeout(() => {
            navigate(link);
            setLoading(false);
        }, 1000);
    };

    const backgroundColors = ['#E8F5E9', '#E3F2FD', '#FFF3E0'];
    const borderColor = '#A5D6A7';

    return (
        <Box>
            {location.pathname === '/homepage' && (
                <>
                    <AppBar />
                    <Navbar />
                </>
            )}
            <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex' }}>
                {loading && (
                    <Box style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        zIndex: 9999
                    }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <CircularProgress />
                            <Typography sx={{ mt: 2 }}>Loading...</Typography>
                        </Box>
                    </Box>
                )}

                <Drawer menuOpen={menuOpen} toggleMenu={toggleMenu} />
                <Box sx={{ flex: 1, p: 2 }}>
                    <Typography variant="h4" gutterBottom>
                        สวัสดีคุณ ,{user_fname} {user_lname}!
                    </Typography>

                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                        gap: 2,
                        padding: 2
                    }}>
                        {/* สถิติการส่งเอกสารทั้งหมด */}
                        <Box
                            sx={{
                                position: 'relative',
                                overflow: 'hidden',
                                borderRadius: 4,
                                backgroundColor: backgroundColors[1],
                                border: `2px solid ${borderColor}`,
                                padding: 1,
                                boxShadow: 2
                            }}
                        >
                            <img
                                src={images[1].src}
                                alt={images[1].title}
                                loading="lazy"
                                style={{
                                    width: '300px',
                                    height: '300px',
                                    objectFit: 'cover',
                                }}
                            />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    textAlign: 'center',
                                    bgcolor: '#338ef7',
                                    color: 'white',
                                    p: 2,
                                    fontSize: '1rem',
                                }}
                            >
                                <Tooltip title={images[1].title}>
                                    <Link
                                        onClick={() => handleLinkClick('/track')}
                                        underline="hover"
                                        color="inherit"
                                        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                    >
                                        <Typography
                                            variant="h6"
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            สถิติการส่งเอกสารทั้งหมด {documentCount !== null ? documentCount : 'กำลังโหลด...'} รายการ
                                        </Typography>
                                    </Link>
                                </Tooltip>
                            </Box>
                        </Box>

                        {/* เอกสารที่ดำเนินการเรียบร้อย */}
                        <Box
                            sx={{
                                position: 'relative',
                                overflow: 'hidden',
                                borderRadius: 4,
                                backgroundColor: backgroundColors[1],
                                border: `2px solid ${borderColor}`,
                                padding: 1,
                                boxShadow: 2
                            }}
                        >
                            <img
                                src={images[0].src}
                                alt={images[0].title}
                                loading="lazy"
                                style={{
                                    width: '300px',
                                    height: '300px',
                                    objectFit: 'cover',
                                }}
                            />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    textAlign: 'center',
                                    bgcolor: '#338ef7',
                                    color: 'white',
                                    p: 2,
                                    fontSize: '1rem',
                                }}
                            >
                                <Tooltip title={images[0].title}>
                                    <Link
                                        onClick={() => handleLinkClick('/success')}
                                        underline="hover"
                                        color="inherit"
                                        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                    >
                                        <Typography
                                            variant="h6"
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            เอกสารที่ดำเนินการเรียบร้อย {successDocumentCount !== null ? successDocumentCount : 'กำลังโหลด...'} รายการ
                                        </Typography>
                                    </Link>
                                </Tooltip>
                            </Box>
                        </Box>

                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default HomePage;
