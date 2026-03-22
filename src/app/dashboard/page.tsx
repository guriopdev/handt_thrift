"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  UserCircle, MapPin, Phone, CheckCircle2, 
  ShoppingBag, MessageSquare, PlusCircle, Heart,
  HelpCircle, PackageSearch, ShieldCheck, ArrowRight,
  LogOut, Image as ImageIcon, X, Navigation, Banknote, Flag, CheckCheck, Reply, Trash2, HeartHandshake
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// Dummy data types
type Product = {
  id: number;
  title: string;
  price: string;
  condition: string;
  image: string;
  sellerId: string;
  sellerName: string;
  status: "In Stock" | "Currently in Deal" | "Sold";
};

type ChatMessage = {
  id: number;
  text: string;
  sender: "me" | "other";
  status?: "sent" | "delivered" | "read";
  replyToId?: number;
  isDeleted?: boolean;
};

type Chat = {
  id: number;
  productId: number;
  otherUser: string;
  messages: ChatMessage[];
  dealApproved: { me: boolean; other: boolean };
};

type Offer = {
  id: number;
  productId: number;
  buyerName: string;
  negotiatedPrice: string;
  place: string;
  status: "pending" | "approved" | "rejected";
};

const NIT_LAT = 31.7084;
const NIT_LON = 76.5273;

export default function DashboardPage() {
  const { user, updateProfile, logout, loading } = useAuth();
  const router = useRouter();
  
  // Profile State
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [location, setLocation] = useState("");
  const isAdmin = user?.email?.toLowerCase().includes('gurjyot') || false;
  const [strictLocation, setStrictLocation] = useState(false);

  const [toastMsg, setToastMsg] = useState("");
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4500);
  };

  // Dashboard Tabs: 'browse', 'chat', 'sell', 'cart', 'wishlist', 'profile'
  const [activeTab, setActiveTab] = useState("profile");

  // Dummy State for Functionality
  // Start empty — all products come exclusively from Supabase DB
  const [products, setProducts] = useState<Product[]>([]);

  const [chats, setChats] = useState<Chat[]>([]);

  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);

  const [cart, setCart] = useState<number[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);

  // Sell Form State
  const [sellTitle, setSellTitle] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [sellCondition, setSellCondition] = useState("");
  const [sellImage, setSellImage] = useState<File | null>(null);

  const [pendingOffers, setPendingOffers] = useState<Offer[]>([]);
  
  // ======== DEBUG CONSOLE ========
  const [debugLog, setDebugLog] = useState<string[]>([`Booted correctly. Connected to: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`]);
  const logDebug = (msg: string) => {
    console.log(msg);
    setDebugLog(prev => [msg, ...prev]);
  };
  // ===============================

  const [negotiatedPrice, setNegotiatedPrice] = useState("");
  const [meetupLocation, setMeetupLocation] = useState("");

  // Lazily create Supabase client — only in the browser, never during SSR prerendering
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createClient();
    return supabaseRef.current;
  }

  const fetchGlobalData = async () => {
    const supabase = getSupabase();

    // 1. Fetch ALL products from Supabase
    logDebug(`Fetching products...`);
    const { data: pData, error: pError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (pError) {
      logDebug(`ERROR fetching products: ${JSON.stringify(pError)}`);
      showToast(`Browse error: ${pError.message}`);
    } else {
      logDebug(`SUCCESS: Fetched ${pData?.length || 0} products.`);
      // Always overwrite — even empty array clears stale data
      setProducts((pData ?? []).map((p: any) => ({
        id: p.id, title: p.title, price: p.price, condition: p.condition,
        image: p.image_url, sellerId: p.seller_id, sellerName: p.seller_name, status: p.status
      })));
    }

    // 2. Fetch Global Offers
    const { data: oData, error: oError } = await supabase
      .from('offers')
      .select('*')
      .order('created_at', { ascending: false });

    if (oError) {
      console.error('fetchGlobalData offers error:', oError);
    } else if (oData) {
      setPendingOffers(oData.map((o: any) => ({
        id: o.id, productId: o.product_id, buyerName: o.buyer_name,
        negotiatedPrice: o.negotiated_price, place: o.meetup_location, status: o.status
      })));
    }

    // 3. Fetch Chats
    if (user) {
      const { data: cData, error: cError } = await supabase
        .from('chats')
        .select(`
          id, product_id, buyer_id, seller_id, created_at,
          messages ( id, text, sender_id, is_read, created_at )
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

      if (cError) {
        logDebug(`fetchGlobalData chats error: ${cError.message}`);
      } else if (cData) {
        const formattedChats: Chat[] = cData.map((c: any) => {
          const isBuyer = c.buyer_id === user.id;
          const otherUserId = isBuyer ? c.seller_id : c.buyer_id;
          return {
            id: c.id,
            productId: c.product_id,
            otherUser: otherUserId,
            messages: (c.messages || [])
              .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
              .map((m: any) => ({
                id: m.id,
                text: m.text,
                sender: m.sender_id === user.id ? "me" : "other",
                status: m.is_read ? "read" : "sent"
              })),
            dealApproved: { me: false, other: false }
          };
        });
        setChats(formattedChats);
      }
    }
  };

  useEffect(() => {
    if (loading) return;
    
    if (user) {
      setName(user.name || "");
      setNumber(user.number || "");
      setLocation(user.location || "");
      
      if (user.name && user.number && user.location) {
        if (activeTab === "profile") setActiveTab("browse");
      } else {
        setActiveTab("profile");
      }

      fetchGlobalData();

      // Realtime Multi-Channel Event Subscriptions
      const supabase = getSupabase();
      const channels = supabase.channel('custom-all-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => { fetchGlobalData(); })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, () => { fetchGlobalData(); })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, () => { fetchGlobalData(); })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => { fetchGlobalData(); })
        .subscribe();

      return () => { supabase.removeChannel(channels); };

    } else {
      router.push("/login");
    }
  }, [user, router, loading]); // omitted activeTab intentionally

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const R = 6371; // Earth radius in km
      const dLat = (NIT_LAT-latitude) * (Math.PI/180);
      const dLon = (NIT_LON-longitude) * (Math.PI/180); 
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(latitude*(Math.PI/180)) * Math.cos(NIT_LAT*(Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      const dist = R * c; 
      
      if (strictLocation && dist > 5) { // 5km radius hard strict
         showToast(`Access Denied: You are not within the NIT Hamirpur campus! (Distance: ${dist.toFixed(1)}km away)`);
         setLocation(""); 
      } else {
         setLocation("NIT Hamirpur, HP");
      }
    }, (err) => {
      showToast("Unable to retrieve your location. Please ensure location permissions are granted.");
    });
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !number || !location) return;
    
    // Security: sanitize basic lengths for production
    const cleanName = name.trim().slice(0, 50);
    const cleanNumber = number.trim().slice(0, 15);
    const cleanLocation = location.trim().slice(0, 100);
    
    updateProfile({ name: cleanName, number: cleanNumber, location: cleanLocation });
    showToast("Identity Card updated securely!");
    if (!isProfileComplete) setActiveTab("browse");
  };

  const startChat = async (productId: number, otherUser: string) => {
    const existingChat = chats.find(c => c.productId === productId);
    if (existingChat) {
      setActiveChatId(existingChat.id);
    } else {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('chats').insert([{
        product_id: productId,
        buyer_id: user!.id,
        seller_id: otherUser
      }]).select().single();

      if (data) {
        await supabase.from('messages').insert([{
          chat_id: data.id,
          sender_id: user!.id,
          text: "Hello, I am interested in this item."
        }]);
        setActiveChatId(data.id);
        fetchGlobalData();
      } else if (error) {
        showToast("Error starting chat: " + error.message);
      }
    }
    setActiveTab("chat");
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChatId) return;
    const cleanText = newMessage.trim().slice(0, 500);
    const supabase = getSupabase();
    
    setNewMessage(""); // clear input optimistically
    const { error } = await supabase.from('messages').insert([{
      chat_id: activeChatId,
      sender_id: user!.id,
      text: cleanText
    }]);

    if (error) {
      showToast("Error sending message: " + error.message);
    } else {
      setReplyingTo(null);
      fetchGlobalData();
    }
  };

  const deleteMessage = async (chatId: number, msgId: number) => {
    const supabase = getSupabase();
    await supabase.from('messages').delete().eq('id', msgId);
    fetchGlobalData();
  };

  const deleteChat = async (chatId: number) => {
    if (confirm("Are you sure you want to permanently delete this conversation?")) {
      const supabase = getSupabase();
      await supabase.from('chats').delete().eq('id', chatId);
      if (activeChatId === chatId) setActiveChatId(null);
      fetchGlobalData();
    }
  };

  const handleApproveOffer = async (offer: Offer) => {
    const supabase = getSupabase();
    await supabase.from('products').update({ status: 'Sold' }).eq('id', offer.productId);
    await supabase.from('offers').update({ status: 'approved' }).eq('id', offer.id);
    showToast("Deal Approved! Item is now marked as Sold.");
    await fetchGlobalData();
  };

  const handleRejectOffer = async (offer: Offer) => {
    const supabase = getSupabase();
    await supabase.from('products').update({ status: 'In Stock' }).eq('id', offer.productId);
    await supabase.from('offers').update({ status: 'rejected' }).eq('id', offer.id);
    showToast("Offer rejected. Item is back in stock.");
    await fetchGlobalData();
  };

  const handleSendDeal = async () => {
    const supabase = getSupabase();
    if (!negotiatedPrice || !meetupLocation) {
      showToast("Please provide the negotiated price and meetup location.");
      return;
    }
    const newOffers = cart.map(productId => ({
      product_id: productId,
      buyer_id: user?.id,
      buyer_name: name || "Anonymous Buyer",
      negotiated_price: negotiatedPrice,
      meetup_location: meetupLocation,
      status: "pending"
    }));

    await supabase.from('offers').insert(newOffers);
    for (const pid of cart) {
      await supabase.from('products').update({ status: 'Currently in Deal' }).eq('id', pid);
    }
    
    setCart([]);
    setNegotiatedPrice("");
    setMeetupLocation("");
    showToast("Deal sent to seller for approval! They will contact you in Chat.");
    setActiveTab("chat");
  };

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabase();
    if (!sellImage) {
      showToast("Please upload an image for your listing.");
      return;
    }

    showToast("Saving listing...");
    const cleanTitle = sellTitle.trim().slice(0, 60);
    const cleanPrice = Math.abs(parseInt(sellPrice) || 0).toString().slice(0, 7);

    // Step 1: Ensure the seller's profile row exists in DB (required by FK constraint)
    logDebug(`Step 1: Upserting profile for ${user!.id}...`);
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user!.id,
      name: user?.name || "Anonymous",
      number: user?.number || "N/A",
      location: user?.location || "NIT Hamirpur, HP",
    }, { onConflict: 'id' });

    if (profileError) {
      logDebug(`ERROR: Profile upsert failed: ${JSON.stringify(profileError)}`);
      showToast(`Error saving profile: ${profileError.message}`);
      return;
    }
    logDebug(`SUCCESS: Profile upserted.`);

    // Step 2: Upload image to Supabase Storage
    logDebug(`Step 2: Uploading image...`);
    const fileExt = sellImage.name.split('.').pop();
    const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, sellImage, { upsert: true });

    let imageUrl = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80";
    if (!uploadError && uploadData) {
      logDebug(`SUCCESS: Image uploaded.`);
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(uploadData.path);
      imageUrl = urlData.publicUrl;
    } else if (uploadError) {
      logDebug(`WARNING: Image upload failed: ${uploadError.message}. Using placeholder.`);
      // Continue with placeholder — don't block listing
    }

    // Step 3: Insert product — CHECK the error this time!
    logDebug(`Step 3: Inserting product into database...`);
    const { data: insertData, error: insertError } = await supabase.from('products').insert([{
      seller_id: user!.id,
      seller_name: user?.name || "Anonymous",
      title: cleanTitle,
      price: `₹${cleanPrice}`,
      condition: sellCondition || "Good",
      image_url: imageUrl,
      status: "In Stock"
    }]).select('*');

    if (insertError) {
      logDebug(`ERROR: Product insert failed: ${JSON.stringify(insertError)}`);
      showToast(`Failed to list item: ${insertError.message}`);
      return;
    }
    logDebug(`SUCCESS: Product inserted. DB returned row: ${JSON.stringify(insertData)}`);

    // Success — clear form and refresh
    setSellTitle("");
    setSellPrice("");
    setSellCondition("");
    setSellImage(null);
    showToast("Item listed! Visible to all users now.");
    await fetchGlobalData(); // immediately refresh browse list
    setActiveTab("browse");
  };

  const toggleWishlist = (id: number) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(wId => wId !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

  const toggleCart = (id: number) => {
    if (cart.includes(id)) {
      setCart(cart.filter(cId => cId !== id));
    } else {
      setCart([...cart, id]);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple"></div>
      </div>
    );
  }

  const isProfileComplete = user.name && user.number && user.location;

  return (
    <div className="min-h-screen bg-beige flex flex-col md:flex-row font-sans relative">
      
      {/* Global Dashboard Toast (Replaces Alerts) */}
      {toastMsg && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[1000] bg-gray-900 border-2 border-white/20 text-white font-black tracking-widest text-xs uppercase px-8 py-4 rounded-full shadow-2xl animate-in slide-in-from-top-10 fade-in duration-300">
          {toastMsg}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 w-full lg:w-3/4 p-4 lg:p-8 overflow-y-auto pt-24 pb-20 lg:pb-8">
        
        {/* ======== DEBUG CONSOLE VISUAL ======== */}
        <div className="mb-6 p-4 bg-red-950 text-red-400 border border-red-800 rounded-lg text-xs font-mono max-h-40 overflow-y-auto">
          <strong>SYSTEM DEBUG CONSOLE:</strong><br />
          {debugLog.map((log, i) => <div key={i}>{log}</div>)}
        </div>
        
        <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-purple/10 min-h-full p-6 md:p-10 relative">
          
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter capitalize fade-in">
              {activeTab === 'profile' && !isProfileComplete ? 'Complete Auto-Identity Card' : 
               activeTab === 'profile' ? 'Your Identity Card' : 
               activeTab}
            </h1>
            
            <Link href="/" className="flex md:hidden items-center gap-2">
               <Image src="/logo.png" alt="HandT" width={32} height={32} className="rounded-lg border border-purple/10" />
            </Link>
          </div>

          {/* TAB: PROFILE / HELP */}
          {activeTab === "profile" && (
            <div className="max-w-xl mx-auto mt-10 fade-in">
              <div className="bg-gradient-to-tr from-lavender/40 to-blue/40 p-8 rounded-t-[2rem] text-center flex flex-col items-center">
                <div className="relative overflow-hidden rounded-[1.5rem] shadow-sm bg-white mb-4 p-2">
                   <Image src="/logo.png" alt="HandT Thrift Logo" width={56} height={56} className="object-cover" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Identity Card Verification</h2>
                <p className="mt-2 text-sm text-gray-600 font-medium">Please provide your details to buy or sell securely. All fields required.</p>
              </div>

              <form onSubmit={handleProfileSubmit} className="bg-white p-8 rounded-b-[2rem] shadow-sm border border-t-0 border-purple/10 space-y-6">
                <div>
                  <label className="block text-sm font-bold leading-6 text-gray-900">Full Name</label>
                  <div className="mt-2 relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} maxLength={50}
                      className="block w-full rounded-2xl border-0 py-3 pl-10 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-purple sm:text-sm sm:leading-6 bg-beige/30"
                      placeholder="John Doe" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold leading-6 text-gray-900">Phone Number</label>
                  <div className="mt-2 relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="tel" required value={number} onChange={(e) => setNumber(e.target.value)} maxLength={15}
                      className="block w-full rounded-2xl border-0 py-3 pl-10 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-purple sm:text-sm sm:leading-6 bg-beige/30"
                      placeholder="+91 98765 43210" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold leading-6 text-gray-900">Current Location (GPS required)</label>
                  <div className="mt-2 relative flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} maxLength={100}
                        readOnly={strictLocation}
                        className={`block w-full rounded-2xl border-0 py-3 pl-10 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-purple sm:text-sm sm:leading-6 ${strictLocation ? 'bg-gray-100' : 'bg-beige/30'}`}
                        placeholder={strictLocation ? "Click the GPS button ->" : "Hamirpur, HP"} />
                    </div>
                    <button 
                      type="button" 
                      onClick={fetchLocation}
                      className="flex items-center justify-center px-4 rounded-2xl bg-blue/10 text-blue font-bold hover:bg-blue/20 transition-colors shadow-sm"
                      title="Fetch Real-Time Location"
                    >
                      <Navigation size={20} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">* Location restricted strictly to NIT Hamirpur.</p>

                  {isAdmin && (
                    <div className="mt-4 p-4 border border-red-200 bg-red-50 rounded-2xl flex items-center justify-between shadow-sm">
                      <div>
                        <span className="font-bold text-red-600 text-sm flex items-center gap-1"><ShieldCheck size={16}/> Admin Controls</span>
                        <p className="text-xs text-gray-600 mt-1">Status: {strictLocation ? 'Strict GPS ON' : 'Testing Mode (Location bypass)'}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={strictLocation} onChange={() => setStrictLocation(!strictLocation)} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                      </label>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full btn btn-primary flex items-center justify-center gap-2 !rounded-full shadow-lg shadow-purple/20">
                    <CheckCircle2 size={20} />
                    {isProfileComplete ? "Update Identity Card" : "Save and Start Thrifting"}
                  </button>
                </div>
              </form>

              {/* Workflow Diagram */}
              <div className="bg-white p-8 mt-6 rounded-[2.5rem] shadow-sm border border-purple/10">
                <h3 className="text-xl font-black text-gray-900 tracking-tighter mb-8 text-center uppercase tracking-widest text-purple">How HandT Works</h3>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative">
                  
                  {/* Connector Line (Desktop) */}
                  <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-0.5 bg-gray-100 z-0"></div>
                  
                  {[
                    { title: "1. Locked", desc: "GPS identity is locked", icon: <UserCircle size={20}/> },
                    { title: "2. Explore", desc: "Find pre-loved items", icon: <PackageSearch size={20}/> },
                    { title: "3. Propose", desc: "Negotiate live in chat", icon: <MessageSquare size={20}/> },
                    { title: "4. Approve", desc: "Seller accepts the deal", icon: <CheckCircle2 size={20}/> },
                    { title: "5. Meetup", desc: "Pay safe in-person", icon: <HeartHandshake size={20}/> }
                  ].map((step, idx) => (
                    <div key={idx} className="relative z-10 flex flex-col items-center bg-white p-2 rounded-2xl w-full md:w-auto mt-4 md:mt-0 group hover:-translate-y-1 transition-transform">
                      <div className={`w-14 h-14 rounded-[1rem] flex items-center justify-center mb-3 shadow-sm border-2 transition-colors
                        ${idx === 0 ? 'bg-orange-50 text-orange-500 border-orange-100 group-hover:bg-orange-500 group-hover:text-white' : 
                          idx === 1 ? 'bg-blue/10 text-blue border-blue/20 group-hover:bg-blue group-hover:text-white' : 
                          idx === 2 ? 'bg-purple/10 text-purple border-purple/20 group-hover:bg-purple group-hover:text-white' : 
                          idx === 3 ? 'bg-green-50 text-green-500 border-green-100 group-hover:bg-green-500 group-hover:text-white' : 
                          'bg-red-50 text-red-500 border-red-100 group-hover:bg-red-500 group-hover:text-white'}`}>
                        {step.icon}
                      </div>
                      <h4 className="font-extrabold text-gray-900 text-sm whitespace-nowrap">{step.title}</h4>
                      <p className="text-[11px] text-gray-500 font-medium text-center mt-1 max-w-[80px] leading-tight">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: BROWSE */}
          {activeTab === "browse" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 fade-in">
              {products.filter(p => p.status === 'In Stock' || p.status === 'Currently in Deal').map((product, idx) => (
                <div key={product.id} className="card !p-0 overflow-hidden flex flex-col group" style={{ animationDelay: `${0.1 * idx}s` }}>
                  <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                      <div className={`backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1 w-max
                        ${product.status === 'In Stock' ? 'bg-green-100/90 text-green-700' : 
                          product.status === 'Currently in Deal' ? 'bg-yellow-100/90 text-yellow-700' : 'bg-red-100/90 text-red-700'}`}>
                        {product.status === 'In Stock' && <CheckCircle2 size={14} />}
                        {product.status === 'Currently in Deal' && <MessageSquare size={14} />}
                        {product.status === 'Sold' && <X size={14} />}
                        {product.status}
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleWishlist(product.id)}
                      className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm transition-all ${wishlist.includes(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                    >
                      <Heart size={18} fill={wishlist.includes(product.id) ? "currentColor" : "none"} />
                    </button>
                    <Image src={product.image} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="font-bold text-gray-900 leading-tight">{product.title}</h3>
                      <span className="font-extrabold text-purple text-lg tracking-tight">{product.price}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1 mb-3 text-sm font-medium text-gray-500">
                      <div className="flex items-center gap-2">
                         <div className="w-5 h-5 bg-purple/10 rounded-full flex items-center justify-center text-purple text-xs font-bold">
                           {product.sellerName.charAt(0)}
                         </div>
                         <span className="text-gray-800">{product.sellerName}</span>
                      </div>
                      <button onClick={() => alert("Reported fraud seller!")} className="text-red-400 hover:text-red-600 flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors" title="Report fraud seller">
                        <Flag size={12} /> Report
                      </button>
                    </div>

                    <div className="text-sm font-medium text-gray-500 mb-4">Condition: <span className="text-gray-800">{product.condition}</span></div>
                    
                    <div className="mt-auto grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => startChat(product.id, "Seller " + product.id)}
                        className="flex items-center justify-center gap-2 py-2 px-3 bg-lavender/30 text-purple font-bold rounded-xl hover:bg-lavender/50 transition-colors text-sm"
                      >
                        <MessageSquare size={16} /> Chat
                      </button>
                      <button 
                        onClick={() => toggleCart(product.id)}
                        className={`flex items-center justify-center gap-2 py-2 px-3 font-bold rounded-xl transition-colors text-sm ${cart.includes(product.id) ? 'bg-purple text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        <ShoppingBag size={16} /> {cart.includes(product.id) ? 'In Cart' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: CHAT */}
          {activeTab === "chat" && (
            <div className="flex h-[calc(100vh-12rem)] flex-col lg:flex-row gap-6 fade-in">
              <div className="w-full lg:w-1/3 border border-gray-100 rounded-3xl overflow-hidden bg-gray-50 flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-white">
                  <h3 className="font-bold text-lg">Negotiations</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                  {chats.map(chat => {
                    const product = products.find(p => p.id === chat.productId);
                    return (
                      <div 
                        key={chat.id} 
                        onClick={() => setActiveChatId(chat.id)}
                        className={`p-3 rounded-2xl cursor-pointer flex gap-3 items-center transition-colors ${activeChatId === chat.id ? 'bg-white shadow-sm border border-purple/20' : 'hover:bg-gray-100 border border-transparent'}`}
                      >
                        <div className="w-12 h-12 rounded-xl border border-gray-200 overflow-hidden relative flex-shrink-0">
                          {product && <Image src={product.image} alt="item" fill className="object-cover" />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 truncate">{chat.otherUser}</h4>
                          <p className="text-xs text-gray-500 truncate">{product?.title}</p>
                        </div>
                      </div>
                    );
                  })}
                  {chats.length === 0 && (
                    <div className="text-center p-6 text-gray-400 text-sm">No active chats</div>
                  )}
                </div>
              </div>
              
              <div className="w-full lg:w-2/3 border border-gray-100 rounded-3xl overflow-hidden bg-white flex flex-col">
                {activeChatId ? (
                  <>
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <div className="font-bold flex items-center gap-2">
                        <MessageSquare size={18} className="text-purple" />
                        Chatting with {chats.find(c => c.id === activeChatId)?.otherUser}
                      </div>
                      <button onClick={() => deleteChat(activeChatId)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors" title="Delete Chat">
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[url('/chat-bg.png')] bg-opacity-10">
                      {chats.find(c => c.id === activeChatId)?.messages.map(msg => {
                        const isMe = msg.sender === 'me';
                        const repliedMsg = msg.replyToId ? chats.find(c => c.id === activeChatId)?.messages.find(m => m.id === msg.replyToId) : null;
                        
                        if (msg.isDeleted) {
                          return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <div className="px-4 py-2 rounded-2xl bg-gray-100 text-gray-400 italic text-sm border border-gray-200">
                                This message was deleted.
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-4`}>
                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl flex flex-col gap-1 ${isMe ? 'bg-purple text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'} shadow-sm`}>
                              {repliedMsg && !repliedMsg.isDeleted && (
                                <div className={`text-xs p-2 rounded-xl mb-1 border-l-2 ${isMe ? 'bg-white/10 border-white/40 text-white/80' : 'bg-gray-200/50 border-gray-400 text-gray-600'}`}>
                                  {repliedMsg.text}
                                </div>
                              )}
                              <div className="flex items-end gap-2">
                                <span>{msg.text}</span>
                                {isMe && <CheckCheck size={14} className={`shrink-0 mb-0.5 ml-1 ${msg.status === 'read' ? 'text-blue-300' : 'text-white/70'}`} />}
                              </div>
                            </div>
                            
                            {/* Action Buttons underneath the text */}
                            {!msg.isDeleted && (
                              <div className={`flex items-center gap-3 mt-1.5 px-2 opacity-80 hover:opacity-100`}>
                                <button onClick={() => setReplyingTo(msg)} className="text-[11px] flex items-center gap-1 hover:text-blue-500 font-bold text-gray-500 uppercase tracking-widest transition-colors">
                                  <Reply size={12} /> Reply
                                </button>
                                {isMe && (
                                  <button onClick={() => deleteMessage(activeChatId, msg.id)} className="text-[11px] flex items-center gap-1 hover:text-red-500 font-bold text-gray-500 uppercase tracking-widest transition-colors">
                                    <Trash2 size={12} /> Delete
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="p-4 border-t border-gray-100 bg-white flex flex-col gap-2">
                      {replyingTo && (
                        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 p-2 rounded-xl text-sm">
                          <div className="flex items-center gap-2 text-gray-600 truncate">
                            <Reply size={14} className="text-purple" />
                            <span className="truncate">Replying to: {replyingTo.text}</span>
                          </div>
                          <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          maxLength={500}
                          value={newMessage}
                          onChange={e => setNewMessage(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && sendMessage()}
                          className="flex-1 rounded-full border-0 py-3 pl-5 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-purple sm:text-sm sm:leading-6"
                          placeholder="Negotiate the price..."
                        />
                        <button onClick={sendMessage} className="w-12 h-12 rounded-full bg-purple flex items-center justify-center text-white hover:bg-purple/90 shadow-md">
                          < ArrowRight size={20} />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <MessageSquare size={48} className="mb-4 opacity-20" />
                    <p>Select a chat to view messages</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: SELL */}
          {activeTab === "sell" && (
            <div className="max-w-4xl mx-auto mt-10 fade-in space-y-10">
              
              {/* My Pending Offers (Negotiated Prices) */}
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tighter mb-4">Pending Offers to Approve</h3>
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-orange-200 p-6 space-y-4">
                  {pendingOffers.filter(o => o.status === 'pending').length === 0 ? (
                    <div className="text-center text-gray-500 py-4">No pending offers right now.</div>
                  ) : (
                    pendingOffers.filter(o => o.status === 'pending').map(offer => {
                      const product = products.find(p => p.id === offer.productId);
                      return (
                         <div key={offer.id} className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-orange-50 rounded-2xl border border-orange-100">
                            <div>
                              <h4 className="font-bold text-gray-900">Offer on: {product?.title || "Unknown Item"}</h4>
                              <p className="text-sm text-gray-600 mt-1"><strong>Buyer:</strong> {offer.buyerName}</p>
                              <p className="text-sm text-gray-600"><strong>Negotiated Price:</strong> ₹{offer.negotiatedPrice}</p>
                              <p className="text-sm text-gray-600"><strong>Proposed Place:</strong> {offer.place}</p>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                              <button onClick={() => handleApproveOffer(offer)} className="btn btn-primary !rounded-xl px-6 py-2 shadow-sm text-sm whitespace-nowrap">
                                Approve Deal
                              </button>
                              <button onClick={() => handleRejectOffer(offer)} className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold rounded-xl px-4 py-2 text-sm shadow-sm">
                                Reject
                              </button>
                            </div>
                         </div>
                      );
                    })
                  )}
                  {pendingOffers.filter(o => o.status === 'pending').length > 0 && <p className="text-xs text-gray-500 mt-4 px-2">Approve the finalized negotiated price and meetup location as sent by the buyer.</p>}
                </div>
              </div>

              <div className="max-w-2xl mx-auto">
                <div className="bg-gradient-to-tr from-lavender/40 to-blue/40 p-10 rounded-[2.5rem] shadow-sm relative overflow-hidden text-center mb-8 border border-purple/10">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tighter relative z-10">List a New Item</h2>
                  <p className="mt-2 text-gray-600 font-medium relative z-10">Only list items in good condition. Pending deals will show above.</p>
                </div>

                <form onSubmit={handleSellSubmit} className="space-y-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <div>
                  <label className="block text-sm font-bold leading-6 text-gray-900">Title</label>
                  <input type="text" required value={sellTitle} onChange={e => setSellTitle(e.target.value)} maxLength={60}
                    className="mt-2 block w-full rounded-2xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-purple sm:text-sm"
                    placeholder="e.g. Vintage Levi's 501" />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold leading-6 text-gray-900">Price (₹)</label>
                    <input type="number" required value={sellPrice} onChange={e => setSellPrice(e.target.value)} min={0} max={1000000}
                      className="mt-2 block w-full rounded-2xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-purple sm:text-sm"
                      placeholder="e.g. 800" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold leading-6 text-gray-900">Condition</label>
                    <select required value={sellCondition} onChange={e => setSellCondition(e.target.value)}
                      className="mt-2 block w-full rounded-2xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-purple sm:text-sm">
                      <option value="">Select condition</option>
                      <option value="New with Tags">New with Tags</option>
                      <option value="Like New">Like New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                    </select>
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-bold leading-6 text-gray-900 mb-2">Upload Image <span className="text-red-500">*</span></label>
                   <div className="flex justify-center rounded-3xl border border-dashed border-gray-300 px-6 py-10 hover:bg-gray-50 transition-colors cursor-pointer relative overflow-hidden">
                    <input type="file" required accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => e.target.files && setSellImage(e.target.files[0])} />
                    <div className="text-center w-full z-10 pointer-events-none">
                      {sellImage ? (
                        <p className="text-sm font-bold text-purple truncate">{sellImage.name}</p>
                      ) : (
                        <>
                          <ImageIcon className="mx-auto h-12 w-12 text-gray-300 pointer-events-none" aria-hidden="true" />
                          <div className="mt-4 flex text-sm justify-center leading-6 text-gray-600 pointer-events-none">
                            <span className="relative rounded-md font-semibold text-purple">Upload a file</span>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs leading-5 text-gray-500 pointer-events-none">PNG, JPG, GIF up to 10MB</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full btn btn-primary py-4 text-lg !rounded-full shadow-lg shadow-purple/20">
                    List Item for Sale
                  </button>
                </div>
              </form>
              </div>
            </div>
          )}

          {/* TAB: CART */}
          {activeTab === "cart" && (
            <div className="max-w-4xl mx-auto mt-6 fade-in">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingBag size={64} className="mx-auto text-gray-200 mb-6" />
                  <h3 className="text-2xl font-bold text-gray-400">Your cart is empty</h3>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(id => {
                    const product = products.find(p => p.id === id);
                    if (!product) return null;
                    return (
                      <div key={id} className="flex gap-6 p-4 bg-white rounded-3xl border border-gray-100 shadow-sm items-center">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden relative flex-shrink-0">
                          <Image src={product.image} alt={product.title} fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg">{product.title}</h3>
                          <p className="text-sm text-gray-500">Condition: {product.condition}</p>
                          <p className="font-extrabold text-purple text-lg mt-1">{product.price}</p>
                        </div>
                        <button onClick={() => toggleCart(id)} className="w-10 h-10 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                          <X size={20} />
                        </button>
                      </div>
                    );
                  })}
                  <div className="mt-8 flex justify-end">
                    <button onClick={() => setActiveTab("payment")} className="btn btn-primary !rounded-full px-8 py-3 shadow-lg flex items-center gap-2">
                       Proceed to Final Payment <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: WISHLIST */}
          {activeTab === "wishlist" && (
            <div className="max-w-4xl mx-auto mt-6 fade-in">
              {wishlist.length === 0 ? (
                <div className="text-center py-20">
                  <Heart size={64} className="mx-auto text-gray-200 mb-6" />
                  <h3 className="text-2xl font-bold text-gray-400">Your wishlist is empty</h3>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlist.map(id => {
                    const product = products.find(p => p.id === id);
                    if (!product) return null;
                    return (
                      <div key={id} className="card !p-0 overflow-hidden flex flex-col group relative">
                        <button 
                          onClick={() => toggleWishlist(id)}
                          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm text-red-500 hover:text-gray-400 transition-colors"
                        >
                          <Heart size={18} fill="currentColor" />
                        </button>
                        <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                          <Image src={product.image} alt={product.title} fill className="object-cover" />
                        </div>
                        <div className="p-4 border-t border-gray-100">
                          <h3 className="font-bold text-gray-900 leading-tight truncate">{product.title}</h3>
                          <span className="font-extrabold text-purple tracking-tight">{product.price}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: PAYMENT */}
          {activeTab === "payment" && (
            <div className="max-w-2xl mx-auto mt-6 fade-in">
              <div className="bg-gradient-to-tr from-lavender/40 to-blue/40 p-8 rounded-[2rem] text-center mb-8 border border-purple/10">
                <Banknote size={48} className="mx-auto text-purple mb-4" />
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Final Payment & Negotiation</h2>
                <p className="mt-2 text-gray-600 font-medium">No online checkout. Finalize your deal and meet in person.</p>
              </div>

              {pendingOffers.filter(o => o.buyerName === name && name !== "").length > 0 && (
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-orange-100 mb-8 space-y-4">
                  <h3 className="font-bold text-gray-900 text-xl tracking-tight">My Sent Deals </h3>
                  {pendingOffers.filter(o => o.buyerName === name && name !== "").reverse().map(offer => {
                    const product = products.find(p => p.id === offer.productId);
                    return (
                      <div key={offer.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center gap-4 flex-col md:flex-row">
                        <div className="flex-1 w-full relative pl-3 border-l-2 border-purple/30">
                          <span className="font-bold text-gray-900 block truncate">{product?.title || "Unknown Item"}</span>
                          <span className="text-sm text-gray-500 block truncate">You Proposed: ₹{offer.negotiatedPrice} | Place: {offer.place}</span>
                        </div>
                        <div className={`px-4 py-2 w-full md:w-auto text-center rounded-xl text-sm font-bold whitespace-nowrap shadow-sm
                          ${offer.status === 'pending' ? 'bg-orange-100 text-orange-700' : 
                            offer.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {offer.status === 'pending' && "Pending Seller..."}
                          {offer.status === 'approved' && "Approved! Meet safely."}
                          {offer.status === 'rejected' && "Rejected by Seller."}
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-xs text-gray-500 text-center uppercase tracking-widest font-bold pt-2">Track the status of your offers here</p>
                </div>
              )}

              {cart.length === 0 ? (
                <div className="text-center py-10 text-gray-500">Your cart is empty. Ensure you add items before making a final payment plan!</div>
              ) : (
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
                  
                  {/* Cart Summary */}
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <h3 className="font-bold text-gray-900 mb-4">Items to Finalize</h3>
                    {cart.map(id => {
                      const product = products.find(p => p.id === id);
                      return product ? (
                        <div key={id} className="flex justify-between items-center mb-2 last:mb-0">
                          <span className="text-gray-600">{product.title}</span>
                          <span className="font-bold text-purple">{product.price}</span>
                        </div>
                      ) : null;
                    })}
                  </div>

                  {/* Negotiation Section */}
                  <div>
                    <label className="block text-sm font-bold leading-6 text-gray-900">Price Counter Meter (Negotiate)</label>
                    <p className="text-xs text-gray-500 mb-2">Propose your counter-price. The seller must approve it.</p>
                    <div className="mt-2 relative">
                      <input type="number" 
                        value={negotiatedPrice}
                        onChange={(e) => setNegotiatedPrice(e.target.value)}
                        className="block w-full rounded-2xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-purple sm:text-sm sm:leading-6"
                        placeholder="e.g. 700" />
                    </div>
                  </div>

                  {/* Future Booking Amount Note */}
                  <div className="bg-blue/10 border border-blue/20 p-4 rounded-2xl flex items-start gap-4">
                     <CheckCircle2 className="text-blue mt-1 shrink-0" size={20} />
                     <div>
                       <h4 className="font-bold text-blue">5% Booking Amount (Coming Soon)</h4>
                       <p className="text-sm text-gray-600 mt-1">In future updates, a 5% advance booking amount of the final price will be required securely online before the deal is completely approved by the seller.</p>
                     </div>
                  </div>

                  {/* Meetup Logistics */}
                  <div>
                    <label className="block text-sm font-bold leading-6 text-gray-900">Where to Meet? (One-to-One)</label>
                    <textarea 
                      rows={3}
                      value={meetupLocation}
                      onChange={(e) => setMeetupLocation(e.target.value)}
                      className="mt-2 block w-full rounded-2xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-purple sm:text-sm sm:leading-6 custom-scrollbar"
                      placeholder="e.g. NIT Hamirpur Main Gate at 5 PM. I will pay in cash."
                    ></textarea>
                  </div>

                  <div className="pt-4">
                    <button onClick={handleSendDeal} className="w-full btn btn-primary py-4 text-lg !rounded-full shadow-lg shadow-purple/20">
                      Send Deal for Approval
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>


      {/* RIGHT AREA (SIDEBAR) */}
      <div className="w-full md:w-80 p-4 md:p-8 md:pl-4">
        {/* User Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple/10 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-lavender to-purple flex items-center justify-center text-white font-black text-xl shadow-md">
            {name ? name.charAt(0).toUpperCase() : "N"}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-gray-900 truncate tracking-tight">{name || "New User"}</h4>
            <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
              <MapPin size={12} className="text-purple/70" /> {location || "No Location"}
            </p>
          </div>
        </div>

        {/* Navigation / Sections */}
        <nav className="bg-white rounded-[2.5rem] shadow-sm border border-purple/10 overflow-hidden">
          <div className="p-4 space-y-2">
            
            <button 
              onClick={() => isProfileComplete && setActiveTab("browse")}
              disabled={!isProfileComplete}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${activeTab === 'browse' ? 'bg-gradient-to-r from-blue/10 to-lavender/20 text-blue shadow-sm' : 'text-gray-600 hover:bg-gray-50'} ${!isProfileComplete && 'opacity-50 cursor-not-allowed'}`}
            >
              <PackageSearch size={22} className={activeTab === 'browse' ? 'text-blue' : 'text-gray-400'} />
              1. Browse
            </button>
            
            <button 
              onClick={() => isProfileComplete && setActiveTab("chat")}
              disabled={!isProfileComplete}
              className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${activeTab === 'chat' ? 'bg-gradient-to-r from-lavender/20 to-purple/10 text-purple shadow-sm' : 'text-gray-600 hover:bg-gray-50'} ${!isProfileComplete && 'opacity-50 cursor-not-allowed'}`}
            >
              <div className="flex items-center gap-4">
                <MessageSquare size={22} className={activeTab === 'chat' ? 'text-purple' : 'text-gray-400'} />
                2. Chat
              </div>
              {chats.length > 0 && <span className="w-6 h-6 rounded-full bg-purple text-white text-xs flex items-center justify-center">{chats.length}</span>}
            </button>

            <button 
              onClick={() => isProfileComplete && setActiveTab("sell")}
              disabled={!isProfileComplete}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${activeTab === 'sell' ? 'bg-gradient-to-r from-purple/10 to-blue/10 text-purple shadow-sm' : 'text-gray-600 hover:bg-gray-50'} ${!isProfileComplete && 'opacity-50 cursor-not-allowed'}`}
            >
              <PlusCircle size={22} className={activeTab === 'sell' ? 'text-purple' : 'text-gray-400'} />
              3. Sell
            </button>

            <button 
              onClick={() => isProfileComplete && setActiveTab("cart")}
              disabled={!isProfileComplete}
              className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${activeTab === 'cart' ? 'bg-gradient-to-r from-blue/10 to-lavender/20 text-blue shadow-sm' : 'text-gray-600 hover:bg-gray-50'} ${!isProfileComplete && 'opacity-50 cursor-not-allowed'}`}
            >
              <div className="flex items-center gap-4">
                <ShoppingBag size={22} className={activeTab === 'cart' ? 'text-blue' : 'text-gray-400'} />
                4. Cart
              </div>
              {cart.length > 0 && <span className="w-6 h-6 rounded-full bg-blue text-white text-xs flex items-center justify-center">{cart.length}</span>}
            </button>

            <button 
              onClick={() => isProfileComplete && setActiveTab("wishlist")}
              disabled={!isProfileComplete}
              className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${activeTab === 'wishlist' ? 'bg-gradient-to-r from-red-50 to-red-100/50 text-red-500 shadow-sm' : 'text-gray-600 hover:bg-gray-50'} ${!isProfileComplete && 'opacity-50 cursor-not-allowed'}`}
            >
              <div className="flex items-center gap-4">
                <Heart size={22} className={activeTab === 'wishlist' ? 'text-red-500' : 'text-gray-400'} />
                5. Wishlist
              </div>
              {wishlist.length > 0 && <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">{wishlist.length}</span>}
            </button>

            <button 
              onClick={() => isProfileComplete && setActiveTab("payment")}
              disabled={!isProfileComplete}
              className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${activeTab === 'payment' ? 'bg-gradient-to-r from-blue/10 to-lavender/20 text-blue shadow-sm' : 'text-gray-600 hover:bg-gray-50'} ${!isProfileComplete && 'opacity-50 cursor-not-allowed'}`}
            >
              <div className="flex items-center gap-4">
                <Banknote size={22} className={activeTab === 'payment' ? 'text-blue' : 'text-gray-400'} />
                6. Final Payment
              </div>
            </button>
            
            <div className="h-px bg-gray-100 my-2 w-full"></div>

            <button 
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${activeTab === 'profile' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <HelpCircle size={22} className={activeTab === 'profile' ? 'text-gray-900' : 'text-gray-400'} />
              7. Help / Profile ID
            </button>

          </div>
          
          <div className="bg-gray-50 p-4 border-t border-gray-100">
            <button onClick={logout} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-colors">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </nav>
      </div>

    </div>
  );
}
