import { useMemo, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { useAppData } from '../services/AppDataContext';

const initialForm = { name: '', category: 'Fish', price: '', seller: '' };

export default function MarketplacePage() {
  const { addProduct, dataSource, error, isLoading, products } = useAppData();
  const [category, setCategory] = useState('All');
  const [form, setForm] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);

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

  return (
    <div className="page-grid">
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
