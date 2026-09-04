import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './lib/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ContentList from './pages/ContentList.jsx';
import ContentEditor from './pages/ContentEditor.jsx';
import Testimonials from './pages/Testimonials.jsx';
import Faqs from './pages/Faqs.jsx';
import Leads from './pages/Leads.jsx';
import Users from './pages/Users.jsx';
import Theme from './pages/Theme.jsx';
import Scripts from './pages/Scripts.jsx';
import Customers from './pages/Customers.jsx';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/content/:type" element={<ProtectedRoute><ContentList /></ProtectedRoute>} />
      <Route path="/content/:type/:id" element={<ProtectedRoute><ContentEditor /></ProtectedRoute>} />
      <Route path="/testimonials" element={<ProtectedRoute><Testimonials /></ProtectedRoute>} />
      <Route path="/faqs" element={<ProtectedRoute><Faqs /></ProtectedRoute>} />
      <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
      <Route path="/theme" element={<ProtectedRoute><Theme /></ProtectedRoute>} />
      <Route path="/scripts" element={<ProtectedRoute><Scripts /></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
    </Routes>
  );
}
