import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Divider, CssBaseline, Container, Box, Typography, TextField, Button, MenuItem, FormControl, InputLabel, Select, IconButton, InputAdornment, FormHelperText, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../AppBar/Navbar';
import AppBar from '../../AppBar/Appbar';
import Swal from 'sweetalert2';

const Logo = styled('img')(({ theme }) => ({
    height: '60px',
    marginBottom: theme.spacing(2),
}));

function RegisterFrom() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [touchedFields, setTouchedFields] = useState({});
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [loading, setLoading] = useState(false); // สถานะการโหลด
    const [formValues, setFormValues] = useState({
        prefix: '',
        user_fname: '',
        user_lname: '',
        username: '',
        password: '',
        confirmPassword: '',
        phone_number: '',
        affiliation: '',
        role: 'user'
    });

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

    const [success, setSuccess] = useState({
        prefix: false,
        user_fname: false,
        user_lname: false,
        username: false,
        password: false,
        confirmPassword: false,
        phone_number: false,
        affiliation: false,
        role: false
    });


    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormValues({
            ...formValues,
            [name]: value,
        });

        setTouchedFields(prev => ({
            ...prev,
            [name]: true
        }));


        if (formSubmitted) {
            const validationErrors = validateForm({ ...formValues, [name]: value });
            setErrors(validationErrors);


            setSuccess(prev => ({
                ...prev,
                [name]: !validationErrors[name]
            }));
        }
    };


    useEffect(() => {
        if (formValues.confirmPassword && formValues.password !== formValues.confirmPassword) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                confirmPassword: 'รหัสผ่านไม่ตรงกัน',
            }));
        } else {
            setErrors((prevErrors) => ({
                ...prevErrors,
                confirmPassword: null,
            }));
        }

    }, [formValues.password, formValues.confirmPassword]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormValues(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null,
            });
        }


        setTouchedFields(prev => ({
            ...prev,
            [name]: true
        }));


        if (formSubmitted) {
            const validationErrors = validateForm({ ...formValues, [name]: value });
            setErrors(validationErrors);


            setSuccess(prev => ({
                ...prev,
                [name]: !validationErrors[name]
            }));
        }
    };


    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };


    const validateForm = (values) => {
        const newErrors = {};

        if (!values.prefix) newErrors.prefix = '*กรุณาเลือกคำนำหน้า';

        if (!values.user_fname) newErrors.user_fname = '*กรุณากรอกชื่อ';


        if (!values.user_lname) newErrors.user_lname = '*กรุณากรอกนามสกุล';


        if (!values.username) {
            newErrors.username = '*กรุณากรอกชื่อผู้ใช้งาน';
        } else if (!values.username.endsWith('@tsu.ac.th')) {
            newErrors.username = '*กรุณากรอกอีเมลที่ลงท้ายด้วย @tsu.ac.th';
        }


        if (!values.password) {
            newErrors.password = '*กรุณากรอกข้อมูลรหัสผ่าน';
        } else if (values.password.length < 8) {
            newErrors.password = '*รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร';
        }

        if (!values.confirmPassword) newErrors.confirmPassword = '*กรุณากรอกนามสกุล';


        const phonePattern = /^[0-9]{4,10}$/;
        if (!values.phone_number) {
            newErrors.phone_number = '*กรุณากรอกเบอร์โทรศัพท์';
        } else if (!phonePattern.test(values.phone_number)) {
            newErrors.phone_number = 'เบอร์โทรศัพท์ต้องมีระหว่าง 4 ถึง 10 หลัก';
        }


        if (!values.affiliation) newErrors.affiliation = '*กรุณากรอกสังกัด';


        if (!values.role) newErrors.role = '*กรุณาเลือกประเภทผู้ใช้';

        return newErrors;
    };


    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormSubmitted(true);


        const validationErrors = validateForm(formValues);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        if (formValues.password !== formValues.confirmPassword) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                confirmPassword: 'รหัสผ่านไม่ตรงกัน',
            }));
            return;
        }


        setErrors((prevErrors) => ({
            ...prevErrors,
            confirmPassword: null,
        }));

        try {
            const usernameCheckResponse = await axios.get(`http://localhost:3000/check-username?username=${formValues.username}`);
            if (usernameCheckResponse.data.exists) {
                setErrors({ username: 'ชื่อผู้ใช้นี้มีอยู่แล้ว กรุณาเลือกชื่อผู้ใช้อื่น' });
                return;
            }
        } catch (error) {
            console.error("Error checking username:", error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด!',
                text: 'ไม่สามารถตรวจสอบชื่อผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง',
            });
            return;
        }


        try {
            const response = await axios.post('http://localhost:3000/users', formValues);

            Swal.fire({
                icon: 'success',
                title: 'สำเร็จ!',
                text: 'ลงทะเบียนสำเร็จ!',
            }).then(() => {
                navigate('/loginpage');
            });

            setSuccessMessage('ลงทะเบียนสำเร็จ');
            setDialogOpen(true);
            resetForm();
        } catch (error) {
            console.error("Error during registration", error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด!',
                text: 'การลงทะเบียนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
            });
        }
    };



    const resetForm = () => {
        setFormValues({
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
    };

    const handleCancel = () => {
        setLoading(true);
        setTimeout(() => {
            navigate('/loginpage');
            setLoading(false);
        }, 400);
    };


    return (
        <div>
            {window.location.pathname === '/registerfrom' && (

                <>
                    <AppBar />
                    <Navbar />
                </>
            )}
            <React.Fragment>
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
                        </Box>
                    </Box>
                )}
                <Container
                    maxWidth={false}
                    sx={{
                        width: '100%',
                       
                        height: '100vh',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        p: 2,
                        mt: 5

                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            maxWidth: '800px',
                            p: 2,
                            borderRadius: 2,
                            border: '2px solid #1976d2',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            backgroundColor: 'white', // ทำให้กล่องมีพื้นหลังสีขาว
                            boxShadow: 5, // เพิ่มเงาเพื่อทำให้กล่องเด่นขึ้น
                            gap: 2,
                        }}
                    >
                        {/* โลโก้ */}
                        <Logo src="/asset/logosc.png" alt="Logo" sx={{ mb: 2 }} />



                        {/* หัวข้อการลงทะเบียน */}
                        <Typography
                            variant="h5"
                            component="form"
                            onSubmit={handleSubmit}
                            gutterBottom
                            sx={{
                                color: '#1976d2',
                                textShadow: '1px 1px 4px rgba(0, 0, 0, 0.2)', 
                                fontWeight: 'bold',
                                textAlign: 'center',
                                mb: 4,
                            }}
                        >
                            ลงทะเบียน
                        </Typography>

                        {/* ฟอร์มการกรอกข้อมูล */}
                        <Box component="form" sx={{ width: '100%' }} onSubmit={handleSubmit}>
                            <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>
                                {/* ข้อมูลส่วนตัวและข้อมูลเข้าสู่ระบบ */}
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', mr: 2 }}>
                                    <Typography variant="h6" sx={{ mb: 1 }}>ข้อมูลส่วนตัว</Typography>

                                    <FormControl variant="outlined" margin="normal" error={Boolean(errors.prefix)} InputProps={{
                                        style: { borderColor: success.user_fname ? 'green' : '', borderWidth: '2px' },
                                    }}
                                        sx={{
                                            flexBasis: '50%',
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: success.user_fname ? 'green' : (errors.user_fname ? 'red' : ''),
                                                },
                                            },
                                        }} >
                                        <InputLabel>คำนำหน้า</InputLabel>
                                        <Select
                                            name="prefix"
                                            value={formValues.prefix}
                                            onChange={handleChange}
                                            label="Prefix"

                                        >
                                            <MenuItem value="นาย">นาย</MenuItem>
                                            <MenuItem value="นาง">นาง</MenuItem>
                                            <MenuItem value="นางสาว">นางสาว</MenuItem>
                                            <MenuItem value="อาจารย์">อาจารย์</MenuItem>
                                            <MenuItem value="ดร.">ดร.</MenuItem>
                                            <MenuItem value="ผศ.ดร">ผศ.ดร</MenuItem>
                                            <MenuItem value="ศาสตราจารย์.ดร">ศาสตราจารย์.ดร</MenuItem>
                                        </Select>
                                        <FormHelperText>{errors.prefix || '*กรุณาเลือก'}</FormHelperText>
                                    </FormControl>

                                    <TextField
                                        fullWidth
                                        label="ชื่อ"
                                        name="user_fname"
                                        variant="outlined"
                                        margin="normal"
                                        value={formValues.user_fname}
                                        onChange={handleChange}
                                        error={Boolean(errors.user_fname)}
                                        helperText={errors.user_fname || '*กรุณากรอกชื่อ'}
                                        InputProps={{
                                            style: { borderColor: success.user_fname ? 'green' : '', borderWidth: '2px' },
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: success.user_fname ? 'green' : (errors.user_fname ? 'red' : ''),
                                                },
                                            },
                                        }}
                                    />

                                    <TextField
                                        fullWidth
                                        label="นามสกุล"
                                        name="user_lname"
                                        variant="outlined"
                                        margin="normal"
                                        value={formValues.user_lname}
                                        onChange={handleChange}
                                        error={Boolean(errors.user_lname)}
                                        helperText={errors.user_lname || '*กรุณานามสกุล'}
                                        InputProps={{
                                            style: { borderColor: success.user_lname ? 'green' : '', borderWidth: '2px' },
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: success.user_lname ? 'green' : (errors.user_lname ? 'red' : ''),
                                                },
                                            },
                                        }}
                                    />

                                    <FormControl
                                        fullWidth
                                        variant="outlined"
                                        margin="normal"
                                        error={Boolean(errors.affiliation)}
                                        InputProps={{
                                            style: { borderColor: success.user_fname ? 'green' : '', borderWidth: '2px' },
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: success.user_fname ? 'green' : (errors.user_fname ? 'red' : ''),
                                                },
                                            },
                                        }}
                                    >
                                        <InputLabel>สังกัด</InputLabel>
                                        <Select
                                            name="affiliation"
                                            value={formValues.affiliation}
                                            onChange={handleChange}
                                            label="สังกัด"
                                        >
                                            <MenuItem value="สาขาวิชาวิทยาศาสตร์กายภาพ">สาขาวิชาวิทยาศาสตร์กายภาพ</MenuItem>
                                            <MenuItem value="สาขาวิชาวิทยาศาสตร์ชีวภาพ">สาขาวิชาวิทยาศาสตร์ชีวภาพ</MenuItem>
                                            <MenuItem value="หลักสูตร วท.บ. คณิตศาสตร์และการจัดการข้อมูล">หลักสูตร วท.บ. คณิตศาสตร์และการจัดการข้อมูล</MenuItem>
                                            <MenuItem value="หลักสูตร วท.บ. วิทยาการคอมพิวเตอร์และสารสนเทศ">หลักสูตร วท.บ. วิทยาการคอมพิวเตอร์และสารสนเทศ</MenuItem>
                                            <MenuItem value="หลักสูตร วท.บ. วิทยาศาสตร์สิ่งแวดล้อม">หลักสูตร วท.บ. วิทยาศาสตร์สิ่งแวดล้อม</MenuItem>
                                            <MenuItem value="สำนักงานคณะวิทยาศาสตร์และนวัตกรรมดิจิทัล">สำนักงานคณะวิทยาศาสตร์และนวัตกรรมดิจิทัล</MenuItem>
                                        </Select>
                                        <FormHelperText>{errors.affiliation || '*กรุณาเลือกสังกัด'}</FormHelperText>
                                    </FormControl>


                                </Box>

                                {/* ข้อมูลติดต่อ */}
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

                                    <Typography variant="h6" sx={{ mb: 1 }}>ข้อมูลเข้าสู่ระบบ</Typography>

                                    <TextField
                                        fullWidth
                                        label="Email"
                                        name="username"
                                        variant="outlined"
                                        margin="normal"
                                        value={formValues.username}
                                        onChange={handleChange}
                                        error={Boolean(errors.username)}
                                        helperText={errors.username || '*กรุณากรอกอีเมล'}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">@tsu.ac.th</InputAdornment>,
                                            style: { borderColor: success.username ? 'green' : '', borderWidth: '2px' },
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: success.username ? 'green' : (errors.username ? 'red' : ''),
                                                },
                                            },
                                        }}
                                    />

                                    <TextField
                                        fullWidth
                                        label="Password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        variant="outlined"
                                        margin="normal"
                                        value={formValues.password}
                                        onChange={handleInputChange}
                                        error={Boolean(errors.password)}
                                        helperText={errors.password || '*รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร'}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleClickShowPassword}
                                                        edge="end"
                                                    >

                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: success.password ? 'green' : (errors.password ? 'red' : ''),
                                                },
                                            },
                                        }}
                                    />

                                    <TextField
                                        fullWidth
                                        label="Confirm Password"
                                        name="confirmPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        variant="outlined"
                                        margin="normal"
                                        value={formValues.confirmPassword}
                                        onChange={handleInputChange}
                                        error={Boolean(errors.confirmPassword)}
                                        helperText={errors.confirmPassword || '*กรุณายืนยันรหัสผ่าน'}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleClickShowPassword}
                                                        edge="end"
                                                    >

                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: success.confirmPassword ? 'green' : (errors.confirmPassword ? 'red' : ''),
                                                },
                                            },
                                        }}
                                    />



                                    <TextField
                                        fullWidth
                                        label="โทรศัพท์"
                                        name="phone_number"
                                        variant="outlined"
                                        margin="normal"
                                        value={formValues.phone_number}
                                        onChange={handleChange}
                                        error={Boolean(errors.phone_number)}
                                        helperText={errors.phone_number || '*กรุณากรอกหมายเลยโทรศัพท์'}
                                        InputProps={{
                                            style: { borderColor: success.phone_number ? 'green' : '', borderWidth: '2px' },
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: success.user_lname ? 'green' : (errors.user_lname ? 'red' : ''),
                                                },
                                            },
                                        }}
                                    />
                                </Box>
                            </Box>

                            {/* <FormControl fullWidth variant="outlined" margin="normal">
                                <InputLabel>ประเภทผู้ใช้</InputLabel>
                                <Select
                                    name="role"
                                    value={formValues.role} // ตั้งค่าเริ่มต้นเป็น 'user'
                                    onChange={handleChange}
                                    label="User Type"
                                    disabled // ทำให้ช่องนี้ไม่สามารถแก้ไขได้
                                >
                                    <MenuItem value="user">User</MenuItem>
                                    <MenuItem value="admin" disabled>Admin</MenuItem>
                                </Select>
                                <FormHelperText>{errors.role}</FormHelperText>
                            </FormControl> */}
                            {/* เส้นแบ่ง */}
                            <Divider sx={{ width: '100%', backgroundColor: '#3F3F46', height: '2px', mt: 3, mb: 3 }} />
                            {/* ปุ่มสมัครและยกเลิก */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                                <Button type="submit" variant="contained" color="success" sx={{ mb: 2, backgroundColor: '#0E793C', }}>
                                    สมัครสมาชิก
                                </Button>
                                <Button variant="outlined" onClick={handleCancel} sx={{
                                    mb: 2,
                                    color: "#fff",
                                    backgroundColor: '#52525B',
                                    '&:hover': {
                                        backgroundColor: '#3F3F46',
                                    },
                                }}>
                                    ยกเลิก
                                </Button>
                            </Box>

                        </Box>
                    </Box>
                </Container>
                {/* Footer */}
                <Box sx={{ bgcolor: '#003b8c', color: '#e0e0e0', p: 1, textAlign: 'center', mt: 3 }}>
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
        </div>
    )
}

export default RegisterFrom
