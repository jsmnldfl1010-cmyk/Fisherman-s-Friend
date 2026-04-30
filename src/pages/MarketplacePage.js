import { useMemo, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { useAppData } from '../services/AppDataContext';
import { getFishLegality, getGuidedInputOptions } from '../services/fishingAssistant';

const initialForm = { name: 'Bangus (Milkfish)', category: 'Fish', price: '', seller: '', equipmentType: 'Net', location: 'Sarangani Bay', kilo: '', catchDate: '' };
const initialCheckout = { useCase: 'Permit', item: '', amount: '', method: 'GCash' };

export default function MarketplacePage() {
  const { addProduct, dataSource, error, isLoading, products } = useAppData();
  const [category, setCategory] = useState('All');
  const [form, setForm] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [checkout, setCheckout] = useState(initialCheckout);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [warning, setWarning] = useState('');
  const [chatTarget, setChatTarget] = useState('');
  const options = getGuidedInputOptions('en');

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
      if (form.category === 'Fish') {
        const legality = getFishLegality(form.name, 50);
        if (!legality.legal) {
          setWarning(`Restricted species warning: ${form.name} should not be sold. Recommendation: ${legality.recommendation}.`);
          return;
        }
      }
      const autoPrice = form.category === 'Fish' && form.kilo ? `PHP ${(Number(form.kilo) * 220).toFixed(0)}` : form.price;
      await addProduct({ ...form, price: autoPrice || form.price, seller: `${form.seller} (${form.location})` });
      setForm(initialForm);
      setWarning('');
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
              {options.paymentMethods.map((item) => <option key={item}>{item}</option>)}
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
            <select className="select select-large" name="name" onChange={handleChange} value={form.name}>
              {options.fishSpecies.map((item) => <option key={item.value} value={item.value}>{item.icon} {item.value}</option>)}
            </select>
          </label>
          <label className="field">
            <span className="label">Category</span>
            <select className="select select-large" name="category" onChange={handleChange} value={form.category}>
              <option>Fish</option>
              <option>Supplies</option>
              <option>Equipment</option>
              <option>Services</option>
            </select>
          </label>
          <label className="field">
            <span className="label">Base price</span>
            <input className="input" name="price" onChange={handleChange} required value={form.price} />
          </label>
          <label className="field">
            <span className="label">Fish kilos</span>
            <input className="input" name="kilo" onChange={handleChange} value={form.kilo} />
          </label>
          <label className="field">
            <span className="label">Equipment type</span>
            <select className="select select-large" name="equipmentType" onChange={handleChange} value={form.equipmentType}>
              {options.equipmentTypes.map((item) => <option key={item}>🧰 {item}</option>)}
            </select>
          </label>
          <label className="field">
            <span className="label">Seller</span>
            <input className="input" name="seller" onChange={handleChange} required value={form.seller} />
          </label>
          <label className="field">
            <span className="label">Location</span>
            <select className="select select-large" name="location" onChange={handleChange} value={form.location}>
              {options.locations.map((item) => <option key={item.value}>{item.value}</option>)}
            </select>
          </label>
          <label className="field">
            <span className="label">Catch date</span>
            <input className="input" name="catchDate" onChange={handleChange} type="date" value={form.catchDate} />
          </label>
          <div className="field-full">
            <Button disabled={isSaving} type="submit">{isSaving ? 'Publishing...' : 'Publish listing'}</Button>
          </div>
        </form>
        {warning ? <p className="status-error">{warning}</p> : null}
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
              <Button variant="secondary" type="button" onClick={() => setChatTarget(product.seller)}>Contact</Button>
            </article>
          ))}
        </div>
        {chatTarget ? <p className="card-description">Contact option opened for: {chatTarget}. Use GCash-ready checkout above for payment.</p> : null}
      </Card>
    </div>
  );
}
