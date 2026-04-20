
'use client';

import { addToCart } from "@/lib/features/cart/cartSlice";
import { StarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import Counter from "./Counter";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast"; // ✅ ADD

const ProductDetails = ({ product }) => {

  if (!product) return null;

  const productId = product._id;
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹';

  const dispatch = useDispatch();
  const router = useRouter();

  // ✅ AUTH
  const { isLoggedIn } = useSelector((state) => state.auth);

  // ✅ CART
  const cartItems = useSelector(state => state.cart.items || []);
  const loading = useSelector(state => state.cart.loading);

  const existingItem = cartItems.find(
    item => item.product?._id === productId
  );

  const [quantity, setQuantity] = useState(1);

  // ✅ Sync with cart
  useEffect(() => {
    if (existingItem) {
      setQuantity(existingItem.quantity);
    }
  }, [existingItem]);

  // 🔥 UPDATED HANDLER WITH TOAST
  const handleCartClick = async () => {

    // 🔐 LOGIN CHECK
    if (!isLoggedIn) {
      toast.error("Please login to add items");

      setTimeout(() => {
        router.push("/login");
      }, 800);

      return;
    }

    // ✅ already in cart
    if (existingItem) {
      router.push('/cart');
      return;
    }

    // ✅ add to cart
    try {
      await dispatch(addToCart({
        productId,
        quantity
      })).unwrap();

      toast.success(`${product.name} added to cart 🛒`);
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  const images = product.images?.length
    ? product.images
    : [product.image || "/placeholder.png"];

  const [mainImage, setMainImage] = useState(images[0]);

  const isInCart = !!existingItem;

  const averageRating = product.rating?.length
    ? product.rating.reduce((acc, item) => acc + item.rating, 0) / product.rating.length
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      <div className="flex flex-col lg:flex-row gap-12">

        {/* IMAGES */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-3">
            {images.map((img, index) => (
              <div key={index} onClick={() => setMainImage(img)}>
                <Image src={img} width={60} height={60} alt="thumb" />
              </div>
            ))}
          </div>

          <Image
            src={mainImage}
            width={350}
            height={350}
            alt={product.name}
          />
        </div>

        {/* DETAILS */}
        <div>

          <h1 className="text-3xl font-semibold">{product.name}</h1>

          <div className="flex mt-2">
            {Array(5).fill('').map((_, i) => (
              <StarIcon
                key={i}
                fill={averageRating >= i + 1 ? "#00C950" : "#ccc"}
              />
            ))}
          </div>

          <p className="text-2xl text-green-600 mt-3">
            {currency}{product.price}
          </p>

          <p className="mt-4 text-gray-600">
            {product.description}
          </p>

          {/* COUNTER */}
          <Counter
            quantity={quantity}
            setQuantity={setQuantity}
          />

          {/* BUTTON */}
          <button
            onClick={handleCartClick}
            disabled={loading}
            className={`mt-6 px-6 py-3 rounded text-white ${
              isInCart ? "bg-blue-500" : "bg-green-600"
            }`}
          >
            {isInCart
              ? "Go to Cart"
              : loading
              ? "Adding..."
              : "Add to Cart"}
          </button>

        </div>

      </div>

    </div>
  );
};

export default ProductDetails;