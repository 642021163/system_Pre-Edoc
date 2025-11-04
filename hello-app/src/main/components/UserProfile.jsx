import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button, Typography, Container, Paper, Grid, Dialog, DialogActions, DialogContent, DialogTitle, Box, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // ไอคอนสำเร็จ
import Swal from 'sweetalert2';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    prefix: '',
    user_fname: '',
    user_lname: '',
    username: '',
    phone_number: '',
    affiliation: '',
    role: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({
    prefix: '',
    user_fname: '',
    user_lname: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone_number: '',
    affiliation: '',
    role: ''
});


  useEffect(() => {
    if (!id) {
      setError('ID ของผู้ใช้ไม่ถูกต้อง');
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/users-profile/${id}`);
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
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3000/users/${id}`, user);

      // แสดงการแจ้งเตือนสำเร็จ
      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ!',
        text: 'บันทึกข้อมูลเรียบร้อยแล้ว!',
        showConfirmButton: false,
        timer: 1500 // ปิดการแจ้งเตือนอัตโนมัติหลังจาก 1.5 วินาที
      });

      setTimeout(() => {
        navigate('/homepage');
      }, 1500);

    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการอัปเดตผู้ใช้:', error.response?.data || error.message);

      // แสดงการแจ้งเตือนข้อผิดพลาด
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาดในการอัปเดตผู้ใช้',
        text: error.response?.data || 'กรุณาลองใหม่อีกครั้ง',
        confirmButtonText: 'ตกลง'
      });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'รหัสผ่านไม่ตรงกัน',
        text: 'กรุณาตรวจสอบรหัสผ่านใหม่อีกครั้ง'
      });
      return;
    }

    try {
      const response = await axios.put(`http://localhost:3000/users/change-password/${id}`, {
        old_password: oldPassword,
        new_password: newPassword,
      });

      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ!',
        text: response.data.message,
        showConfirmButton: false,
        timer: 1500
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน:', error.response?.data || error.message);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error.response?.data.message || 'กรุณาลองใหม่อีกครั้ง'
      });
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    navigate('/homepage');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 2, background: `url('/path/to/your/background-image.jpg')`, backgroundSize: 'cover', padding: '2rem', borderRadius: '8px' }}>
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
      <Paper elevation={3} style={{ padding: '2rem', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
        <Typography variant="h4" gutterBottom>
          อัปเดตโปรไฟล์ผู้ใช้
        </Typography>
        <form onSubmit={handleSubmit}>

          <Grid container spacing={2}>
            <Grid item xs={3}>
              <FormControl variant="outlined" margin="normal" fullWidth>
                <InputLabel>คำนำหน้า</InputLabel>
                <Select
                  name="prefix"
                  value={user.prefix}
                  onChange={handleChange}
                  label="คำนำหน้า"
                >
                  <MenuItem value="นาย">นาย</MenuItem>
                  <MenuItem value="นาง">นาง</MenuItem>
                  <MenuItem value="นางสาว">นางสาว</MenuItem>
                  <MenuItem value="อาจารย์">อาจารย์</MenuItem>
                  <MenuItem value="ดร.">ดร.</MenuItem>
                  <MenuItem value="ผศ.ดร">ผศ.ดร</MenuItem>
                  <MenuItem value="ศาสตราจารย์.ดร">ศาสตราจารย์.ดร</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={4.5}>
              <TextField
                label="ชื่อจริง"
                name="user_fname"
                value={user.user_fname}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </Grid>

            <Grid item xs={4.5}>
              <TextField
                label="นามสกุล"
                name="user_lname"
                value={user.user_lname}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </Grid>
          </Grid>

          <TextField
            label="ชื่อผู้ใช้"
            name="username"
            value={user.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputProps={{
              readOnly: true, // ทำให้ฟิลด์เป็นแบบอ่านได้
              style: { color: 'rgba(0, 0, 0, 0.5)' }, // ทำให้ข้อความในฟิลด์มีสีจาง
            }}
            InputLabelProps={{
              style: { color: 'rgba(0, 0, 0, 0.5)' }, // ทำให้ชื่อฟิลด์มีสีจาง
            }}
          />

          <TextField
            label="หมายเลขโทรศัพท์"
            name="phone_number"
            value={user.phone_number}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <FormControl
            fullWidth
            variant="outlined"
            margin="normal"
          >
            <InputLabel>หน่วยงาน</InputLabel>
            <Select
              name="affiliation"
              value={user.affiliation}
              onChange={handleChange}
              label="หน่วยงาน"
              fullWidth
            >
              <MenuItem value="สาขาวิชาวิทยาศาสตร์กายภาพ">สาขาวิชาวิทยาศาสตร์กายภาพ</MenuItem>
              <MenuItem value="สาขาวิชาวิทยาศาสตร์ชีวภาพ">สาขาวิชาวิทยาศาสตร์ชีวภาพ</MenuItem>
              <MenuItem value="หลักสูตร วท.บ. คณิตศาสตร์และการจัดการข้อมูล">หลักสูตร วท.บ. คณิตศาสตร์และการจัดการข้อมูล</MenuItem>
              <MenuItem value="หลักสูตร วท.บ. วิทยาการคอมพิวเตอร์และสารสนเทศ">หลัก วท.บ. วิทยาการคอมพิวเตอร์และสารสนเทศ</MenuItem>
              <MenuItem value="หลักสูตร วท.บ. วิทยาศาสตร์สิ่งแวดล้อม">หลักสูตร วท.บ. วิทยาศาสตร์สิ่งแวดล้อม</MenuItem>
              <MenuItem value="สำนักงานคณะวิทยาศาสตร์และนวัตกรรมดิจิทัล">สำนักงานคณะวิทยาศาสตร์และนวัตกรรมดิจิทัล</MenuItem>
            </Select>
          </FormControl>

          {/* <TextField
            label="บทบาท"
            name="role"
            value={user.role}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled // ทำให้ช่องนี้ไม่สามารถแก้ไขได้
          /> */}

          <DialogActions style={{ justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="success"
              sx={{  backgroundColor: '#0E793C' }}
              style={{ marginRight: '8px' }}
            >
              บันทึก
            </Button>
            <Button
              color="secondary"
              variant="contained"
              sx={{
                backgroundColor: '#52525B',
                '&:hover': {
                  backgroundColor: '#3F3F46',
                },
              }}
              onClick={() => {
                setLoading(true); // เริ่มการโหลดเมื่อกดปุ่ม
                setTimeout(() => {
                  setLoading(false); // หยุดการโหลดหลังจากเปลี่ยนหน้า
                  navigate('/homepage'); // เปลี่ยนเส้นทางไปที่หน้า homepage
                }, 400); // หน่วงเวลา 400ms ก่อนเปลี่ยนหน้า
              }}
            >
              ยกเลิก
            </Button>
          </DialogActions>
        </form>
        <Typography variant="h5" sx={{ mt: 3 }}>
          เปลี่ยนรหัสผ่าน
        </Typography>
        <form onSubmit={handleChangePassword}>
          <TextField
            label="รหัสผ่านเดิม"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="รหัสผ่านใหม่"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            margin="normal"
            helperText={errors.password || '*รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร'}
          />
          <TextField
            label="ยืนยันรหัสผ่านใหม่"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button type="submit"  color="success" variant="contained"  sx={{  backgroundColor: '#0E793C' }} style={{ marginTop: '16px' }}>
            เปลี่ยนรหัสผ่าน
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default UserProfile;
