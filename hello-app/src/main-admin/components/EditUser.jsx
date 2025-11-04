import React, { useEffect, useState } from 'react';
import {
  Box, CssBaseline, AppBar, Toolbar, Typography, IconButton, Badge, InputBase, Drawer, List, ListItem,
  ListItemIcon, ListItemText, Paper, Button, Grid, TextField, FormControl, InputLabel, Select, CircularProgress,
  MenuItem, Dialog, DialogActions, DialogContent, DialogTitle, Tooltip
} from '@mui/material';
import { Search, Notifications, Home, PersonAdd } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import Layout from '../../LayoutAdmin/Layout';

const drawerWidth = 240; // หรือค่าที่คุณต้องการ

function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    user_fname: '',
    user_lname: '',
    username: '',
    phone_number: '',
    affiliation: '',
    role: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false); // สถานะเปิด/ปิด Dialog
  const [resetPassword, setResetPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);


  const roleOptions = [
    { value: 'Admin', label: 'Admin' },
    { value: 'User', label: 'User' }
  ];

  // ดึงข้อมูลผู้ใช้จากเซิร์ฟเวอร์
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/user/${id}`);
        setUser(response.data);
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:', error.response?.data || error.message);
        setError('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);



  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('Field changed:', name, value); // ดีบัก: ตรวจสอบการเปลี่ยนแปลงของฟิลด์
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // จัดการการส่งฟอร์ม
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:3000/users/${id}`, user);
      console.log('อัปเดตผู้ใช้สำเร็จ:', response.data);

      // ใช้ SweetAlert แสดงแจ้งเตือนความสำเร็จ
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'บันทึกข้อมูลเรียบร้อยแล้ว',
        timer: 1500, // กำหนดเวลาแสดง SweetAlert 2 วินาที
        showConfirmButton: false // ไม่ต้องแสดงปุ่ม Confirm
      }).then(() => {
        // คุณสามารถเพิ่มการนำทางไปยังหน้าที่คุณต้องการหลังจากแสดง SweetAlert เสร็จ
        navigate('/list'); // เปลี่ยนเส้นทางไปยังหน้ารายชื่อผู้ใช้
      });

    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการอัปเดตผู้ใช้:', error.response?.data || error.message);

      // แสดง SweetAlert ข้อผิดพลาด
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'เกิดข้อผิดพลาดในการอัปเดตผู้ใช้',
      });
    }
  };


  // ฟังก์ชันสำหรับรีเซ็ตรหัสผ่าน
  const handleResetPassword = async () => {
    if (resetPassword !== confirmPassword) {
      // แสดงข้อความแจ้งเตือนว่ารหัสผ่านไม่ตรงกัน
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'รหัสผ่านไม่ตรงกัน',
      });
      return;
    }

    try {
      // ส่งคำขอไปที่ API
      const response = await axios.put(`http://localhost:3000/api/reset-password`, {
        userId: id, // ใช้ `id` ที่มาจาก useParams
        newPassword: resetPassword
      });

      // แสดงข้อความเมื่อการรีเซ็ตรหัสผ่านสำเร็จ
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'อัปเดตรหัสผ่านเรียบร้อยแล้ว',
      });

      // รีเซ็ตค่าของฟิลด์รหัสผ่าน
      setResetPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error resetting password:', error);
      // แสดงข้อความเมื่อการอัปเดตไม่สำเร็จ
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'ไม่สามารถอัปเดตรหัสผ่านได้',
      });
    }
  };

  const handleBackToHome = () => {
    navigate('/home'); // นำทางไปที่หน้าโฮม
  };
  const handleCancel = () => {

    setLoading(true); // เริ่มการโหลด
    setTimeout(() => {
      navigate('/list');
      setLoading(false); // หยุดการโหลดหลังจากเปลี่ยนหน้า
    }, 400); // หน่วงเวลา 400ms
  };


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
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Loading...</Typography>
            </Box>
          </Box>
        )}

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'left', color: '#1976d2' }}>เเก้ไขข้อมูลผู้ใช้</Typography>

          <Paper
            sx={{
              padding: 3,
              backgroundColor: '#f5f5f5' // สีพื้นหลังของ Paper
            }}
          >
            <form onSubmit={handleSubmit}>
              {/* <Typography variant="h6" gutterBottom sx={{ p: 2 }}>แก้ไขข้อมูลผู้ใช้</Typography> */}
              <Box mb={2}>
                <Grid container spacing={2}>
                  {/* Row 1 */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="ชื่อ"
                      name="user_fname"
                      value={user.user_fname}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="นามสกุล"
                      name="user_lname"
                      value={user.user_lname}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Username"
                      name="username"
                      value={user.username}
                      onChange={handleChange}
                      fullWidth
                      required
                      disabled // ทำให้ช่องนี้ไม่สามารถแก้ไขได้
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="หมายเลขโทรศัพท์"
                      name="phone_number"
                      value={user.phone_number}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl
                      fullWidth
                      required
                    >
                      <InputLabel>สังกัด</InputLabel>
                      <Select
                        name="affiliation"
                        value={user.affiliation}
                        onChange={handleChange}
                        fullWidth
                        label="สังกัด"
                        required
                      >
                        <MenuItem value="สาขาวิชาวิทยาศาสตร์กายภาพ">สาขาวิชาวิทยาศาสตร์กายภาพ</MenuItem>
                        <MenuItem value="สาขาวิชาวิทยาศาสตร์ชีวภาพ">สาขาวิชาวิทยาศาสตร์ชีวภาพ</MenuItem>
                        <MenuItem value="หลักสูตร วท.บ. คณิตศาสตร์และการจัดการข้อมูล">หลักสูตร วท.บ. คณิตศาสตร์และการจัดการข้อมูล</MenuItem>
                        <MenuItem value="หลัก วท.บ. วิทยาการคอมพิวเตอร์และสารสนเทศ">หลัก วท.บ. วิทยาการคอมพิวเตอร์และสารสนเทศ</MenuItem>
                        <MenuItem value="หลักสูตร วท.บ. วิทยาศาสตร์สิ่งแวดล้อม">หลักสูตร วท.บ. วิทยาศาสตร์สิ่งแวดล้อม</MenuItem>
                        <MenuItem value="สำนักงานคณะวิทยาศาสตร์และนวัตกรรมดิจิทัล">สำนักงานคณะวิทยาศาสตร์และนวัตกรรมดิจิทัล</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Role"
                      name="role"
                      value={user.role || ''}
                      onChange={handleChange}
                      fullWidth
                      required
                      disabled // ทำให้ช่องนี้ไม่สามารถแก้ไขได้
                    />
                  </Grid>


                </Grid>
              </Box>
              <DialogActions style={{ justifyContent: 'center' }}>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  style={{ marginRight: '8px' }} // เพิ่มระยะห่าง
                >
                  บันทึก
                </Button>
                <Button
                  color="error"
                  variant="outlined"
                  onClick={handleCancel}
                >
                  ยกเลิก
                </Button>
              </DialogActions>
            </form>
          </Paper>
          {/* Form for Resetting Password */}
          {/* <Paper sx={{ padding: 3, mt: 3, backgroundColor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom>รีเซ็ตรหัสผ่านใหม่</Typography>
            <TextField
              margin="dense"
              label="รหัสผ่านใหม่"
              type="password"
              fullWidth
              variant="outlined"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
            />
            <TextField
              margin="dense"
              label="ยืนยันรหัสผ่านอีกครั้ง"
              type="password"
              fullWidth
              variant="outlined"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleResetPassword}
                sx={{ mr: 2 }}
              >
                รีเซ็ต
              </Button>
              <Button
                color="error"
                variant="outlined"
                onClick={handleCancel}
              >
                ยกเลิก
              </Button>
            </Box>
          </Paper> */}
        </Box>
      </Box>
    </Layout>
  );
}

export default EditUser;
