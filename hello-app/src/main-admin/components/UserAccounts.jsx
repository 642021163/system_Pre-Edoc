import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper as MuiPaper } from '@mui/material';
import { Person } from '@mui/icons-material';

function UserAccounts() {
    const [userCount, setUserCount] = useState(0);
    const [users, setUsers] = useState([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchUserCount = async () => {
            try {
              const response = await fetch('http://localhost:3000/user-count'); // ตรวจสอบ URL
              if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
              }
              const data = await response.json();
              setUserCount(data.count);
            } catch (error) {
              console.error('Error fetching user count:', error);
            }
          };

        fetchUserCount();
    }, []);

    const handleCardClick = async () => {
        try {
            const response = await axios.get('/api/users'); // Fetch all users
            setUsers(response.data);
            setOpen(true);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Grid item xs={12} sm={6} md={4}>
            <Paper
                elevation={3}
                sx={{ padding: 3, textAlign: 'center', backgroundColor: '#ffffff', cursor: 'pointer' }}
                onClick={handleCardClick}
            >
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Person fontSize="large" sx={{ marginRight: 1, color: '#1976d2' }} />
                    ผู้ใช้ที่ลงทะเบียน
                </Typography>
                <Typography variant="h6" sx={{ color: '#555' }}>{userCount} คน</Typography>
            </Paper>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>ข้อมูลผู้ใช้ทั้งหมด</DialogTitle>
                <DialogContent>
                    <TableContainer component={MuiPaper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>หมายเลข</TableCell>
                                    <TableCell>ชื่อผู้ใช้</TableCell>
                                    <TableCell>ชื่อ</TableCell>
                                    <TableCell>นามสกุล</TableCell>
                                    <TableCell>หมายเลขโทรศัพท์</TableCell>
                                    <TableCell>บทบาท</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map(user => (
                                    <TableRow key={user.user_id}>
                                        <TableCell>{user.user_id}</TableCell>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>{user.user_fname}</TableCell>
                                        <TableCell>{user.user_lname}</TableCell>
                                        <TableCell>{user.phone_number}</TableCell>
                                        <TableCell>{user.role}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>ปิด</Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};


export default UserAccounts;
