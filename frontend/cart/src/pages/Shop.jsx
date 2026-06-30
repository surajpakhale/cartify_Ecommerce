import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import '../styles/product.css';
import api, { normalizeArray } from '../utils/api';
const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

   useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        const list = normalizeArray(res.data);
        setProducts(list);
      } catch (error) {
        console.error('Error:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);
  const filteredProducts = Array.isArray(products)
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div className="shop-container">
      <h2>All Products</h2>
      <input 
        type="text" 
        placeholder="Search products..." 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-bar"
      />
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
