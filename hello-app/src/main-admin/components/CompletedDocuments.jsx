import React, { useEffect, useState } from 'react';
import {Typography,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,CircularProgress, TextField, IconButton, Box, Chip, Button, Tooltip, Pagination} from '@mui/material';
import { Search } from '@mui/icons-material';
import axios from 'axios';
import Layout from '../../LayoutAdmin/Layout';

const CompletedDocuments = () => {
    const [allDocuments, setAllDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await axios.get('http://localhost:3000/admin/documents');
            setAllDocuments(response.data);
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDocumentRead = async (docId) => {
        if (!docId) {
            console.error('Document ID is undefined');
            return;
        }
        try {
            await axios.put(`http://localhost:3000/document/${docId}/read`);
        } catch (error) {
            console.error('Error updating document status:', error);
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) {
            return "No Date Available";
        }
        try {
            const formattedDate = new Date(dateString);
            const datePart = formattedDate.toLocaleDateString("th-TH", {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            const timePart = formattedDate.toLocaleTimeString("th-TH", {
                hour: 'numeric',
                minute: 'numeric',
                hour12: false
            });

            return `${datePart}  ${timePart}`;
        } catch (error) {
            console.error("Invalid Date Format", error);
            return "Invalid Date";
        }
    };

    const filteredDocuments = allDocuments.filter(doc =>
        doc.status === 2 && // Show only documents that are "completed"
        ((doc.subject && doc.subject.toLowerCase().includes(search.toLowerCase())) ||
            (`${doc.user_fname || ''} ${doc.user_lname || ''}`.toLowerCase().includes(search.toLowerCase())))
    );

    const sortedDocuments = filteredDocuments.sort((a, b) => new Date(b.create_at) - new Date(a.create_at));

    const startIndex = (page - 1) * rowsPerPage;
    const displayedDocuments = sortedDocuments.slice(startIndex, startIndex + rowsPerPage);

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

    const highlightSearchTerm = (text) => {
        if (!search) return text;
        const regex = new RegExp(`(${search})`, 'gi');
        return text.split(regex).map((part, index) =>
            regex.test(part) ? <span key={index} style={{ backgroundColor: '#ffeb3b' }}>{part}</span> : part
        );
    };

    return (
        <Layout>
           
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              เอกสารที่ดำเนินการเรียบร้อย
              </Typography>
              </Box>
              

                <TextField
                    variant="outlined"
                    placeholder="ค้นหา..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        endAdornment: (
                            <IconButton>
                                <Search />
                            </IconButton>
                        ),
                    }}
                    fullWidth
                    sx={{ mb: 3 }}
                />

                {loading ? (
                    <CircularProgress />
                ) : (
                    <TableContainer sx={{ maxHeight: 440, bgcolor: '#f8f8f8', borderRadius: '8px', boxShadow: 2 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ลำดับ</TableCell>
                                    <TableCell>วันที่</TableCell>
                                    <TableCell>ชื่อ-สกุล</TableCell>
                                    <TableCell>เรื่อง</TableCell>
                                    <TableCell>ถึง</TableCell>
                                    <TableCell>สถานะ</TableCell>
                                    <TableCell>ไฟล์</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {displayedDocuments.length > 0 ? (
                                    displayedDocuments.map((doc, index) => (
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
                                            <TableCell>{highlightSearchTerm(doc.subject)}</TableCell>
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
                                                <Tooltip title="เปิดไฟล์" arrow>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={() => {
                                                            handleDocumentRead(doc.document_id); // Call function with document_id
                                                            window.open(`http://localhost:3000/${doc.file}`, '_blank'); // Open file in new tab
                                                        }}
                                                        sx={{
                                                            textTransform: 'none',
                                                            '&:hover': {
                                                                backgroundColor: '#1976d2',
                                                            }
                                                        }}
                                                    >
                                                        View
                                                    </Button>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">ไม่พบรายชื่อที่ค้นหา</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                )}
                <Box sx={{ mt: 3, textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                        count={Math.ceil(sortedDocuments.length / rowsPerPage)} // คำนวณจำนวนหน้า
                        page={page}
                        shape="rounded"
                        onChange={(event, value) => setPage(value)} // เปลี่ยนหน้าเมื่อคลิก
                    />
                </Box>
           
        </Layout>
    );
};

export default CompletedDocuments;
