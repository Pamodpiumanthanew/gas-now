"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CheckCircle2, Truck, Navigation, PackageCheck, Flame, MessageCircle } from "lucide-react";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
           alert(data.error);
           router.push("/");
        } else {
           setOrder(data);
        }
        setLoading(false);
      });
  }, [id, router]);

  if (loading) return <div className="p-10 text-center">Loading order details...</div>;
  if (!order) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-green-600 py-8 px-4 sm:px-6 shadow-md text-white">
        <div className="max-w-4xl mx-auto flex items-center">
           <CheckCircle2 className="h-10 w-10 text-white mr-4" />
           <div>
              <h1 className="text-3xl font-extrabold">Order Confirmed!</h1>
              <p className="mt-1 text-green-100">Order #{order.id.slice(-6).toUpperCase()}</p>
           </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
        
        {/* Delivery / Status Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
           <div className="p-6 border-b border-gray-100 flex justify-between items-center">
             <h2 className="text-xl font-bold flex items-center text-gray-900">
               {order.isDelivery ? <><Truck className="mr-2 text-orange-500" /> Delivery Status</> : <><PackageCheck className="mr-2 text-green-500" /> Pickup Status</>}
             </h2>
             <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-bold">
               {order.status}
             </span>
           </div>
           
           {order.isDelivery && (
             <div className="p-0">
               {/* Simulated Map */}
               <div className="bg-gray-200 h-64 relative w-full flex flex-col items-center justify-center">
                  <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=colombo,srilanka&zoom=13&size=800x400&maptype=roadmap&sensor=false')] opacity-40 bg-cover bg-center mix-blend-multiply transition-all duration-3000 ease-in-out"></div>
                  
                  {/* Fake routing line SVG */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-60">
                     <path d="M 100 200 Q 300 100 500 150 T 800 50" stroke="#3b82f6" strokeWidth="4" fill="none" strokeDasharray="10 10" className="animate-[dash_10s_linear_infinite]" />
                  </svg>
                  
                  <div className="z-20 bg-white/95 p-4 rounded-lg shadow-xl max-w-sm text-center border border-blue-100 backdrop-blur-sm animate-bounce">
                     <Navigation className="h-8 w-8 text-blue-600 mx-auto animate-pulse" />
                     <p className="font-bold mt-2 text-gray-900">Driver is arriving soon</p>
                     <p className="text-sm text-gray-600 mt-1">Simulated Live Tracking Active</p>
                  </div>
               </div>
             </div>
           )}
           
           {!order.isDelivery && (
             <div className="p-6 text-center bg-gray-50">
                <p className="text-gray-700 font-medium">Your order is ready. Please visit {order.shop.name} to pick up your cylinders.</p>
             </div>
           )}
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
           <h2 className="text-xl font-bold mb-6 border-b pb-4 text-gray-900">Order Summary</h2>
           
           <div className="space-y-4 mb-6">
              {order.items.map((item: any) => (
                 <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                       <Flame className={`h-5 w-5 mr-3 ${item.gasItem.brand === 'LAUGFS' ? 'text-yellow-500' : 'text-blue-500'}`} />
                       <span className="font-bold text-gray-700">{item.quantity}x {item.gasItem.brand} {item.gasItem.weight}</span>
                    </div>
                    <span className="font-medium">Rs. {(item.quantity * item.priceAtTime).toFixed(2)}</span>
                 </div>
              ))}
           </div>

           {order.isDelivery && (
              <div className="flex justify-between text-sm py-3 border-t border-gray-100 text-gray-600">
                 <span>Delivery Fee</span>
                 <span className="font-medium text-gray-900">Rs. {order.deliveryFee.toFixed(2)}</span>
              </div>
           )}

           <div className="flex justify-between font-bold text-xl py-4 border-t border-gray-200 text-gray-900">
              <span>Total Paid</span>
              <span>Rs. {order.totalAmount.toFixed(2)}</span>
           </div>
        </div>

        {/* Shop Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row justify-between items-center">
            <div>
               <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Sold By</p>
               <p className="font-bold text-lg text-gray-900">{order.shop.name}</p>
               <p className="text-sm text-gray-600">{order.shop.phone}</p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex gap-3">
               {order.shop.whatsapp && (
                 <a 
                   href={`https://wa.me/${order.shop.whatsapp}`}
                   target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#25D366] hover:bg-[#128C7E] shadow-sm"
                 >
                   <MessageCircle className="h-5 w-5 mr-2" /> Message Shop
                 </a>
               )}
               <Link href="/" className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm">
                 Back to Home
               </Link>
            </div>
        </div>

      </div>
    </div>
  );
}
