import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, Paper, TableContainer, TableHead, TableRow, Box, Button, Tooltip, InputBase, Chip, Typography, IconButton,Pagination } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import Layout from '../../LayoutAdmin/Layout';
import { Search, } from '@mui/icons-material';

// การจัดรูปแบบวันที่และเวลา
const formatDateTime = (dateTime) => format(parseISO(dateTime), 'yyyy-MM-dd HH:mm:ss');

function UnreadDocuments() {
    const [unreadDocuments, setUnreadDocuments] = useState([]);
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1); // State for current page
    const rowsPerPage = 10; // Set number of rows per page to 10

    useEffect(() => {
        fetchUnreadDocuments(); // ดึงข้อมูลเอกสารที่ยังไม่ได้อ่านทันทีที่หน้าโหลด
    }, []);

    // ดึงเอกสาร Document ที่ยังไม่อ่าน
    const fetchUnreadDocuments = async () => {
        try {
            const response = await axios.get('http://localhost:3000/document/unread');
            setUnreadDocuments(response.data);
        } catch (error) {
            console.error('Error fetching unread documents:', error);
        }
    };

    const handleDocumentRead = async (docId) => {
        if (!docId) {
            console.error('Document ID is undefined');
            return;
        }
        try {
            await axios.put(`http://localhost:3000/document/${docId}/read`);
            fetchUnreadDocuments(); // รีเฟรชข้อมูลเอกสารที่ยังไม่อ่าน
        } catch (error) {
            console.error('Error updating document status:', error);
        }
    };

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
    };

    const handleEditClick = (docId) => {
        navigate(`/edit/${docId}`);
    };


    const getStatusText = (docStatus) => {
        switch (docStatus) {
            case 0:
                return { label: 'รอดำเนินการ', color: 'warning' };
            case 1:
                return { label: 'กำลังดำเนินการ', color: 'info' };
            case 2:
                return { label: 'ดำเนินการเรียบร้อย', color: 'success' };
            default:
                return { label: 'ไม่ทราบสถานะ', color: 'default' };
        }
    };

    // ฟังก์ชันเพื่อไฮไลต์ข้อความ
    const highlightText = (text) => {
        if (!search) return text;

        const parts = text.split(new RegExp(`(${search})`, 'gi'));
        return parts.map((part, index) =>
            part.toLowerCase() === search.toLowerCase() ? (
                <span key={index} style={{ backgroundColor: '#ffeb3b' }}>{part}</span>
            ) : part
        );
    };

    // ฟังก์ชันสำหรับการกรองเอกสารที่ยังไม่อ่านตามคำค้นหา
    const filteredDocuments = unreadDocuments.filter(doc =>
        doc.user_fname.toLowerCase().includes(search.toLowerCase()) ||
        doc.subject.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => a.status - b.status); // เรียงตามสถานะ

    const sortedDocuments = filteredDocuments.sort((a, b) => a.status - b.status);
    const startIndex = (page - 1) * rowsPerPage;
    const displayedDocuments = sortedDocuments.slice(startIndex, startIndex + rowsPerPage);
    

    return (
        <Layout> {/* เรียกใช้ Layout ที่ห่อไว้ */}
            <Box sx={{ display: 'flex' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: 3, bgcolor: '#eaeff1' }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'left', color: '#1976d2' }}>เอกสารที่ยังไม่เปิดอ่าน</Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', borderRadius: '4px', px: 1, mx: 2, mb: 3 }}>
                        <IconButton sx={{ p: '10px' }}>
                            <Search />
                        </IconButton>
                        <InputBase
                            placeholder="Search…"
                            value={search}
                            onChange={handleSearchChange}
                            sx={{ ml: 1, flex: 1 }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', backgroundColor: '#fff', borderRadius: '4px', px: 1, mx: 2, p: 4 }}>

                        {/* ตารางแสดงเอกสารที่ยังไม่อ่าน */}
                        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f0f8ff' }}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>ลำดับ.</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>วันที่</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>ชื่อ-สกุล</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>เรื่อง</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>ถึง</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>สถานะ</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>ไฟล์</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredDocuments.map((doc, index) => {
                                        return (
                                            <TableRow key={doc.document_id}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{formatDateTime(doc.upload_date)}</TableCell>
                                                <TableCell>{highlightText(`${doc.user_fname} ${doc.user_lname}`)}</TableCell>
                                                <TableCell>{highlightText(doc.subject)}</TableCell>
                                                <TableCell>{doc.to_recipient}</TableCell>
                                                <TableCell>
                                                    {
                                                        (() => {
                                                            const { label, color } = getStatusText(doc.status);
                                                            return <Chip label={label} color={color} sx={{ borderRadius: '4px' }} />;
                                                        })()
                                                    }
                                                </TableCell>

                                                <TableCell>
                                                    <Tooltip title="เปิดไฟล์ PDF" arrow>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            onClick={() => {
                                                                handleDocumentRead(doc.document_id); // เรียกฟังก์ชันด้วย document_id
                                                                window.open(`http://localhost:3000/${doc.file}`, '_blank'); // เปิดไฟล์ในแท็บใหม่
                                                            }}
                                                            sx={{
                                                                textTransform: 'none', // ปิดการแปลงข้อความเป็นตัวพิมพ์ใหญ่
                                                                '&:hover': { // ปรับแต่งสไตล์เมื่อเมาส์อยู่เหนือปุ่ม
                                                                    backgroundColor: '#1976d2', // สีเมื่ออยู่เหนือปุ่ม
                                                                }
                                                            }}
                                                        >
                                                            PDF
                                                        </Button>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Box sx={{ mt: 3, textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                            <Pagination
                                count={Math.ceil(sortedDocuments.length / rowsPerPage)} // คำนวณจำนวนหน้า
                                page={page}
                                shape="rounded"
                                onChange={(event, value) => setPage(value)} // เปลี่ยนหน้าเมื่อคลิก
                            />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Layout>
    );
}

export default UnreadDocuments;
