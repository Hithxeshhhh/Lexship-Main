import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx';
import InvoicePage from './pages/InvoicePage.jsx'
import PDFtotifPage from './pages/PdftoTif.jsx';
import RelabelPage from './pages/RelabelPage.jsx';
import StatusUpdatePage from './pages/StatusUpdatePage.jsx';

function App() {
  localStorage.setItem("chakra-ui-color-mode", "dark");
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route exact path='/' element={<LoginPage />} />
          <Route path='/dashboard' element={<DashboardPage />} />
          <Route path='/invoices' element={<InvoicePage/>}/>
          <Route path='/pdftotif' element={<PDFtotifPage/>}/>
          <Route path='relabel' element={<RelabelPage/>}/>
          <Route path='statusupdate' element={<StatusUpdatePage/>}/>
        </Routes>
      </BrowserRouter>

    </>
  )
}

export default App
