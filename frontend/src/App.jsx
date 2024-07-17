import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx';
import InvoicePage from './pages/InvoicePage.jsx'
import PDFtotifPage from './pages/PdftoTif.jsx';
import RelabelPage from './pages/RelabelPage.jsx';
import StatusUpdatePage from './pages/StatusUpdatePage.jsx';



const ProtectedRoute = ({ element }) => {
  const token = localStorage.getItem('token');
  return token ? element : <Navigate to="/" />;
};
function App() {
  localStorage.setItem("chakra-ui-color-mode", "dark");
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route exact path='/' element={<LoginPage />} />
          <Route path='/dashboard' element={<ProtectedRoute element={<DashboardPage  />} />} />
          <Route path='/invoices' element={<ProtectedRoute element={<InvoicePage />} />} />
          <Route path='/pdftotif' element={<ProtectedRoute element={<PDFtotifPage />} />} />
          <Route path='/relabel' element={<ProtectedRoute element={<RelabelPage />} />} />
          <Route path='/statusupdate' element={<ProtectedRoute element={<StatusUpdatePage />} />} />
        </Routes>
      </BrowserRouter>

    </>
  )
}

export default App
