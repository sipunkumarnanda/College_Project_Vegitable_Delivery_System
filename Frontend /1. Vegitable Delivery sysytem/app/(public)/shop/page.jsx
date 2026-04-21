
'use client'

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast"; // ✅ ADD

import { fetchProducts } from "@/lib/features/product/productSlice";
import { addToCart } from "@/lib/features/cart/cartSlice";

const ShopPage = () => {

  const dispatch = useDispatch();
  const router = useRouter();

  // ✅ PRODUCTS
  const {
    items: products = [],
    loading = false,
    error = null
  } = useSelector((state) => state.product || {});

  // ✅ CART
  const {
    items: cartItems = [],
    loading: cartLoading
  } = useSelector((state) => state.cart);

  // ✅ AUTH
  const { isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleCartClick = async (e, product, isInCart) => {
    e.preventDefault();

    // 🔥 NOT LOGGED IN
    if (!isLoggedIn) {
      toast.error("Please login to add items");

      setTimeout(() => {
        router.push("/login");
      }, 800);

      return;
    }

    // ✅ already in cart
    if (isInCart) {
      router.push("/cart");
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

      // 🔥 SUCCESS TOAST with product name
      toast.success(`${product.name} added to cart 🛒`);
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  if (loading) return <div className="p-6">Loading products...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">

      <h2 className="text-2xl font-semibold mb-6">
        Shop Products
      </h2>

      {/* GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">

        {products.map((product) => {

          const imageUrl =
            product?.image && product.image.startsWith("http")
              ? product.image
              : "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600";

          const isInCart = cartItems.some(
            (item) => item.product?._id === product._id
          );

          return (
            <div
              key={product._id}
              className="border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition"
            >

              {/* PRODUCT LINK */}
              <Link href={`/product/${product._id}`}>

                <div className="w-full h-40 bg-gray-100 flex items-center justify-center rounded-md overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    width={200}
                    height={150}
                    className="object-contain h-full w-full"
                  />
                </div>

                <div className="mt-3">
                  <h3 className="text-sm font-medium text-gray-800 line-clamp-1">
                    {product.name}
                  </h3>

                  <p className="font-semibold text-green-600 mt-1">
                    ₹{product.price}
                  </p>
                </div>

              </Link>

              {/* BUTTON */}
              <button
                onClick={(e) =>
                  handleCartClick(e, product, isInCart)
                }
                disabled={cartLoading}
                className={`mt-3 w-full py-2 rounded text-white transition ${
                  isInCart
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isInCart
                  ? "Go to Cart"
                  : cartLoading
                  ? "Adding..."
                  : "Add to Cart"}
              </button>

            </div>
          );
        })}

      </div>
    </div>
  );
};

export default ShopPage;