import React, { useState } from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Divider, Collapse, Tooltip, CircularProgress,Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { AccountCircle, InsertDriveFile, Description, Menu as MenuIcon } from '@mui/icons-material';

const Drawer = ({ menuOpen, toggleMenu }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false); // สถานะการโหลด

    // ฟังก์ชันหลักสำหรับการนำทางพร้อมแสดงการโหลด
    const handleNavigation = (path) => {
        setLoading(true); // เริ่มการโหลด
        setTimeout(() => {
            navigate(path); // เปลี่ยนเส้นทางไปยังหน้าที่กำหนด
            setLoading(false); // หยุดการโหลดหลังจากเปลี่ยนหน้า
        }, 400); // หน่วงเวลา 400ms
    };


    // ฟังก์ชันสำหรับ Profile
    const handleProfile = () => {
        const userId = localStorage.getItem('user_id'); // ดึง userId ที่เก็บไว้ใน localStorage
        if (userId) {
            console.log("Logged in user ID:", userId);
            handleNavigation(`/profile/${userId}`); // ใช้เครื่องหมาย backtick
        } else {
            console.error("User is not logged in or userId is missing.");
        }// เรียกใช้ handleNavigation เพื่อไปที่หน้าโปรไฟล์
    };

    // ฟังก์ชันสำหรับติดตามเอกสาร
    const handleTrack = () => {
        handleNavigation('/track');
    };

    // ฟังก์ชันสำหรับส่งเอกสาร
    const handleFileUpload = () => {
        handleNavigation('/fileupload');
    };

    return (
        <Box sx={{
            width: menuOpen ? 250 : 60,
            bgcolor: '#001731',
            color: '#FFFFFF',
            p: 2,
            boxShadow: 1,
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.3s',
        }}>
            {/* สถานะการโหลด */}
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
            <MenuIcon onClick={toggleMenu} />
            <Divider sx={{ my: 2, bgcolor: '#bbdefb' }} />
            <Collapse in={menuOpen}>
                <List>
                    <Tooltip title="ติดตามเอกสาร" arrow>
                        <ListItem
                            onClick={handleTrack} // เรียกใช้ handleTrack โดยตรง
                            sx={{
                                borderRadius: '8px',
                                mb: 1,
                                backgroundColor: location.pathname === '/track' ? '#004493' : 'transparent',
                                '&:hover': { backgroundColor: '#004493' },
                                color: '#FFFFFF',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <ListItemIcon sx={{ color: '#FF5733' }}>
                                <InsertDriveFile />
                            </ListItemIcon>
                            {menuOpen && <ListItemText primary="ติดตามเอกสาร" />}
                        </ListItem>
                    </Tooltip>

                    <Tooltip title="ส่งเอกสาร" arrow>
                        <ListItem
                            onClick={handleFileUpload} // เรียกใช้ handleFileUpload โดยตรง
                            sx={{
                                borderRadius: '8px',
                                mb: 1,
                                backgroundColor: location.pathname === '/fileupload' ? '#004493' : 'transparent',
                                '&:hover': { backgroundColor: '#004493' },
                                color: '#FFFFFF',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <ListItemIcon sx={{ color: '#FF5733' }}>
                                <Description />
                            </ListItemIcon>
                            {menuOpen && <ListItemText primary="ส่งเอกสาร" />}
                        </ListItem>
                    </Tooltip>

                    <Tooltip title="ข้อมูลผู้ใช้" arrow>
                        <ListItem
                            onClick={handleProfile} // เรียกใช้ handleProfile โดยตรง
                            sx={{
                                borderRadius: '8px',
                                mb: 1,
                                backgroundColor: location.pathname === '/profile' ? '#004493' : 'transparent',
                                '&:hover': { backgroundColor: '#004493' },
                                color: '#FFFFFF',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <ListItemIcon sx={{ color: '#FF5733' }}>
                                <AccountCircle />
                            </ListItemIcon>
                            {menuOpen && <ListItemText primary="ข้อมูลผู้ใช้" />}
                        </ListItem>
                    </Tooltip>
                </List>
            </Collapse>
            <Divider sx={{ my: 2, bgcolor: '#bbdefb' }} />
        </Box>
    );
};

export default Drawer;
