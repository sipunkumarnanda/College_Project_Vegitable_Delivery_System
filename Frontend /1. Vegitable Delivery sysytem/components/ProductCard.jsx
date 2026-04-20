

'use client';

import { StarIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { addToCart } from '@/lib/features/cart/cartSlice';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {

const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹';

const dispatch = useDispatch();
const router = useRouter();
const { isLoggedIn } = useSelector((state) => state.auth);

const { items: cartItems = [], loading } = useSelector(
(state) => state.cart
);

if (!product) return null;

const rating = 4;

const isInCart = cartItems.some(
(item) => item.product?._id === product._id
);

const handleCartClick = async (e) => {
  e.preventDefault();

  // 🔥 NOT LOGGED IN → toast + redirect
  if (!isLoggedIn) {
    toast.error("Please login to add items to cart");
    router.push("/login");
    return;
  }

  // ✅ already in cart
  if (isInCart) {
    router.push('/cart');
    return;
  }

  // ✅ add to cart
  try {
    await dispatch(
      addToCart({
        productId: product._id,
        quantity: 1
      })
    ).unwrap();

    // ✅ success toast
    toast.success("Added to cart");
  } catch (err) {
    toast.error("Failed to add to cart");
  }
};

return ( <div className="w-full max-w-[220px] mx-auto border rounded-xl p-3 bg-white shadow-sm hover:shadow-md transition">

  {/* CLICKABLE AREA */}
  <Link href={`/product/${product._id}`} className="block">

    {/* IMAGE FIX */}
    <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
      <Image
        src={product.image || "/placeholder.png"}
        alt={product.name}
        width={200}
        height={150}
        className="object-contain w-full h-full"
      />
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
    disabled={loading}
    className={`mt-3 w-full py-2 rounded text-white transition ${
      isInCart
        ? "bg-blue-500 hover:bg-blue-600"
        : "bg-green-600 hover:bg-green-700"
    }`}
  >
    {isInCart ? "Go to Cart" : loading ? "Adding..." : "Add to Cart"}
  </button>

</div>

);
};

export default ProductCard;
