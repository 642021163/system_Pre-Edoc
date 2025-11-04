import React, { useState, useEffect } from 'react';
import { CssBaseline, Container, Box, Typography, TextField, Button, RadioGroup, FormControlLabel, Radio, CircularProgress, Link, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Facebook, Twitter, Instagram, LinkedIn } from '@mui/icons-material';

// กำหนดสไตล์โลโก้
const Logo = styled('img')(({ theme }) => ({
  height: '60px', // ปรับขนาดโลโก้ตามต้องการ
  marginBottom: theme.spacing(1), // เพิ่มระยะห่างระหว่างโลโก้กับข้อความ
}));

const RadioLabel = styled(FormControlLabel)(({ theme }) => ({
  '& .MuiFormControlLabel-label': {
    fontSize: '1rem', // ขนาดฟอนต์
    fontWeight: '500', // ความหนาของฟอนต์
    color: theme.palette.text.primary, // สีของฟอนต์
    marginRight: theme.spacing(3), // ระยะห่างระหว่างตัวเลือก
  },
  '& .MuiRadio-root': {
    color: theme.palette.primary.main, // สีของ radio button
  },
}));

function LoginPage() {
  const [userType, setUserType] = useState('user'); // ใช้ useState เพื่อเก็บประเภทของผู้ใช้ที่เลือก
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // กำหนด useNavigate
  const [loadingLogin, setLoadingLogin] = useState(false); // สถานะการโหลดเข้าสู่ระบบ
  const [loadingRegister, setLoadingRegister] = useState(false); // สถานะการโหลดลงทะเบียน

  useEffect(() => {
    // ตรวจสอบ token เมื่อหน้า LoginPage โหลดขึ้นมา
    const token = localStorage.getItem('token');
    const storedUserType = localStorage.getItem('userType');

    if (token) {
      // ถ้ามี token และ userType ให้ redirect ไปยังหน้าที่เหมาะสม
      if (storedUserType === 'admin') {
        navigate('/home');
      } else if (storedUserType === 'user') {
        navigate('/homepage');
      }
    }
  }, [navigate]);

  const handleChange = (event) => {
    setUserType(event.target.value); // เปลี่ยนประเภทของผู้ใช้ที่เลือก
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoadingLogin(true); // เริ่มแสดง CircularProgress
    try {
      // ใช้ setTimeout เพื่อเลียนแบบการหน่วงเวลา 2 วินาที
      await new Promise((resolve) => setTimeout(resolve, 1000)); // หน่วงเวลา 2 วินาที

      const response = await axios.post('http://localhost:3000/login', {
        username,
        password,
        userType,
      });

      const { token, user_fname, user_lname, prefix, phone_number, affiliation, user_id } = response.data;

      // บันทึกข้อมูลลงใน localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user_id', user_id);
      localStorage.setItem('username', username);
      localStorage.setItem('user_fname', user_fname);
      localStorage.setItem('user_lname', user_lname);
      localStorage.setItem('prefix', prefix);
      localStorage.setItem('phone_number', phone_number);
      localStorage.setItem('affiliation', affiliation);
      localStorage.setItem('userType', userType);

      // เปลี่ยนเส้นทางหลังจากเข้าสู่ระบบสำเร็จ
      if (userType === 'admin') {
        navigate('/home');
      } else if (userType === 'user') {
        navigate('/homepage');
      }
    } catch (err) {
      console.error('Login Error:', err.response ? err.response.data : err.message);
      setError(err.response ? err.response.data.message : 'Login failed'); // แสดงข้อความผิดพลาด
    } finally {
      setLoadingLogin(false);
    }
  };


  const handleNavigate = () => {
    setLoadingRegister(true);
    setTimeout(() => {
      navigate('/registerfrom');
      setLoadingRegister(false);
    }, 400);
  };

  return (
    <React.Fragment>
      <CssBaseline />
      {/* CircularProgress สำหรับการเข้าสู่ระบบ */}
      {loadingLogin && (
        <Box
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '300px',
            padding: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            zIndex: 9999,
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>กำลังเข้าสู่ระบบ...</Typography>
          </Box>
        </Box>
      )}

      {/* CircularProgress สำหรับการลงทะเบียน */}
      {loadingRegister && (
        <Box
          style={{
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
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        </Box>
      )}


      <Container
        maxWidth={false} // ปิดการกำหนด maxWidth
        sx={{
          width: '100%', // ทำให้ Container กว้างเต็มหน้าจอ
          bgcolor: 'white',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 1,
          backgroundImage: 'url("/asset/BG5.jpg")', // ใส่รูปภาพพื้นหลัง
          backgroundSize: 'cover', // ปรับขนาดพื้นหลังให้ครอบคลุมพื้นที่ทั้งหมด
          backgroundPosition: 'center', // จัดตำแหน่งรูปภาพให้อยู่ตรงกลาง
          opacity: 0.96,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '400px',
            p: 2,
            borderRadius: 2, // เพิ่มมุมโค้งมน
            border: '2px solid #1976d2', // เส้นขอบ
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.99)', // เพิ่มพื้นหลังสีขาวโปร่งใส
          }}
        >
          {/* โลโก้ */}
          <Logo src="/asset/logosc.png" alt="Logo" />
          <Typography
            variant="h5"
            component="div"
            gutterBottom
            sx={{
              color: '#1976d2', // สีของข้อความ
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)', // เงาของข้อความ
              fontWeight: 'bold', // ทำให้ข้อความหนาขึ้น
              textAlign: 'center', // จัดตำแหน่งข้อความกลาง

            }}
          >
            LOGIN
          </Typography>

          {/* ตัวเลือกประเภทผู้ใช้ */}
          <Box sx={{ width: '100%', mb: 1 }}>
            <Typography variant="body1" sx={{ textAlign: 'center', fontWeight: 'bold', color: '#1976d2' }}>
            </Typography>
            <RadioGroup
              value={userType}
              onChange={handleChange}
              sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}
            >
              <RadioLabel value="user" control={<Radio />} label="User" />
              <RadioLabel value="admin" control={<Radio />} label="Admin" />
            </RadioGroup>
          </Box>

          <Box component="form" sx={{ width: '100%', mt: 1 }} onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}

            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (<Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>{error}</Typography>)}

            <Box sx={{ display: 'flex', flexDirection: 'column', mt: 2 }}>
              <Button type="submit" variant="contained" color="primary" sx={{ mb: 2 }} disabled={loadingLogin}>
                {loadingLogin ? 'Logging in...' : 'Login'}
              </Button>
              {userType !== 'admin' && (
                <Link
                  variant="body2"
                  onClick={handleNavigate}
                  sx={{
                    textDecoration: 'none', // ลบขีดเส้นใต้
                    color: '#0E793C', // สีน้ำเงิน
                    fontSize: '14px', // ปรับขนาดฟอนต์
                    '&:hover': {
                      textDecoration: 'underline', // เพิ่มเส้นใต้เมื่อ Hover
                      color: '#0E793C', // เปลี่ยนสีเมื่อ Hover
                    },
                    cursor: 'pointer', // แสดง pointer เมื่อชี้เมาส์
                  }}
                >


                  ยังไม่มีบัญชี? สมัครสมาชิกที่นี่
                </Link>


              )}
            </Box>
          </Box>
        </Box>
      </Container>


      {/* Footer */}
      <Box sx={{ bgcolor: '#003b8c', color: '#e0e0e0', p: 1, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 0 }, justifyContent: 'center' }}>
            <img src="/asset/logoemoji.png" alt="Logo" style={{ height: '40px', marginRight: '10px' }} />
            <Typography variant="body2" sx={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}>
              © 2024 Faculty of Science and Digital Innovation, Thaksin University
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" sx={{ mb: 1, textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}>
          Contact us: akkarachai003@gmail.com | Phone: (096) 864-8749
        </Typography>

        {/* <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <IconButton component={Link} href="https://facebook.com" color="inherit" target="_blank" sx={{ mx: 0.5 }}>
            <Facebook />
          </IconButton>
          <IconButton component={Link} href="https://twitter.com" color="inherit" target="_blank" sx={{ mx: 0.5 }}>
            <Twitter />
          </IconButton>
          <IconButton component={Link} href="https://instagram.com" color="inherit" target="_blank" sx={{ mx: 0.5 }}>
            <Instagram />
          </IconButton>
          <IconButton component={Link} href="https://linkedin.com" color="inherit" target="_blank" sx={{ mx: 0.5 }}>
            <LinkedIn />
          </IconButton>
        </Box> */}
      </Box>
    </React.Fragment>
  );
}

export default LoginPage;
