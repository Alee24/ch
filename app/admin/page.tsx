'use client';
import { useEffect, useState } from 'react';
import { Clock, DollarSign, ShoppingBag, Star, RefreshCw, MessageSquare, BarChart2, LogOut, Layout } from 'lucide-react';

export default function Admin() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'analytics' | 'reviews'>('orders');
  const [updating, setUpdating] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      setUser(meData.user);

      if (meData.user && ['ADMIN', 'STAFF'].includes(meData.user.role)) {
        // Load orders
        const ordersRes = await fetch('/api/admin/orders');
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);

        // Load reviews
        const reviewsRes = await fetch('/api/reviews');
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.reviews || []);
      }
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function advanceStatus(id: string, status: string) {
    setUpdating(id);
    try {
      const r = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (r.ok) {
        // Refresh local orders list
        const ordersRes = await fetch('/api/admin/orders');
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(null);
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    location.reload();
  }

  if (loading) {
    return (
      <main className="shell">
        <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
          <h2>Loading Administrator Dashboard...</h2>
        </div>
      </main>
    );
  }

  if (!user || !['ADMIN', 'STAFF'].includes(user.role)) {
    return (
      <main className="shell">
        <div className="container" style={{ maxWidth: '600px', paddingTop: '80px' }}>
          <div className="card" style={{ textAlign: 'center', borderColor: '#f6d6d6' }}>
            <h2 style={{ color: '#7b2020' }}>Access Denied</h2>
            <p className="muted">You must be logged in as an administrator or staff member to view this page.</p>
            <a href="/" className="btn primary" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '16px' }}>
              Return Home
            </a>
          </div>
        </div>
      </main>
    );
  }

  // --- ANALYTICS CALCULATIONS ---
  
  // Finance Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  
  const paidRevenue = orders
    .filter(o => ['PAID', 'RECEIVED', 'IN_PROGRESS', 'READY', 'COMPLETED'].includes(o.status))
    .reduce((sum, o) => sum + o.total, 0);

  const pendingRevenue = orders
    .filter(o => ['PENDING', 'PAYMENT_PENDING'].includes(o.status))
    .reduce((sum, o) => sum + o.total, 0);

  // Status Counts
  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pendingOrdersCount = (statusCounts['PENDING'] || 0) + (statusCounts['PAYMENT_PENDING'] || 0);
  const collectedOrdersCount = statusCounts['COMPLETED'] || 0;
  const inProgressOrdersCount = (statusCounts['RECEIVED'] || 0) + (statusCounts['IN_PROGRESS'] || 0) + (statusCounts['READY'] || 0);
  const activeOrdersList = orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');

  // Food Sales Metrics
  const foodSales = orders
    .filter(o => o.type === 'FOOD')
    .reduce((acc, o) => {
      if (o.items) {
        o.items.forEach((item: any) => {
          const prodName = item.product?.name || 'Unknown Product';
          if (!acc[prodName]) {
            acc[prodName] = { name: prodName, quantity: 0, revenue: 0, emoji: item.product?.emoji || '🍔' };
          }
          acc[prodName].quantity += item.quantity;
          acc[prodName].revenue += item.quantity * item.unitPrice;
        });
      }
      return acc;
    }, {} as Record<string, { name: string; quantity: number; revenue: number; emoji: string }>);

  const foodSalesList = (Object.values(foodSales) as { name: string; quantity: number; revenue: number; emoji: string }[])
    .sort((a, b) => b.quantity - a.quantity);

  // Daily Sales Trends
  const dailyTrends = orders.reduce((acc, o) => {
    const dateStr = new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (!acc[dateStr]) {
      acc[dateStr] = { date: dateStr, count: 0, revenue: 0 };
    }
    acc[dateStr].count += 1;
    acc[dateStr].revenue += o.total;
    return acc;
  }, {} as Record<string, { date: string; count: number; revenue: number }>);

  const dailyTrendsList = (Object.values(dailyTrends) as { date: string; count: number; revenue: number }[])
    .slice(0, 7); // Show last 7 days

  return (
    <div className="admin-layout">
      {/* Dynamic Styling */}
      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: var(--paper);
        }
        .admin-sidebar {
          width: 280px;
          background: #1c3d2f;
          color: white;
          display: flex;
          flex-direction: column;
          padding: 24px 16px;
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          border-right: 1px solid var(--line);
          z-index: 100;
        }
        .admin-content {
          margin-left: 280px;
          flex: 1;
          padding: 40px;
          min-height: 100vh;
        }
        .sidebar-brand {
          font-family: 'Space Grotesk';
          font-weight: 700;
          font-size: 22px;
          margin-bottom: 32px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .sidebar-menu {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          color: #e4dcc8;
          text-decoration: none;
          border-radius: 8px;
          background: transparent;
          border: 0;
          width: 100%;
          text-align: left;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }
        .sidebar-link:hover {
          background: rgba(255,255,255,0.06);
          color: white;
        }
        .sidebar-link.active {
          background: var(--amber);
          color: var(--ink);
        }
        .badge {
          background: #7b2020;
          color: white;
          font-size: 11px;
          padding: 2px 7px;
          border-radius: 999px;
          margin-left: auto;
          font-weight: bold;
        }
        .badge-active {
          background: var(--green-dark);
          color: white;
        }
        .sidebar-footer {
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 16px;
          margin-top: 16px;
        }
        @media (max-width: 860px) {
          .admin-layout {
            flex-direction: column;
          }
          .admin-sidebar {
            width: 100%;
            position: static;
            height: auto;
            padding: 20px;
          }
          .admin-content {
            margin-left: 0;
            padding: 20px;
          }
          .sidebar-brand {
            margin-bottom: 20px;
          }
        }
      `}</style>

      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <Layout size={22} style={{ color: 'var(--amber)' }} />
          <span>Campus Hub Staff</span>
        </div>

        <div className="sidebar-menu">
          <button 
            className={`sidebar-link ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Clock size={18} />
            <span>Incoming Orders</span>
            {activeOrdersList.length > 0 && (
              <span className={`badge ${activeTab === 'orders' ? 'badge-active' : ''}`}>
                {activeOrdersList.length}
              </span>
            )}
          </button>

          <button 
            className={`sidebar-link ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart2 size={18} />
            <span>Analytics & Metrics</span>
          </button>

          <button 
            className={`sidebar-link ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <MessageSquare size={18} />
            <span>Reviews & Feedback</span>
            {reviews.length > 0 && (
              <span className={`badge ${activeTab === 'reviews' ? 'badge-active' : ''}`}>
                {reviews.length}
              </span>
            )}
          </button>
        </div>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button className="btn" onClick={loadData} style={{ background: 'rgba(255,255,255,0.08)', color: 'white', padding: '6px 10px', borderRadius: '6px', border: 0 }} title="Refresh Data">
              <RefreshCw size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              <span style={{ fontSize: '12px' }}>Refresh</span>
            </button>
          </div>
          
          <div style={{ marginBottom: '16px', fontSize: '13px', color: '#e4dcc8', background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '8px' }}>
            <div style={{ color: '#aaa', fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' }}>CONNECTED AS</div>
            <div style={{ fontWeight: 'bold', color: 'white', fontSize: '14px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--amber)', textTransform: 'capitalize' }}>{user.role.toLowerCase()} portal</div>
          </div>

          <a href="/" className="btn primary" style={{ textDecoration: 'none', display: 'block', textAlign: 'center', marginBottom: '8px', fontSize: '13px', padding: '10px' }}>
            Customer App
          </a>
          
          <button className="btn" onClick={logout} style={{ width: '100%', background: '#7b2020', color: 'white', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px' }}>
            <LogOut size={14} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-content">
        {/* Tab 1: Incoming Orders */}
        {activeTab === 'orders' && (
          <div className="card">
            <h2>Active Order Pipeline</h2>
            <p className="muted" style={{ marginBottom: '20px' }}>Advance orders as they move from payment receipt to kitchen preparation, document binding, and student pickup.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activeOrdersList.map(o => (
                <div className="item" key={o.id} style={{ padding: '16px', background: '#fff', border: '1px solid var(--line)' }}>
                  <div className="row">
                    <div>
                      <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--green-dark)' }}>{o.ticketCode}</span>
                      <span className="pill" style={{ marginLeft: '12px', background: o.status === 'PAID' || o.status === 'RECEIVED' ? '#dcfce7' : '#fef9c3', color: o.status === 'PAID' || o.status === 'RECEIVED' ? '#14532d' : '#713f12' }}>
                        {o.status}
                      </span>
                      <div className="muted" style={{ marginTop: '4px', fontSize: '13px' }}>
                        Type: <b>{o.type}</b> · Amount: <b>KES {o.total}</b> · Placed: {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      
                      {/* Order Details */}
                      <div style={{ marginTop: '12px', fontSize: '14px', background: '#fafaf9', padding: '8px 12px', borderRadius: '8px' }}>
                        {o.type === 'FOOD' ? (
                          <div>
                            <b>Food Items:</b>
                            <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
                              {o.items?.map((i: any) => (
                                <li key={i.id}>{i.quantity}x {i.product?.name} (KES {i.unitPrice})</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div>
                            <b>Print Job:</b> {o.printJob?.fileName} ({o.printJob?.pages} pages · {o.printJob?.color} · {o.printJob?.binding} binding)
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {o.status === 'PAID' && (
                        <button className="btn secondary" disabled={updating === o.id} onClick={() => advanceStatus(o.id, 'RECEIVED')}>
                          Acknowledge Receipt
                        </button>
                      )}
                      {(o.status === 'RECEIVED' || o.status === 'PENDING') && (
                        <button className="btn secondary" disabled={updating === o.id} onClick={() => advanceStatus(o.id, 'IN_PROGRESS')}>
                          Start Processing
                        </button>
                      )}
                      {o.status === 'IN_PROGRESS' && (
                        <button className="btn primary" disabled={updating === o.id} onClick={() => advanceStatus(o.id, 'READY')}>
                          Mark as Ready
                        </button>
                      )}
                      {o.status === 'READY' && (
                        <button className="btn" style={{ background: 'var(--green-dark)', color: 'white' }} disabled={updating === o.id} onClick={() => advanceStatus(o.id, 'COMPLETED')}>
                          Mark Collected
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {activeOrdersList.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <h3>No active orders at this time.</h3>
                  <p className="muted">All orders have been processed or collected.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Analytics & Metrics Dashboard */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Cards Grid */}
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <div className="card" style={{ borderLeft: '5px solid var(--green)' }}>
                <div className="row">
                  <div className="muted">Finances Summary</div>
                  <DollarSign size={20} className="muted" />
                </div>
                <h2 style={{ margin: '12px 0 6px 0', fontSize: '28px' }}>KES {paidRevenue}</h2>
                <div className="muted" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                  Paid/Collected: <b>KES {paidRevenue}</b> <br/>
                  Unpaid Pending: <b>KES {pendingRevenue}</b> <br/>
                  Cumulative Volume: <b>KES {totalRevenue}</b>
                </div>
                
                {/* Finance progress bar */}
                <div style={{ background: '#e4dcc8', height: '6px', borderRadius: '3px', marginTop: '12px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ background: 'var(--green)', width: `${totalRevenue > 0 ? (paidRevenue / totalRevenue) * 100 : 0}%`, height: '100%' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginTop: '4px' }} className="muted">
                  <span>Paid: {totalRevenue > 0 ? Math.round((paidRevenue / totalRevenue) * 100) : 0}%</span>
                  <span>Pending: {totalRevenue > 0 ? Math.round((pendingRevenue / totalRevenue) * 100) : 0}%</span>
                </div>
              </div>

              <div className="card" style={{ borderLeft: '5px solid var(--amber)' }}>
                <div className="row">
                  <div className="muted">Order Volume</div>
                  <ShoppingBag size={20} className="muted" />
                </div>
                <h2 style={{ margin: '12px 0 6px 0', fontSize: '28px' }}>{orders.length}</h2>
                <div className="muted" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                  Food Orders: <b>{orders.filter(o => o.type === 'FOOD').length}</b> <br/>
                  Print Orders: <b>{orders.filter(o => o.type === 'PRINT').length}</b>
                </div>

                {/* Type progress bar */}
                <div style={{ background: '#e4dcc8', height: '6px', borderRadius: '3px', marginTop: '12px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ background: 'var(--amber)', width: `${orders.length > 0 ? (orders.filter(o => o.type === 'FOOD').length / orders.length) * 100 : 0}%`, height: '100%' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginTop: '4px' }} className="muted">
                  <span>Food: {orders.length > 0 ? Math.round((orders.filter(o => o.type === 'FOOD').length / orders.length) * 100) : 0}%</span>
                  <span>Print: {orders.length > 0 ? Math.round((orders.filter(o => o.type === 'PRINT').length / orders.length) * 100) : 0}%</span>
                </div>
              </div>

              <div className="card" style={{ borderLeft: '5px solid var(--indigo)' }}>
                <div className="row">
                  <div className="muted">Queue Status</div>
                  <Clock size={20} className="muted" />
                </div>
                <h2 style={{ margin: '12px 0 6px 0', fontSize: '28px' }}>{inProgressOrdersCount}</h2>
                <div className="muted" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                  Processing/Ready: <b>{inProgressOrdersCount}</b> <br/>
                  Collected/Picked Up: <b>{collectedOrdersCount}</b> <br/>
                  Awaiting Payment: <b>{pendingOrdersCount}</b>
                </div>

                {/* Queue status multi-segment progress bar */}
                <div style={{ background: '#e4dcc8', height: '6px', borderRadius: '3px', marginTop: '12px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ background: 'var(--indigo)', width: `${orders.length > 0 ? (inProgressOrdersCount / orders.length) * 100 : 0}%`, height: '100%' }} />
                  <div style={{ background: 'var(--green)', width: `${orders.length > 0 ? (collectedOrdersCount / orders.length) * 100 : 0}%`, height: '100%' }} />
                  <div style={{ background: '#756f63', width: `${orders.length > 0 ? (pendingOrdersCount / orders.length) * 100 : 0}%`, height: '100%' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginTop: '4px' }} className="muted">
                  <span>Active: {orders.length > 0 ? Math.round((inProgressOrdersCount / orders.length) * 100) : 0}%</span>
                  <span>Done: {orders.length > 0 ? Math.round((collectedOrdersCount / orders.length) * 100) : 0}%</span>
                </div>
              </div>
            </div>

            {/* Foods Sales and Daily Trend Grid */}
            <div className="grid">
              {/* Food Catalog Sales Monitor */}
              <div className="card">
                <h3>Food Sales Breakdown</h3>
                <p className="muted" style={{ marginBottom: '16px' }}>Quantity and revenue generated by each catalogue item.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {foodSalesList.map(item => {
                    const maxQty = Math.max(...foodSalesList.map(f => f.quantity), 1);
                    const widthPercent = Math.round((item.quantity / maxQty) * 100);
                    return (
                      <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div className="row" style={{ width: '100%', margin: 0 }}>
                          <div>
                            <span style={{ fontSize: '20px', marginRight: '8px' }}>{item.emoji}</span>
                            <b>{item.name}</b>
                          </div>
                          <div style={{ textAlign: 'right', fontSize: '13px' }}>
                            <b>{item.quantity} units</b> <span className="muted">({widthPercent}%)</span> · <span className="muted">KES {item.revenue}</span>
                          </div>
                        </div>
                        {/* Horizontal volume indicator bar */}
                        <div style={{ background: '#fafaf9', height: '8px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--line)' }}>
                          <div style={{ background: 'var(--amber)', width: `${widthPercent}%`, height: '100%' }} />
                        </div>
                      </div>
                    );
                  })}
                  {foodSalesList.length === 0 && (
                    <div className="muted" style={{ textAlign: 'center', padding: '20px' }}>No food sales recorded.</div>
                  )}
                </div>
              </div>

              {/* Order volume per day */}
              <div className="card">
                <h3>Daily Orders & Revenue</h3>
                <p className="muted" style={{ marginBottom: '16px' }}>Monitor daily counts and transaction volume.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {dailyTrendsList.map(day => {
                    const maxRevenue = Math.max(...dailyTrendsList.map(d => d.revenue), 1);
                    const widthPercent = Math.round((day.revenue / maxRevenue) * 100);
                    return (
                      <div key={day.date} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div className="row" style={{ width: '100%', margin: 0 }}>
                          <div>
                            <b>{day.date}</b>
                            <span className="muted" style={{ fontSize: '12px', marginLeft: '8px' }}>{day.count} orders</span>
                          </div>
                          <div style={{ textAlign: 'right', fontSize: '13px' }}>
                            <b>KES {day.revenue}</b>
                          </div>
                        </div>
                        {/* Horizontal revenue indicator bar */}
                        <div style={{ background: '#fafaf9', height: '8px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--line)' }}>
                          <div style={{ background: 'var(--indigo)', width: `${widthPercent}%`, height: '100%' }} />
                        </div>
                      </div>
                    );
                  })}
                  {dailyTrendsList.length === 0 && (
                    <div className="muted" style={{ textAlign: 'center', padding: '20px' }}>No sales data available.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Reviews & Feedback */}
        {activeTab === 'reviews' && (
          <div className="card">
            <h2>Customer Reviews & Feedback</h2>
            <p className="muted" style={{ marginBottom: '24px' }}>See feedback submitted by students about the food catalogue, print quality, and checkout speeds.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviews.map(r => (
                <div className="card" key={r.id} style={{ background: '#fafaf9', padding: '16px 20px' }}>
                  <div className="row" style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <b>{r.name}</b>
                      <span className="muted" style={{ fontSize: '12px' }}>· {new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} size={16} fill={star <= r.rating ? 'var(--amber)' : 'none'} stroke="var(--amber)" />
                      ))}
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#333', lineHeight: '1.5' }}>"{r.comment}"</p>
                </div>
              ))}

              {reviews.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <h3>No reviews yet.</h3>
                  <p className="muted">Reviews submitted by students will appear here.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
