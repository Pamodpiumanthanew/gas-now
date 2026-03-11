"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserCircle, ShoppingBag, Star, Mail, MapPin, Phone, MessageSquare, CheckCircle2 } from "lucide-react";

export default function UserProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", address: "", email: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/profile");
      return;
    }

    if (status === "authenticated") {
      Promise.all([
        fetch("/api/user/profile").then(res => res.json()),
        fetch("/api/messages").then(res => res.json())
      ]).then(([profileData, messagesData]) => {
         setUserProfile(profileData);
         setMessages(Array.isArray(messagesData) ? messagesData : []);
         setLoading(false);
         
         // Mark unread as read
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
  }, [status, router]);

  const handleEditSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setSaving(true);
     try {
        const res = await fetch("/api/user/profile", {
           method: "PATCH",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify(editForm)
        });
        if (res.ok) {
           const { user } = await res.json();
           setUserProfile({ ...userProfile, ...user });
           setIsEditing(false);
        } else {
           alert("Failed to update profile");
        }
     } catch (error) {
        alert("Failed to update profile");
     } finally {
        setSaving(false);
     }
  };

  const openEditModal = () => {
     setEditForm({
        name: userProfile.name || "",
        phone: userProfile.phone || "",
        address: userProfile.address || "",
        email: userProfile.email || ""
     });
     setIsEditing(true);
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading your profile...</div>;
  if (!userProfile) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Profile Info */}
      <div className="bg-blue-600 text-white py-12 px-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-6">
           <div className="bg-white/20 p-4 rounded-full">
              <UserCircle className="h-20 w-20 text-white" />
           </div>
           <div className="text-center md:text-left">
              <h1 className="text-3xl font-extrabold mb-1">{userProfile.name || userProfile.username}</h1>
              <p className="text-blue-100 font-medium">@{userProfile.username} • {userProfile.role}</p>
              
              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4 text-sm text-blue-50">
                 {userProfile.email && (
                    <div className="flex items-center bg-blue-700/50 px-3 py-1.5 rounded-full"><Mail className="h-4 w-4 mr-2" /> {userProfile.email}</div>
                 )}
                 {userProfile.phone && (
                    <div className="flex items-center bg-blue-700/50 px-3 py-1.5 rounded-full"><Phone className="h-4 w-4 mr-2" /> {userProfile.phone}</div>
                 )}
                 {userProfile.address && (
                    <div className="flex items-center bg-blue-700/50 px-3 py-1.5 rounded-full"><MapPin className="h-4 w-4 mr-2" /> {userProfile.address}</div>
                 )}
              </div>
           </div>
           
           <div className="md:ml-auto mt-4 md:mt-0 flex gap-3">
              <button 
                 onClick={openEditModal}
                 className="px-4 py-2 bg-white text-blue-600 text-sm font-bold rounded-md hover:bg-gray-100 transition shadow-sm"
              >
                 Edit Profile
              </button>
              <Link href="/" className="px-4 py-2 border border-white/40 text-sm font-medium rounded-md hover:bg-white/10 transition">
                 Back to Home
              </Link>
           </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Orders Column */}
        <div className="md:col-span-2 space-y-6">
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center bg-gray-50/50">
                 <ShoppingBag className="h-5 w-5 mr-2 text-gray-500" />
                 <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              </div>
              <div className="divide-y divide-gray-100">
                 {userProfile.orders.length === 0 ? (
                    <p className="p-8 text-center text-gray-500">You haven't placed any orders yet.</p>
                 ) : (
                    userProfile.orders.map((order: any) => (
                       <Link key={order.id} href={`/orders/${order.id}`} className="block hover:bg-gray-50 transition-colors p-6">
                          <div className="flex justify-between items-start mb-3">
                             <div>
                                <span className="font-bold text-gray-900 flex items-center">
                                   From: {order.shop.name}
                                </span>
                                <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                             </div>
                             <div className="text-right">
                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${order.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                   {order.status}
                                </span>
                                <div className="font-bold text-gray-900 mt-2">Rs. {order.totalAmount.toFixed(2)}</div>
                             </div>
                          </div>
                          
                          <div className="text-sm text-gray-600 flex flex-wrap gap-2">
                             {order.items.map((item: any) => (
                                <span key={item.id} className="bg-gray-100 px-2 py-1 rounded inline-block text-xs font-medium">
                                   {item.quantity}x {item.gasItem.brand} {item.gasItem.weight}
                                </span>
                             ))}
                          </div>
                       </Link>
                    ))
                 )}
              </div>
           </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-1 space-y-6">
           
           {/* Messages from Admin */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center bg-gray-50/50 justify-between">
                 <div className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">Admin Messages</h2>
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
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center bg-gray-50/50">
                 <Star className="h-5 w-5 mr-2 text-gray-500" />
                 <h2 className="text-xl font-bold text-gray-900">My Reviews</h2>
              </div>
              <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                 {userProfile.reviews.length === 0 ? (
                    <p className="p-6 text-center text-gray-500 text-sm">You haven't written any reviews.</p>
                 ) : (
                    userProfile.reviews.map((review: any) => (
                       <div key={review.id} className="p-5">
                          <p className="font-bold text-gray-900 text-sm">{review.shop.name}</p>
                          <div className="flex text-yellow-400 my-1">
                             {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                             ))}
                          </div>
                           <p className="text-sm text-gray-600 mt-2 italic">"{review.comment}"</p>
                        </div>
                     ))
                  )}
               </div>
            </div>
         </div>
       </div>

       {/* Edit Profile Modal */}
       {isEditing && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
               <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Profile</h3>
               <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700">Full Name</label>
                     <input 
                        type="text" 
                        value={editForm.name} 
                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700">Email Address</label>
                     <input 
                        type="email" 
                        value={editForm.email} 
                        onChange={e => setEditForm({...editForm, email: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                     <input 
                        type="tel" 
                        value={editForm.phone} 
                        onChange={e => setEditForm({...editForm, phone: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700">Delivery Address</label>
                     <textarea 
                        value={editForm.address} 
                        onChange={e => setEditForm({...editForm, address: e.target.value})}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                     />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                     <button 
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                        disabled={saving}
                     >
                        Cancel
                     </button>
                     <button 
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded shadow-sm"
                     >
                        {saving ? "Saving..." : "Save Changes"}
                     </button>
                  </div>
               </form>
            </div>
         </div>
       )}
     </div>
   );
 }
