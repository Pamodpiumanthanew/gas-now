"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Store, Clock, Phone, MapPin, Package, ListOrdered, CheckCircle2, Settings, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function SellerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [shop, setShop] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Settings form state
  const [isOpen, setIsOpen] = useState(false);
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", address: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated" || (session?.user as any)?.role !== "SELLER") {
      router.push("/");
      return;
    }

    if (status === "authenticated") {
      Promise.all([
         fetch("/api/seller/shop").then(res => res.json()),
         fetch("/api/messages").then(res => res.json())
      ]).then(([data, messagesData]) => {
         setShop(data);
         setIsOpen(data.isOpen);
         setOpenTime(data.openTime || "");
         setCloseTime(data.closeTime || "");
         setWhatsapp(data.whatsapp || "");
         setMessages(Array.isArray(messagesData) ? messagesData : []);
         setLoading(false);
         
         const unreadIds = Array.isArray(messagesData) ? messagesData.filter(m => !m.isRead).map(m => m.id) : [];
         if (unreadIds.length > 0) {
            fetch("/api/messages", { 
               method: "PATCH", 
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ messageIds: unreadIds }) 
            });
         }
      });
    }
  }, [status, session, router]);

  const updateSettings = async (openState?: boolean) => {
     setSavingSettings(true);
     try {
        const res = await fetch("/api/seller/shop", {
           method: "PATCH",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
              action: "UPDATE_SHOP",
              shopId: shop.id,
              payload: { 
                 isOpen: openState !== undefined ? openState : isOpen, 
                 openTime, 
                 closeTime, 
                 whatsapp 
              }
           })
        });
        if (res.ok) {
           // Silently succeed for better UX on auto-save
        }
     } catch (error) {
        alert("Failed to update settings");
     } finally {
        setSavingSettings(false);
     }
  };

  const toggleShopOpen = async (checked: boolean) => {
     setIsOpen(checked);
     // Auto-save the toggle state
     await updateSettings(checked);
  };

  const updateProfile = async (e: React.FormEvent) => {
     e.preventDefault();
     setSavingProfile(true);
     try {
        const res = await fetch("/api/seller/shop", {
           method: "PATCH",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
              action: "UPDATE_PROFILE",
              shopId: shop.id,
              payload: editForm
           })
        });
        if (res.ok) {
           setShop({ ...shop, ...editForm });
           setIsEditing(false);
        } else {
           alert("Failed to update profile");
        }
     } catch (error) {
        alert("Failed to update profile");
     } finally {
        setSavingProfile(false);
     }
  };

  const openEditModal = () => {
     setEditForm({
        name: shop.name || "",
        phone: shop.phone || "",
        address: shop.address || ""
     });
     setIsEditing(true);
  };

  const updateStock = async (stockId: string, quantity: number) => {
     try {
        await fetch("/api/seller/shop", {
           method: "PATCH",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
              action: "UPDATE_STOCK",
              payload: { stockId, quantity }
           })
        });
        
        // Optimistic update
        setShop((s: any) => ({
           ...s,
           stocks: s.stocks.map((st: any) => st.id === stockId ? { ...st, quantity } : st)
        }));
     } catch (error) {
        alert("Failed to update stock");
     }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-12 w-12 text-orange-600" /></div>;

  if (shop?.status === "PENDING") {
     return (
       <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
          <div className="bg-white p-8 rounded-xl shadow-md max-w-md text-center">
             <Clock className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
             <h2 className="text-2xl font-bold mb-2 text-gray-900">Account Pending Approval</h2>
             <p className="text-gray-600 mb-6">Your seller account is currently under review. Please ensure you have contacted the administrator via WhatsApp for payment and verification.</p>
             <Link href="/" className="text-orange-600 font-medium hover:underline">Return to Home</Link>
          </div>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-20">
      <nav className="bg-orange-600 shadow text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
               <img src="/logoo.jpeg" alt="Gas Now Logo" className="h-10 w-auto rounded-md" />
               <h1 className="text-2xl font-bold tracking-tight">Seller Dashboard</h1>
            </div>
            <Link href="/" className="text-orange-200 hover:text-white font-medium">Back to Site</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
               <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Store className="h-6 w-6 mr-2 text-gray-400" /> {shop.name}
               </h2>
               <div className="mt-2 text-sm text-gray-600 space-x-4 flex">
                  <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> {shop.address}</span>
                  <span className="flex items-center"><Phone className="h-4 w-4 mr-1" /> {shop.phone}</span>
               </div>
               <button 
                  onClick={openEditModal}
                  className="mt-3 text-sm text-orange-600 font-medium hover:text-orange-700 underline flex items-center"
               >
                  Edit Shop Details
               </button>
            </div>
            <div className={`mt-4 sm:mt-0 px-4 py-2 rounded-full font-bold text-sm ${isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
               Status: {isOpen ? "OPEN" : "CLOSED"}
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Settings and Stock */}
            <div className="lg:col-span-1 space-y-8">
               
               {/* Shop Settings */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between text-gray-800">
                     <div className="flex items-center">
                        <Settings className="h-5 w-5 mr-2 text-gray-500" />
                        <h3 className="font-bold text-lg">Shop Settings</h3>
                     </div>
                     {savingSettings && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                  </div>
                  <div className="p-5 space-y-4">
                     <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 block">Shop is Open</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                             type="checkbox" 
                             className="sr-only peer" 
                             checked={isOpen} 
                             onChange={(e) => toggleShopOpen(e.target.checked)} 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                     </div>
                     <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Open Time</label>
                        <input 
                           type="time" 
                           value={openTime} 
                           onChange={(e) => setOpenTime(e.target.value)} 
                           onBlur={() => updateSettings()}
                           className="w-full border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border" 
                        />
                     </div>
                     <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Close Time</label>
                        <input 
                           type="time" 
                           value={closeTime} 
                           onChange={(e) => setCloseTime(e.target.value)} 
                           onBlur={() => updateSettings()}
                           className="w-full border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border" 
                        />
                     </div>
                     <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">WhatsApp Number (For Direct Chat)</label>
                        <input 
                           type="text" 
                           value={whatsapp} 
                           onChange={(e) => setWhatsapp(e.target.value)} 
                           onBlur={() => updateSettings()}
                           placeholder="e.g. 94700000000" 
                           className="w-full border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border" 
                        />
                     </div>
                  </div>
               </div>

               {/* Live Stock Management */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center text-gray-800">
                     <Package className="h-5 w-5 mr-2 text-gray-500" />
                     <h3 className="font-bold text-lg">Live Stock Management</h3>
                  </div>
                  <div className="p-0">
                     <ul className="divide-y divide-gray-100">
                        {shop.stocks.map((stock: any) => (
                           <li key={stock.id} className="p-5 flex flex-col items-start">
                              <div className="flex justify-between w-full mb-3">
                                 <span className="font-bold text-gray-900">{stock.gasItem.brand} {stock.gasItem.weight}</span>
                                 <span className="text-sm text-gray-500 border bg-gray-100 px-2 py-0.5 rounded">Rs. {stock.gasItem.price}</span>
                              </div>
                              <div className="flex items-center w-full">
                                 <span className="text-sm font-medium text-gray-700 mr-4">Current Qty:</span>
                                 <input 
                                    type="number" 
                                    min="0"
                                    defaultValue={stock.quantity}
                                    onBlur={(e) => {
                                       const val = parseInt(e.target.value);
                                       if(val !== stock.quantity && !isNaN(val)) updateStock(stock.id, val);
                                    }}
                                    className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border" 
                                 />
                                 <span className="ml-2 text-xs text-green-600 font-medium">Auto-saves on blur</span>
                              </div>
                           </li>
                        ))}
                        {shop.stocks.length === 0 && <li className="p-5 text-center text-gray-500 text-sm">No cylinders assigned to shop yet.</li>}
                     </ul>
                  </div>
               </div>
            </div>

            {/* Right Column: Orders View & Messages */}
            <div className="lg:col-span-2 space-y-8">
               
               {/* Admin Messages */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between text-gray-800">
                     <div className="flex items-center">
                        <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                        <h3 className="font-bold text-lg">Admin Messages</h3>
                     </div>
                     {messages.filter(m => !m.isRead).length > 0 && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{messages.filter(m => !m.isRead).length} New</span>
                     )}
                  </div>
                  <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                     {messages.length === 0 ? (
                        <p className="p-6 text-center text-gray-500 text-sm">No messages received.</p>
                     ) : (
                        messages.map((msg: any) => (
                           <div key={msg.id} className={`p-5 ${!msg.isRead ? 'bg-blue-50/50' : ''}`}>
                              <div className="flex justify-between items-start mb-2">
                                 <span className="font-bold text-sm text-gray-900 flex items-center">
                                    System Admin
                                    {!msg.isRead && <span className="ml-2 w-2 h-2 rounded-full bg-blue-600"></span>}
                                 </span>
                                 <span className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.content}</p>
                           </div>
                        ))
                     )}
                  </div>
               </div>

               {/* Orders */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full">
                  <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between text-gray-800">
                     <div className="flex items-center">
                        <ListOrdered className="h-5 w-5 mr-2 text-gray-500" />
                        <h3 className="font-bold text-lg">Recent Orders</h3>
                     </div>
                     <span className="bg-orange-100 text-orange-800 py-1 px-3 rounded-full font-bold text-xs">
                        {shop.orders.length} Total
                     </span>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-[800px] overflow-y-auto">
                     {shop.orders.length === 0 ? (
                        <p className="p-8 text-center text-gray-500">No orders received yet.</p>
                     ) : (
                        shop.orders.map((order: any) => (
                           <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                              <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                                 <div>
                                    <div className="flex items-center space-x-2">
                                       <span className="font-bold text-gray-900">Order #{order.id.slice(-6).toUpperCase()}</span>
                                       <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div className="mt-1 text-sm text-gray-600">
                                       <span className="font-semibold text-gray-800">{order.buyer.name || order.buyer.username}</span> • {order.buyer.phone || "No phone"}
                                    </div>
                                 </div>
                                 <div className="mt-2 sm:mt-0 flex flex-col items-end">
                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${order.isDelivery ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                       {order.isDelivery ? 'Delivery' : 'Pickup'}
                                    </span>
                                    <div className="font-bold text-gray-900 mt-2">Rs. {order.totalAmount.toFixed(2)}</div>
                                 </div>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                 <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Order Items</h4>
                                 <ul className="space-y-1">
                                    {order.items.map((item: any) => (
                                       <li key={item.id} className="text-sm text-gray-800 flex justify-between">
                                          <span>{item.quantity}x {item.gasItem.brand} {item.gasItem.weight}</span>
                                          <span className="text-gray-500 font-medium text-xs">Rs. {item.priceAtTime * item.quantity}</span>
                                       </li>
                                    ))}
                                 </ul>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
               <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Shop Details</h3>
               <form onSubmit={updateProfile} className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700">Shop Name</label>
                     <input 
                        type="text" 
                        value={editForm.name} 
                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 border p-2"
                        required
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                     <input 
                        type="tel" 
                        value={editForm.phone} 
                        onChange={e => setEditForm({...editForm, phone: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 border p-2"
                        required
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700">Shop Address</label>
                     <textarea 
                        value={editForm.address} 
                        onChange={e => setEditForm({...editForm, address: e.target.value})}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 border p-2"
                        required
                     />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                     <button 
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                        disabled={savingProfile}
                     >
                        Cancel
                     </button>
                     <button 
                        type="submit"
                        disabled={savingProfile}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded shadow-sm"
                     >
                        {savingProfile ? "Saving..." : "Save Changes"}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}
