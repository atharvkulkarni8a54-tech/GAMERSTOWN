
import { useMemo, useRef, useState } from "react";
import "./FoodDrinkCatalog.css";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
};

const starterCategories = ["Pizza", "Burgers", "Snacks", "Cold Drinks"];

export default function FoodDrinkCatalog() {
  const [categories, setCategories] = useState(starterCategories);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState(starterCategories[0]);
  const [price, setPrice] = useState("0");
  const [stock, setStock] = useState("0");
  const [image, setImage] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [discount, setDiscount] = useState("2");
  const fileRef = useRef<HTMLInputElement>(null);

  const visibleProducts = useMemo(
    () => products.filter(p =>
      (activeCategory === "All" || p.category === activeCategory) &&
      p.name.toLowerCase().includes(search.toLowerCase())
    ),
    [products, activeCategory, search]
  );

  const comboProducts = products.filter(p => selected.includes(p.id));
  const comboTotal = comboProducts.reduce((sum, p) => sum + p.price, 0);
  const comboDiscount = Math.max(0, Number(discount) || 0);
  const comboFinal = Math.max(0, comboTotal - comboDiscount);

  function addCategory() {
    const value = categoryName.trim();
    if (!value || categories.some(c => c.toLowerCase() === value.toLowerCase())) return;
    setCategories(old => [...old, value]);
    setCategory(value);
    setCategoryName("");
    setShowCategoryForm(false);
  }

  function addProduct() {
    if (!name.trim() || !category || Number(price) < 0 || Number(stock) < 0) return;
    setProducts(old => [...old, {
      id: Date.now(),
      name: name.trim(),
      category,
      price: Number(price),
      stock: Number(stock),
      image
    }]);
    setName("");
    setPrice("0");
    setStock("0");
    setImage("");
    setShowProductForm(false);
  }

  function uploadImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Please choose an image smaller than 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  function toggleProduct(id: number) {
    setSelected(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id]);
  }

  function deleteProduct(id: number) {
    setProducts(old => old.filter(p => p.id !== id));
    setSelected(old => old.filter(x => x !== id));
  }

  return (
    <div className="fdc">
      <div className="fdc-heading">
        <div>
          <span className="fdc-kicker">GAMERSTOWN / COUNTER MENU</span>
          <h2>Food & Drinks</h2>
          <p>Manage your menu, product photos, prices and combos.</p>
        </div>
        <button className="fdc-primary" onClick={() => setShowProductForm(true)}>＋ Add product</button>
      </div>

      <div className="fdc-top-stats">
        <div><span>PRODUCTS</span><strong>{products.length}</strong></div>
        <div><span>CATEGORIES</span><strong>{categories.length}</strong></div>
        <div><span>LOW STOCK</span><strong>{products.filter(p => p.stock <= 5).length}</strong></div>
      </div>

      <section className="fdc-combo">
        <div className="fdc-combo-intro">
          <span className="fdc-combo-icon">✦</span>
          <div>
            <h3>Build a combo deal</h3>
            <p>Select products to create a bundle for your customers.</p>
          </div>
          <span className="fdc-discount-tag">COMBO OFFER</span>
        </div>

        <div className="fdc-combo-selection">
          <div>
            <label>Choose products</label>
            <div className="fdc-mini-products">
              {products.map(p => (
                <button
                  key={p.id}
                  className={`fdc-mini-product ${selected.includes(p.id) ? "chosen" : ""}`}
                  onClick={() => toggleProduct(p.id)}
                >
                  <span className="fdc-mini-image">
                    {p.image ? <img src={p.image} alt="" /> : "＋"}
                  </span>
                  <span className="fdc-mini-name">{p.name}<small>₹{p.price}</small></span>
                  <span className="fdc-check">{selected.includes(p.id) ? "✓" : ""}</span>
                </button>
              ))}
              {products.length === 0 && <p className="fdc-empty">Add products to start building combos.</p>}
            </div>
          </div>

          <div className="fdc-combo-total">
            <div><span>Selected items</span><strong>{comboProducts.length}</strong></div>
            {comboProducts.map(p => <div key={p.id}><span>{p.name}</span><strong>₹{p.price}</strong></div>)}
            <div><span>Discount (₹)</span>
              <input type="number" min="0" value={discount} onChange={e => setDiscount(e.target.value)} />
            </div>
            <div className="fdc-total-line"><span>Combo total</span><strong>₹{comboFinal.toFixed(2)}</strong></div>
          </div>
        </div>
        <p className="fdc-combo-note">This is a combo preview. It does not yet create a saved offer or counter transaction.</p>
      </section>

      <section className="fdc-menu">
        <div className="fdc-menu-heading">
          <div><h3>Product menu</h3><p>Your food and beverage catalogue</p></div>
          <button className="fdc-secondary" onClick={() => setShowCategoryForm(true)}>＋ Add category</button>
        </div>

        <div className="fdc-toolbar">
          <div className="fdc-categories">
            {["All", ...categories].map(c => (
              <button key={c} className={activeCategory === c ? "active" : ""} onClick={() => setActiveCategory(c)}>{c}</button>
            ))}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." />
        </div>

        <div className="fdc-products">
          {visibleProducts.map(p => (
            <article className="fdc-product" key={p.id}>
              <div className="fdc-product-photo">
                {p.image ? <img src={p.image} alt={p.name} /> : <span>PHOTO</span>}
                <button className="fdc-delete" onClick={() => deleteProduct(p.id)} title="Delete product">×</button>
              </div>
              <div className="fdc-product-info">
                <span>{p.category}</span>
                <h4>{p.name}</h4>
                <div><strong>₹{p.price.toFixed(2)}</strong><small>{p.stock} in stock</small></div>
              </div>
            </article>
          ))}
          {visibleProducts.length === 0 && (
            <div className="fdc-empty-state">
              <span>＋</span>
              <h3>No products here yet</h3>
              <p>Add your first product and upload its photo.</p>
              <button className="fdc-primary" onClick={() => setShowProductForm(true)}>Add a product</button>
            </div>
          )}
        </div>
      </section>

      {showProductForm && (
        <div className="fdc-overlay" onClick={() => setShowProductForm(false)}>
          <div className="fdc-modal" onClick={e => e.stopPropagation()}>
            <button className="fdc-modal-close" onClick={() => setShowProductForm(false)}>×</button>
            <h3>Add a product</h3>
            <p>Add its photo, category, price and available stock.</p>

            <label className="fdc-upload" onClick={() => fileRef.current?.click()}>
              {image ? <img src={image} alt="Product preview" /> : <><b>＋</b><span>Upload product photo</span><small>JPG, PNG or WEBP · Max 5 MB</small></>}
            </label>
            <input ref={fileRef} hidden type="file" accept="image/*" onChange={e => uploadImage(e.target.files?.[0])} />

            <label>Product name<input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Pepperoni Pizza" /></label>
            <label>Category
              <select value={category} onChange={e => setCategory(e.target.value)}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </label>
            <div className="fdc-form-row">
              <label>Selling price (₹)<input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} /></label>
              <label>Stock quantity<input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} /></label>
            </div>
            <button className="fdc-primary fdc-save" onClick={addProduct}>Save product</button>
          </div>
        </div>
      )}

      {showCategoryForm && (
        <div className="fdc-overlay" onClick={() => setShowCategoryForm(false)}>
          <div className="fdc-modal fdc-category-modal" onClick={e => e.stopPropagation()}>
            <button className="fdc-modal-close" onClick={() => setShowCategoryForm(false)}>×</button>
            <h3>Create a category</h3>
            <p>Examples: Pizza, Cold Drinks, Burgers or Desserts.</p>
            <label>Category name<input autoFocus value={categoryName} onChange={e => setCategoryName(e.target.value)} placeholder="Enter category name" /></label>
            <button className="fdc-primary fdc-save" onClick={addCategory}>Create category</button>
          </div>
        </div>
      )}
    </div>
  );
}
