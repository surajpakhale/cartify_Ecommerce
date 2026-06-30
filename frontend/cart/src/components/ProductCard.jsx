import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/product.css';

const ProductCard = ({ product }) => {
  const imageSrc = product?.imageUrl || product?.image || '/fallback-product.png';
  const productId = product?._id || product?.id;
  const price = typeof product?.price === 'number' ? product.price : Number(product?.price) || 0;

  return (
    <div className="product-card">
      <img src={imageSrc} alt={product?.name || 'Product'} className="product-image" />
      <div className="product-info">
        <h3>{product?.name}</h3>
        <p className="price">₹{price.toFixed(2)}</p>
        <Link to={`/product/${productId}`} className="btn">View Details</Link>
      </div>
    </div>
  );
};

export default ProductCard;
