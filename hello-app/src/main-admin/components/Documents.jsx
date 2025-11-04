import React, { useEffect, useState } from 'react';
import { Typography, Tabs, Tab, Table, TableBody, TableCell, Paper, CircularProgress, TableContainer, TableHead, TableRow, Box, Pagination, CssBaseline, IconButton, InputBase, Button, Tooltip } from '@mui/material';
import { Search, } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import Layout from '../../LayoutAdmin/Layout';
import Swal from 'sweetalert2';

const formatDateTime = (dateTime) => format(parseISO(dateTime), 'yyyy-MM-dd HH:mm:ss');

function Documents() {
    const [allDocuments, setAllDocuments] = useState([]);
    const [unreadDocuments, setUnreadDocuments] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [paperCost, setPaperCost] = useState(0.00); // กำหนดค่าเริ่มต้น paperCost
    const adminId = localStorage.getItem('user_id');
    const [receivedDocuments, setReceivedDocuments] = useState(new Set());
    const [isReceived, setIsReceived] = useState(false);
    const [document, setDocument] = useState({ status: 0 });
    const rowsPerPage = 10;
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

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
            }); // จัดรูปแบบเวลา (ชั่วโมง:นาที) ไม่มีวินาที

            return `${datePart}  ${timePart}`;  // รวมวันที่และเวลา
        } catch (error) {
            console.error("Invalid Date Format", error);
            return "Invalid Date"; // ถ้าไม่สามารถแปลงวันที่ได้
        }
    };


    const filteredDocuments = (activeTab === 'all' ? allDocuments : unreadDocuments).filter(doc =>
        (doc.subject && doc.subject.toLowerCase().includes(search.toLowerCase())) ||
        (`${doc.user_fname || ''} ${doc.user_lname || ''}`.toLowerCase().includes(search.toLowerCase())) 
    );


    // ฟังก์ชันสำหรับไฮไลท์คำค้นหา
    const highlightSearchTerm = (text) => {
        if (!search) return text; // หากไม่มีการค้นหาให้แสดงข้อความปกติ
        const regex = new RegExp(`(${search})`, 'gi'); // สร้าง regex สำหรับคำค้นหา
        return text.split(regex).map((part, index) =>
            regex.test(part) ? <span key={index} style={{ backgroundColor: '#ffeb3b' }}>{part}</span> : part
        );
    };
    const preventNavigation = (event) => {
        if (isReceived && document.status === 1) { // ตรวจสอบว่ามีการรับเอกสารแล้วและสถานะเป็น 'กำลังดำเนินการ'
            event.preventDefault();
            event.returnValue = ''; // ต้องตั้งค่านี้เพื่อแสดงการเตือน
        }
    };

    const removeNavigationWarning = () => {
        window.removeEventListener('beforeunload', preventNavigation);
    };

    // ฟังก์ชันสำหรับการเพิ่ม event beforeunload เพื่อเตือนก่อนออกจากหน้า
    const addNavigationWarning = () => {
        window.addEventListener('beforeunload', handleBeforeUnload);
    };

    // ฟังก์ชันจัดการการแจ้งเตือนเมื่อออกจากหน้า
    const handleBeforeUnload = (e) => {
        const confirmationMessage = 'คุณยังไม่ได้บันทึกการเปลี่ยนแปลง หากคุณออกจากหน้านี้ ข้อมูลที่คุณทำจะสูญหาย';
        e.returnValue = confirmationMessage; // สำหรับเบราว์เซอร์เก่า
        return confirmationMessage;
    };





    // ฟังก์ชันจัดเรียงเอกสาร
    const sortedDocuments = filteredDocuments.sort((a, b) => {
        const statusOrder = {
            0: 1, // รอดำเนินการ
            1: 2, // กำลังดำเนินการ
            2: 3, // ดำเนินการเรียบร้อย
        };
        const statusA = statusOrder[a.status];
        const statusB = statusOrder[b.status];

        if (statusA === statusB) {
            return new Date(b.create_at) - new Date(a.create_at); // เรียงตามวันที่ (ใหม่สุดไปเก่าที่สุด)
        }
        return statusA - statusB; // เรียงตามสถานะ
    });

    // คำนวณเอกสารที่จะแสดงตามหน้า
    const startIndex = (page - 1) * rowsPerPage;
    const displayedDocuments = sortedDocuments.slice(startIndex, startIndex + rowsPerPage);

    useEffect(() => {
        if (activeTab === 'all') {
            fetchAllDocuments();
        } else {
            fetchUnreadDocuments();
        }
    }, [activeTab]);

    useEffect(() => {
        // เพิ่ม event listener
        window.addEventListener('beforeunload', preventNavigation);

        // ลบ event listener เมื่อ component จะ unmount
        return () => {
            window.removeEventListener('beforeunload', preventNavigation);
        };
    }, [isReceived, document.status]);


    const fetchAllDocuments = async () => {
        try {
            const response = await axios.get('http://localhost:3000/admin/documents');
            setAllDocuments(response.data);
            setIsReceived(response.data.some(doc => receivedDocuments.has(doc.id) && doc.status === 1));
        } catch (error) {
            console.error('Error fetching all documents:', error);
        }
    };

    //ดึงเอกสาร Document
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

            if (activeTab === 'all') {
                fetchAllDocuments();
            } else {
                fetchUnreadDocuments();
            }
        } catch (error) {
            console.error('Error updating document status:', error);
        }
    };


    const handleDocumentReceive = async (docId) => {
        try {
            // อัปเดตสถานะเอกสารเป็น 'กำลังดำเนินการ'
            const updateStatusResponse = await axios.put(`http://localhost:3000/document/${docId}/status`, {
                received_by: adminId
            });

            setIsReceived(true);
            setDocument(prev => ({ ...prev, status: 1 }));

            // // บันทึกข้อมูลการรับเอกสาร
            // const receiptResponse = await axios.post('http://localhost:3000/document-stats', {
            //     documentId: docId,
            //     adminId: adminId,
            //     dateReceived: new Date().toISOString().split('T')[0],

            // });
            // console.log('Receipt response:', receiptResponse.data);

            // อัปเดตสถานะเอกสารใน state ว่าได้รับการบันทึกแล้ว
            setReceivedDocuments((prev) => new Set(prev).add(docId));

            // แสดงข้อความยืนยันว่าเอกสารถูกบันทึกแล้ว
            Swal.fire({
                title: 'สำเร็จ!',
                text: 'รับเอกสารเรียบร้อยแล้ว',
                icon: 'success',
                confirmButtonText: 'ตกลง'
            });

            // รีเฟรชข้อมูลเอกสาร
            if (activeTab === 'all') {
                console.log('Fetching all documents...');
                fetchAllDocuments();
            } else {
                console.log('Fetching unread documents...');
                fetchUnreadDocuments();
            }

        } catch (error) {
            console.error('Error handling document receive:', error);

            // แสดงข้อความผิดพลาด
            Swal.fire({
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถรับเอกสารได้',
                icon: 'error',
                confirmButtonText: 'ตกลง'
            });
        }

    };

    const handleReceiveButtonClick = (docId) => {
        // ถามยืนยันก่อนรับเอกสาร
        Swal.fire({
            title: 'คุณแน่ใจหรือไม่?',
            text: 'คุณต้องการรับเอกสารนี้ใช่ไหม?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'ใช่, รับเอกสาร',
            cancelButtonText: 'ยกเลิก'
        }).then((result) => {

            if (result.isConfirmed) {
                // เรียกฟังก์ชันเพื่อรับเอกสาร
                handleDocumentReceive(docId);
                // เพิ่มการเตือนเมื่อยังไม่ได้เปลี่ยนสถานะ
                window.addEventListener('beforeunload', preventNavigation);
            }
        });
    };


    const handleSearchChange = (event) => {
        setSearch(event.target.value);
    };

    const handleAddFile = () => {
        setLoading(true); // เริ่มการโหลด
        setTimeout(() => {
            navigate('/addfile'); // เปลี่ยนหน้าไปยัง path ที่ระบุ
            setLoading(false); // หยุดการโหลดหลังจากเปลี่ยนหน้า
        }, 400); // หน่วงเวลา 400ms
    };

    const getStatusText = (docStatus) => {
        switch (docStatus) {
            case 0:
                return { label: 'รอดำเนินการ', color: 'error' };
            case 1:
                return { label: 'กำลังดำเนินการ', color: 'info' };
            case 2:
                return { label: 'ดำเนินการเรียบร้อย', color: 'success' };
            default:
                return { label: 'ไม่ทราบสถานะ', color: 'default' };
        }
    };

    // ในฟังก์ชัน Documents
    const handleEditClick = (docId) => {

        setLoading(true); // เริ่มการโหลด
        setTimeout(() => {
            navigate(`/edit/${docId}`);
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
                        <CircularProgress />
                    </Box>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: 3, bgcolor: '#eaeff1' }}>

                    {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                            เอกสารทั้งหมด
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddFile}
                            sx={{ height: 'fit-content' }}
                        >
                            + Add File
                        </Button>
                    </Box> */}

                    <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', borderRadius: '4px', px: 1, mx: 2 }}>
                        <IconButton sx={{ p: '10px' }}>
                            <Search />
                        </IconButton>
                        <InputBase
                            placeholder="ค้นหา…"
                            value={search}
                            onChange={handleSearchChange}
                            sx={{ ml: 1, flex: 1 }}
                        />
                    </Box>
                    <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
                        {/* <Tab label="เอกสารที่ยังไม่เปิดอ่าน" value="unread" /> */}
                        <Tab label="เอกสารทั้งหมด" value="all" />
                    </Tabs>
                    <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#1976d2' }}>
                                <TableRow sx={{ backgroundColor: '#f0f8ff' }}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>ลำดับ.</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>วันที่</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>ชื่อ-สกุล</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>เรื่อง</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>ถึง</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>สถานะ</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>ไฟล์</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {displayedDocuments.map((doc, index) => {
                                    return (
                                        <TableRow key={doc.document_id}>
                                            <TableCell>{startIndex + index + 1}</TableCell>
                                            <TableCell>{formatDateTime(doc.create_at)}</TableCell>
                                            <TableCell>
                                                <Tooltip title={`${doc.user_fname} ${doc.user_lname}`} arrow>
                                                    <Typography variant="body1" noWrap>
                                                        {highlightSearchTerm(`${doc.user_fname} ${doc.user_lname}`)}
                                                    </Typography>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title={doc.subject} arrow>
                                                    <Typography
                                                        variant="body1"

                                                        sx={{
                                                            maxWidth: '190px', // ปรับความกว้างสูงสุดตามที่ต้องการ
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                        }}
                                                    >
                                                        {highlightSearchTerm(doc.subject)}
                                                    </Typography>
                                                </Tooltip>
                                            </TableCell>

                                            <TableCell>
                                                <Tooltip title={doc.to_recipient} arrow>
                                                    <Typography
                                                        variant="body1"
                                                        noWrap
                                                        sx={{
                                                            maxWidth: '100px', // ปรับความกว้างสูงสุดตามที่ต้องการ
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                        }}
                                                    >
                                                        {doc.to_recipient}
                                                    </Typography>
                                                </Tooltip>
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    (() => {
                                                        const { label, color } = getStatusText(doc.status);
                                                        return <Chip label={label} color={color} sx={{ borderRadius: '4px' }} />;
                                                    })()
                                                }
                                            </TableCell>
                                            {/* <TableCell sx={{ width: '130px' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                                                    <Tooltip title="แก้ไขข้อมูลเอกสาร" arrow>
                                                        <Button variant="contained"
                                                            sx={{
                                                                mx: 1,
                                                                backgroundColor: '#ffeb3b', // สีหลักของปุ่ม
                                                                color: '#000',
                                                                '&:hover': {
                                                                    backgroundColor: '#fbc02d', // สีเมื่อชี้เมาส์
                                                                },
                                                                display: 'flex',
                                                                alignItems: 'center', // จัดแนวให้อยู่กลาง
                                                            }}
                                                            onClick={() => {
                                                                console.log('Edit button clicked for document_id:', doc.document_id);
                                                                handleEditClick(doc.document_id);
                                                            }}>
                                                            <EditIcon /> 
                                                            Edit
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip title="สำหรับรับเอกสาร" arrow>
                                                        <Button
                                                            variant="contained"
                                                            color={doc.status === 1 || doc.status === 2 ? "success" : "primary"}
                                                            onClick={() => handleReceiveButtonClick(doc.document_id)}
                                                            disabled={receivedDocuments.has(doc.document_id) || doc.status === 1 || doc.status === 2} // ปิดปุ่มเมื่อเอกสารถูกกดรับแล้ว หรือสถานะเป็น "กำลังดำเนินการ" หรือ "ดำเนินการเสร็จแล้ว"

                                                        >
                                                            {doc.status === 1 || doc.status === 2 || receivedDocuments.has(doc.document_id) ? 'สำเร็จ' : 'รับ'}
                                                        </Button>
                                                    </Tooltip>
                                                </Box>

                                                <IconButton
                                                    sx={{ mx: 1, color: '#1976d2' }}
                                                    onClick={() => handleReceiveButtonClick(doc.document_id)}
                                                    disabled={doc.status === 1}
                                                >
                                                    <CheckCircle />
                                                </IconButton>
                                            </TableCell> */}
                                            <TableCell sx={{ width: '130px' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                                                    {/* ปุ่ม Edit ถูกปิดเมื่อสถานะเอกสารเป็น "ดำเนินการเรียบร้อย" */}
                                                    <Tooltip title="รับเอกสารและแก้ไข" arrow>
                                                        <Button
                                                            variant="contained"
                                                            sx={{
                                                                mx: 1,
                                                                backgroundColor: '#ffeb3b', // สีหลักของปุ่ม
                                                                color: '#000',
                                                                '&:hover': {
                                                                    backgroundColor: '#fbc02d', // สีเมื่อชี้เมาส์
                                                                },
                                                                display: 'flex',
                                                                alignItems: 'center', // จัดแนวให้อยู่กลาง
                                                            }}
                                                            onClick={() => {
                                                                console.log('Edit button clicked for document_id:', doc.document_id);
                                                                handleEditClick(doc.document_id);
                                                            }}
                                                            disabled={doc.status === 2} // ปิดปุ่มเมื่อสถานะเป็น "ดำเนินการเรียบร้อย"
                                                        >
                                                            <EditIcon /> {/* ไอคอนการแก้ไข */}
                                                            แก้ไข
                                                        </Button>
                                                    </Tooltip>

                                                    {/* ปุ่มรับเอกสาร */}
                                                    {/* <Tooltip title="สำหรับรับเอกสาร" arrow>
                                                        <Button
                                                            variant="contained"
                                                            color={doc.status === 1 || doc.status === 2 ? "success" : "primary"}
                                                            onClick={() => handleReceiveButtonClick(doc.document_id)}
                                                            disabled={receivedDocuments.has(doc.document_id) || doc.status === 1 || doc.status === 2}
                                                        >
                                                            {doc.status === 1 || doc.status === 2 || receivedDocuments.has(doc.document_id) ? 'สำเร็จ' : 'รับ'}
                                                        </Button>
                                                    </Tooltip> */}
                                                </Box>
                                            </TableCell>



                                            <TableCell>
                                                <Tooltip title="เปิดไฟล์" arrow>
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
                                                        View
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
        </Layout>
    );
}

export default Documents;
