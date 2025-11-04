import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    AppBar, Toolbar, Typography, IconButton, Box, TextField, InputAdornment, Container, Grid, FormControl,
    InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Pagination, Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import Layout from '../../LayoutAdmin/Layout';
import { Pie } from 'react-chartjs-2';
import PieChart from '../../Charts/PieChart';

function ReceiptsList() {
    const [receipts, setReceipts] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [selectedAdmin, setSelectedAdmin] = useState('');
    const [allReceipts, setAllReceipts] = useState([]);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const totalReceipts = receipts.length; // จำนวนเอกสารทั้งหมด
    const totalSavings = receipts.reduce((acc, receipt) => acc + parseFloat(receipt.paper_cost), 0); // ใช้ parseFloat
    const [adminData, setAdminData] = useState([]);
    const [searchDate, setSearchDate] = useState('');
    const [highlightedRows, setHighlightedRows] = useState([]); // สถานะสำหรับเก็บแถวที่ต้องการไฮไลต์
    const [page, setPage] = useState(1); // State for current page
    const rowsPerPage = 10; // Set number of rows per page to 10
    const [documents, setDocuments] = useState([]);
    const [startDate, setStartDate] = useState('');  // ประกาศสถานะ startDate
    const [endDate, setEndDate] = useState('');  // ประกาศสถานะ endDate
    const [searchTerm, setSearchTerm] = useState(''); // จัดการการค้นหา

    // ฟังก์ชันจัดเรียงเอกสารให้ใหม่แสดงด้านบนสุด
    const sortedReceipts = [...receipts].sort((a, b) => new Date(b.date_received) - new Date(a.date_received));
    // ฟังก์ชันสำหรับแบ่งหน้า
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedReceipts = sortedReceipts.slice(startIndex, endIndex);

    // ฟังก์ชันสำหรับไฮไลท์ข้อความที่ตรงกับการค้นหา
    const highlightText = (text, searchTerm) => {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, index) =>
            regex.test(part) ? <span key={index} style={{ backgroundColor: 'yellow' }}>{part}</span> : part
        );
    };



    // ฟังก์ชันฟิลเตอร์ข้อมูลที่ตรงกับคำค้นหา
    const filteredReceipts = paginatedReceipts.filter(receipt => {
        const document = documents.find(doc => doc.document_id === receipt.document_id);
        const subjectMatch = document?.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const senderMatch = `${document?.user_fname} ${document?.user_lname}`.toLowerCase().includes(searchTerm.toLowerCase());

        return subjectMatch || senderMatch; // ฟิลเตอร์เฉพาะข้อมูลที่ตรง
    });



    const handleDrawerToggle = () => {
        setOpen(!open);
    };

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/admins');
                setAdmins(response.data);

            } catch (error) {
                console.error('Error fetching admins:', error);
            }
        };

        const fetchAllReceipts = async () => {
            try {
                const response = await axios.get('http://localhost:3000/document-receipts');
                setAllReceipts(response.data);
            } catch (error) {
                console.error('Error fetching all document receipts:', error);
            }
        };

        fetchAdmins();
        fetchAllReceipts();
    }, []);

    useEffect(() => {
        if (selectedAdmin === 'all') {
            const adminCounts = receipts.reduce((acc, receipt) => {
                const adminId = receipt.user_id; // ไอดี Admin
                acc[adminId] = (acc[adminId] || { count: 0, paper_cost: 0 });
                acc[adminId].count += 1; // นับจำนวนเอกสาร
                acc[adminId].paper_cost += Number(receipt.paper_cost); // รวมค่าใช้จ่ายในการประหยัดกระดาษ แปลงเป็นตัวเลข
                return acc;
            }, {});

            // แปลงข้อมูลให้ตรงกับโครงสร้างที่เราต้องการแสดง
            const adminDataArray = admins.map(admin => ({
                user_id: admin.user_id,
                user_fname: admin.user_fname,
                user_lname: admin.user_lname,
                count: adminCounts[admin.user_id]?.count || 0,
                paper_cost: adminCounts[admin.user_id]?.paper_cost || 0,
            }));

            setAdminData(adminDataArray); // ตั้งค่า adminData สำหรับแสดงในตาราง

        } else {
            const fetchDocumentReceipts = async () => {
                try {
                    const response = await axios.get(`http://localhost:3000/document-receipts/${selectedAdmin}`);
                    setReceipts(response.data); // ตั้งค่าผลลัพธ์ที่ได้จากการเลือกแอดมิน

                    // สร้างข้อมูลสำหรับกราฟ
                    const dataForChart = response.data.reduce((acc, receipt) => {
                        acc.push({ label: receipt.document_id, value: Number(receipt.paper_cost) }); // แปลงเป็นตัวเลข
                        return acc;
                    }, []);
                    setAdminData(dataForChart); // ตั้งค่าข้อมูลกราฟ
                } catch (error) {
                    console.error('Error fetching document receipts:', error);
                }
            };

            fetchDocumentReceipts();
        }
    }, [selectedAdmin, receipts, admins]);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await axios.get('http://localhost:3000/admin/documents');
                setDocuments(response.data); // เก็บข้อมูลเอกสาร
            } catch (error) {
                console.error('Error fetching documents:', error);
            }
        };

        fetchDocuments();
    }, []);

    const adminCounts = receipts.reduce((acc, receipt) => {
        const adminId = receipt.user_id; // ไอดี Admin
        acc[adminId] = (acc[adminId] || 0) + 1; // เพิ่มจำนวนเอกสารที่แอดมินคนนี้รับ
        return acc;
    }, {});


    // คำนวณจำนวนเอกสารทั้งหมดที่ได้รับโดยรวมจากแอดมินทุกคน
    const totalDocuments = adminData.reduce((total, admin) => total + admin.count, 0);

    // คำนวณเปอร์เซ็นต์สำหรับแต่ละแอดมิน
    const chartData = {
        labels: adminData.map(admin => `${admin.user_fname} ${admin.user_lname}`), // ชื่อแอดมิน
        datasets: [{
            label: 'จำนวนเอกสารที่รับ (%)',
            data: adminData.map(admin => (admin.count / totalDocuments) * 100), // คำนวณเปอร์เซ็นต์
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'], // กำหนดสีของกราฟ
        }]
    };

    return (
        <Layout> {/* เรียกใช้ Layout ที่ห่อไว้ */}
            <Box sx={{ display: 'flex' }}>
                <Box component="main" sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: 3, bgcolor: '#eaeff1' }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'left', color: '#1976d2' }}>สถิติการรับเอกสาร</Typography>
                    <Toolbar />
                    <Container>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="ค้นหา..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)} // อัปเดต searchTerm เมื่อพิมพ์
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel>Admin</InputLabel>
                                    <Select
                                        value={selectedAdmin} // ใช้ selectedAdmin เป็น value
                                        onChange={(e) => setSelectedAdmin(e.target.value)}
                                        label="Admin"
                                    >
                                        <MenuItem value=""></MenuItem> {/* ตัวเลือก "ไม่มีแอดมิน" เมื่อไม่เลือก */}
                                        <MenuItem value="all">ทั้งหมด</MenuItem> {/* ตัวเลือก "ทั้งหมด" */}
                                        {admins.length > 0 ? (
                                            admins.map(admin => (
                                                <MenuItem key={admin.user_id} value={admin.user_id}>
                                                    {admin.user_fname} {admin.user_lname}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem value="">No Admins Available</MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                            </Grid>

                        </Grid>
                        {/* เงื่อนไขสำหรับแสดงตาราง */}
                        {selectedAdmin && (
                            <>

                                {/* ตารางสำหรับแสดงข้อมูลเอกสารเมื่อเลือกแอดมินรายบุคคล */}
                                {selectedAdmin !== '' && selectedAdmin !== 'all' && (
                                    <TableContainer component={Paper} sx={{ mt: 4 }}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>ลำดับ</TableCell>
                                                    <TableCell>วันที่รับเอกสาร</TableCell>
                                                    <TableCell>เรื่อง</TableCell>
                                                    <TableCell>ผู้ส่ง</TableCell>
                                                    <TableCell>จำนวนเงินประหยัดกระดาษ</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {filteredReceipts.length > 0 ? (
                                                    filteredReceipts.map((receipt, index) => {
                                                        const document = documents.find(doc => doc.document_id === receipt.document_id);
                                                        return (
                                                            <TableRow key={receipt.receipt_id}>
                                                                <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                                                                <TableCell>
                                                                    {new Date(receipt.date_received).toLocaleDateString('th-TH', {
                                                                        day: 'numeric',
                                                                        month: 'long',
                                                                        year: 'numeric',
                                                                    })}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {document ? highlightText(document.subject, searchTerm) : 'No Subject'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {document ? highlightText(`${document.user_fname} ${document.user_lname}`, searchTerm) : 'No Name'}
                                                                </TableCell>
                                                                <TableCell>{receipt.paper_cost}</TableCell>
                                                            </TableRow>
                                                        );
                                                    })
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={5}>No receipts available</TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}

                                {/* Pagination */}
                                <Box sx={{ mt: 3, textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                                    <Pagination
                                        count={Math.ceil(sortedReceipts.length / rowsPerPage)} // คำนวณจำนวนหน้า
                                        page={page}
                                        shape="rounded"
                                        onChange={(event, value) => setPage(value)} // เปลี่ยนหน้าเมื่อคลิก
                                    />
                                </Box>
                                {/* ตารางผลรวมด้านล่าง */}
                                {selectedAdmin !== 'all' && ( // เพิ่มเงื่อนไขที่นี่เพื่อให้ไม่แสดงตารางผลรวมเมื่อเลือก "ทั้งหมด"
                                    <TableContainer component={Paper} sx={{ mt: 4 }}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>จำนวนเอกสารทั้งหมด</TableCell>
                                                    <TableCell>{totalReceipts}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>รวมเงินประหยัดกระดาษ</TableCell>
                                                    <TableCell>{Number(totalSavings).toFixed(2)}</TableCell> {/* จำกัดทศนิยม 2 ตำแหน่ง */}

                                                </TableRow>
                                            </TableHead>
                                        </Table>
                                    </TableContainer>
                                )}

                                {/* ตารางสำหรับแสดงข้อมูลแอดมินเมื่อเลือก "ทั้งหมด" */}
                                {selectedAdmin === 'all' && (
                                    <TableContainer component={Paper} sx={{ mt: 4 }}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>ชื่อแอดมิน</TableCell>
                                                    <TableCell>จำนวนเอกสาร</TableCell>
                                                    <TableCell>รวมเงินประหยัดกระดาษ</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {adminData.map(admin => (
                                                    <TableRow key={admin.user_id}>
                                                        <TableCell>{`${admin.user_fname} ${admin.user_lname}`}</TableCell>
                                                        <TableCell>{admin.count}</TableCell>
                                                        <TableCell>{Number(admin.paper_cost).toFixed(2)}</TableCell> {/* จำกัดทศนิยม 2 ตำแหน่ง */}

                                                    </TableRow>
                                                ))}
                                                {/* แถวรวม */}
                                                <TableRow>
                                                    <TableCell><strong>รวม</strong></TableCell>
                                                    <TableCell>
                                                        <strong>
                                                            {adminData.reduce((total, admin) => total + admin.count, 0)}
                                                        </strong>
                                                    </TableCell>
                                                    <TableCell>
                                                        <strong>
                                                            {(
                                                                adminData.reduce((total, admin) => total + admin.paper_cost, 0)
                                                            ).toFixed(2).toLocaleString()} {/* จำกัดทศนิยม 2 ตำแหน่งและแปลงเป็นรูปแบบที่อ่านได้ */}
                                                        </strong>
                                                    </TableCell>

                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}


                            </>
                        )}

                        {/* แสดงกราฟ */}
                        {selectedAdmin === 'all' && (
                            <Box sx={{ width: 500, height: 500, textAlign: 'center', justifyContent: 'center', mt: 4 }}>
                                <Pie data={chartData} />
                            </Box>
                        )}
                    </Container>
                    {/* <Box sx={{ mt: 3, textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                        <Pagination
                            count={Math.ceil(sortedDocuments.length / rowsPerPage)} // คำนวณจำนวนหน้า
                            page={page}
                            shape="rounded"
                            onChange={(event, value) => setPage(value)} // เปลี่ยนหน้าเมื่อคลิก
                        />
                    </Box> */}
                </Box>
            </Box>

        </Layout>
    );
}

export default ReceiptsList;
