import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const statusOptions = ['Open', 'In Progress', 'Resolved'];
const priorityOptions = ['Low', 'Medium', 'High'];

function App() {
  const [session, setSession] = useState(() => {
    try {
      const stored = localStorage.getItem('deskflow-session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [email, setEmail] = useState('employee@deskflow.local');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('Employee');
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium' });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isAdmin = session?.user?.role === 'Admin';

  const authHeaders = useMemo(() => {
    if (!session?.token) {
      return {};
    }
    return { Authorization: `Bearer ${session.token}` };
  }, [session]);

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

  async function handleStatusChange(ticketId, nextStatus) {
    try {
      const response = await axios.put(`/api/tickets/${ticketId}`, { status: nextStatus }, { headers: authHeaders });
      setTickets((current) => current.map((ticket) => (ticket.id === ticketId ? response.data : ticket)));
      setMessage('Ticket status updated');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update status');
    }
  }

  function logout() {
    localStorage.removeItem('deskflow-session');
    setSession(null);
    setMessage('Signed out');
  }

  return (
    <div className="app-shell">
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

      {error && <div className="alert alert-error">{error}</div>}
      {message ; <div className="alert alert-success">{message}</div>}

      {!session ? (
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
        <div className="dashboard-grid">
          {isAdmin ? (
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
                      <select value={ticket.status} onChange={(event) => handleStatusChange(ticket.id, event.target.value)}>
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : (
            <>
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
                        <span>{ticket.status}</span>
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
