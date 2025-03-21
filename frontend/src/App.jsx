import "./App.css";
import Spinner from "./components/Spinner.jsx";
import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const InvoicePage = lazy(() => import('./pages/InvoicePage.jsx'));
const PDFtotifPage = lazy(() => import('./pages/PdftoTif.jsx'));
const RelabelPage = lazy(() => import('./pages/RelabelPage.jsx'));
const StatusUpdatePage = lazy(() => import('./pages/StatusUpdatePage.jsx'));
const TrackingPage = lazy(() => import('./pages/Tracking.jsx'));

const ProtectedRoute = ({ element }) => {
  const token = localStorage.getItem('token');
  return token ? element : <Navigate to="/" />;
};

function App() {
  localStorage.setItem("chakra-ui-color-mode", "dark");
  return (
    <BrowserRouter>
      <Suspense fallback={<Spinner/>}>
        <Routes>
          <Route exact path='/' element={<LoginPage />} />
          <Route path='/dashboard' element={<ProtectedRoute element={<DashboardPage />} />} />
          <Route path='/invoices' element={<ProtectedRoute element={<InvoicePage />} />} />
          <Route path='/pdftotif' element={<ProtectedRoute element={<PDFtotifPage />} />} />
          <Route path='/relabel' element={<ProtectedRoute element={<RelabelPage />} />} />
          <Route path='/statusupdate' element={<ProtectedRoute element={<StatusUpdatePage />} />} />
          <Route path='/tracking' element={<ProtectedRoute element={<TrackingPage />} />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
