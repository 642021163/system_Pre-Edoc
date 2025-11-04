import { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SendIcon from '@mui/icons-material/Send';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Swal from 'sweetalert2';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

const EditDocument = () => {
    const { id } = useParams();
    const [values, setValues] = useState({
        // upload_date: '',
        subject: '',
        to_recipient: '',
        document_type: '',
        notes: ''
    });
    const [fileName, setFileName] = useState('');
    const [existingFileName, setExistingFileName] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/document/${id}`);
                const data = response.data;

                // แปลงค่า upload_date ให้ตรงตามรูปแบบ
                const localDateTime = new Date(data.upload_date).toISOString().slice(0, 16);
                setValues({ ...data, upload_date: localDateTime }); // เซ็ตค่าข้อมูลเอกสาร
                setExistingFileName(data.file); // เซ็ตชื่อไฟล์ที่เคยอัปโหลด
            } catch (error) {
                console.error("Error fetching document:", error);
            }
        };
        fetchDocument();
    }, []);


    // ฟังก์ชันสำหรับอัปเดตค่าในฟอร์ม
    const handleInput = (e) => {
        setValues({ ...values, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
        } else {
            setFileName('');
        }
    };

    const handleSubmit = async () => {
        try {
            const formData = new FormData();
            // formData.append('upload_date', values.upload_date);
            formData.append('subject', values.subject);
            formData.append('to_recipient', values.to_recipient);
            formData.append('document_type', values.document_type);
            formData.append('notes', values.notes);
            if (fileName) {
                formData.append('file', fileName); // ส่งไฟล์จริงไปยังเซิร์ฟเวอร์
            }

            const response = await axios.put(`http://localhost:3000/useredit/document/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                // ใช้ SweetAlert2 สำหรับแจ้งเตือนความสำเร็จ
                Swal.fire({
                    icon: 'success',
                    title: 'สำเร็จ!',
                    text: 'เอกสารถูกอัปเดตเรียบร้อยแล้ว!',
                    showConfirmButton: false,
                    timer: 1500 // ปิดการแจ้งเตือนอัตโนมัติหลังจาก 1.5 วินาที
                })
            }
            // นำกลับไปหน้า homepage หลังจากการแจ้งเตือน
            setTimeout(() => {
                navigate('/track'); // นำไปหน้า homepage หลังจากการแจ้งเตือน
            }, 1500); // รอให้การแจ้งเตือนแสดงครบ 1.5 วินาทีก่อนเปลี่ยนเส้นทาง

        } catch (error) {
            console.error("Error updating document:", error);

            // ใช้ SweetAlert2 สำหรับแจ้งเตือนข้อผิดพลาด
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด!',
                text: 'ไม่สามารถอัปเดตเอกสารได้!',
            });
        }
    };

    const handleCancel = () => {
        setLoading(true); // เริ่มการโหลดเมื่อกดปุ่ม
        setTimeout(() => {
            setLoading(false); // หยุดการโหลดหลังจากเปลี่ยนหน้า
            navigate('/track'); // เปลี่ยนเส้นทางไปที่หน้า homepage
        }, 400); // หน่วงเวลา 400ms ก่อนเปลี่ยนหน้า
    };

    return (
        <Box sx={{ flex: 1, p: 2, maxWidth: 800, mx: 'auto', bgcolor: '#f9f9f9', borderRadius: 2, boxShadow: 3 }}>
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
                    cursor: loading ? 'none' : 'auto',
                    zIndex: 9999
                }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress />
                        <Typography sx={{ mt: 2 }}>Loading...</Typography>
                    </Box>
                </Box>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                <Typography variant="h4" gutterBottom>
                    แก้ไขเอกสาร
                </Typography>
                <Box sx={{ width: '100%', mb: 5, display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <TextField
                        label="เรื่อง"
                        name="subject"
                        value={values.subject}
                        onChange={handleInput}
                        sx={{ width: 530 }}
                        margin="normal"
                    />
                </Box>

                <Box sx={{ width: '100%', mb: 5, display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <TextField
                        label="ถึง"
                        name="to_recipient"
                        value={values.to_recipient}
                        onChange={handleInput}
                        sx={{ width: 270 }}

                    />
                    <FormControl sx={{ width: 250 }}>
                        <InputLabel id="document-type-label">ประเภทเอกสาร</InputLabel>
                        <Select
                            labelId="document-type-label"
                            id="document-type"
                            name="document_type"
                            value={values.document_type}
                            label="ประเภทเอกสาร"
                            onChange={handleInput}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            <MenuItem value="เอกสารภายใน">เอกสารภายใน</MenuItem>
                            <MenuItem value="เอกสารภายนอก">เอกสารภายนอก</MenuItem>
                            <MenuItem value="เอกสารสำคัญ">เอกสารสำคัญ</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ width: '100%' }}>
                    <TextField
                        label="หมายเหตุ"
                        name="notes"
                        value={values.notes}
                        onChange={handleInput}
                        sx={{ width: 550 }}
                        multiline
                        rows={4}

                    />
                </Box>

                {/* แสดงไฟล์ที่อัปโหลดก่อนหน้านี้ */}
                {existingFileName && (
                    <Paper
                        elevation={2}
                        sx={{
                            p: 1,
                            backgroundColor: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: 1,
                            mt: 2
                        }}
                    >
                        <InsertDriveFileIcon sx={{ color: '#006FEE', mr: 1 }} /> {/* แสดงไอคอน PDF */}
                        <Typography variant="body2" sx={{ color: 'primary' }}>
                            ไฟล์ที่เคยอัปโหลด: {existingFileName}
                        </Typography>
                    </Paper>
                )}

                {/* ปุ่มสำหรับอัปโหลดไฟล์ใหม่ */}
                <Box sx={{ width: '100%', mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 3 }}>
                    <Button variant="contained" component="label" startIcon={<InsertDriveFileIcon />} >
                        เลือกไฟล์ใหม่
                        <input type="file" hidden onChange={handleFileChange} />
                    </Button>
                    {fileName && (
                        <Paper
                            elevation={2}
                            sx={{
                                p: 1,
                                backgroundColor: '#f5f5f5',
                                display: 'flex',
                                alignItems: 'center',
                                borderRadius: 1,
                            }}
                        >
                            <InsertDriveFileIcon sx={{ color: '#d32f2f', mr: 1 }} />
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                ไฟล์ที่เลือก: {fileName}
                            </Typography>
                        </Paper>
                    )}
                </Box>

                {/* ปุ่มบันทึก */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <Button
                            variant="contained"
                            endIcon={<SendIcon />}
                            onClick={handleSubmit}
                            color="success"
                            sx={{ width: '150px', height: '50px', fontSize: '16px', backgroundColor: '#0E793C' }}
                        >
                            บันทึก
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleCancel}
                            sx={{
                                width: '150px',
                                height: '50px',
                                fontSize: '16px',
                                backgroundColor: '#52525B',
                                color: '#FFFFFF',
                                '&:hover': {
                                    backgroundColor: '#3F3F46', // สีที่เข้ากันเมื่อ hover
                                },
                            }}
                        >
                            ยกเลิก
                        </Button>

                    </Box>
                </Box>

            </Box>
        </Box>
    );
};

export default EditDocument;
