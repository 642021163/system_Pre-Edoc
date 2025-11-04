// // NewDocuments.js
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const NewDocuments = () => {
//     const [newDocuments, setNewDocuments] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     const fetchNewDocuments = async () => {
//         try {
//             const response = await axios.get('http://localhost:3000/api/new-documents'); // ปรับ URL ตามที่คุณตั้งค่า
//             setNewDocuments(response.data);
//         } catch (error) {
//             console.error('Error fetching new documents:', error);
//             setError('Failed to fetch new documents.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchNewDocuments();
//     }, []);

//     if (loading) {
//         return <div>Loading...</div>;
//     }

//     if (error) {
//         return <div>{error}</div>;
//     }

//     return (
//         <div>
//             <h1>Documents Uploaded by Users</h1>
//             {newDocuments.length > 0 ? (
//                 <table>
//                     <thead>
//                         <tr>
//                             <th>Document ID</th>
//                             <th>Upload Date</th>
//                             <th>Subject</th>
//                             <th>Uploaded By</th>
//                             <th>Status</th>
//                             <th>Action</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {newDocuments.map(doc => (
//                             <tr key={doc.id}>
//                                 <td>{doc.id}</td>
//                                 <td>{new Date(doc.upload_date).toLocaleString()}</td>
//                                 <td>{doc.subject}</td>
//                                 <td>{doc.user_fname} {doc.user_lname}</td>
//                                 <td>{doc.status === 0 ? 'Pending' : 'Received'}</td>
//                                 <td>
//                                     <button onClick={() => handleViewDocument(doc.id)}>View</button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             ) : (
//                 <div>No new documents available.</div>
//             )}
//         </div>
//     );
// };

// const handleViewDocument = (id) => {
//     // นำทางไปยังหน้าที่แสดงเอกสารตาม ID
//     console.log(`Viewing document with ID: ${id}`);
// };

// export default NewDocuments;
