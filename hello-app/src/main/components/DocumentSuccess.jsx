import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, InputBase, Link, Button, Tooltip, Modal, IconButton, Grid } from '@mui/material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Pagination from '@mui/material/Pagination';
import { format } from 'date-fns';
import { Chip } from '@mui/material';
import Swal from 'sweetalert2';
import Drawer from '../../AppBar/Drawer';
import { Search, } from '@mui/icons-material';

const getFileName = (filePath) => {
    if (filePath) {
        return filePath.split('/').pop();
    }
    return 'No file name';
};

const DocumentSuccess = () => {
    const [documents, setDocuments] = useState([]);
    const { id } = useParams();
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const indexOfLastDocument = page * rowsPerPage;
    const indexOfFirstDocument = indexOfLastDocument - rowsPerPage;
    const currentDocuments = documents.slice(indexOfFirstDocument, indexOfLastDocument);
    const storedUserFname = localStorage.getItem('user_fname');
    const storedUserLname = localStorage.getItem('user_lname');
    const senderName = `${storedUserFname} ${storedUserLname}`;
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#8E44AD'];
    const [menuOpen, setMenuOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const [search, setSearch] = useState('');

    const formatDateTime = (dateString) => {
        if (!dateString) {
            return "No Date Available";  // ถ้าไม่มีวันที่ จะแสดงข้อความนี้
        }
        try {
            const formattedDate = new Date(dateString); // แปลงค่าเป็นวันที่
            const datePart = formattedDate.toLocaleDateString("th-TH", {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }); // จัดรูปแบบวันที่ (วัน, เดือน, ปี)
            const timePart = formattedDate.toLocaleTimeString("th-TH", {
                hour: 'numeric',
                minute: 'numeric',
                hour12: false  // ใช้เวลาในรูปแบบ 24 ชั่วโมง
            });

            return `${datePart}  ${timePart}`;
        } catch (error) {
            console.error("Invalid Date Format", error);
            return "Invalid Date";
        }
    };

    const fetchDocuments = async () => {
        try {
            const token = localStorage.getItem('token'); // สมมุติว่าเก็บ token ไว้ใน localStorage
            const response = await axios.get('http://localhost:3000/documents', {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            // กรองเอกสารที่มีสถานะดำเนินการเรียบร้อย (status = 2)
            const successDocuments = response.data.filter(doc => doc.status === 2);
    
            // จัดเรียงตามวันที่
            const sortedDocuments = successDocuments.sort((a, b) => new Date(b.create_at) - new Date(a.create_at));
            setDocuments(sortedDocuments);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleOpen = (document) => {
        setSelectedDocument(document);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedDocument(null);
    };


    // ฟังก์ชันกรองเอกสารตามการค้นหา
    const filteredDocuments = documents.filter(doc =>
        doc.subject && doc.subject.toLowerCase().includes(search.toLowerCase())
    );

    if (error) return (
        <Box>
            <Typography>ข้อผิดพลาด: {error}</Typography>
            <Button onClick={fetchDocuments} variant="contained" color="primary">ลองอีกครั้ง</Button>
        </Box>
    );

    const getStatusText = (status) => {
        switch (status) {
            case 0:
                return { label: 'รอดำเนินการ', color: 'error' }; // สีเหลือง
            case 1:
                return { label: 'กำลังดำเนินการ', color: 'info' }; // สีฟ้า
            case 2:
                return { label: 'ดำเนินการเรียบร้อย', color: 'success' }; // สีเขียว
            default:
                return { label: 'ไม่ทราบสถานะ', color: 'default' }; // สีเทา
        }
    };

    const sortedDocuments = filteredDocuments.sort((a, b) => {
        const statusOrder = {
            0: 3, // รอดำเนินการ
            1: 2, // กำลังดำเนินการ
            2: 1, // ดำเนินการเรียบร้อย
        };
        const statusA = statusOrder[a.status];
        const statusB = statusOrder[b.status];

        if (statusA !== statusB) {
            return statusA - statusB;
        }

        return new Date(b.create_at) - new Date(a.create_at);
    });


    const getAdminNameById = (recipient) => {
        switch (recipient) {
            case 1:
                return 'อรวรรณ หนูนุ่น';
            case 2:
                return 'สุภา นวลจันทร์';
            case 3:
                return 'ปัทติมา รัตนะบุรี';
            default:
                return 'รอผู้รับ';
        }
    };

    const toggleMenu = () => {
        setMenuOpen((prev) => !prev);
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
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
                    cursor: loading ? 'none' : 'auto',
                    zIndex: 9999
                }}>
                    <CircularProgress />
                </Box>
            )}
            <Drawer menuOpen={menuOpen} toggleMenu={toggleMenu} />
            {/* เนื้อหาหลัก */}
            <Box sx={{ flex: 1, p: 2, bgcolor: '#E4E4E7',textAlign:'left'}}>
                <Typography variant="h4" gutterBottom>
                    เอกสารที่ดำเนินการเรียบร้อย
                </Typography>
                <Box sx={{ overflowX: 'auto', p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', borderRadius: '4px', px: 1, mx: 2, mb: 4 }}>
                        <IconButton sx={{ p: '10px' }}>
                            <Search />
                        </IconButton>
                        <InputBase
                            placeholder="Search…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{ ml: 1, flex: 1 }}
                        />
                    </Box>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>ลำดับ</TableCell>
                                    <TableCell align="left" sx={{ fontWeight: 'bold' }}>วันที่</TableCell>
                                    <TableCell align="left" sx={{ fontWeight: 'bold' }}>เรื่อง</TableCell>
                                    <TableCell align="left" sx={{ fontWeight: 'bold' }}>ไฟล์</TableCell>
                                    <TableCell align="left" sx={{ fontWeight: 'bold' }}>สถานะ</TableCell>
                                    <TableCell align="left" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>ผู้รับเอกสาร</TableCell>
                                    <TableCell align="left" sx={{ fontWeight: 'bold' }}>รายละเอียด</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(filteredDocuments.length === 0 ? documents : filteredDocuments)
                                    .sort((a, b) => new Date(b.create_at) - new Date(a.create_at))
                                    .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                                    .map((doc, index) => {
                                        return (
                                            <TableRow
                                                key={doc.id || index}
                                                sx={{
                                                    '&:nth-of-type(even)': { backgroundColor: '#f5f5f5' },
                                                    '&:hover': { backgroundColor: '#e0e0e0' },
                                                    '&:last-child td, &:last-child th': { border: 0 },
                                                }}
                                            >
                                                <TableCell component="th" scope="row">{index + 1 + (page - 1) * rowsPerPage}</TableCell>
                                                <TableCell align="left">{formatDateTime(doc.create_at)}</TableCell>
                                                <TableCell align="left">
                                                    {doc.subject.split(new RegExp(`(${search})`, 'i')).map((part, i) => (
                                                        <span key={i} style={{ backgroundColor: part.toLowerCase() === search.toLowerCase() && filteredDocuments.length > 0 ? '#ffeb3b' : 'transparent' }}>
                                                            {part}
                                                        </span>
                                                    ))}
                                                </TableCell>
                                                <TableCell>
                                                    <Tooltip title="เปิดไฟล์ " arrow>
                                                        <Link
                                                            variant="contained"
                                                            color="primary"
                                                            onClick={() => {
                                                                window.open(`http://localhost:3000/${doc.file}`, '_blank');
                                                            }}
                                                            sx={{
                                                                textTransform: 'none',
                                                            }}
                                                        >
                                                            ViewFile
                                                        </Link>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell align="left" sx={{ maxWidth: 200, whiteSpace: 'nowrap' }}>
                                                    {
                                                        (() => {
                                                            const { label, color } = getStatusText(doc.status);
                                                            return <Chip label={label} color={color} sx={{ borderRadius: '4px' }} />;
                                                        })()
                                                    }
                                                </TableCell>
                                                <TableCell align="left">{getAdminNameById(doc.recipient)}</TableCell>


                                                <TableCell align="left">
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={() => handleOpen(doc)}
                                                    >
                                                        ดูรายละเอียด
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                            </TableBody>

                        </Table>
                    </TableContainer>
                    <Box sx={{ mt: 3, textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                        <Pagination
                            count={Math.ceil(filteredDocuments.length / rowsPerPage)} // ใช้ count จาก filteredDocuments
                            page={page}
                            shape="rounded"
                            onChange={(event, value) => setPage(value)}
                        />
                    </Box>
                </Box>
            </Box>

            {/* ป๊อปอัพสำหรับรายละเอียดเอกสาร */}
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="document-details-title"
                aria-describedby="document-details-description"
            >
                <Box
                    sx={{
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        position: 'absolute',
                        width: { xs: 300, sm: 400, md: 500 },
                        bgcolor: 'background.paper',
                        border: '1px solid #ccc',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                        maxHeight: '80vh',
                        overflowY: 'auto',
                    }}
                >
                    <Typography
                        id="document-details-title"
                        variant="h6"
                        component="h2"
                        sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}
                    >
                        รายละเอียดเอกสาร
                    </Typography>
                    {selectedDocument && (
                        <Grid container spacing={2}>
                            {[
                                { label: 'เรื่อง:', value: selectedDocument.subject },
                                { label: 'วันที่และเวลาอัพโหลด:', value: formatDateTime(selectedDocument.create_at) },
                                { label: 'ถึง:', value: selectedDocument.to_recipient },
                                {
                                    label: 'ชื่อไฟล์:',
                                    value: (
                                        <Link
                                            href={`http://localhost:3000/${selectedDocument.file}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{ color: '#1976d2', textDecoration: 'none' }}
                                        >
                                            {selectedDocument.file}
                                        </Link>
                                    ),
                                },
                                {
                                    label: 'สถานะ:',
                                    value: (
                                        <Chip {...getStatusText(selectedDocument.status)} sx={{ borderRadius: '4px' }} />
                                    ),
                                },
                                { label: 'เลขที่เอกสาร:', value: selectedDocument.document_number },
                                { label: 'ประเภทเอกสาร:', value: selectedDocument.document_type },
                                { label: 'หมายเหตุ:', value: selectedDocument.notes },

                                { label: 'ผู้ส่ง:', value: senderName },
                                { label: 'ผู้รับเอกสาร:', value: getAdminNameById(selectedDocument.recipient) },
                                { label: 'ที่ต้องแก้ไข:', value: selectedDocument.reply },
                            ].map((item, index) => (
                                <Grid item xs={12} key={index}>
                                    <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', borderBottom: '1px solid #e0e0e0', pb: 1 }}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', width: '150px' }}>
                                            {item.label}
                                        </Typography>
                                        <Typography variant="body2" sx={{ ml: 1, flex: 1 }}>
                                            {item.value}
                                        </Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    )}

                    <Button
                        onClick={handleClose}
                        variant="contained"
                        sx={{
                            mt: 3,
                            width: '100%',
                            backgroundColor: '#52525B',
                            color: '#FFFFFF',
                            '&:hover': {
                                backgroundColor: '#3F3F46', // สีที่เข้ากันเมื่อ hover
                            },
                        }}
                    >
                        ปิด
                    </Button>

                </Box>
            </Modal>
        </Box>
    );
};

export default DocumentSuccess;
