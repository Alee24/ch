'use client';
import { useEffect,useState } from 'react';
import Link from 'next/link';
import { Utensils, Printer, Plus, Minus, LogOut, Clock, MessageSquare, Star, Upload, FileText, CheckCircle2, ShoppingCart, User, AlertCircle } from 'lucide-react';
import AuthForm from './AuthForm';
type Product={id:string;name:string;price:number;emoji?:string|null}; type Order={id:string;ticketCode:string;type:string;status:string;total:number;createdAt:string;items?:any[];printJob?:any;payment?:any};
export default function CustomerApp(){const [user,setUser]=useState<any>(undefined);const [tab,setTab]=useState<'food'|'print'|'orders'|'reviews'>('food');const [products,setProducts]=useState<Product[]>([]);const [cart,setCart]=useState<Record<string,number>>({});const [orders,setOrders]=useState<Order[]>([]);const [reviews,setReviews]=useState<any[]>([]);const [message,setMessage]=useState('');
 useEffect(()=>{fetch('/api/auth/me').then(r=>r.json()).then(d=>setUser(d.user));fetch('/api/products').then(r=>r.json()).then(d=>setProducts(d.products||[]));loadReviews();},[]); useEffect(()=>{if(user)refresh();},[user]); async function refresh(){const r=await fetch('/api/orders');setOrders((await r.json()).orders||[])}
 async function loadReviews(){const r=await fetch('/api/reviews');setReviews((await r.json()).reviews||[])}
 async function createFood(){const items=Object.entries(cart).filter(([,q])=>q>0).map(([productId,quantity])=>({productId,quantity}));const r=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'FOOD',items})});const d=await r.json();if(!r.ok)return setMessage(d.error);setCart({});setMessage(`Order ${d.order.ticketCode} created. Pay to confirm.`);setTab('orders');refresh()}
 async function pay(o:Order){const phone=prompt('Enter M-Pesa phone number',user?.phone||'');if(!phone)return;const r=await fetch('/api/payments/stk',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId:o.id,phone})});const d=await r.json();setMessage(r.ok?d.message:d.error);setTimeout(refresh,4000)}
 async function logout(){await fetch('/api/auth/logout',{method:'POST'});setUser(null)}
  if(user===undefined)return <main className="shell"><div className="container">Loading…</div></main>;
  if(!user) {
    return (
      <main className="shell" style={{ scrollBehavior: 'smooth' }}>
        {/* Navigation Bar */}
        <nav className="nav">
          <div className="brand" style={{ fontSize: '20px' }}>Campus Hub</div>
          <div>
            <a href="#auth" className="btn primary" style={{ color: 'var(--ink)', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '14px' }}>
              Sign In
            </a>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="container" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
          <div className="grid" style={{ alignItems: 'center' }}>
            <div>
              <h1 style={{ font: "700 48px 'Space Grotesk'", margin: '0 0 16px', color: 'var(--ink)', lineHeight: '1.15' }}>
                Skip the Queue. <br/>
                Order Food & Print Documents.
              </h1>
              <p style={{ fontSize: '17px', color: '#555', marginBottom: '28px', lineHeight: '1.6' }}>
                Campus Hub connects you directly to the campus kiosk. Order from the cafeteria catalogue, upload document print jobs with custom binding options, and pay securely using M-Pesa.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a href="#auth" className="btn primary" style={{ textDecoration: 'none', padding: '12px 24px', borderRadius: '12px', fontSize: '15px' }}>
                  Get Started Now
                </a>
                <Link href="/menu" className="btn" style={{ background: '#e4dcc8', color: 'var(--ink)', textDecoration: 'none', padding: '12px 24px', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold' }}>
                  View Today's Menu
                </Link>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <svg width="240" height="240" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--green-dark)', opacity: 0.85 }}>
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
                <path d="M12 7v4M9 9h6" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" style={{ background: '#fff', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '80px 0' }}>
          <div className="container">
            <h2 style={{ font: "700 32px 'Space Grotesk'", textAlign: 'center', marginBottom: '48px', color: 'var(--ink)' }}>
              Core Campus Hub Features
            </h2>
            
            <div className="grid" style={{ gap: '32px' }}>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '32px' }}>🍟</div>
                <h3 style={{ margin: '8px 0 4px', font: "700 20px 'Space Grotesk'" }}>Smart Food Ordering</h3>
                <p className="muted" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  Browse the active cafeteria menu, select your favourite meals, customize quantities, and place orders. Track the kitchen prep status from your phone.
                </p>
              </div>

              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '32px' }}>🖨️</div>
                <h3 style={{ margin: '8px 0 4px', font: "700 20px 'Space Grotesk'" }}>Quick Document Printing</h3>
                <p className="muted" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  Upload PDF or Word files to S3 secure storage. Set print rules (Colour vs B/W), select page numbers, choose binding (Spiral, Staple, or None), and see live pricing.
                </p>
              </div>

              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '32px' }}>📱</div>
                <h3 style={{ margin: '8px 0 4px', font: "700 20px 'Space Grotesk'" }}>M-Pesa STK Push Integration</h3>
                <p className="muted" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  No cash or manual transfers required. Enter your M-Pesa number to receive an instant STK push prompt on your mobile phone to complete payment.
                </p>
              </div>

              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '32px' }}>⏱️</div>
                <h3 style={{ margin: '8px 0 4px', font: "700 20px 'Space Grotesk'" }}>Real-time Status Tracking</h3>
                <p className="muted" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  Watch your orders progress through the state machine: pending, paid, in-progress, ready, and completed. Walk to the kiosk only when your ticket is ready!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div id="benefits" style={{ background: 'var(--paper)', borderBottom: '1px solid var(--line)', padding: '80px 0' }}>
          <div className="container">
            <h2 style={{ font: "700 32px 'Space Grotesk'", textAlign: 'center', marginBottom: '16px', color: 'var(--ink)' }}>
              Why Choose Campus Hub?
            </h2>
            <p className="muted" style={{ textAlign: 'center', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px', fontSize: '15px' }}>
              We built Campus Hub to make university life simple, fast, and organized. Here is how we improve your day-to-day routine.
            </p>
            
            <div className="grid" style={{ gap: '32px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ background: 'var(--green-dark)', color: 'white', borderRadius: '12px', padding: '10px 14px', fontWeight: 'bold', fontSize: '18px' }}>1</div>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 'bold' }}>Zero Queue Waiting</h4>
                  <p className="muted" style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                    Stop standing in lines. Order your lunch while in class or submit assignment files from your study desk, and only visit the kiosk when you receive the "Ready" notification.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ background: 'var(--green-dark)', color: 'white', borderRadius: '12px', padding: '10px 14px', fontWeight: 'bold', fontSize: '18px' }}>2</div>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 'bold' }}>Instant Pricing Estimates</h4>
                  <p className="muted" style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                    Upload your Word/PDF document and customize configurations to see the exact price automatically calculated. No hidden costs or manual calculation errors.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ background: 'var(--green-dark)', color: 'white', borderRadius: '12px', padding: '10px 14px', fontWeight: 'bold', fontSize: '18px' }}>3</div>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 'bold' }}>Secure Mobile Payments</h4>
                  <p className="muted" style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                    Fully integrated with Safaricom M-Pesa. Payments are processed securely via an automated STK push prompt directly to your phone. No manual transactions or cash handling.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ background: 'var(--green-dark)', color: 'white', borderRadius: '12px', padding: '10px 14px', fontWeight: 'bold', fontSize: '18px' }}>4</div>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 'bold' }}>Real-time Status Tracking</h4>
                  <p className="muted" style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                    Track your orders through a reliable state machine. Walk to the kiosk with confidence, knowing your printouts are bound or your food is ready.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div id="testimonials" style={{ background: '#fff', borderBottom: '1px solid var(--line)', padding: '80px 0' }}>
          <div className="container">
            <h2 style={{ font: "700 32px 'Space Grotesk'", textAlign: 'center', marginBottom: '48px', color: 'var(--ink)' }}>
              Loved by Students & Kiosk Staff
            </h2>
            
            <div className="grid" style={{ gap: '32px' }}>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px' }}>
                <p style={{ fontStyle: 'italic', fontSize: '15px', color: '#444', lineHeight: '1.6', marginBottom: '16px' }}>
                  "Campus Hub has completely transformed how I handle my class printouts. I upload my lab reports directly from my hostel room, choose the spiral binding, and pay via M-Pesa. I pick it up on my way to lecture without losing a minute in line!"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--ink)' }}>GW</div>
                  <div>
                    <h5 style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>Grace Wambui</h5>
                    <span className="muted" style={{ fontSize: '12px' }}>Computer Science Student</span>
                  </div>
                </div>
              </div>

              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px' }}>
                <p style={{ fontStyle: 'italic', fontSize: '15px', color: '#444', lineHeight: '1.6', marginBottom: '16px' }}>
                  "Lunch breaks used to mean long queues at the kiosk, and half the time food was sold out before I reached the front. With Campus Hub, I pre-order my fries and smokies from my phone during my morning break. It is hot and waiting for me!"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>DK</div>
                  <div>
                    <h5 style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>David Kiprop</h5>
                    <span className="muted" style={{ fontSize: '12px' }}>Mechanical Engineering Student</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div id="faqs" style={{ background: 'var(--paper)', borderBottom: '1px solid var(--line)', padding: '80px 0' }}>
          <div className="container" style={{ maxWidth: '800px' }}>
            <h2 style={{ font: "700 32px 'Space Grotesk'", textAlign: 'center', marginBottom: '48px', color: 'var(--ink)' }}>
              Frequently Asked Questions
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="card" style={{ padding: '20px 24px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>Which document formats can I upload for printing?</h4>
                <p className="muted" style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                  We currently support PDF, DOC, and DOCX file uploads. To ensure formatting stays identical, we recommend exporting your documents to PDF before uploading them.
                </p>
              </div>

              <div className="card" style={{ padding: '20px 24px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>How does the M-Pesa payment STK push work?</h4>
                <p className="muted" style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                  When you submit a food or print order, click the 'Pay with M-Pesa' button. Enter your Safaricom phone number, and a secure payment prompt will automatically appear on your phone screen. Simply enter your M-Pesa PIN to complete the transaction.
                </p>
              </div>

              <div className="card" style={{ padding: '20px 24px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>Where do I collect my order when it is ready?</h4>
                <p className="muted" style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                  All orders can be collected at the main Campus Kiosk. Show the ticket code (e.g., CH-XXXX) displayed under your orders tab or tracking link to the kiosk operator.
                </p>
              </div>

              <div className="card" style={{ padding: '20px 24px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>Is my document storage secure and private?</h4>
                <p className="muted" style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                  Yes, your documents are uploaded directly to an S3 secure storage bucket using unique encrypted keys. Files are strictly accessible only by the kiosk operators for printing, and are automatically purged from the system after the order is completed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Section */}
        <div id="auth" style={{ padding: '80px 0', background: 'var(--paper)' }}>
          <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ font: "700 32px 'Space Grotesk'", marginBottom: '8px' }}>Access Campus Hub</h2>
            <p className="muted" style={{ marginBottom: '32px', textAlign: 'center' }}>
              Sign in or register for a customer account to begin ordering and uploading print jobs.
            </p>
            <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '32px' }}>
              <AuthForm onDone={() => location.reload()} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={{ background: 'var(--green-dark)', color: 'white', padding: '24px 0', textAlign: 'center', fontSize: '14px' }}>
          <div className="container">
            <p>© {new Date().getFullYear()} Campus Hub. All rights reserved.</p>
          </div>
        </footer>
      </main>
    );
  }
  return (
    <main className="shell">
      {/* Visual styling overrides */}
      <style>{`
        .customer-nav {
          background: #1c3d2f;
          padding: 16px 24px;
          border-bottom: 4px solid var(--amber);
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--line);
          background: white;
          border-radius: 12px;
          padding: 12px 20px;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s;
          cursor: pointer;
        }
        .tab-btn:hover {
          background: #fafaf9;
          border-color: #aaa;
        }
        .tab-btn.active {
          background: var(--amber);
          border-color: var(--amber);
          color: var(--ink);
          box-shadow: 0 4px 10px rgba(227, 150, 62, 0.2);
        }
        .food-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .food-card {
          background: white;
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.02);
          transition: all 0.2s;
        }
        .food-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.05);
        }
        .stepper {
          display: flex;
          align-items: center;
          background: #faf9f6;
          border: 1px solid var(--line);
          border-radius: 12px;
          overflow: hidden;
        }
        .stepper-btn {
          background: transparent;
          border: 0;
          padding: 8px 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.1s;
        }
        .stepper-btn:hover {
          background: rgba(0,0,0,0.04);
        }
        .stepper-val {
          width: 32px;
          text-align: center;
          font-weight: bold;
        }
        .checkout-panel {
          background: #1c3d2f;
          color: white;
          border-radius: 20px;
          padding: 24px;
          margin-top: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 10px 25px rgba(28, 61, 47, 0.25);
        }
        .print-dropzone {
          border: 2px dashed #b5a88e;
          border-radius: 16px;
          padding: 40px;
          text-align: center;
          background: #fafaf9;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 24px;
        }
        .print-dropzone:hover {
          background: #f5f4ef;
          border-color: var(--green);
        }
        .order-card {
          background: white;
          border: 1px solid var(--line);
          border-radius: 18px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 200px;
          transition: all 0.2s;
        }
        .order-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        }
        @media (max-width: 768px) {
          .food-grid {
            grid-template-columns: 1fr;
          }
          .checkout-panel {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
        }
      `}</style>
      
      {/* Navigation Header */}
      <nav className="nav customer-nav">
        <div className="brand" style={{ fontSize: '22px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingCart size={22} style={{ color: 'var(--amber)' }} />
          <span>Campus Hub</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '14px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--ink)' }}>
              {user.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
            </div>
            <span>{user.name}</span>
          </div>
          <button onClick={logout} className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 0, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </nav>

      <div className="container">
        {/* Welcome Block */}
        <div className="card" style={{ background: 'linear-gradient(135deg, #1c3d2f, #2f7a5c)', color: 'white', border: 0, padding: '24px 32px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '28px', margin: '0 0 8px 0' }}>Hi, {user.name ? user.name.split(' ')[0] : 'Student'}! 👋</h1>
            <p style={{ margin: 0, opacity: 0.85, fontSize: '15px' }}>Skip the cafeteria lines or setup your study print jobs before you arrive.</p>
          </div>
          <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '120px', opacity: 0.08, pointerEvents: 'none' }}>🎓</div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', margin: '24px 0', flexWrap: 'wrap' }}>
          <button className={`tab-btn ${tab === 'food' ? 'active' : ''}`} onClick={() => setTab('food')}>
            <Utensils size={16} />
            <span>Cafeteria Menu</span>
          </button>
          <button className={`tab-btn ${tab === 'print' ? 'active' : ''}`} onClick={() => setTab('print')}>
            <Printer size={16} />
            <span>Print Services</span>
          </button>
          <button className={`tab-btn ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>
            <Clock size={16} />
            <span>My Orders</span>
            {orders.filter(o => ['PENDING', 'PAYMENT_PENDING', 'RECEIVED', 'IN_PROGRESS', 'READY'].includes(o.status)).length > 0 && (
              <span style={{ background: '#7b2020', color: 'white', fontSize: '10px', padding: '1px 5px', borderRadius: '10px', marginLeft: '6px', fontWeight: 'bold' }}>
                {orders.filter(o => ['PENDING', 'PAYMENT_PENDING', 'RECEIVED', 'IN_PROGRESS', 'READY'].includes(o.status)).length}
              </span>
            )}
          </button>
          <button className={`tab-btn ${tab === 'reviews' ? 'active' : ''}`} onClick={() => setTab('reviews')}>
            <MessageSquare size={16} />
            <span>Give Feedback</span>
          </button>
        </div>

        {message && (
          <div className="card" style={{ marginBottom: '24px', background: '#fef9c3', border: '1px solid #fef08a', color: '#713f12', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} />
            <div>{message}</div>
          </div>
        )}

        {/* Tab content rendering */}
        {tab === 'food' && (
          <div>
            <div className="food-grid">
              {products.map(p => (
                <div className="food-card" key={p.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '32px', background: '#faf9f6', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)' }}>
                      {p.emoji || '🍔'}
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: 'bold' }}>{p.name}</h4>
                      <span style={{ background: '#dcfce7', color: '#14532d', fontSize: '12px', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                        KES {p.price}
                      </span>
                    </div>
                  </div>
                  
                  {/* Quantity controls */}
                  <div className="stepper">
                    <button className="stepper-btn" onClick={() => setCart(c => ({ ...c, [p.id]: Math.max(0, (c[p.id] || 0) - 1) }))}>
                      <Minus size={14} />
                    </button>
                    <span className="stepper-val">{cart[p.id] || 0}</span>
                    <button className="stepper-btn" onClick={() => setCart(c => ({ ...c, [p.id]: (c[p.id] || 0) + 1 }))}>
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout Panel */}
            <div className="checkout-panel">
              <div>
                <span className="muted" style={{ color: '#aaa', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>ORDER TOTAL</span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '24px', fontFamily: 'Space Grotesk' }}>
                  KES {products.reduce((s, p) => s + p.price * (cart[p.id] || 0), 0)}
                </h3>
              </div>
              <button 
                className="btn primary" 
                disabled={!Object.values(cart).some(Boolean)} 
                onClick={createFood}
                style={{ padding: '14px 28px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <ShoppingCart size={18} />
                <span>Place Food Order</span>
              </button>
            </div>
          </div>
        )}

        {tab === 'print' && <PrintForm onCreated={(msg) => { setMessage(msg); setTab('orders'); refresh(); }} />}

        {tab === 'orders' && (
          <div className="grid">
            {orders.map(o => {
              // Map status to a nice badge style
              let badgeBg = '#fef9c3';
              let badgeColor = '#713f12';
              if (['PAID', 'RECEIVED'].includes(o.status)) {
                badgeBg = '#dcfce7';
                badgeColor = '#14532d';
              } else if (o.status === 'IN_PROGRESS') {
                badgeBg = '#e0e7ff';
                badgeColor = '#3730a3';
              } else if (o.status === 'READY') {
                badgeBg = '#dbeafe';
                badgeColor = '#1e3a8a';
              } else if (o.status === 'COMPLETED') {
                badgeBg = '#f3f4f6';
                badgeColor = '#374151';
              }

              return (
                <div className="order-card" key={o.id}>
                  <div>
                    <div className="row" style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--green-dark)' }}>{o.ticketCode}</span>
                      <span className="pill" style={{ background: badgeBg, color: badgeColor }}>
                        {o.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#777', marginBottom: '16px' }}>
                      <Clock size={12} />
                      <span>Placed: {new Date(o.createdAt).toLocaleDateString()} at {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    
                    <p style={{ margin: '0 0 16px 0', fontSize: '14px', lineHeight: '1.5' }}>
                      {o.type === 'FOOD' ? (
                        <span>🛒 {o.items?.map((i: any) => `${i.quantity}x ${i.product.name}`).join(', ')}</span>
                      ) : (
                        <span>📄 {o.printJob?.fileName} ({o.printJob?.pages} pages, {o.printJob?.color.toLowerCase()}, {o.printJob?.binding.toLowerCase()} binding)</span>
                      )}
                    </p>
                  </div>

                  <div>
                    <div className="row" style={{ borderTop: '1px solid var(--line)', paddingTop: '16px', marginTop: '8px' }}>
                      <div>
                        <span className="muted" style={{ fontSize: '11px', display: 'block' }}>TOTAL AMOUNT</span>
                        <b>KES {o.total}</b>
                      </div>
                      <Link href={`/order/${o.id}`} className="btn" style={{ textDecoration: 'none', background: '#e4dcc8', color: 'var(--ink)', padding: '8px 14px', fontSize: '13px', borderRadius: '8px' }}>
                        Track Live
                      </Link>
                    </div>
                    
                    {['PENDING', 'PAYMENT_PENDING', 'FAILED'].includes(o.status) && (
                      <button 
                        className="btn primary" 
                        style={{ width: '100%', marginTop: '12px', display: 'block', fontSize: '13px', padding: '10px' }} 
                        onClick={() => pay(o)}
                      >
                        Pay with M-Pesa
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            
            {orders.length === 0 && (
              <div className="card" style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px' }}>
                <Clock size={40} style={{ color: '#aaa', marginBottom: '12px' }} />
                <h3>No orders placed yet.</h3>
                <p className="muted">Your active and historical food or print orders will be listed here.</p>
              </div>
            )}
          </div>
        )}

        {tab === 'reviews' && <ReviewsTab reviews={reviews} onSubmitted={loadReviews} />}
      </div>
    </main>
  );
}

function PrintForm({onCreated}:{onCreated:(m:string)=>void}){
  const [file,setFile]=useState<File|null>(null);
  const [pages,setPages]=useState(10);
  const [color,setColor]=useState<'BW'|'COLOR'>('BW');
  const [binding,setBinding]=useState<'NONE'|'SPIRAL'|'STAPLE'>('NONE');
  const [busy,setBusy]=useState(false);

  // Live Pricing
  const pagesCost = pages * (color === 'COLOR' ? 20 : 5);
  const bindingCost = binding === 'SPIRAL' ? 100 : binding === 'STAPLE' ? 20 : 0;
  const totalCost = pagesCost + bindingCost;

  async function submit(){
    if(!file)return;
    setBusy(true);
    try{
      const p=await fetch('/api/print/presign',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fileName:file.name,contentType:file.type,size:file.size})}).then(r=>r.json());
      if(!p.url)throw new Error(p.error);
      await fetch(p.url,{method:'PUT',headers:{'Content-Type':file.type},body:file});
      const r=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'PRINT',fileKey:p.key,fileName:file.name,mimeType:file.type,pages,color,binding})});
      const d=await r.json();
      if(!r.ok)throw new Error(d.error);
      onCreated(`Print order ${d.order.ticketCode} created. Pay to confirm.`)
    }catch(e){
      onCreated(e instanceof Error?e.message:'Unable to create print order')
    }finally{
      setBusy(false);
    }
  }

  return (
    <div className="grid">
      {/* Configuration Card */}
      <div className="card">
        <h2>Document Printing</h2>
        <p className="muted" style={{ marginBottom: '24px' }}>Upload your document file and select configurations. We support PDF, DOC, and DOCX.</p>
        
        {/* Custom Upload Dropzone */}
        <label className="print-dropzone" style={{ display: 'block' }}>
          <input type="file" accept=".pdf,.doc,.docx" onChange={e=>setFile(e.target.files?.[0]||null)} style={{ display: 'none' }} />
          <Upload size={32} style={{ color: 'var(--green)', marginBottom: '8px', marginLeft: 'auto', marginRight: 'auto' }} />
          <div>
            <b>{file ? file.name : "Choose a file to print"}</b>
          </div>
          <span className="muted" style={{ display: 'block', marginTop: '4px' }}>{file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "Click to select a PDF or Word document"}</span>
        </label>

        <div className="field">
          <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Estimated Page Count</label>
          <select value={pages} onChange={e=>setPages(Number(e.target.value))}>
            {[10,25,50].map(x=><option key={x} value={x}>{x} Pages</option>)}
          </select>
        </div>

        <div className="field">
          <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Colour Mode</label>
          <select value={color} onChange={e=>setColor(e.target.value as any)}>
            <option value="BW">Black & White — KES 5 per page</option>
            <option value="COLOR">Colour — KES 20 per page</option>
          </select>
        </div>

        <div className="field">
          <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Binding Option</label>
          <select value={binding} onChange={e=>setBinding(e.target.value as any)}>
            <option value="NONE">No binding — Free</option>
            <option value="SPIRAL">Spiral binding — KES 100</option>
            <option value="STAPLE">Staple — KES 20</option>
          </select>
        </div>
      </div>

      {/* Pricing and Details Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '5px solid var(--green)' }}>
        <div>
          <h2>Order Summary</h2>
          <p className="muted" style={{ marginBottom: '24px' }}>Verify your document print configurations before submitting.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="row">
              <span className="muted">Document:</span>
              <span style={{ fontWeight: 'bold', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file ? file.name : "Not selected"}</span>
            </div>
            <div className="row">
              <span className="muted">Pages ({pages} × {color === 'BW' ? 'B/W' : 'Colour'}):</span>
              <b>KES {pagesCost}</b>
            </div>
            <div className="row">
              <span className="muted">Binding ({binding.toLowerCase()}):</span>
              <b>KES {bindingCost}</b>
            </div>
            <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '12px 0' }} />
            <div className="row">
              <span style={{ fontWeight: 'bold' }}>Total Cost:</span>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--green-dark)' }}>KES {totalCost}</span>
            </div>
          </div>
        </div>

        <button 
          className="btn primary" 
          disabled={!file||busy} 
          onClick={submit}
          style={{ width: '100%', padding: '14px', fontSize: '15px', marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {busy ? "Uploading Document..." : "Create Print Order"}
        </button>
      </div>
    </div>
  );
}

function ReviewsTab({reviews, onSubmitted}:{reviews:any[], onSubmitted:()=>void}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function submit() {
    if (!comment.trim()) return;
    setBusy(true);
    setMsg('');
    try {
      const r = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setComment('');
      setRating(5);
      setMsg('Thank you! Your feedback has been submitted.');
      onSubmitted();
    } catch (e: any) {
      setMsg(e.message || 'Failed to submit review');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card">
        <h2>Submit Feedback</h2>
        <p className="muted" style={{ marginBottom: '16px' }}>Let us know how we are doing! Share your experience with food or printing.</p>
        
        {msg && <div style={{ background: '#dcfce7', color: '#14532d', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontWeight: 'bold' }}>{msg}</div>}
        
        <div className="field">
          <label>Rating</label>
          <div style={{ display: 'flex', gap: '6px', margin: '4px 0 12px 0' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button 
                key={star} 
                onClick={() => setRating(star)} 
                style={{ background: 'transparent', border: 0, padding: 0, cursor: 'pointer' }}
              >
                <Star size={24} fill={star <= rating ? 'var(--amber)' : 'none'} stroke="var(--amber)" />
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Comment</label>
          <textarea 
            value={comment} 
            onChange={e => setComment(e.target.value)} 
            placeholder="Write your review here..."
            style={{ width: '100%', minHeight: '100px', padding: '11px', border: '1px solid var(--line)', borderRadius: '10px', fontFamily: 'inherit' }}
          />
        </div>

        <button className="btn primary" disabled={busy || !comment.trim()} onClick={submit}>
          {busy ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>

      <div className="card">
        <h2>Recent Reviews</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          {reviews.map((r: any) => (
            <div key={r.id} style={{ borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
              <div className="row" style={{ marginBottom: '4px' }}>
                <div>
                  <b>{r.name}</b> <span className="muted" style={{ fontSize: '11px' }}>· {new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} size={14} fill={star <= r.rating ? 'var(--amber)' : 'none'} stroke="var(--amber)" />
                  ))}
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#444' }}>"{r.comment}"</p>
            </div>
          ))}
          {reviews.length === 0 && <p className="muted">No reviews yet. Be the first to leave feedback!</p>}
        </div>
      </div>
    </div>
  );
}
