import { useMemo, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { useAppData } from '../services/AppDataContext';

const initialForm = { name: '', category: 'Fish', price: '', seller: '' };
const initialCheckout = { useCase: 'Permit', item: '', amount: '', method: 'GCash' };

export default function MarketplacePage() {
  const { addProduct, dataSource, error, isLoading, products } = useAppData();
  const [category, setCategory] = useState('All');
  const [form, setForm] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [checkout, setCheckout] = useState(initialCheckout);
  const [paymentStatus, setPaymentStatus] = useState('');

  const filteredProducts = useMemo(
    () => (category === 'All' ? products : products.filter((product) => product.category === category)),
    [category, products]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await addProduct(form);
      setForm(initialForm);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCheckoutChange = (event) => {
    const { name, value } = event.target;
    setCheckout((current) => ({ ...current, [name]: value }));
  };

  const handleCheckout = (event) => {
    event.preventDefault();
    setPaymentStatus(`Paid ${checkout.amount || '0'} via ${checkout.method} for ${checkout.useCase}. Receipt token: PAY-${Date.now()}.`);
    setCheckout(initialCheckout);
  };

  return (
    <div className="page-grid">
      <Card>
        <CardHeader title="Secure in-app e-payment" description="Pay for permits, guided trips, and local gear/bait with common methods." />
        <form className="form-grid" onSubmit={handleCheckout}>
          <label className="field">
            <span className="label">Use case</span>
            <select className="select" name="useCase" onChange={handleCheckoutChange} value={checkout.useCase}>
              <option>Permit</option>
              <option>Guided trip</option>
              <option>Gear/Bait</option>
            </select>
          </label>
          <label className="field">
            <span className="label">Item / Vendor</span>
            <input className="input" name="item" onChange={handleCheckoutChange} required value={checkout.item} />
          </label>
          <label className="field">
            <span className="label">Amount</span>
            <input className="input" name="amount" onChange={handleCheckoutChange} required value={checkout.amount} />
          </label>
          <label className="field">
            <span className="label">Payment method</span>
            <select className="select" name="method" onChange={handleCheckoutChange} value={checkout.method}>
              <option>GCash</option>
              <option>Maya</option>
              <option>Credit/Debit Card</option>
              <option>Online Banking</option>
            </select>
          </label>
          <div className="field-full">
            <Button type="submit">Confirm payment</Button>
          </div>
        </form>
        {paymentStatus ? <p className="card-description">{paymentStatus}</p> : null}
      </Card>

      <Card>
        <CardHeader title="Create listing" description="Post catch, equipment, or supplies into Supabase for nearby buyers." />
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field">
            <span className="label">Item name</span>
            <input className="input" name="name" onChange={handleChange} required value={form.name} />
          </label>
          <label className="field">
            <span className="label">Category</span>
            <select className="select" name="category" onChange={handleChange} value={form.category}>
              <option>Fish</option>
              <option>Supplies</option>
              <option>Equipment</option>
              <option>Services</option>
            </select>
          </label>
          <label className="field">
            <span className="label">Price</span>
            <input className="input" name="price" onChange={handleChange} required value={form.price} />
          </label>
          <label className="field">
            <span className="label">Seller</span>
            <input className="input" name="seller" onChange={handleChange} required value={form.seller} />
          </label>
          <div className="field-full">
            <Button disabled={isSaving} type="submit">{isSaving ? 'Publishing...' : 'Publish listing'}</Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader
          title="Marketplace"
          description={`Listings are stored in ${dataSource}.`}
          action={
            <select aria-label="Filter marketplace category" className="select" onChange={(event) => setCategory(event.target.value)} value={category}>
              <option>All</option>
              <option>Fish</option>
              <option>Supplies</option>
              <option>Equipment</option>
              <option>Services</option>
            </select>
          }
        />
        {error ? <p className="status-error">{error}</p> : null}
        {isLoading ? <p className="card-description">Loading marketplace from Supabase...</p> : null}
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <article className="card product-card" key={product.id}>
              <div className="product-image" aria-hidden="true">{product.icon}</div>
              <div>
                <p className="list-item-title">{product.name}</p>
                <p className="list-item-meta">{product.seller}</p>
              </div>
              <div className="list-item-meta">
                <span className="badge badge-success">{product.category}</span>
              </div>
              <strong>{product.price}</strong>
            </article>
          ))}
        </div>
      </Card>
    </div>
  );
}
