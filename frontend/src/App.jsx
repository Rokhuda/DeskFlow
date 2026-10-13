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
const filters = ['All', 'Open', 'InProgress', 'Resolved'];

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ==================== Ticket Form State ====================
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium' });

  // ==================== UI State ====================
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingTicketId, setUpdatingTicketId] = useState('');
  const [ticketFilter, setTicketFilter] = useState('All');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Determine if current user is admin
  const isAdmin = session?.user?.role === 'Admin';
  const filteredTickets = tickets.filter((ticket) => ticketFilter === 'All' || ticket.status === ticketFilter);
  const ticketCounts = {
    open: tickets.filter((ticket) => ticket.status === 'Open').length,
    inProgress: tickets.filter((ticket) => ticket.status === 'InProgress').length,
    resolved: tickets.filter((ticket) => ticket.status === 'Resolved').length
  };

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
  async function signIn(nextEmail, nextPassword) {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('/api/auth/login', { email: nextEmail, password: nextPassword });
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

  async function handleLogin(event) {
    event.preventDefault();
    await signIn(email, password);
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
      const response = await axios.post('/api/tickets', {
        ...form,
        title: form.title.trim(),
        description: form.description.trim()
      }, { headers: authHeaders });
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
    setError('');
    setMessage('');
    setUpdatingTicketId(ticketId);
    try {
      const response = await axios.put(`/api/tickets/${ticketId}`, { status: nextStatus }, { headers: authHeaders });
      setTickets((current) => current.map((ticket) => (ticket.id === ticketId ? response.data : ticket)));
      setMessage('Ticket status updated');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update status');
    } finally {
      setUpdatingTicketId('');
    }
  }

  /**
   * Handle user logout
   * Clears session from localStorage and state
   */
  function logout() {
    localStorage.removeItem('deskflow-session');
    setSession(null);
    setTickets([]);
    setError('');
    setMessage('Signed out');
  }

  // ==================== Render ====================

  return (
    <div className="app-shell">
      <header className="hero">
        <a className="brand" href="/" aria-label="DeskFlow home">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span>DeskFlow</span>
        </a>
        <div className="hero-actions">
          {session && (
            <>
              <span className="user-chip"><span className="user-avatar">{session.user.name?.charAt(0) || 'D'}</span>{session.user.name}</span>
              <button className="ghost-button" onClick={logout}>Sign out</button>
            </>
          )}
        </div>
      </header>

      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {message && <div className="alert alert-success" role="status">{message}</div>}

      {!session ? (
        <main className="login-layout">
          <section className="login-intro">
            <p className="eyebrow">IT support, made simpler</p>
            <h1>Good support starts with a clear view.</h1>
            <p className="intro-copy">One calm place to report an issue, follow its progress, and keep your team moving.</p>
            <div className="feature-list">
              <div><span className="feature-icon">01</span><span><strong>Raise a request</strong><small>Share the details your support team needs.</small></span></div>
              <div><span className="feature-icon">02</span><span><strong>Follow every update</strong><small>Know what is open, underway, and resolved.</small></span></div>
            </div>
            <p className="intro-note">A lightweight service desk for teams that value their time.</p>
          </section>
          <section className="card login-card">
            <div className="card-kicker">WELCOME TO DESKFLOW</div>
            <h2>Sign in to your workspace</h2>
            <p className="muted">Use your account or jump in with a demo profile.</p>
            <form onSubmit={handleLogin}>
              <label>
                Work email
                <input type="email" autoComplete="username" placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </label>
              <label>
                Password
                <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
              </label>
              <button className="primary-button" type="submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
                <span aria-hidden="true">→</span>
              </button>
            </form>
            <div className="demo-divider"><span>OR TRY A DEMO</span></div>
            <div className="demo-buttons">
              <button type="button" className="demo-button" disabled={loading} onClick={() => signIn('employee@deskflow.local', 'password123')}>
                <span className="demo-avatar employee-avatar">E</span>
                <span><strong>Employee view</strong><small>Submit and track requests</small></span>
                <span className="demo-arrow" aria-hidden="true">→</span>
              </button>
              <button type="button" className="demo-button" disabled={loading} onClick={() => signIn('admin@deskflow.local', 'password123')}>
                <span className="demo-avatar admin-avatar">A</span>
                <span><strong>Admin view</strong><small>Manage the support queue</small></span>
                <span className="demo-arrow" aria-hidden="true">→</span>
              </button>
            </div>
            <p className="hint">Demo password: <code>password123</code></p>
          </section>
        </main>
      ) : (
        <main className="workspace">
          <section className="workspace-heading">
            <div>
              <p className="eyebrow">{isAdmin ? 'SUPPORT WORKSPACE' : 'MY WORKSPACE'}</p>
              <h1>{isAdmin ? 'Support overview' : `Hello, ${session.user.name?.split(' ')[0] || 'there'}.`}</h1>
              <p>{isAdmin ? 'Here is what your team is working on today.' : 'Your requests, all in one place.'}</p>
            </div>
            <span className={`role-badge ${isAdmin ? 'role-admin' : ''}`}><span className="status-dot" />{isAdmin ? 'Administrator' : 'Employee'}</span>
          </section>

          <section className="stats-grid" aria-label="Request summary">
            <article className="stat-card"><span className="stat-label">TOTAL REQUESTS</span><strong>{tickets.length}</strong><span className="stat-note">Across your workspace</span></article>
            <article className="stat-card stat-open"><span className="stat-label">OPEN</span><strong>{ticketCounts.open}</strong><span className="stat-note">Waiting for support</span></article>
            <article className="stat-card stat-progress"><span className="stat-label">IN PROGRESS</span><strong>{ticketCounts.inProgress}</strong><span className="stat-note">Being worked on</span></article>
            <article className="stat-card stat-resolved"><span className="stat-label">RESOLVED</span><strong>{ticketCounts.resolved}</strong><span className="stat-note">Successfully completed</span></article>
          </section>

          <div className={`dashboard-grid ${isAdmin ? 'admin-grid' : ''}`}>
            {!isAdmin && (
              <section className="card request-card">
                <div className="card-kicker">NEED A HAND?</div>
                <h2>Submit a request</h2>
                <p className="muted">Tell us what is getting in your way. We’ll take it from here.</p>
                <form onSubmit={handleCreateTicket} className="stacked-form">
                  <label>
                    Request title
                    <input maxLength="100" placeholder="e.g. Can't connect to the office Wi-Fi" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
                  </label>
                  <label>
                    What happened?
                    <textarea maxLength="1000" placeholder="Add any details that might help us resolve this faster…" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
                    <span className="field-hint">{form.description.length}/1000 characters</span>
                  </label>
                  <label>
                    Priority
                    <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                      {priorityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                  <button className="primary-button" type="submit" disabled={loading}>
                    {loading ? 'Submitting…' : 'Send request'}<span aria-hidden="true">→</span>
                  </button>
                </form>
              </section>
            )}

            <section className="card requests-card">
              <div className="section-heading">
                <div><div className="card-kicker">{isAdmin ? 'TEAM QUEUE' : 'YOUR ACTIVITY'}</div><h2>{isAdmin ? 'All requests' : 'Recent requests'}</h2></div>
                <span className="request-count">{tickets.length}</span>
              </div>
              <div className="filter-row" role="group" aria-label="Filter requests by status">
                {filters.map((filter) => (
                  <button key={filter} type="button" className={`filter-button ${ticketFilter === filter ? 'active' : ''}`} onClick={() => setTicketFilter(filter)}>
                    {statusLabels[filter] || filter}
                    {filter === 'All' && <span>{tickets.length}</span>}
                  </button>
                ))}
              </div>
              {loading && tickets.length === 0 ? (
                <div className="empty-state"><span className="loading-mark" /><p>Loading your requests…</p></div>
              ) : filteredTickets.length ? (
                <div className="ticket-list">
                  {filteredTickets.map((ticket) => (
                    <article key={ticket.id} className="ticket-item">
                      <div className="ticket-main">
                        <div className="ticket-title-row">
                          <span className={`priority-mark priority-${ticket.priority.toLowerCase()}`} aria-hidden="true" />
                          <h3>{ticket.title}</h3>
                        </div>
                        <p>{ticket.description}</p>
                        <div className="ticket-meta">
                          <span>{isAdmin ? ticket.author?.name : `DF-${ticket.id.slice(-6).toUpperCase()}`}</span>
                          <span className="meta-separator">·</span>
                          <span>{new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span className={`priority-label priority-text-${ticket.priority.toLowerCase()}`}>{ticket.priority} priority</span>
                        </div>
                      </div>
                      <div className="ticket-side">
                        {isAdmin ? (
                          <label className="status-control">
                            <span className="sr-only">Status for {ticket.title}</span>
                            <select className={`status-select status-${ticket.status.toLowerCase()}`} value={ticket.status} disabled={updatingTicketId === ticket.id} onChange={(event) => handleStatusChange(ticket.id, event.target.value)}>
                              {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                            </select>
                          </label>
                        ) : (
                          <span className={`status-pill status-${ticket.status.toLowerCase()}`}><span className="status-dot" />{statusLabels[ticket.status] || ticket.status}</span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <span className="empty-icon" aria-hidden="true">✓</span>
                  <h3>{tickets.length ? 'Nothing in this view' : isAdmin ? 'Your queue is clear' : 'You’re all caught up'}</h3>
                  <p>{tickets.length ? 'Try another status filter to see more requests.' : isAdmin ? 'New team requests will show up here.' : 'When you need help, send a request and track it here.'}</p>
                  {tickets.length > 0 && <button type="button" className="text-button" onClick={() => setTicketFilter('All')}>Show all requests</button>}
                </div>
              )}
            </section>
          </div>
          <footer className="workspace-footer"><span>DeskFlow</span><span>Good support keeps work flowing.</span></footer>
        </main>
      )}
    </div>
  );
}

export default App;
