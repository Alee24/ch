'use client';
import { useEffect, useState } from 'react';
import { Clock, DollarSign, ShoppingBag, Star, RefreshCw, MessageSquare, BarChart2 } from 'lucide-react';

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

  const foodSalesList = Object.values(foodSales).sort((a, b) => b.quantity - a.quantity);

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

  const dailyTrendsList = Object.values(dailyTrends).slice(0, 7); // Show last 7 days

  return (
    <main className="shell">
      {/* Admin Navbar */}
      <nav className="nav" style={{ background: '#1c3d2f' }}>
        <div className="brand" style={{ fontSize: '20px' }}>Campus Hub Staff Portal</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: '#e4dcc8' }}>Signed in as: <b>{user.name}</b> ({user.role})</span>
          <button className="btn" onClick={loadData} style={{ background: 'transparent', color: 'white', padding: '4px' }} title="Refresh Data">
            <RefreshCw size={18} />
          </button>
          <a href="/" className="btn primary" style={{ textDecoration: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '13px' }}>
            Customer App
          </a>
        </div>
      </nav>

      <div className="container">
        {/* Navigation Tabs */}
        <div className="tabs" style={{ marginBottom: '24px' }}>
          <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
            <Clock size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Incoming Orders ({orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length})
          </button>
          <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>
            <BarChart2 size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Analytics & Metrics
          </button>
          <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>
            <MessageSquare size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Reviews & Feedback ({reviews.length})
          </button>
        </div>

        {/* Tab 1: Incoming Orders */}
        {activeTab === 'orders' && (
          <div className="card">
            <h2>Active Order Pipeline</h2>
            <p className="muted" style={{ marginBottom: '20px' }}>Advance orders as they move from payment receipt to kitchen preparation, document binding, and student pickup.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').map(o => (
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
              
              {orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length === 0 && (
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
                <div className="muted" style={{ fontSize: '12px' }}>
                  Paid/Collected: <b>KES {paidRevenue}</b> <br/>
                  Unpaid Pending: <b>KES {pendingRevenue}</b> <br/>
                  Cumulative Volume: <b>KES {totalRevenue}</b>
                </div>
              </div>

              <div className="card" style={{ borderLeft: '5px solid var(--amber)' }}>
                <div className="row">
                  <div className="muted">Order Volume</div>
                  <ShoppingBag size={20} className="muted" />
                </div>
                <h2 style={{ margin: '12px 0 6px 0', fontSize: '28px' }}>{orders.length}</h2>
                <div className="muted" style={{ fontSize: '12px' }}>
                  Food Orders: <b>{orders.filter(o => o.type === 'FOOD').length}</b> <br/>
                  Print Orders: <b>{orders.filter(o => o.type === 'PRINT').length}</b>
                </div>
              </div>

              <div className="card" style={{ borderLeft: '5px solid var(--indigo)' }}>
                <div className="row">
                  <div className="muted">Queue Status</div>
                  <Clock size={20} className="muted" />
                </div>
                <h2 style={{ margin: '12px 0 6px 0', fontSize: '28px' }}>{inProgressOrdersCount}</h2>
                <div className="muted" style={{ fontSize: '12px' }}>
                  Processing/Ready: <b>{inProgressOrdersCount}</b> <br/>
                  Collected/Picked Up: <b>{collectedOrdersCount}</b> <br/>
                  Awaiting Payment: <b>{pendingOrdersCount}</b>
                </div>
              </div>
            </div>

            {/* Foods Sales and Daily Trend Grid */}
            <div className="grid">
              {/* Food Catalog Sales Monitor */}
              <div className="card">
                <h3>Food Sales Breakdown</h3>
                <p className="muted" style={{ marginBottom: '16px' }}>Quantity and revenue generated by each catalogue item.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {foodSalesList.map(item => (
                    <div className="item" key={item.name} style={{ margin: 0, padding: '12px' }}>
                      <div className="row" style={{ width: '100%' }}>
                        <div>
                          <span style={{ fontSize: '20px', marginRight: '8px' }}>{item.emoji}</span>
                          <b>{item.name}</b>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div><b>{item.quantity} units sold</b></div>
                          <span className="muted">KES {item.revenue}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {foodSalesList.length === 0 && (
                    <div className="muted" style={{ textAlign: 'center', padding: '20px' }}>No food sales recorded.</div>
                  )}
                </div>
              </div>

              {/* Order volume per day */}
              <div className="card">
                <h3>Daily Orders Trend</h3>
                <p className="muted" style={{ marginBottom: '16px' }}>Monitor daily counts and transaction volume.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {dailyTrendsList.map(day => (
                    <div className="item" key={day.date} style={{ margin: 0, padding: '12px' }}>
                      <div className="row" style={{ width: '100%' }}>
                        <div>
                          <b>{day.date}</b>
                          <div className="muted" style={{ fontSize: '12px' }}>{day.count} orders</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <b>KES {day.revenue}</b>
                        </div>
                      </div>
                    </div>
                  ))}
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
      </div>
    </main>
  );
}
