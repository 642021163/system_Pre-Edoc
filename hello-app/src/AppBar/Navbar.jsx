import * as React from 'react';
import { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Swal from 'sweetalert2';


const pages = ['Home'];

function Navbar() {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [username, setUsername] = useState('');
  const [user_fname, setUser_fname] = useState('');
  const [user_lname, setUser_lname] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedUser_fname = localStorage.getItem('user_fname');
    const storedUser_lname = localStorage.getItem('user_lname');
    const token = localStorage.getItem('token');

    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        localStorage.clear();
        setIsLoggedIn(false);
        navigate('/loginpage');
      } else {
        setUsername(storedUsername);
        setUser_fname(storedUser_fname || '');
        setUser_lname(storedUser_lname || '');
        setIsLoggedIn(true);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, [navigate]);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'คุณแน่ใจว่าต้องการออกจากระบบไหม?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่',
      cancelButtonText: 'ไม่',
      onBeforeOpen: () => {
        Swal.showLoading(); // แสดง loading ขณะรอการยืนยัน
      },
    }).then((result) => {
      if (result.isConfirmed) {
        setLoading(true); // เริ่มการโหลด
        localStorage.clear();

        // ใช้ setTimeout เพื่อเลียนแบบการโหลด
        setTimeout(() => {
          setLoading(false); // หยุดการโหลด
          navigate('/loginpage');
        }, 600); // ปรับเวลาได้ตามต้องการ
      }
    });
  };

  const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  };

  const stringAvatar = (name) => ({
    sx: { bgcolor: stringToColor(name) },
    children: `${name.split(' ')[0][0]}`,
  });

  const handleNavigateHome = () => {
    setLoading(true); // เริ่มการโหลด
    setTimeout(() => {
      navigate('/homepage');
      setLoading(false); // หยุดการโหลดหลังจากเปลี่ยนหน้า
    }, 400); // หน่วงเวลา 400ms

  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#005bc4' }}> {/* สีหลัก */}
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

      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={() => { handleCloseNavMenu(); handleNavigateHome(); }}>
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {isLoggedIn && (
              <Button
                onClick={handleNavigateHome}
                sx={{ my: 2, color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} // ใช้สีขาวสำหรับตัวอักษร
              >
                <HomeIcon sx={{ marginRight: 1 }} />
                <Typography variant="body1" sx={{ paddingTop: '4px' }}>{pages[0]}</Typography>
              </Button>
            )}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {isLoggedIn && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ marginRight: 2, color: '#ffffff' }}>
                    {user_fname} {user_lname}
                  </Typography>
                  <Tooltip title="เปิดการตั้งค่า">
                    <IconButton onClick={(event) => setAnchorElUser(event.currentTarget)} sx={{ p: 0 }}>
                      <Avatar {...stringAvatar(username)} />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Menu
                  anchorEl={anchorElUser}
                  open={Boolean(anchorElUser)}
                  onClose={() => setAnchorElUser(null)}
                >
                  <MenuItem>
                    <Typography textAlign="center">{username}</Typography>
                  </MenuItem>
                  <MenuItem onClick={() => {
                    setAnchorElUser(null); // ปิดเมนู Dropdown
                    handleLogout(); // เรียกฟังก์ชัน logout
                  }}>
                    <Typography textAlign="center">Logout</Typography>
                  </MenuItem>
                </Menu>

              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
