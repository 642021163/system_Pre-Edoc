import React, { useState } from 'react';
import { TextField, Button, Typography, Box } from '@mui/material';


function PaperSavingsCalculator() {
    const [status, setStatus] = useState(''); // Status state
    const [pdfPages, setPdfPages] = useState(''); // Number of PDF pages
    const [savings, setSavings] = useState(null); // Savings state

    // Function to calculate paper savings
    const calculateSavings = () => {
        const costPerPage = 0.5; // Example cost per page
        const totalSavings = pdfPages * costPerPage;
        setSavings(totalSavings);
    };

    return (
        <Box>
            {/* Dropdown to select status */}
            <TextField
                select
                label="สถานะ"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                SelectProps={{
                    native: true,
                }}
            >
                <option value="">เลือกสถานะ</option>
                <option value="Pending">รอดำเนินการ</option>
                <option value="In Progress">กำลังดำเนินการ</option>
                <option value="Completed">ดำเนินการเรียบร้อย</option>
            </TextField>

            {/* Show TextField and Button when status is "Completed" */}
            {status === 'Completed' && (
                <Box mt={2}>
                    <TextField
                        label="จำนวนหน้าของ PDF"
                        value={pdfPages}
                        onChange={(e) => setPdfPages(e.target.value)}
                        type="number"
                        fullWidth
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={calculateSavings}
                        sx={{ mt: 2 }}
                    >
                        คำนวณการประหยัดค่ากระดาษ
                    </Button>

                    {/* Display savings if calculated */}
                    {savings !== null && (
                        <Typography variant="h6" sx={{ mt: 2 }}>
                            คุณประหยัดค่ากระดาษไป {savings} บาท
                        </Typography>
                    )}
                </Box>
            )}
        </Box>
    );
}

export default PaperSavingsCalculator;
