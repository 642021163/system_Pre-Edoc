import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider'; // นำเข้า Divider
import { styled } from '@mui/material/styles';

// กำหนดสไตล์โลโก้
const Logo = styled('img')(({ theme }) => ({
  height: '60px', // ขนาดเริ่มต้น
  [theme.breakpoints.down('md')]: {
    height: '50px', // ปรับขนาดสำหรับหน้าจอขนาดกลางและเล็ก
  },
  [theme.breakpoints.down('sm')]: {
    height: '40px', // ปรับขนาดสำหรับหน้าจอขนาดเล็ก
  },
  marginRight: theme.spacing(2),
}));

function Appbar() {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#fff' }}>
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            minHeight: '250px',
            padding: '20px',
            [theme => theme.breakpoints.down('md')]: {
              minHeight: '200px', // ปรับความสูงสำหรับหน้าจอขนาดกลาง
            },
            [theme => theme.breakpoints.down('sm')]: {
              minHeight: '150px', // ปรับความสูงสำหรับหน้าจอขนาดเล็ก
              padding: '10px', // ลด padding ลงในหน้าจอขนาดเล็ก
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', flexDirection: { xs: 'column', md: 'row' } }}>
            <Logo src="/asset/logosc.png" alt="Logo" aria-label="Company Logo" />
            {/* เส้นตรงแนวตั้ง */}
            <Divider orientation="vertical" flexItem sx={{ borderColor: 'black', mx: 2 }} />
            <Logo src="/asset/logoemoji.png" alt="Logo" aria-label="Company Logo" />
            <Box sx={{ flexGrow: 1, textAlign: 'left', mt: { xs: 2, md: 0 } }}>
              <Typography
                variant="h4"
                component="div"
                gutterBottom
                sx={{
                  color: 'black',
                  [theme => theme.breakpoints.down('sm')]: {
                    fontSize: '1.2rem', // ลดขนาดฟอนต์ในหน้าจอขนาดเล็ก
                  },
                }}
              >
                ระบบเตรียมข้อมูลสำหรับป้อนเข้าสู่ระบบเอกสารอิเล็กทรอนิกส์
              </Typography>
              <Typography
                variant="h6"
                component="div"
                gutterBottom
                sx={{
                  color: 'black',
                  [theme => theme.breakpoints.down('sm')]: {
                    fontSize: '1rem', // ลดขนาดฟอนต์ในหน้าจอขนาดเล็ก
                  },
                }}
              >
                Data Preparation For E-DOC System
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Appbar;
