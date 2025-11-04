import React, { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography, Box, CssBaseline, CircularProgress,Divider } from '@mui/material';
import { InsertDriveFile, Person, ReportProblem } from '@mui/icons-material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import MuiAlert from '@mui/material/Alert'; // สำหรับการแจ้งเตือน
import axios from 'axios';
import Layout from '../../LayoutAdmin/Layout';
import { Link as RouterLink } from 'react-router-dom';


function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function AdminHome() {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [userCount, setUserCount] = useState(0);
  const [documentCount, setDocumentCount] = useState(0);
  const [unreadDocuments, setUnreadDocuments] = useState(0);
  const [openAlert, setOpenAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [isLinear, setIsLinear] = useState(false); // ใช้สำหรับ Linear
  const [isLinearIndeterminate, setIsLinearIndeterminate] = useState(false); // ใช้สำหรับ Linear indeterminate


  const handleCloseAlert = () => {
    setOpenAlert(false);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUsername = localStorage.getItem('username');
        const storedUserId = localStorage.getItem('userId');
        if (!storedUsername) {
          navigate('/loginpage');
        } else {
          setUsername(storedUsername);
          setUserId(storedUserId);
        }

        // เรียกใช้ฟังก์ชันทั้งหมดเพื่อนำข้อมูล
        await Promise.all([
          fetchUserCount(),
          fetchDocumentCount(),
          fetchUnreadDocumentCount() // เรียกใช้ฟังก์ชันนี้
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // ฟังก์ชันสำหรับดึงข้อมูลจำนวนผู้ใช้
  const fetchUserCount = async () => {
    try {
      const response = await axios.get('http://localhost:3000/user-count');
      setUserCount(response.data.count);
    } catch (error) {
      console.error('Error fetching user count:', error);
    }
  };

  // ฟังก์ชันสำหรับดึงข้อมูลจำนวนเอกสาร
  const fetchDocumentCount = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/document-count');
      setDocumentCount(response.data.count);
    } catch (error) {
      console.error('Error fetching document count:', error);
    }
  };

  // ฟังก์ชันสำหรับดึงข้อมูลจำนวนเอกสารที่ยังไม่อ่าน
  const fetchUnreadDocumentCount = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/unread-document-count');
      setUnreadDocuments(response.data.count);
    } catch (error) {
      console.error('Error fetching unread document count:', error);
    }
  };

  // ใช้ useEffect ในการดึงข้อมูลเมื่อคอมโพเนนต์โหลด
  useEffect(() => {
    fetchUserCount();
    fetchDocumentCount();
  }, []);



  const handleLinkClick = (path) => {
    setLoading(true); // เริ่มการโหลด
    setTimeout(() => {
      navigate(path); // เปลี่ยนหน้าไปยัง path ที่ระบุ
      setLoading(false); // หยุดการโหลดหลังจากเปลี่ยนหน้า
    }, 400); // หน่วงเวลา 400ms
  };


  return (
    <Layout>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {loading && (
            <Box style={{
              position: 'fixed', // เพื่อให้คอมโพเนนต์คงอยู่กับหน้าจอ
              top: 0,
              left: 0,
              width: '100vw', // คลุมทั้งความกว้างของหน้าจอ
              height: '100vh', // คลุมทั้งความสูงของหน้าจอ
              display: 'flex', // ใช้ flexbox ในการจัดกึ่งกลาง
              justifyContent: 'center', // จัดกึ่งกลางในแนวนอน
              alignItems: 'center', // จัดกึ่งกลางในแนวตั้ง
              backgroundColor: 'rgba(255, 255, 255, 0.7)', // สีพื้นหลังโปร่งใสเล็กน้อยเพื่อเน้นการโหลด
              zIndex: 9999 // ทำให้ชั้นการแสดงอยู่ด้านบนสุด
            }}>
              <CircularProgress />
            </Box>
          )}
          <Container maxWidth="lg">
            <Typography  
            variant="h5" 
            sx={{ color:'#71717A', textAlign:'left' }}>
              Dashboard
            </Typography>
          <Divider sx={{ my: 2, bgcolor: '#bbdefb' }} />
            <Grid container spacing={3}>

              {/* Card 1 */}
              {/* <Grid item xs={12} sm={6} md={4}>
                <Link onClick={() => handleLinkClick('/unread')} style={{ textDecoration: 'none' }}>
                  <Paper
                    elevation={6}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      backgroundColor: '#f5a524',
                      color:'#fff',
                      borderRadius: 2,
                      boxShadow: 4,
                      transition: '0.3s',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: 6,
                      },
                    }}
                  >
                    <>
                      <Typography
                        variant="h5"
                        gutterBottom
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                        }}
                      >
                        <ReportProblem fontSize="large" sx={{ mr: 1, color: '#fff' }} />
                        เอกสารที่ยังไม่อ่าน
                      </Typography>
                      <Typography variant="h6" sx={{ fontSize:30,color: '#fff' }}>{unreadDocuments} รายการ</Typography>
                    </>
                  </Paper>
                </Link>
              </Grid> */}

              {/* Card 2 */}
              <Grid item xs={12} sm={6} md={4}>
                <Link onClick={() => handleLinkClick('/doc')} style={{ textDecoration: 'none' }}>
                  <Paper
                    elevation={6}
                    sx={{
                      width:'300px',
                      p: 3,
                      textAlign: 'center',
                      backgroundColor: '#17c964',
                      color:'#fff',
                      borderRadius: 2,
                      boxShadow: 4,
                      transition: '0.3s',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: 6,
                      },
                    }}
                  >
                    <>
                      <Typography
                        variant="h5"
                        gutterBottom
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                        }}
                      >
                        <InsertDriveFile fontSize="large" sx={{ mr: 1, color: '#fff' }} />
                        เอกสารทั้งหมด
                      </Typography>
                      <Typography variant="h6" sx={{ fontSize:30,color: '#fff' }}>{documentCount} รายการ</Typography>
                    </>

                  </Paper>
                </Link>
              </Grid>

              {/* Card 3 */}
              <Grid item xs={12} sm={6} md={4}>
                <Link onClick={() => handleLinkClick('/list')} style={{ textDecoration: 'none' }}>
                  <Paper
                    elevation={6}
                    sx={{
                      width:'300px',
                      p: 3,
                      textAlign: 'center',
                      backgroundColor: '#006FEE',
                      color:'#fff',
                      borderRadius: 2,
                      boxShadow: 4,
                      transition: '0.3s',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: 6,
                      },
                    }}
                  >

                    <>
                      <Typography
                        variant="h5"
                        gutterBottom
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                        }}
                      >
                        <Person fontSize="large" sx={{ mr: 1, color: '#fff' }} />
                        ผู้ใช้ที่ลงทะเบียน
                      </Typography>
                      <Typography variant="h6" sx={{ fontSize:30,color: '#fff' }}>{userCount} คน</Typography>
                    </>
                  </Paper>
                </Link>
              </Grid>

              {/* Card 4 */}
              <Grid item xs={12} sm={6} md={4}>
                <Link onClick={() => handleLinkClick('/rec')} style={{ textDecoration: 'none' }}>
                  <Paper
                    elevation={6}
                    sx={{
                      width:'300px',
                      p: 3,
                      textAlign: 'center',
                      backgroundColor: '#6020a0',
                      color:'#fff',
                      borderRadius: 2,
                      boxShadow: 4,
                      transition: '0.3s',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: 6,
                      },
                    }}
                  >
                    <>
                      <Typography
                        variant="h5"
                        gutterBottom
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                        }}
                      >
                        <ReportProblem fontSize="large" sx={{ mr: 1, color: '#fff' }} />
                        สถิติการรับเอกสาร
                      </Typography>
                      <Typography variant="h6" sx={{ fontSize:30,color: '#fff' }}> รายการ</Typography>
                    </>

                  </Paper>
                </Link>
              </Grid>

            </Grid>
          </Container>
        </Box>
      </Box>
    </Layout>
  );
}
export default AdminHome;
