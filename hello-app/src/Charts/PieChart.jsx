import React from 'react';
import { Pie } from 'react-chartjs-2';
import {Chart,ArcElement,Tooltip,Legend,} from 'chart.js';
import { Box } from '@mui/material';

// ลงทะเบียน ArcElement, Tooltip, และ Legend
Chart.register(ArcElement, Tooltip, Legend);

const PieChart = ({ data }) => {
    // ฟังก์ชัน colorize สำหรับกำหนดสี
    const colorize = (opaque, hover, ctx) => {
        const v = ctx.parsed;
        const c = v < -50 ? '#D60000'
            : v < 0 ? '#F46300'
                : v < 50 ? '#0358B6'
                    : '#44DE28';

        const opacity = hover ? 1 - Math.abs(v / 150) - 0.2 : 1 - Math.abs(v / 150);
        return opaque ? c : rgba(c, opacity);

        // ฟังก์ชันสร้าง rgba จาก hex
        function rgba(hex, alpha) {
            const bigint = parseInt(hex.slice(1), 16);
            const r = (bigint >> 16) & 255;
            const g = (bigint >> 8) & 255;
            const b = bigint & 255;

            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
    };

    // การตั้งค่า chartData
    const chartData = {
        labels: data.map(item => item.label),
        datasets: [{
            data: data.map(item => item.value),
            backgroundColor: data.map(item => colorize(false, false, { parsed: item.value })),
        }],
    };

    // ตัวเลือกสำหรับกราฟ
    const options = {
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        return `${tooltipItem.label}: ${tooltipItem.raw}`;
                    },
                },
            },
        },
    };

    return (
        <Box sx={{ width:200 ,height:200 }}> {/* กำหนดขนาดของกราฟ */}
            <Pie data={chartData} options={options} />
        </Box>
    );
};

export default PieChart;
