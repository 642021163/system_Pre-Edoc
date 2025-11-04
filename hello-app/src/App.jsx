// src/App.js
import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './AppBar/Navbar';
import Appbar from './AppBar/Appbar';
import './App.css';
import AdminLogin from './main/components/AdminLogin';
import UserLogin from './main/components/UserLogin';
import LoginPage from './main/Login-Register/LoginPage';
import HomePage from './main/components/HomePage';
import RegisterFrom from './main/Login-Register/RegisterFrom';
import FileUpload from './main/components/FileUpload';
import TrackDocuments from './main/components/TrackDocuments';
import UserProfile from './main/components/UserProfile';
import AdminHome from './main-admin/components/AdminHome';
import Documents from './main-admin/components/Documents';
import UserAccounts from './main-admin/components/UserAccounts';
import UserList from './main-admin/components/UserList';
import EditDocuments from './main-admin/components/EditDocuments';
import ReceiptsList from './main-admin/components/ReceiptsList';
import EditUser from './main-admin/components/EditUser';
import EditDocument from './main/components/EditDocument';
import UnreadDocuments from './main-admin/components/UnreadDocuments';
import PaperSavingsCalculator from './main-admin/components/PaperSavingsCalculator';
import NewDocuments from './main-admin/components/NewDocuments';
import CompletedDocuments from './main-admin/components/CompletedDocuments';
import DocumentSuccess from './main/components/DocumentSuccess';

function App() {
  return (
    <div className='App'>
      <AppContent />
    </div>
  );
}

function AppContent() {
  const location = useLocation();

  // ตรวจสอบว่าเป็นหน้า AdminHome หรือหน้าที่เกี่ยวข้องกับ AdminHome หรือไม่
  const isAdminHome = location.pathname.startsWith('/home') ||
                      location.pathname.startsWith('/doc') ||
                      location.pathname.startsWith('/edit') ||
                      location.pathname.startsWith('/list') ||
                      location.pathname.startsWith('/ac') ||
                      location.pathname.startsWith('/re') ||
                      location.pathname.startsWith('/newuser') ||
                      location.pathname.startsWith('/editu') ||
                      location.pathname.startsWith('/addfile') ||
                      location.pathname.startsWith('/dashboard') ||
                      location.pathname.startsWith('/unread') ||
                      location.pathname.startsWith('/paper') ||
                      location.pathname.startsWith('/newdoc')  ||
                      location.pathname.startsWith('/register') ||
                      location.pathname.startsWith('/complete') ;

  return (
    <>
      {!isAdminHome && (
        <>
          <Appbar />
          <Navbar />
        </>
      )}
      
      <Routes>
        <Route path='/' element={<LoginPage />} />
        <Route path='/loginpage' element={<LoginPage />} />
        <Route path='/Admin' element={<AdminLogin />} />
        <Route path='/user' element={<UserLogin />} />
        <Route path='/registerfrom' element={<RegisterFrom />} />
        <Route path='/homepage' element={<HomePage />} />
        <Route path='/fileupload' element={<FileUpload />} />
        <Route path='/track' element={<TrackDocuments />} />
        <Route path='/profile/:id' element={<UserProfile />} />
        <Route path='/home' element={<AdminHome />} />
        <Route path='/doc' element={<Documents />} />
        <Route path='/ac' element={<UserAccounts />} />
        <Route path='/list' element={<UserList />} />
        <Route path='/edit/:id' element={<EditDocuments />} />
        <Route path='/rec' element={<ReceiptsList />} />
        <Route path='/editu/:id' element={<EditUser />} />
        <Route path='/user-edit/:id' element={<EditDocument />} />
        <Route path='/unread' element={<UnreadDocuments />} />
        <Route path='/paper' element={<PaperSavingsCalculator />} />
        <Route path='/newdoc' element={<NewDocuments />} />
        <Route path='/complete' element={<CompletedDocuments />} />
        <Route path='/success' element={<DocumentSuccess />} />
        



      </Routes>
    </>
  );
}

export default App;
