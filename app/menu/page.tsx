'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Utensils, Award, ArrowLeft, ArrowRight, ShoppingCart, Percent } from 'lucide-react';

export default function MenuPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(d => {
        setProducts(d.products || []);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const foodSlugs = ['chips', 'sausage', 'smokie', 'burger', 'pizza', 'samosa', 'chapati'];
  const drinkSlugs = ['soda', 'coffee', 'juice', 'water'];
  
  const foods = products.filter(p => foodSlugs.includes(p.slug));
  const drinks = products.filter(p => drinkSlugs.includes(p.slug));

  const promotions = [
    { title: "Student Combo Deal", desc: "Burger 🍔 + Cold Soda 🥤", original: 320, price: 290, discount: "Save KES 30" },
    { title: "Quick Snack Deal", desc: "Chips 🍟 + Smokie 🌯", original: 150, price: 135, discount: "10% OFF" },
    { title: "Midday Coffee Boost", desc: "Coffee ☕ + Chapati 🥞", original: 100, price: 85, discount: "Save KES 15" }
  ];

  return (
    <main className="shell">
      {/* Styles */}
      <style>{`
        .menu-header {
          background: #1c3d2f;
          color: white;
          padding: 40px 24px;
          text-align: center;
          border-bottom: 5px solid var(--amber);
        }
        .section-title {
          font-family: 'Space Grotesk';
          font-weight: 700;
          font-size: 26px;
          margin-bottom: 24px;
          color: var(--green-dark);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .promo-card {
          background: linear-gradient(135deg, #1c3d2f, #2f7a5c);
          color: white;
          border-radius: 16px;
          padding: 24px;
          border: 0;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(28, 61, 47, 0.15);
        }
        .promo-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          background: var(--amber);
          color: var(--ink);
          padding: 4px 10px;
          font-weight: bold;
          border-radius: 8px;
          font-size: 12px;
        }
        .item-card {
          background: white;
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
          transition: all 0.2s;
        }
        .item-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.05);
        }
      `}</style>

      {/* Header */}
      <header className="menu-header">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <Link href="/" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </Link>
            <div style={{ fontWeight: 'bold', fontFamily: 'Space Grotesk' }}>CAMPUS KIOSK</div>
          </div>
          <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '40px', margin: '0 0 12px 0' }}>Today's Menu</h1>
          <p style={{ margin: 0, opacity: 0.85, fontSize: '16px' }}>
            Active cafeteria catalogue prices and special discounts for {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}.
          </p>
        </div>
      </header>

      <div className="container" style={{ maxWidth: '900px', paddingTop: '40px', paddingBottom: '60px' }}>
        
        {/* Special Promotions / Discounts Section */}
        <section style={{ marginBottom: '48px' }}>
          <h2 className="section-title">
            <Percent size={22} style={{ color: 'var(--amber)' }} />
            <span>Today's Special Discounts & Combos</span>
          </h2>
          <div className="grid">
            {promotions.map((p, idx) => (
              <div className="promo-card" key={idx}>
                <span className="promo-badge">{p.discount}</span>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>{p.title}</h3>
                <p style={{ margin: '0 0 16px 0', opacity: 0.85, fontSize: '14px' }}>{p.desc}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--amber)' }}>KES {p.price}</span>
                  <span style={{ fontSize: '14px', textDecoration: 'line-through', opacity: 0.6 }}>KES {p.original}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Categories Section */}
        <section style={{ marginBottom: '40px' }}>
          <h2 className="section-title">
            <Utensils size={22} style={{ color: 'var(--green-dark)' }} />
            <span>Meals & Snacks</span>
          </h2>
          
          {loading ? (
            <div>Loading menu...</div>
          ) : (
            <div className="grid">
              {foods.map(item => (
                <div className="item-card" key={item.id}>
                  <div style={{ fontSize: '28px', background: '#fafaf9', width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)' }}>
                    {item.emoji || '🍔'}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold' }}>{item.name}</h4>
                    <span style={{ background: '#dcfce7', color: '#14532d', fontSize: '13px', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                      KES {item.price}
                    </span>
                  </div>
                </div>
              ))}
              {foods.length === 0 && <div className="muted">No meals available today.</div>}
            </div>
          )}
        </section>

        <section style={{ marginBottom: '48px' }}>
          <h2 className="section-title">
            <Award size={22} style={{ color: 'var(--green-dark)' }} />
            <span>Beverages & Drinks</span>
          </h2>
          
          {loading ? (
            <div>Loading menu...</div>
          ) : (
            <div className="grid">
              {drinks.map(item => (
                <div className="item-card" key={item.id}>
                  <div style={{ fontSize: '28px', background: '#fafaf9', width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)' }}>
                    {item.emoji || '🥤'}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold' }}>{item.name}</h4>
                    <span style={{ background: '#dcfce7', color: '#14532d', fontSize: '13px', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                      KES {item.price}
                    </span>
                  </div>
                </div>
              ))}
              {drinks.length === 0 && <div className="muted">No drinks available today.</div>}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <div className="card" style={{ background: '#faf6ee', border: '1px solid var(--line)', padding: '32px', textAlign: 'center', borderRadius: '24px' }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '24px', margin: '0 0 8px 0' }}>Ready to Skip the Line?</h2>
          <p className="muted" style={{ maxWidth: '500px', margin: '0 auto 24px' }}>
            Place your food or drink order directly from your mobile phone, pay securely with M-Pesa, and pick it up when ready.
          </p>
          <Link href="/" className="btn primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px' }}>
            <ShoppingCart size={18} />
            <span>Order Now</span>
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </main>
  );
}
