'use client';
import { useEffect,useState } from 'react';
import Link from 'next/link';
import { Utensils, Printer, Plus, Minus, LogOut, Clock } from 'lucide-react';
import AuthForm from './AuthForm';
type Product={id:string;name:string;price:number;emoji?:string|null}; type Order={id:string;ticketCode:string;type:string;status:string;total:number;items?:any[];printJob?:any;payment?:any};
export default function CustomerApp(){const [user,setUser]=useState<any>(undefined);const [tab,setTab]=useState<'food'|'print'|'orders'>('food');const [products,setProducts]=useState<Product[]>([]);const [cart,setCart]=useState<Record<string,number>>({});const [orders,setOrders]=useState<Order[]>([]);const [message,setMessage]=useState('');
 useEffect(()=>{fetch('/api/auth/me').then(r=>r.json()).then(d=>setUser(d.user));fetch('/api/products').then(r=>r.json()).then(d=>setProducts(d.products||[]));},[]); useEffect(()=>{if(user)refresh();},[user]); async function refresh(){const r=await fetch('/api/orders');setOrders((await r.json()).orders||[])}
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
                <a href="#features" className="btn" style={{ background: '#e4dcc8', color: 'var(--ink)', textDecoration: 'none', padding: '12px 24px', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold' }}>
                  Explore Features
                </a>
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
 return <main className="shell"><nav className="nav"><div className="brand">Campus Hub</div><div><span>{user.name}</span><button onClick={logout} style={{marginLeft:12,background:'transparent',border:0,color:'white'}}><LogOut size={16}/></button></div></nav><div className="container"><div className="tabs"><button className={tab==='food'?'active':''} onClick={()=>setTab('food')}><Utensils size={15}/> Food</button><button className={tab==='print'?'active':''} onClick={()=>setTab('print')}><Printer size={15}/> Printing</button><button className={tab==='orders'?'active':''} onClick={()=>setTab('orders')}>My orders</button></div>{message&&<div className="card" style={{marginBottom:12}}>{message}</div>}
 {tab==='food'&&<div className="card"><h2>Today's menu</h2>{products.map(p=><div className="item" key={p.id}><div><b>{p.emoji} {p.name}</b><div className="muted">KES {p.price}</div></div><div style={{display:'flex',alignItems:'center',gap:8}}><button className="btn" onClick={()=>setCart(c=>({...c,[p.id]:Math.max(0,(c[p.id]||0)-1)}))}><Minus size={15}/></button><b>{cart[p.id]||0}</b><button className="btn primary" onClick={()=>setCart(c=>({...c,[p.id]:(c[p.id]||0)+1}))}><Plus size={15}/></button></div></div>)}<div className="row" style={{marginTop:16}}><b>Total: KES {products.reduce((s,p)=>s+p.price*(cart[p.id]||0),0)}</b><button className="btn primary" disabled={!Object.values(cart).some(Boolean)} onClick={createFood}>Place food order</button></div></div>}
 {tab==='print'&&<PrintForm onCreated={(msg)=>{setMessage(msg);setTab('orders');refresh()}}/>}
 {tab==='orders'&&<div className="grid">{orders.map(o=><div className="card" key={o.id}><div className="row"><b>{o.ticketCode}</b><span className="pill">{o.status}</span></div><p>{o.type==='FOOD'?o.items?.map(i=>`${i.quantity}× ${i.product.name}`).join(', '):`${o.printJob?.pages} pages · ${o.printJob?.color==='COLOR'?'Colour':'B/W'} · ${o.printJob?.binding}`}</p><b>KES {o.total}</b>{['PENDING','PAYMENT_PENDING','FAILED'].includes(o.status)&&<button className="btn primary" style={{display:'block',marginTop:12}} onClick={()=>pay(o)}>Pay with M-Pesa</button>}{o.status==='READY'&&<p className="muted"><Clock size={14}/> Ready for pickup</p>}<Link href={`/order/${o.id}`}>View tracking</Link></div>)}{orders.length===0&&<div className="card">No orders yet.</div>}</div>}
 </div></main>}
function PrintForm({onCreated}:{onCreated:(m:string)=>void}){const [file,setFile]=useState<File|null>(null);const [pages,setPages]=useState(10);const [color,setColor]=useState<'BW'|'COLOR'>('BW');const [binding,setBinding]=useState<'NONE'|'SPIRAL'|'STAPLE'>('NONE');const [busy,setBusy]=useState(false);async function submit(){if(!file)return;setBusy(true);try{const p=await fetch('/api/print/presign',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fileName:file.name,contentType:file.type,size:file.size})}).then(r=>r.json());if(!p.url)throw new Error(p.error);await fetch(p.url,{method:'PUT',headers:{'Content-Type':file.type},body:file});const r=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'PRINT',fileKey:p.key,fileName:file.name,mimeType:file.type,pages,color,binding})});const d=await r.json();if(!r.ok)throw new Error(d.error);onCreated(`Print order ${d.order.ticketCode} created. Pay to confirm.`)}catch(e){onCreated(e instanceof Error?e.message:'Unable to create print order')}finally{setBusy(false)}}return <div className="card"><h2>Print & binding</h2><div className="field"><label>PDF or Word file</label><input type="file" accept=".pdf,.doc,.docx" onChange={e=>setFile(e.target.files?.[0]||null)}/></div><div className="field"><label>Pages</label><select value={pages} onChange={e=>setPages(Number(e.target.value))}>{[10,25,50].map(x=><option key={x}>{x}</option>)}</select></div><div className="field"><label>Colour</label><select value={color} onChange={e=>setColor(e.target.value as any)}><option value="BW">Black & white — KES 5/page</option><option value="COLOR">Colour — KES 20/page</option></select></div><div className="field"><label>Binding</label><select value={binding} onChange={e=>setBinding(e.target.value as any)}><option value="NONE">No binding — Free</option><option value="SPIRAL">Spiral — KES 100</option><option value="STAPLE">Staple — KES 20</option></select></div><button className="btn primary" disabled={!file||busy} onClick={submit}>{busy?'Uploading…':'Create print order'}</button></div>}
