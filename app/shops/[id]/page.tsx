"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Flame, Droplet, MapPin, Clock, Phone, Map, Navigation } from "lucide-react";

type Shop = {
  id: string;
  name: string;
  address: string;
  phone: string;
  isOpen: boolean;
  brands: string;
  stocks: Array<{ gasItem: any, quantity: number, id: string }>;
};

export default function ShopDetailsPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const brandFilter = searchParams.get("brand");
  
  const { data: session } = useSession();
  const router = useRouter();
  
  const [shop, setShop] = useState<Shop | null>(null);
  const [filteredStocks, setFilteredStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Cart/Order state
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [isDelivery, setIsDelivery] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  
  // Simulated Map State
  const [showMap, setShowMap] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);

  useEffect(() => {
    fetch(`/api/shops/detail/${id}`)
      .then(res => res.json())
      .then(data => {
        setShop(data);
        if (data.stocks) {
           if (brandFilter) {
              setFilteredStocks(data.stocks.filter((s: any) => s.gasItem.brand === brandFilter));
           } else {
              setFilteredStocks(data.stocks);
           }
        }
        setLoading(false);
      });
  }, [id, brandFilter]);

  if (loading) return <div className="p-10 text-center">Loading shop details...</div>;
  if (!shop) return <div className="p-10 text-center">Shop not found</div>;

  const isLaugfs = shop.brands === "LAUGFS" || shop.brands === "BOTH";
  const isLitro = shop.brands === "LITRO" || shop.brands === "BOTH";
  
  const themeColor = isLaugfs && !isLitro ? "yellow" : "blue";
  
  const handleQuantity = (itemId: string, delta: number, max: number) => {
     setCart(prev => {
        const current = prev[itemId] || 0;
        const next = Math.max(0, Math.min(max, current + delta));
        return { ...prev, [itemId]: next };
     });
  };

  const calculateTotal = () => {
    let total = 0;
    filteredStocks.forEach(stock => {
      const q = cart[stock.gasItem.id] || 0;
      total += q * stock.gasItem.price;
    });
    return total + deliveryFee;
  };

  const totalItems = Object.values(cart).reduce((a,b) => a+b, 0);

  const handleSimulateDelivery = () => {
     setShowMap(true);
     // Simulate distance calculation (random fee between Rs 300 and Rs 1500)
     setDeliveryFee(Math.floor(Math.random() * 1200) + 300);
  };

  const handleCheckout = async () => {
    if (!session) {
      router.push(`/login?redirect=/shops/${id}`);
      return;
    }

    if (totalItems === 0) return alert("Please add items to cart");
    if (isDelivery && !deliveryAddress) return alert("Please provide a delivery address");

    const orderData = {
      shopId: shop.id,
      isDelivery,
      deliveryAddress,
      deliveryFee,
      items: Object.entries(cart)
        .filter(([_, q]) => q > 0)
        .map(([id, q]) => ({ id, quantity: q }))
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) throw new Error("Checkout failed");
      const { orderId } = await res.json();
      
      router.push(`/orders/${orderId}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className={`bg-${themeColor}-600 py-8 px-4 sm:px-6 shadow-md text-white`}>
        <div className="max-w-4xl mx-auto">
           <Link href="/" className="text-white/80 hover:text-white mb-6 inline-block font-medium">&larr; Back to Shops</Link>
           <h1 className="text-3xl font-extrabold">{shop.name}</h1>
           <p className="mt-2 text-white/90 flex items-center"><MapPin className="h-4 w-4 mr-1" /> {shop.address}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column - Shop Products */}
        <div className="md:col-span-2 space-y-6">
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
                Purchase Cylinders
              </h2>
              
              <div className="space-y-4">
                 {filteredStocks.map(stock => {
                    const item = stock.gasItem;
                    const q = cart[item.id] || 0;
                    return (
                       <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-gray-50">
                          <div>
                             <div className="flex items-center space-x-2">
                               {item.brand === "LAUGFS" ? <Flame className="h-5 w-5 text-yellow-500" /> : <Droplet className="h-5 w-5 text-blue-500" />}
                               <span className="font-bold text-lg text-gray-900">{item.brand} {item.weight}</span>
                             </div>
                             <p className="text-gray-600 mt-1 font-medium">Rs. {item.price.toFixed(2)}</p>
                             <p className="text-xs text-gray-500 mt-1">{stock.quantity} available in stock</p>
                          </div>
                          
                          <div className="mt-4 sm:mt-0 flex items-center space-x-3 bg-white border border-gray-300 rounded-lg p-1">
                             <button 
                                onClick={() => handleQuantity(item.id, -1, stock.quantity)}
                                className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 font-bold hover:bg-gray-200 active:bg-gray-300 text-gray-700 disabled:opacity-50"
                                disabled={q <= 0}
                             >-</button>
                             <span className="w-8 text-center font-bold text-gray-900">{q}</span>
                             <button 
                                onClick={() => handleQuantity(item.id, 1, stock.quantity)}
                                className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 font-bold hover:bg-gray-200 active:bg-gray-300 text-gray-700 disabled:opacity-50"
                                disabled={q >= stock.quantity}
                             >+</button>
                          </div>
                       </div>
                    );
                 })}
                 {filteredStocks.length === 0 && <p className="text-gray-500">No stock available matching this brand.</p>}
              </div>
           </div>

           {/* Delivery Option */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Delivery Method</h2>
              
              <div className="flex space-x-4 mb-6">
                 <button 
                   onClick={() => setIsDelivery(false)}
                   className={`flex-1 py-3 px-4 rounded-lg font-medium border-2 transition-all ${!isDelivery ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                 >Pick Up</button>
                 <button 
                   onClick={() => setIsDelivery(true)}
                   className={`flex-1 py-3 px-4 rounded-lg font-medium border-2 transition-all ${isDelivery ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                 >Delivery</button>
              </div>

              {isDelivery && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Delivery Address</label>
                      <textarea 
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-3 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Enter full address for delivery mapping..."
                        rows={3}
                      />
                   </div>
                   
                   {!showMap ? (
                      <button 
                        onClick={handleSimulateDelivery}
                        className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 flex justify-center items-center"
                        disabled={!deliveryAddress}
                      >
                         <Map className="mr-2 h-5 w-5" /> Calculate Delivery Fee & View Map
                      </button>
                   ) : (
                      <div className="rounded-lg overflow-hidden border border-gray-200 pt-2">
                         <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-start">
                            <Navigation className="text-blue-500 h-5 w-5 mr-3 mt-0.5" />
                            <div>
                               <p className="font-bold text-blue-900 text-sm">Simulated Map View Active</p>
                               <p className="text-blue-700 text-xs mt-1">Distance calculated. Delivery fee: Rs. {deliveryFee}</p>
                            </div>
                         </div>
                         <div className="bg-gray-200 h-64 relative w-full flex items-center justify-center">
                            {/* Simulated Map Interface purely UI */}
                            <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=colombo,srilanka&zoom=12&size=600x300&maptype=roadmap&sensor=false')] opacity-30 bg-cover bg-center mix-blend-multiply"></div>
                            <div className="z-10 bg-white/90 p-3 rounded shadow-lg text-center backdrop-blur-sm">
                               <MapPin className="h-8 w-8 text-orange-600 mx-auto" />
                               <p className="font-bold text-sm mt-1">Delivery Location Pinned</p>
                               <p className="text-xs text-gray-500">Live tracking will appear here after checkout</p>
                            </div>
                         </div>
                      </div>
                   )}
                </div>
              )}
           </div>

        </div>

        {/* Right Column - Order Summary */}
        <div className="md:col-span-1">
           <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-4 border-b pb-4 text-gray-900">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                 {filteredStocks.map(stock => {
                    const item = stock.gasItem;
                    const q = cart[item.id];
                    if (!q) return null;
                    return (
                       <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">{q}x {item.brand} {item.weight}</span>
                          <span className="font-medium">Rs. {(q * item.price).toFixed(2)}</span>
                       </div>
                    );
                 })}
                 {totalItems === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">Your cart is empty</p>
                 )}
              </div>

              {isDelivery && showMap && (
                 <div className="flex justify-between text-sm py-3 border-t border-gray-100">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">Rs. {deliveryFee.toFixed(2)}</span>
                 </div>
              )}

              <div className="flex justify-between font-bold text-lg py-4 border-t border-gray-200 text-gray-900">
                 <span>Total</span>
                 <span>Rs. {calculateTotal().toFixed(2)}</span>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={totalItems === 0 || (isDelivery && !showMap)}
                className="w-full py-4 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm mt-2"
              >
                 Proceed to Checkout
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}
