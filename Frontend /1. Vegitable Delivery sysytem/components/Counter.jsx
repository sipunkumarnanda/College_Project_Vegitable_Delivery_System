
'use client';

const Counter = ({ quantity, setQuantity }) => {

const increase = () => {
setQuantity(prev => prev + 1);
};

const decrease = () => {
if (quantity <= 1) return;
setQuantity(prev => prev - 1);
};

return ( <div className="flex items-center gap-3 mt-4">

  <button
    onClick={decrease}
    className="px-3 py-1 bg-gray-200 rounded"
  >
    -
  </button>

  <span className="text-lg font-semibold min-w-[20px] text-center">
    {quantity}
  </span>

  <button
    onClick={increase}
    className="px-3 py-1 bg-gray-200 rounded"
  >
    +
  </button>

</div>
);
};

export default Counter;
