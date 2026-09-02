import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext.jsx';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>CORE BIT MEDIA</h1>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/content/pages">Pages</NavLink>
          <NavLink to="/content/services">Services</NavLink>
          <NavLink to="/content/blog">Blog Posts</NavLink>
          <NavLink to="/content/case-studies">Case Studies</NavLink>
          <NavLink to="/testimonials">Testimonials</NavLink>
          <NavLink to="/faqs">FAQs</NavLink>
          <NavLink to="/leads">Contact Leads</NavLink>
          <NavLink to="/theme">Theme</NavLink>
          {user?.role === 'admin' && <NavLink to="/users">Team / Users</NavLink>}
        </nav>
        <div className="user-block">
          {user?.name} · {user?.role}
          <br />
          <button className="logout" onClick={handleLogout}>Log out</button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
