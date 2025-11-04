const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require('path');
const multer = require('multer'); //ใช้รับไฟล์ที่ถูกอัปโหลดจาก frontend ผ่าน form-data
const fs = require('fs');//จัดการไฟล์ในเครื่อง เช่น อ่าน, เขียน, ลบ ไฟล์ด้วย Node.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const winston = require('winston'); // เพิ่มไลบรารีสำหรับการล็อก
const { v4: uuidv4 } = require('uuid'); //สร้าง UUID (รหัสเฉพาะแบบไม่ซ้ำ)
const axios = require('axios');//ใช้เรียก API ภายนอกหรือภายใน เช่น REST API
const dotenv = require('dotenv'); // โหลด dotenv
const fs = require('fs'); //คุณต้องใช้ Node.js fs เพื่อลบไฟล์ในระบบไฟล์พร้อมกับลบในฐานข้อมูล
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });// โหลดไฟล์ .env ที่อยู่นอกโฟลเดอร์ backend
const port = process.env.PORT || 3000;
const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
const secretKey = process.env.JWT_SECRET || 'your_secret_key';
const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to the database');
    }
});

//API หน้า RegisterFrom ฝั่ง user
app.post('/users', async (req, res) => {
    try {
        console.log('Received request to create user account with data:', req.body);
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds); // เข้ารหัสรหัสผ่านด้วย bcrypt
        const sql = "INSERT INTO users (prefix, user_fname, user_lname, username, password, phone_number, affiliation, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const values = [
            req.body.prefix,
            req.body.user_fname,
            req.body.user_lname,
            req.body.username,
            hashedPassword,  // ใช้รหัสผ่านที่เข้ารหัสแล้ว
            req.body.phone_number,
            req.body.affiliation,
            req.body.role,
        ];
        db.query(sql, values, (err, data) => {
            if (err) {
                console.error('Database Error:', err.code, err.message, err.sql);
                return res.status(500).json({ message: "Error inserting data", error: err.message });
            }
            console.log('User account created successfully with ID:', data.insertId);
            return res.status(201).json({ message: 'User account created successfully', data: data });
        });
    } catch (err) {
        console.error('Error during user registration:', err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
});

// ตรวจสอบชื่อผู้ใช้
app.get('/check-username', async (req, res) => {
    const username = req.query.username;

    // ตรวจสอบว่าชื่อผู้ใช้มีอยู่ในฐานข้อมูลหรือไม่
    const checkUsernameSql = "SELECT * FROM users WHERE username = ?";
    const [existingUser] = await db.promise().query(checkUsernameSql, [username]);

    if (existingUser.length > 0) {
        return res.json({ exists: true }); // ชื่อผู้ใช้มีอยู่
    } else {
        return res.json({ exists: false }); // ชื่อผู้ใช้ไม่อยู่
    }
});

//API หน้า LoginFrom ฝั่ง User
// สร้าง middleware เพื่อตรวจสอบ JWT และยืนยันการเข้าถึง
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access token required' });

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });

        req.user = user;
        next();
    });
};

async function comparePassword(plainPassword, hashedPassword) { // ฟังก์ชันเปรียบเทียบรหัสผ่าน
    return await bcrypt.compare(plainPassword, hashedPassword);
}
const logger = winston.createLogger({ // กำหนดการตั้งค่าของ winston
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' })
    ],
});

async function findUserByUsernameAndType(username, userType, correlationId) { // ฟังก์ชันสำหรับการค้นหาผู้ใช้
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE username = ? AND role = ?';
        db.query(sql, [username, userType], (err, results) => {
            if (err) {
                logger.error('Database query error', { correlationId, error: err });
                return reject(err);
            }
            if (results.length === 0) {
                logger.info('No user found with username and userType', { correlationId, username, userType });
                return resolve(null);
            }
            logger.info('User found', { correlationId, user: results[0] });
            resolve(results[0]);
        });
    });
}

// API สำหรับ Login
app.post('/login', async (req, res) => {
    const correlationId = uuidv4(); // สร้าง correlationId ใหม่สำหรับคำขอแต่ละครั้ง

    try {
        const { username, password, userType } = req.body;
        logger.info('Login attempt', { correlationId, username, userType });
        const user = await findUserByUsernameAndType(username, userType, correlationId);
        if (!user) {
            logger.warn('Invalid username or userType', { correlationId, username, userType });
            return res.status(400).json({ message: 'กรุณาเลือกประเภทผู้ใช้งาน' });
        }
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            logger.warn('Invalid password attempt', { correlationId, username });
            return res.status(401).json({ message: 'รหัสผ่านหรือชื่อผู้ใช้ไม่ถูกต้อง' });
        }
        const token = jwt.sign({ userId: user.user_id, userType: user.role }, secretKey, { expiresIn: '1h' });
        const responseData = {
            message: 'Login successful',
            token,
            user_id: user.user_id,
            username: user.username,
            user_fname: user.user_fname || '',
            user_lname: user.user_lname || '',
            prefix: user.prefix || '',
            phone_number: user.phone_number || '',
            affiliation: user.affiliation || '',
            userType: user.role,
        };
        logger.info('Login successful', { correlationId, responseData });
        res.json(responseData);
    } catch (error) {
        logger.error('Login error', { correlationId, error });
        res.status(500).json({ message: 'Internal server error' });
    }
});

const authorizeAdmin = (req, res, next) => {
    if (req.user.userType !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admins only' });
    }
    next();
};

app.get('/admin-only-route', authenticateToken, authorizeAdmin, (req, res) => {
    res.json({ message: 'This is an admin-only route', user: req.user });
});

//API หน้า FileUpload ฝั่ง USER
// ตั้งค่าการจัดเก็บไฟล์ ฝั่ง USER
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true }); // สร้างโฟลเดอร์ถ้ายังไม่มี
        }
        cb(null, uploadDir); // ระบุที่จัดเก็บไฟล์
    },
    filename: (req, file, cb) => {
        const originalName = file.originalname; // ใช้ชื่อไฟล์เดิม
        console.log("Original filename:", originalName); // ล็อกชื่อไฟล์เดิม
        let filePath = path.join(__dirname, 'uploads', originalName);
        if (fs.existsSync(filePath)) {
            // ถ้ามีไฟล์ที่มีชื่อเดียวกันอยู่แล้ว, ให้เพิ่มหมายเลขในชื่อไฟล์
            const nameWithoutExt = path.basename(originalName, path.extname(originalName));
            const ext = path.extname(originalName);
            let i = 1;
            while (fs.existsSync(filePath)) {
                filePath = path.join(__dirname, 'uploads', `${nameWithoutExt}(${i})${ext}`);
                i++;
            }
            console.log("Generated filename with number:", path.basename(filePath));
            cb(null, path.basename(filePath));
        } else {
            // ถ้าไม่มีการทับซ้อน, ใช้ชื่อไฟล์เดิม
            console.log("Generated filename:", originalName);
            cb(null, originalName);
        }
    }
});

// ใช้งาน `multer` สำหรับการอัปโหลดไฟล์ ฝั่ง USER
const upload = multer({ storage: storage }); // สร้าง instance ของ multer
// API สำหรับอัปโหลดเอกสาร
app.post('/documents', upload.single('file'), async (req, res) => {
    const filePath = req.file ? path.join('uploads', req.file.filename) : null;
    const sql = "INSERT INTO documents (upload_date, user_id, subject, to_recipient, document_type, file, notes, status, is_read, received_by, user_fname, user_lname) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [
        req.body.upload_date,
        req.body.user_id,
        req.body.subject,
        req.body.to_recipient,
        req.body.document_type,
        filePath,
        req.body.notes,
        0, // status
        0, // is_read
        0, // received_by
        req.body.user_fname,
        req.body.user_lname
    ];

    // ส่งคำสั่ง SQL ไปยังฐานข้อมูล
    db.query(sql, values, async (err, data) => {
        if (err) {
            console.error('Database Error:', err.code, err.message, err.sql);
            return res.status(500).json({ message: "Error inserting data", error: err.message });
        }

        // ส่งการแจ้งเตือน LINE เมื่อมีการเพิ่มเอกสารใหม่
        const token = 'YOUR_LINE_NOTIFY_TOKEN'; // เปลี่ยนเป็น Token ของคุณ
        const message = `เอกสารใหม่ถูกส่งโดย ${req.body.user_fname} ${req.body.user_lname} มีหัวข้อ: ${req.body.subject}`;
        await sendLineNotification(token, message);


        // คิวรีเพื่อดึงจำนวนเอกสารใหม่ที่มีสถานะเป็น 'Pending'
        const countSql = "SELECT COUNT(*) AS newDocumentCount FROM documents WHERE status = 0"; // 0 หมายถึง Pending
        db.query(countSql, (err, countData) => {
            if (err) {
                console.error('Database Error:', err.code, err.message, err.sql);
                return res.status(500).json({ message: "Error counting new documents", error: err.message });
            }

            const newDocumentCount = countData[0].newDocumentCount; // จำนวนเอกสารใหม่
            console.log('Document created successfully with ID:', data.insertId);
            return res.status(201).json({ message: 'Document created successfully', newDocumentCount: newDocumentCount });
        });
    });
});

// ฟังก์ชันส่งการแจ้งเตือน LINE
const sendLineNotification = async (token, message) => {
    try {
        const response = await axios({
            method: 'POST',
            url: 'https://notify-api.line.me/api/notify',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${token}`,
            },
            data: `message=${encodeURIComponent(message)}`,
        });
        console.log("Notify response", response.data); // ตรวจสอบการตอบกลับ
    } catch (error) {
        const errorMessage = error.response ? error.response.data : error.message;
        console.error('Error sending notification:', errorMessage); // แสดงข้อความข้อผิดพลาด
    }
};

// สร้าง API Endpoint สำหรับการส่งการแจ้งเตือน
app.post('/send-notification', async (req, res) => {
    const { token, message } = req.body;

    try {
        await sendLineNotification(token, message);
        return res.status(200).json({ message: 'Notification sent successfully' });
    } catch (error) {
        console.error('Error sending notification:', error);
        return res.status(500).json({ message: 'Failed to send notification', error: error.message });
    }
});

app.get('/logina', (req, res) => {
    return res.status(200).json({ message: 'bbbbbbbbbbbbbbbbbb' });
});

// API หน้า TrackDocuments ฝั่ง USER
// สำหรับดึงข้อมูลเอกสารทั้งหมด ฝั่ง USER
app.get('/documents', authenticateToken, (req, res) => {
    const userId = req.user.userId; // ดึง userId จาก token
    const sql = `
    SELECT document_id, create_at, subject, to_recipient, file, status, document_number, document_type, notes, recipient, reply
    FROM documents
    WHERE user_id = ?  
    `;
    db.query(sql, [userId], (err, results) => { // ส่ง userId เป็น parameter
        if (err) {
            console.error('Database Error:', err.code, err.message, err.sql);
            return res.status(500).json({ message: "Error fetching documents", error: err.message });
        }
        // แปลงข้อมูลเพื่อส่งเฉพาะข้อมูลที่ต้องการ
        const formattedResults = results.map(doc => ({
            document_id: doc.document_id,
            create_at: doc.create_at,
            subject: doc.subject,
            file: doc.file, // ชื่อไฟล์
            status: doc.status,
            document_type: doc.document_type,
            recipient: doc.recipient,
            document_number: doc.document_number,
            notes: doc.notes,
            to_recipient: doc.to_recipient,
            reply: doc.reply
        }));

        console.log('Documents fetched successfully:', formattedResults);
        return res.status(200).json(formattedResults);
    });
});

// เส้นทางสำหรับดึงข้อมูลเอกสารตาม ID ฝั่ง USER
app.get('/documents/:id', (req, res) => {
    const documentId = req.params.id; // ดึง ID จากพารามิเตอร์ URL
    if (!documentId) {
        return res.status(400).json({ message: 'Document ID is required' });
    }
    const sql = `
        SELECT document_id, upload_date, subject, to_recipient, file, status, document_number, document_type, notes, recipient
        FROM documents
        WHERE user_id = ?
    `;
    db.query(sql, [documentId], (err, results) => {
        if (err) {
            console.error('Database Error:', err.code, err.message, err.sql);
            return res.status(500).json({ message: "Error fetching document", error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Document not found' });
        }
        console.log('Document fetched successfully:', results[0]);
        return res.status(200).json(results[0]);
    });
});
// เพิ่ม middleware สำหรับ error handling
app.use((err, req, res, next) => {
    console.error('Unexpected error occurred:', err);
    res.status(500).json({ message: 'An unexpected error occurred', error: err.message });
});

// API สำหรับแก้ไขเอกสารตาม ID
app.put('/useredit/document/:id', upload.single('file'), (req, res) => {
    const docId = req.params.id;
    const { upload_date, subject, to_recipient, document_type, notes } = req.body;
    const newFileName = req.file ? req.file.filename : null; // ชื่อไฟล์ใหม่ถ้ามีการอัปโหลด

    const updateDocument = `
        UPDATE documents
        SET upload_date = ?, subject = ?, to_recipient = ?, document_type = ?, notes = ? ${newFileName ? ', file = ?' : ''}
        WHERE document_id = ?`;
    const params = newFileName
        ? [upload_date, subject, to_recipient, document_type, notes, newFileName, docId]
        : [upload_date, subject, to_recipient, document_type, notes, docId];

    db.query(updateDocument, params, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Error updating document', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.status(200).json({ message: 'Document updated successfully' });
    });
});
// เพิ่ม middleware สำหรับ error handling
app.use((err, req, res, next) => {
    console.error('Unexpected error occurred:', err);
    res.status(500).json({ message: 'An unexpected error occurred', error: err.message });
});

//API หน้า UserProfile ฝั่ง USER
// ดึงข้อมูลผู้ใช้ตาม ID ฝั่ง USER
app.get('/users-profile/:id', (req, res) => {
    const userId = req.params.id;  // ดึงค่า id จาก URL

    // แก้ไขตรงนี้ เพื่อ log ค่า userId
    console.log(userId, "ไม่มีไอดีส่งมา");

    const sql = "SELECT * FROM users WHERE user_id = ?";

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Database Error:', err.code, err.message);
            return res.status(500).json({ message: "Error fetching data", error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(results[0]);
    });
});

// อัปเดตข้อมูลผู้ใช้ตาม ID ฝั่ง USER
app.put('/users/:id', (req, res) => {
    const userId = req.params.id;
    const updatedUser = req.body;

    const sql = "UPDATE users SET prefix = ?, user_fname = ?, user_lname = ?, username = ?, phone_number = ?, affiliation = ?, role = ? WHERE user_id = ?";
    const values = [
        updatedUser.prefix,
        updatedUser.user_fname,
        updatedUser.user_lname,
        updatedUser.username,
        updatedUser.phone_number,
        updatedUser.affiliation,
        updatedUser.role,
        userId
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Database Error:', err.code, err.message);
            return res.status(500).json({ message: "Error updating user", error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ message: 'User updated successfully' });
    });
});

// API สำหรับเปลี่ยนรหัสผ่าน
app.put('/users/change-password/:id', async (req, res) => {
    const userId = req.params.id;
    const { old_password, new_password } = req.body; // ลบ confirm_password ออก

    try {
        // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
        const sql = "SELECT * FROM users WHERE user_id = ?";
        const [user] = await db.promise().query(sql, [userId]);

        if (user.length === 0) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
        }

        // ตรวจสอบรหัสผ่านเดิมว่าเข้ากันหรือไม่
        const validPassword = await bcrypt.compare(old_password, user[0].password);
        if (!validPassword) {
            return res.status(400).json({ message: 'รหัสผ่านเดิมไม่ถูกต้อง' });
        }

        // ตรวจสอบความปลอดภัยของรหัสผ่านใหม่ (ออปชัน)
        if (new_password.length < 6) {
            return res.status(400).json({ message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร' });
        }

        // เข้ารหัสรหัสผ่านใหม่
        const hashedPassword = await bcrypt.hash(new_password, saltRounds);

        // อัปเดตรหัสผ่านใหม่ในฐานข้อมูล
        const updateSql = "UPDATE users SET password = ? WHERE user_id = ?";
        await db.promise().query(updateSql, [hashedPassword, userId]);

        return res.status(200).json({ message: 'อัปเดตรหัสผ่านเรียบร้อยแล้ว' });

    } catch (err) {
        console.error('เกิดข้อผิดพลาดระหว่างการเปลี่ยนรหัสผ่าน:', err);
        return res.status(500).json({ message: 'ข้อผิดพลาดภายในเซิร์ฟเวอร์', error: err.message });
    }
});
//ฝั่ง USER
// API สำหรับดึงจำนวนเอกสารของผู้ใช้ตาม user_id
app.get('/api/user-document-count', (req, res) => {
    const userId = req.query.user_id; // รับ user_id จาก query parameter

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const query = 'SELECT COUNT(*) AS count FROM documents WHERE user_id = ?'; // ใช้ WHERE เพื่อกรองตาม user_id

    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error('Error fetching user document count:', err);
            return res.status(500).json({ error: 'Failed to fetch user document count' });
        }
        res.json({ count: result[0].count }); // ส่งจำนวนเอกสารกลับไปยัง client
    });
});

// API สำหรับดึงจำนวนเอกสารที่ดำเนินการเรียบร้อยของผู้ใช้ตาม user_id
app.get('/api/user-document-success', (req, res) => {
    const userId = req.query.user_id; // รับ user_id จาก query parameter

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    // ปรับ query เพื่อกรองตาม user_id และ status ที่ต้องการ
    const query = 'SELECT COUNT(*) AS count FROM documents WHERE user_id = ? AND status = 2'; // ใช้ WHERE เพื่อกรองตาม user_id และ status

    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error('Error fetching user document count:', err);
            return res.status(500).json({ error: 'Failed to fetch user document count' });
        }
        res.json({ count: result[0].count }); // ส่งจำนวนเอกสารกลับไปยัง client
    });
});

//Api หน้า AdminHome ฝั่ง Admin
// API สำหรับดึงจำนวนผู้ใช้จากตาราง users
app.get('/user-count', (req, res) => {
    const query = 'SELECT COUNT(*) AS count FROM users'; // ใช้ตาราง users

    db.query(query, (err, result) => {
        if (err) {
            console.error('Error fetching user count:', err);
            return res.status(500).json({ error: 'Failed to fetch user count' });
        }
        res.json({ count: result[0].count }); // ส่งจำนวนผู้ใช้กลับไปยัง client
    });
});

// API สำหรับดึงจำนวนเอกสารจากตาราง documents
app.get('/api/document-count', (req, res) => {
    const query = 'SELECT COUNT(*) AS count FROM documents'; // ใช้ตาราง documents

    db.query(query, (err, result) => {
        if (err) {
            console.error('Error fetching document count:', err);
            return res.status(500).json({ error: 'Failed to fetch document count' });
        }
        res.json({ count: result[0].count }); // ส่งจำนวนเอกสารกลับไปยัง client
    });
});

// API สำหรับดึงจำนวนเอกสารที่ยังไม่อ่านจากตาราง documents
app.get('/api/unread-document-count', (req, res) => {
    const query = 'SELECT COUNT(*) AS count FROM documents WHERE is_read = 0'; // เฉพาะเอกสารที่ยังไม่อ่าน

    db.query(query, (err, result) => {
        if (err) {
            console.error('Error fetching unread document count:', err);
            return res.status(500).json({ error: 'Failed to fetch unread document count' });
        }
        res.json({ count: result[0].count }); // ส่งจำนวนเอกสารที่ยังไม่อ่านกลับไปยัง client
    });
});

//Api หน้า Documents ฝั่ง Admin
// เส้นทางสำหรับดึงข้อมูลเอกสารทั้งหมด ฝั่ง admin
app.get('/admin/documents', (req, res) => {
    const sql = `
       SELECT document_id, create_at, subject, to_recipient, document_type, file, notes, status, is_read, user_fname, user_lname
       FROM documents;
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database Error:', err.code, err.message, err.sql);
            return res.status(500).json({ message: "Error fetching documents", error: err.message });
        }

        // ตรวจสอบข้อมูลที่ดึงมาจากฐานข้อมูล
        console.log('Documents fetched successfully:', results);

        // แสดงค่าของ create_at ของแต่ละเอกสาร
        results.forEach(doc => {
            console.log(`Document ID: ${doc.document_id}, Create At: ${doc.create_at}`);
        });

        return res.status(200).json(results);
    });
});

// // API สำหรับดึงจำนวนเอกสารจากตาราง Documents ฝั่ง Addmin
app.get('/document/unread', (req, res) => {
    const sql = "SELECT * FROM documents WHERE is_read = 0";

    console.log('Executing SQL:', sql); // ตรวจสอบ SQL ที่กำลังดำเนินการ

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database Error:', err.code, err.message);
            return res.status(500).json({ message: "Error fetching unread documents", error: err.message });
        }
        console.log('Query Results:', results); // ตรวจสอบผลลัพธ์ที่ได้
        return res.status(200).json(results);
    });
});


app.put('/document/:id/read', (req, res) => {
    const { id } = req.params;
    const sql = 'UPDATE documents SET is_read = 1 WHERE document_id = ?'; // เปลี่ยนจาก 'status' เป็น 'is_read'

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Database Error:', err.code, err.message);
            return res.status(500).json({ error: 'Error updating document status.' });
        }
        return res.status(200).json({ message: 'Document marked as read.' });
    });
});

//Api หน้า UserList ฝั่ง Admin
// เส้นทางสำหรับดึงข้อมูลผู้ใช้ทั้งหมดฝั่ง Addmin
app.get('/api/users', (req, res) => {
    const sql = `
        SELECT user_id, username, user_fname, user_lname, phone_number, role, affiliation
        FROM users
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database Error:', err.code, err.message, err.sql);
            return res.status(500).json({ message: "Error fetching users", error: err.message });
        }
        console.log('Users fetched successfully:', results);
        return res.status(200).json(results);
    });
});

// ดึงเอกสารตามไอดีฝั่ง Admin
app.get('/document/:id', (req, res) => {
    const docId = req.params.id;
    const sql = "SELECT * FROM documents WHERE document_id = ?";

    db.query(sql, [docId], (err, results) => {
        if (err) {
            console.error('Database Error:', err.code, err.message);
            return res.status(500).json({ message: "Error fetching data", error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Document not found' });
        }
        return res.status(200).json(results[0]);
    });
});

// อัปเดตข้อมูลเอกสารตาม ID ฝั่ง Admin
app.put('/documents/:id', (req, res) => {
    const docId = req.params.id;
    const updatedDocument = req.body;

    const sql = `
    UPDATE documents
    SET upload_date = ?, subject = ?, to_recipient = ?, document_number = ?, document_type = ?, status = ?, recipient = ?, notes = ? ,reply = ?,response_file = ?,response_count = ?
    WHERE document_id = ?
  `;
    const values = [
        updatedDocument.upload_date,
        updatedDocument.subject,
        updatedDocument.to_recipient,
        updatedDocument.document_number,
        updatedDocument.document_type,
        updatedDocument.status,
        updatedDocument.recipient,
        updatedDocument.notes,
        updatedDocument.reply,    // ข้อความตอบกลับจากแอดมิน
        updatedDocument.response_file,  // ไฟล์ที่แอดมินแนบกลับไป
        updatedDocument.response_count, // จำนวนครั้งที่แอดมินตอบกลับ
        docId
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Database Error:', err.code, err.message);
            return res.status(500).json({ message: "Error updating document", error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Document not found' });
        }
        console.log('Document updated:', result); // ตรวจสอบข้อมูลที่อัปเดต
        return res.status(200).json({ message: 'Document updated successfully' });
    });
});

// สร้าง API สำหรับ DELETE ข้อมูลเอกสารตาม ID ฝั่ง user
app.delete('/document/:id', (req, res) => {
    const docId = req.params.id;

    // ดึงชื่อไฟล์ก่อนลบ
    db.query('SELECT file FROM documents WHERE document_id = ?', [docId], (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching document", error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Document not found' });

        const filePath = path.join(__dirname, '../uploads', results[0].file);

        // ลบการอ้างอิงใน document_receipts
        db.query('DELETE FROM document_receipts WHERE document_id = ?', [docId], (err) => {
            if (err) return res.status(500).json({ message: "Error deleting references", error: err.message });

            // ลบเอกสารในฐานข้อมูล
            db.query('DELETE FROM documents WHERE document_id = ?', [docId], (err, result) => {
                if (err) return res.status(500).json({ message: "Error deleting document", error: err.message });
                if (result.affectedRows === 0) return res.status(404).json({ message: 'Document not found' });

                // ลบไฟล์จริง
                fs.unlink(filePath, (err) => {
                    if (err) console.warn('Warning: File not found or cannot delete:', err.message);
                });

                return res.status(200).json({ message: 'Document deleted successfully' });
            });
        });
    });
});


// API สำหรับรีเซ็ตรหัสผ่าน ฝั่ง admin
app.put('/api/reset-password/:userId', async (req, res) => {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!userId || !newPassword) {
        return res.status(400).json({ error: 'User ID and new password are required' });
    }

    try {
        // แฮชรหัสผ่านใหม่
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // อัปเดตรหัสผ่านในฐานข้อมูล
        const [result] = await promisePool.query(
            'UPDATE users SET password = ? WHERE user_id = ?',
            [hashedPassword, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//Api เส้น EditUser
// ดึงข้อมูล user ตามไอดีฝั่ง Admin
app.get('/user/:id', (req, res) => {
    const userId = req.params.id;
    const sql = "SELECT * FROM users WHERE user_id = ?";

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Database Error:', err.code, err.message);
            return res.status(500).json({ message: "Error fetching data", error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(results[0]);
    });
});

// อัปเดตข้อมูล user ตาม ID ฝั่ง Admin
app.put('/user/:id', (req, res) => {
    const userId = req.params.id;
    const updatedUser = req.body;

    const sql = `
    UPDATE users
    SET user_fname = ?, user_lname = ?, username = ?, phone_number = ?, affiliation = ?, role = ?, notes = ?
    WHERE user_id = ?
  `;
    const values = [
        updatedUser.user_fname,
        updatedUser.user_lname,
        updatedUser.username,
        updatedUser.phone_number,
        updatedUser.affiliation,
        updatedUser.role,
        updatedUser.notes,
        userId
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Database Error:', err.code, err.message);
            return res.status(500).json({ message: "Error updating user", error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log('User updated:', result); // ตรวจสอบข้อมูลที่อัปเดต
        return res.status(200).json({ message: 'User updated successfully' });
    });
});

// API สำหรับอัปเดตผู้รับเอกสาร (received_by) ฝั่ง Admin
app.put('/document/:id/status', (req, res) => {
    const { received_by } = req.body; // รับค่า received_by จาก body
    const documentId = req.params.id; // รับ document ID จาก URL

    // ตรวจสอบค่าที่รับ
    if (typeof received_by === 'undefined') {
        return res.status(400).send('Missing parameters');
    }

    // SQL สำหรับอัปเดตเฉพาะ received_by
    const sql = 'UPDATE documents SET received_by = ? WHERE document_id = ?';
    db.query(sql, [received_by, documentId], (err, result) => {
        if (err) {
            console.error('Error updating document received_by:', err);
            return res.status(500).send('Error updating document received_by');
        }
        res.send('Document received_by updated successfully');
    });
});

// Endpoint สำหรับบันทึกข้อมูลการรับเอกสาร
app.post('/document-stats', (req, res) => {
    console.log('Received data for document receipt:', req.body);
    const { documentId, adminId, dateReceived, paperCost } = req.body;

    // ตรวจสอบค่าที่รับ
    if (!documentId || !adminId || !dateReceived || !paperCost) {
        return res.status(400).send('Missing parameters');
    }

    // SQL สำหรับการบันทึกข้อมูลการรับเอกสาร
    const sql = 'INSERT INTO document_receipts (document_id, user_id, date_received, paper_cost) VALUES (?, ?, ?, ?)';
    db.query(sql, [documentId, adminId, dateReceived, paperCost], (err, result) => {
        if (err) {
            console.error('Error inserting document receipt:', err);
            return res.status(500).send('Error inserting document receipt');
        }
        res.send('Document receipt recorded successfully');
    });
});

// Endpoint สำหรับบันทึกค่าประหยัดกระดาษ
app.post('/api/document_receipts', (req, res) => {
    console.log('Received data for document receipt:', req.body);
    const { document_id, user_id, paper_cost } = req.body;

    // ตรวจสอบค่าที่รับ
    if (!document_id || !user_id || !paper_cost) {
        return res.status(400).send('Missing parameters');
    }

    // SQL สำหรับการบันทึกข้อมูลการรับเอกสาร
    const sql = 'INSERT INTO document_receipts (document_id, user_id, paper_cost) VALUES (?, ?, ?)';
    db.query(sql, [document_id, user_id, paper_cost], (err, result) => {
        if (err) {
            console.error('Error inserting document receipt:', err);
            return res.status(500).send('Error inserting document receipt');
        }
        res.send('Document receipt recorded successfully');
    });
});

// Endpoint สำหรับดึงข้อมูลทั้งหมดจากตาราง document_receipts
app.get('/document-receipts', (req, res) => {
    const sql = `SELECT * FROM document_receipts`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching document receipts:', err);
            return res.status(500).json({ error: 'Error fetching document receipts' });
        }
        res.json(results);
    });
});

app.get('/document-receipts/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = `
        SELECT receipt_id, document_id, user_id, date_received, paper_cost
        FROM document_receipts
        WHERE user_id = ?;
    `;
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching document receipts:', err);
            return res.status(500).json({ error: 'Error fetching document receipts' });
        }
        res.json(results);
    });
});


// API นี้จะดึงข้อมูลจำนวนเอกสารที่แต่ละแอดมินรับไป
app.get('/receipts', (req, res) => {
    const sql = `
        SELECT
            user_id,
            document_id,
            COUNT(*) AS number_of_receipts
        FROM
            document_receipts
        GROUP BY
            user_id, document_id;
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching document receipts:', err);
            return res.status(500).json({ error: 'Error fetching document receipts' });
        }
        res.json(results);
    });
});


//API นี้จะดึงข้อมูลผู้ใช้ที่มีบทบาทเป็นแอดมินจากฐานข้อมูล
app.get('/api/admins', (req, res) => {
    const sql = `SELECT user_id, user_fname, user_lname FROM users WHERE role = 'admin'`;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ error: 'Error fetching users' });
        }
        res.json(results);
    });
});

//API หน้า NewDocument.js
// API สำหรับดึงจำนวนเอกสารใหม่
app.get('/api/new-documents', (req, res) => {
    const sql = "SELECT * FROM documents WHERE is_read = 0"; // ค้นหาเอกสารที่ยังไม่ถูกอ่าน
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database Error:', err.code, err.message);
            return res.status(500).json({ message: "Error fetching data", error: err.message });
        }
        return res.status(200).json(results); // ส่งคืนเอกสารใหม่
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

