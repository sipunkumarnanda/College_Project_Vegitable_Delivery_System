
'use client';

import { StarIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { addToCart } from '@/lib/features/cart/cartSlice';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹';

const dispatch = useDispatch();
const router = useRouter();

const { isLoggedIn } = useSelector((state) => state.auth);
const { items: cartItems = [] } = useSelector((state) => state.cart);

// ✅ LOCAL loading per product
const [addingId, setAddingId] = useState(null);

if (!product) return null;

const rating = 4;

const isInCart = cartItems.some(
(item) => item.product?._id === product._id
);

const handleCartClick = async (e) => {
e.preventDefault();

// 🔐 Not logged in
if (!isLoggedIn) {
  toast.error("Please login to add items to cart");
  router.push("/login");
  return;
}

// 🔁 Already in cart
if (isInCart) {
  router.push('/cart');
  return;
}

try {
  setAddingId(product._id); // ✅ only this card

  await dispatch(
    addToCart({
      productId: product._id,
      quantity: 1
    })
  ).unwrap();

  toast.success("Added to cart");
} catch (err) {
  toast.error("Failed to add to cart");
} finally {
  setAddingId(null); // reset
}

};

const imageUrl = product?.image || "";

return ( <div className="w-full max-w-[220px] mx-auto border rounded-xl p-3 bg-white shadow-sm hover:shadow-md transition">

  {/* CLICKABLE AREA */}
  <Link href={`/product/${product._id}`} className="block">

    {/* IMAGE */}
    <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-contain"
        />
      ) : (
        <span className="text-xs text-gray-400">No Image</span>
      )}
    </div>

    {/* CONTENT */}
    <div className="mt-3">
      <p className="text-sm font-medium text-slate-800 truncate">
        {product.name}
      </p>

      <div className="flex items-center gap-1 mt-1">
        {Array(5).fill('').map((_, index) => (
          <StarIcon
            key={index}
            size={14}
            fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"}
          />
        ))}
      </div>

      <p className="mt-1 font-semibold text-green-600">
        {currency}{product.price}
      </p>
    </div>

  </Link>

  {/* BUTTON */}
  <button
    onClick={handleCartClick}
    disabled={addingId === product._id}
    className={`mt-3 w-full py-2 rounded text-white transition ${
      isInCart
        ? "bg-blue-500 hover:bg-blue-600"
        : "bg-green-600 hover:bg-green-700"
    }`}
  >
    {isInCart
      ? "Go to Cart"
      : addingId === product._id
      ? "Adding..."
      : "Add to Cart"}
  </button>

</div>

);
};

export default ProductCard;
