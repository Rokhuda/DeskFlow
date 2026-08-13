/**
 * DeskFlow Frontend - React Application
 * 
 * Main component for the Internal IT Service Portal
 * - Handles user authentication (login)
 * - Employee view: Create and view personal tickets
 * - Admin view: View and update status of all tickets
 * - Manages state and API communication
 */

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

// Constants for dropdown options
const statusOptions = [
  { value: 'Open', label: 'Open' },
  { value: 'InProgress', label: 'In Progress' },
  { value: 'Resolved', label: 'Resolved' }
];
const statusLabels = {
  Open: 'Open',
  InProgress: 'In Progress',
  Resolved: 'Resolved'
};
const priorityOptions = ['Low', 'Medium', 'High'];

function App() {
  // ==================== Session State ====================
  // Session stored in localStorage to persist across page reloads
  const [session, setSession] = useState(() => {
    try {
      const stored = localStorage.getItem('deskflow-session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // ==================== Login Form State ====================
  const [email, setEmail] = useState('employee@deskflow.local');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('Employee');

  // ==================== Ticket Form State ====================
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium' });

  // ==================== UI State ====================
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Determine if current user is admin
  const isAdmin = session?.user?.role === 'Admin';

  // Memoized auth headers for API requests
  const authHeaders = useMemo(() => {
    if (!session?.token) {
      return {};
    }
    return { Authorization: `Bearer ${session.token}` };
  }, [session]);

  // ==================== Effects ====================

  /**
   * Load tickets when user logs in
   * Fetches user's own tickets (Employee) or all tickets (Admin)
   */
  useEffect(() => {
    if (!session?.token) {
      return;
    }

    const loadTickets = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/tickets', { headers: authHeaders });
        setTickets(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Unable to load tickets');
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [session, authHeaders]);

  // ==================== Event Handlers ====================

  /**
   * Handle user login
   * Sends credentials to backend, stores session + JWT token in localStorage
   */
  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('/api/auth/login', { email, password, role });
      const nextSession = response.data;
      localStorage.setItem('deskflow-session', JSON.stringify(nextSession));
      setSession(nextSession);
      setMessage(`Signed in as ${nextSession.user.role}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handle new ticket creation (Employees only)
   * Validates form input and creates ticket via API
   */
  async function handleCreateTicket(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!form.title.trim() || !form.description.trim()) {
      setError('Please provide a title and description');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/tickets', form, { headers: authHeaders });
      setTickets((current) => [response.data, ...current]);
      setForm({ title: '', description: '', priority: 'Medium' });
      setMessage('Ticket created successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create ticket');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handle ticket status update (Admins only)
   * Updates ticket status and re-renders the ticket list
   */
  async function handleStatusChange(ticketId, nextStatus) {
    try {
      const response = await axios.put(`/api/tickets/${ticketId}`, { status: nextStatus }, { headers: authHeaders });
      setTickets((current) => current.map((ticket) => (ticket.id === ticketId ? response.data : ticket)));
      setMessage('Ticket status updated');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update status');
    }
  }

  /**
   * Handle user logout
   * Clears session from localStorage and state
   */
  function logout() {
    localStorage.removeItem('deskflow-session');
    setSession(null);
    setMessage('Signed out');
  }

  // ==================== Render ====================

  return (
    <div className="app-shell">
      {/* Header with logo and logout button */}
      <header className="hero">
        <div>
          <p className="eyebrow">Internal IT Service Portal</p>
          <h1>DeskFlow</h1>
          <p>Report issues quickly and keep every request visible.</p>
        </div>
        {session && (
          <button className="ghost-button" onClick={logout}>
            Sign out
          </button>
        )}
      </header>

      {/* Alert messages for errors and success */}
      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {/* Conditional rendering: Login form OR Dashboard */}
      {!session ? (
        // ==================== Login Screen ====================
        <section className="card login-card">
          <h2>Sign in</h2>
          <form onSubmit={handleLogin}>
            <label>
              Role
              <select value={role} onChange={(event) => setRole(event.target.value)}>
                <option value="Employee">Employee</option>
                <option value="Admin">Admin</option>
              </select>
            </label>
            <label>
              Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? 'Signing in…' : `Log in as ${role}`}
            </button>
          </form>
          <p className="hint">Demo credentials: employee@deskflow.local / password123 or admin@deskflow.local / password123</p>
        </section>
      ) : (
        // ==================== Dashboard (Role-based) ====================
        <div className="dashboard-grid">
          {isAdmin ? (
            // ==================== Admin View: All Tickets ====================
            <section className="card">
              <div className="section-heading">
                <h2>Admin overview</h2>
                <span className="pill">{tickets.length} requests</span>
              </div>
              <div className="ticket-list">
                {tickets.map((ticket) => (
                  <article key={ticket.id} className="ticket-item">
                    <div className="ticket-meta">
                      <strong>{ticket.title}</strong>
                      <span>{ticket.author?.name}</span>
                    </div>
                    <p>{ticket.description}</p>
                    <div className="ticket-footer">
                      <span className="pill">{ticket.priority}</span>
                      {/* Status dropdown - Admins can change status */}
                      <select value={ticket.status} onChange={(event) => handleStatusChange(ticket.id, event.target.value)}>
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : (
            // ==================== Employee View: Create & View Tickets ====================
            <>
              {/* Left panel: Create new ticket */}
              <section className="card">
                <div className="section-heading">
                  <h2>Submit a new request</h2>
                  <span className="pill">Employee</span>
                </div>
                <form onSubmit={handleCreateTicket} className="stacked-form">
                  <label>
                    Title
                    <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
                  </label>
                  <label>
                    Description
                    <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
                  </label>
                  <label>
                    Priority
                    <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                      {priorityOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="submit" disabled={loading}>
                    {loading ? 'Submitting…' : 'Create ticket'}
                  </button>
                </form>
              </section>

              {/* Right panel: View own tickets */}
              <section className="card">
                <div className="section-heading">
                  <h2>Your requests</h2>
                  <span className="pill">{tickets.length} items</span>
                </div>
                <div className="ticket-list">
                  {tickets.map((ticket) => (
                    <article key={ticket.id} className="ticket-item">
                      <div className="ticket-meta">
                        <strong>{ticket.title}</strong>
                        <span>{statusLabels[ticket.status] || ticket.status}</span>
                      </div>
                      <p>{ticket.description}</p>
                      <div className="ticket-footer">
                        <span className="pill">{ticket.priority}</span>
                        <span className="pill secondary">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
