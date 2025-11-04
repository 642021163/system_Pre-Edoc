import React, { useEffect, useState } from 'react';
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box, CircularProgress, IconButton, Pagination, Button, Toolbar, AppBar, Drawer, List, ListItem, ListItemIcon, ListItemText, CssBaseline, Divider, InputBase, Badge, Tooltip, Tabs, Tab, Menu, MenuItem, Avatar } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../LayoutAdmin/Layout';
import EditIcon from '@mui/icons-material/Edit';

function UserList() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState(0); // State สำหรับแท็บ
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const rowsPerPage = 10;
  const [page, setPage] = useState(1);


  useEffect(() => {
    // ดึงข้อมูลผู้ใช้จาก localStorage
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/users');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleEditClick = (userId) => {
    if (userId) {
      setLoading(true);
      setTimeout(() => {
        navigate(`/editu/${userId}`);
        setLoading(false);
      }, 400); // หน่วงเวลา 400ms
    } else {
      console.error('User ID is undefined or invalid');
    }
  };

  const handleAddUser = () => {
    setLoading(true); // เริ่มการโหลด
    setTimeout(() => {
      navigate('/newuser'); // เปลี่ยนหน้าไปยัง path ที่ระบุ
      setLoading(false); // หยุดการโหลดหลังจากเปลี่ยนหน้า
    }, 400); // หน่วงเวลา 400ms
  };
  // ฟังก์ชันสำหรับไฮไลท์คำค้นหา (เฉพาะส่วนของชื่อ)
  const highlightText = (text, highlight) => {
    if (!highlight.trim()) {
      return text;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? <span key={index} style={{ backgroundColor: '#ffeb3b' }}>{part}</span> : part
    );
  };
  // กรองผู้ใช้ตามคำค้นหา
  const filteredUsers = users.filter(user =>
    user.user_fname.toLowerCase().includes(search.toLowerCase()) ||
    user.user_lname.toLowerCase().includes(search.toLowerCase()) ||
    user.username.toLowerCase().includes(search.toLowerCase())
  );
  // การใช้ highlightText เฉพาะชื่อเมื่อแสดงผลข้อมูลผู้ใช้
  {
    filteredUsers.map(user => (
      <div key={user.id}>
        <p>
          {highlightText(user.user_fname, search)} {highlightText(user.user_lname, search)}
        </p>
        <p>{user.username}</p>
      </div>
    ))
  }

  const usersOnly = filteredUsers.filter(user => user.role.toLowerCase() === 'user');
  const admins = filteredUsers.filter(user => user.role.toLowerCase() === 'admin');

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const usersToDisplay = usersOnly.slice(startIndex, endIndex); // เลือกผู้ใช้ที่จะแสดงผล


  return (
    <Layout>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
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
            <CircularProgress />
          </Box>
        )}
        {/* เนื้อหาหลัก */}
        <Box component="main" sx={{ flexGrow: 1, bgcolor: '#eaeff1', p: 3 }}>
          <Toolbar /> {/* ระยะห่างด้านบน */}
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                รายชื่อผู้ใช้
              </Typography>
            </Box>
            {/* ช่องค้นหา */}
            <Box sx={{ mb: 3 }}>
              <input
                type="text"
                placeholder="ค้นหาผู้ใช้..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: '10px', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </Box>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
              <Tab label="User" />
              {/* <Tab label="Admin" /> */}
            </Tabs>

            {activeTab === 0 && (
              <>
                {/* <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', textAlign:'left' }}>
                  Users
                </Typography> */}
                <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3 }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#1976d2' }}>
                      <TableRow>
                        <TableCell sx={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>ลำดับ</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>ชื่อ-สกุล</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>ชื่อผู้ใช้</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>สังกัด</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {usersToDisplay.map((user, index) => (
                        <TableRow
                          key={user.user_id}
                          sx={{
                            backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff',
                            '&:hover': { backgroundColor: '#f1f1f1' },
                            ...(search &&
                              (user.user_fname.toLowerCase().includes(search.toLowerCase()) ||
                                user.user_lname.toLowerCase().includes(search.toLowerCase())) && {

                            }),
                          }}
                        >
                          <TableCell sx={{ textAlign: 'center' }}>{startIndex + index + 1}</TableCell>
                          <TableCell sx={{ padding: '12px 16px' }}>
                            {highlightText(`${user.user_fname} ${user.user_lname}`, search)}
                          </TableCell>
                          <TableCell sx={{ padding: '12px 16px' }}>{user.username}</TableCell>
                          <TableCell sx={{ padding: '12px 16px' }}>{user.affiliation}</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <Tooltip title="แก้ไขข้อมูลผู้ใช้" arrow>
                                <Button variant="contained"
                                  sx={{
                                    mx: 1,
                                    backgroundColor: '#ffeb3b', // สีหลักของปุ่
                                    color: '#000',
                                    '&:hover': {
                                      backgroundColor: '#fbc02d', // สีเมื่อชี้เมาส์
                                    },
                                    display: 'flex',
                                    alignItems: 'center', // จัดแนวให้อยู่กลาง
                                  }}
                                  onClick={() => handleEditClick(user.user_id)}>
                                  <EditIcon />
                                  แก้ไข
                                </Button>
                              </Tooltip>
                              {/* 
                              <IconButton onClick={() => handleDelete(user.user_id)} color="secondary">
                                <Delete />
                              </IconButton> */}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
            {activeTab === 1 && (
              <>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  Admins
                </Typography>
                <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3 }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#1976d2' }}>
                      <TableRow>
                        <TableCell sx={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>ลำดับ</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>ชื่อ-สกุล</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>ชื่อผู้ใช้</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>บทบาท</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {admins.map((user, index) => (
                        <TableRow
                          key={user.user_id}
                          sx={{
                            backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff',
                            '&:hover': { backgroundColor: '#f1f1f1' },
                          }}
                        >
                          <TableCell sx={{ textAlign: 'center' }}>{index + 1}</TableCell>
                          <TableCell sx={{ padding: '12px 16px' }}>{user.user_fname} {user.user_lname}</TableCell>
                          <TableCell sx={{ padding: '12px 16px' }}>{user.username}</TableCell>
                          <TableCell sx={{ padding: '12px 16px' }}>{user.role}</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <Tooltip title="แก้ไขข้อมูลเอกสาร" arrow>
                                {/* <Button variant="contained"
                                  sx={{
                                    mx: 1,
                                    backgroundColor: 'success', // สีหลักของปุ่ม
                                    color: '#fff',
                                    '&:hover': {
                                      backgroundColor: '#fbc02d', // สีเมื่อชี้เมาส์
                                    },
                                    display: 'flex',
                                    alignItems: 'center', // จัดแนวให้อยู่กลาง
                                  }}
                                  onClick={() => handleEditClick(user.user_id)}>
                                  <EditIcon />
                                  Edit
                                </Button> */}
                              </Tooltip>

                              {/* <IconButton onClick={() => handleDelete(user.user_id)} color="secondary">
                                <Delete />
                              </IconButton> */}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
            <Box sx={{ mt: 3, textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={Math.ceil(filteredUsers.length / rowsPerPage)} // คำนวณจำนวนหน้าจากข้อมูลผู้ใช้ที่ถูกกรอง
                page={page}
                shape="rounded"
                onChange={(event, value) => setPage(value)} // เปลี่ยนหน้าเมื่อคลิก
              />

            </Box>
          </Container>
        </Box>
      </Box>
    </Layout>
  );
}

export default UserList;
