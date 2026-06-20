import React, { useState, useEffect } from "react";
import { CartItem } from "../types";
import { WHATSAPP_NUMBER } from "../data";
import { X, Plus, Minus, Trash2, ShoppingBag, Gift, User, Phone, MapPin, Calendar, Send, Sparkles, CheckCircle2, Copy, FileText, ChevronDown, Wallet, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQty: (cartId: string, delta: number) => void;
  onRemoveItem: (cartId: string) => void;
  onClearCart: () => void;
  onOpenTracker?: (orderId?: string) => void;
  linkedPhone?: string;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onOpenTracker,
  linkedPhone
}: CartDrawerProps) {
  // Checkout Form states
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    deliveryDate: "",
    deliveryType: "within5km", // "pickup" | "within5km" | "above5km"
    isGift: false,
    giftMessage: "",
  });

  useEffect(() => {
    if (linkedPhone) {
      setFormData((prev) => ({ ...prev, phone: linkedPhone }));
    }
  }, [linkedPhone]);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [confirmedOrder, setConfirmedOrder] = useState<{ id: string; waUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [jazzCashCopied, setJazzCashCopied] = useState(false);

  // Get previous loyalty statistics for current phone
  const getCustomerLoyalty = (phoneNum: string) => {
    if (!phoneNum || !phoneNum.trim()) return { orderCount: 0, points: 0 };
    const cleaned = phoneNum.trim().replace(/\s+/g, "");
    const history = localStorage.getItem(`shaaz_loyalty_${cleaned}`);
    if (history) {
      try {
        return JSON.parse(history);
      } catch (e) {
        return { orderCount: 0, points: 0 };
      }
    }
    return { orderCount: 0, points: 0 };
  };

  const saveCustomerLoyalty = (phoneNum: string, data: { orderCount: number; points: number }) => {
    const cleaned = phoneNum.trim().replace(/\s+/g, "");
    localStorage.setItem(`shaaz_loyalty_${cleaned}`, JSON.stringify(data));
  };

  const loyalty = getCustomerLoyalty(formData.phone);
  const isLoyaltyDiscountAvailable = loyalty.orderCount > 0 && (loyalty.orderCount + 1) % 5 === 0;

  const totalItems = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const grandTotal = cartItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  const loyaltyDiscount = isLoyaltyDiscountAvailable ? Math.min(grandTotal, 500) : 0;
  const finalGrandTotal = grandTotal - loyaltyDiscount;

  const deliveryFee = formData.deliveryType === "pickup" ? 0 : formData.deliveryType === "within5km" ? 150 : 250;
  const totalBill = finalGrandTotal + deliveryFee;

  const todayStr = (() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  })();

  const tomorrowStr = (() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  })();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const type = e.target.type;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    
    // Clear error
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Name is required.";
    if (!formData.phone.trim()) errors.phone = "Phone/WhatsApp is required.";
    if (formData.deliveryType !== "pickup" && !formData.address.trim()) {
      errors.address = "Delivery address is required.";
    }
    if (!formData.deliveryDate) {
      errors.deliveryDate = "Please choose a delivery or pickup date.";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleWhatsAppCheckout = () => {
    if (!validateForm()) {
      return;
    }

    // Generate a unique and gorgeous Order tracking ID
    const orderId = `SHZ-${Math.floor(1000 + Math.random() * 9000)}`;

    // Design neat, structured preloaded order template for WhatsApp
    let orderDetailText = "";
    cartItems.forEach((item, index) => {
      orderDetailText += `${index + 1}. *${item.name}* (${item.pieces} Pcs Box) 
   Quantity: x${item.quantity}  ➔  Rs ${item.price * item.quantity}\n`;
    });

    const isGiftStr = formData.isGift && formData.giftMessage.trim() 
      ? `✅ YES\n   💌 Message: "${formData.giftMessage}"` 
      : "❌ No";

    const dateStr = formData.deliveryDate ? formData.deliveryDate : "Baked Fresh upon earliest dispatch";

    const deliveryMethodStr = formData.deliveryType === "pickup" 
      ? "🏪 Self-Pickup from kitchen (Model Town, Lahore)" 
      : formData.deliveryType === "within5km"
      ? "🚗 Delivery within 5 KM of Model Town Lahore (Rs 150)"
      : "🚗 Delivery above 5 KM from Model Town Lahore (Rs 250)";

    const locationNoticeStr = formData.deliveryType === "pickup"
      ? "📍 Pickup Location: Model Town, Lahore. (We will share coordinates on WhatsApp)"
      : `📍 Address: ${formData.address.trim()}\n\n⚠️ *IMPORTANT:* Please reply to this WhatsApp chat with your *live pin-drop location* so our rider can reach you smoothly!`;

    const textPayload = `🍫 *NEW BROWNIE ORDER - BROWNIE BY SHAAZ* 🍫
-----------------------------------------
🏷️ *ORDER ID:* ${orderId}  ➔ [Track In-App!]
-----------------------------------------
👤 *CUSTOMER DETAILS:*
• *Name:* ${formData.name.trim()}
• *WhatsApp:* ${formData.phone.trim()}
• *Method:* ${deliveryMethodStr}
• *Target Date:* ${dateStr}${formData.deliveryDate === todayStr ? " ⚡ (Same-Day Chef Confirmation Required)" : ""}

🗺️ *DELIVERY INFORMATION:*
${locationNoticeStr}

🤤 *ORDER BREAKDOWN:*
${orderDetailText}
🎁 *CUSTOM GIFT BOX?* 
• *Handwritten Note Card:* ${isGiftStr}

📊 *SUMMARY BILLING:*
• *Subtotal:* Rs ${grandTotal}
${loyaltyDiscount > 0 ? `• *Repeated Customer Discount:* -Rs ${loyaltyDiscount} (Order #${loyalty.orderCount + 1} 👑)\n` : ""}• *Delivery Fee:* Rs ${deliveryFee}
• *Total Payable:* Rs ${totalBill}
${loyaltyDiscount > 0 ? `\n🎉 *LOYALTY MILESTONE:* Unlocked repeated buyer celebration discount of Rs ${loyaltyDiscount}!` : `\n⭐ *POINTS ALERT:* You are earning +${totalItems * 50} Shaaz Sweet Rewards Points on this order!`}

💳 *JAZZCASH WALLET PAYMENT DETAILS:*
• *Transfer Rs ${totalBill} to:*
  ↳ *Number:* 03270711962
  ↳ *Account Title:* Shazia Anwar
⚠️ *IMPORTANT:* Please reply/send your *payment screenshot* in this chat. Your order will be confirmed immediately upon screenshot validation!
-----------------------------------------
*Note:* We bake fresh to order with pure farm ingredients. 
⚠️ For urgent within-day delivery under 1 day, please contact Chef Shaaz directly at 03009842814.
${formData.deliveryDate === todayStr ? "👨‍🍳 *Chef Shaaz will confirm baking slot after WhatsApp checkout.*" : ""}
Thank you for supporting our homemade brownie business! Baked with love by Shaaz. ❤️`;

    // Construct standard web WhatsApp URL
    const encodedText = encodeURIComponent(textPayload);
    const waUrl = `https://wa.me/923019842814?text=${encodedText}`;

    // Save order data client-side in localStorage as a high-fidelity backup for Netlify/static hosting
    const localFallbackOrder = {
      id: orderId,
      name: formData.name.trim(),
      customerName: formData.name.trim(),
      phone: formData.phone.trim(),
      deliveryType: formData.deliveryType,
      address: formData.address.trim(),
      deliveryDate: formData.deliveryDate,
      cartItems: cartItems.map(item => ({
        name: item.name,
        pieces: item.pieces,
        quantity: item.quantity,
        price: item.price
      })),
      subtotal: grandTotal,
      discount: loyaltyDiscount,
      deliveryFee: deliveryFee,
      totalBill: totalBill,
      isGift: formData.isGift,
      giftMessage: formData.giftMessage,
      status: "received",
      createdAt: new Date().toISOString(),
      timeline: [
        {
          status: "received",
          title: "Order Request Transmitted",
          description: "Bespoke brownie cart sent and order registered in database. Direct WhatsApp link generated.",
          timestamp: new Date().toISOString()
        }
      ]
    };
    try {
      localStorage.setItem(`shaaz_order_${orderId}`, JSON.stringify(localFallbackOrder));
    } catch (e) {
      console.warn("Failed to write offline local storage order:", e);
    }

    // POST order directly to backend JSON store so it's instantly trackable
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: orderId,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        deliveryType: formData.deliveryType,
        address: formData.address.trim(),
        deliveryDate: formData.deliveryDate,
        cartItems: cartItems.map(item => ({
          name: item.name,
          pieces: item.pieces,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: grandTotal,
        discount: loyaltyDiscount,
        deliveryFee: deliveryFee,
        totalBill: totalBill,
        isGift: formData.isGift,
        giftMessage: formData.giftMessage
      })
    })
    .then(res => res.json())
    .then(data => {
      console.log("Order saved successfully:", data);
    })
    .catch(err => {
      console.error("Failed to save order to database:", err);
    });

    // Save loyalty points & repeat customer state securely upon confirmation
    const newCount = loyalty.orderCount + 1;
    const pointsEarned = totalItems * 50;
    const newPoints = loyalty.points + pointsEarned;
    saveCustomerLoyalty(formData.phone, { orderCount: newCount, points: newPoints });

    // Save state to present an intermediate beautiful receipt ticket summary in the drawer
    setConfirmedOrder({ id: orderId, waUrl });
    
    // Clear out the cart items
    onClearCart();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950/75 backdrop-blur-sm z-50 transition-opacity"
          />

          {/* Drawer Panel Container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[500px] bg-[#120a07] shadow-2xl z-50 flex flex-col h-screen overflow-hidden text-[#f8f1e9] font-sans border-l border-[#2a1b12]"
          >
            {/* Drawer Header Navbar */}
            <div className="bg-[#1e130d] px-6 py-5 border-b border-[#2a1b12] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5.5 h-5.5 text-[#d4a373]" />
                <h3 className="text-xl font-serif font-bold text-[#f8f1e9]">
                  {confirmedOrder ? "Order Receipt Ticket" : `Your Brownie Box (${totalItems})`}
                </h3>
              </div>

              <button
                onClick={() => {
                  onClose();
                  setConfirmedOrder(null);
                }}
                className="p-1 rounded-xl hover:bg-[#120a07] text-[#8d7c6b] hover:text-[#f8f1e9] transition cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {confirmedOrder ? (
              /* Success / Receipt Screen - Flows inside the drawer */
              <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between bg-[#120a07]">
                <div className="space-y-6 my-auto text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center mx-auto mb-2 border border-green-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  
                  <div>
                    <span className="text-[10px] text-[#8d7c6b] uppercase tracking-[0.25em] font-bold block mb-1">Step 1 Complete</span>
                    <h4 className="text-2xl font-serif font-semibold text-[#f8f1e9]">Order Registered!</h4>
                    <p className="text-xs text-[#b8a99a] mt-2 max-w-sm mx-auto font-light leading-relaxed">
                      We have compiled your delicious brownie box & registered your Order ID in our local baking queue. Please click below to send details and lock in your order with the chef on WhatsApp!
                    </p>
                  </div>

                  {/* Order Ticket details */}
                  <div className="bg-[#1e130d] border border-[#2a1b12] rounded-2xl p-5 text-left relative overflow-hidden max-w-md mx-auto">
                    <div className="absolute top-0 right-0 w-10 h-10 bg-[#d4a373]/5 rounded-bl-3xl" />
                    
                    <span className="text-[9px] uppercase tracking-wider text-[#8d7c6b] block font-semibold mb-1">Your Tracking ID</span>
                    <div className="flex items-center justify-between gap-4 bg-[#120a07] border border-[#2a1b12] px-4 py-3 rounded-xl">
                      <span className="font-mono text-lg font-bold text-[#d4a373] tracking-widest select-all">
                        {confirmedOrder.id}
                      </span>
                      <button
                        onClick={() => {
                          try {
                            navigator.clipboard.writeText(confirmedOrder.id);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          } catch (err) {
                            console.error("Clipboard write blocked:", err);
                          }
                        }}
                        className="text-xs bg-[#1e130d] border border-[#2a1b12] hover:border-[#d4a373] hover:text-[#d4a373] text-[#b8a99a] px-2.5 py-1.5 rounded-lg font-sans transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        {copied ? "Copied!" : "Copy ID"}
                      </button>
                    </div>

                    <div className="mt-4 border-t border-[#2a1b12] pt-4 space-y-2 text-xs text-[#b8a99a]">
                      <div className="flex justify-between">
                        <span>Customer Name:</span>
                        <span className="text-[#f8f1e9] font-medium">{formData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>WhatsApp Location Rule:</span>
                        <span className="text-[#d4a373] font-medium">Pin required via chat</span>
                      </div>
                    </div>
                  </div>

                  {/* Compact success JazzCash details card */}
                  <div className="bg-[#1b1009] border border-red-500/20 rounded-2xl p-4 text-left relative overflow-hidden max-w-md mx-auto">
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-[#da121a] via-[#f7d110] to-[#da121a]" />
                    <div className="ml-1.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Wallet className="w-3.5 h-3.5 text-[#d4a373]" />
                          <span className="text-[11px] font-bold font-sans text-[#f8f1e9] uppercase tracking-wide">JazzCash Wallet (Pay to Confirm)</span>
                        </div>
                        <span className="text-[8px] bg-[#da121a]/15 text-[#da121a] font-extrabold uppercase px-1.5 py-0.5 rounded border border-[#da121a]/25">Transfer Pending</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-[#120a07] border border-[#2a1b12] p-2 rounded-xl flex items-center justify-between gap-1.5">
                          <div>
                            <span className="text-[8px] text-[#8d7c6b] block uppercase tracking-wide">Number</span>
                            <span className="font-mono text-xs font-bold text-[#f8f1e9] select-all">03270711962</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                navigator.clipboard.writeText("03270711962");
                                setJazzCashCopied(true);
                                setTimeout(() => setJazzCashCopied(false), 2000);
                              } catch (e) {}
                            }}
                            className="text-[9px] font-semibold bg-[#1e130d] hover:bg-[#d4a373] text-[#d4a373] hover:text-[#120a07] border border-[#d4a373]/20 px-2 py-1 rounded transition"
                          >
                            {jazzCashCopied ? "Copied" : "Copy"}
                          </button>
                        </div>
                        <div className="bg-[#120a07] border border-[#2a1b12] p-2 rounded-xl">
                          <span className="text-[8px] text-[#8d7c6b] block uppercase tracking-wide">Account Title</span>
                          <span className="font-sans text-xs font-bold text-[#f8f1e9] truncate block">Shazia Anwar</span>
                        </div>
                      </div>

                      <div className="bg-amber-500/5 border border-amber-500/15 p-2 rounded-xl text-[10px] text-amber-300 font-light leading-relaxed">
                        📸 <strong>Baking Rule:</strong> Complete the transfer above, then click below to send the <strong>payment screenshot</strong> to WhatsApp number <strong>03019842814</strong>!
                      </div>
                    </div>
                  </div>

                  {/* Flow Action Guideline */}
                  <div className="space-y-3 pt-2">
                    <button
                      onClick={() => {
                        window.open(confirmedOrder.waUrl, "_blank", "noopener,noreferrer");
                      }}
                      className="w-full bg-[#25d366] hover:bg-[#20ba5a] text-white font-sans font-bold py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-98 cursor-pointer text-sm tracking-wide max-w-md mx-auto"
                    >
                      <Send className="w-4 h-4 fill-current text-white" />
                      Proceed to WhatsApp Chat Now
                    </button>
                    
                    <p className="text-[10px] text-[#8d7c6b] max-w-xs mx-auto leading-relaxed font-light">
                      *Please launch the chef thread. Senders who complete the WhatsApp chat immediately get priority baking and live pin support!
                    </p>
                  </div>
                </div>

                {/* Footer options */}
                <div className="border-t border-[#2a1b12]/75 pt-5 mt-auto flex flex-col gap-2.5">
                  <button
                    onClick={() => {
                      if (onOpenTracker) {
                        onOpenTracker(confirmedOrder.id);
                      }
                      onClose();
                      setConfirmedOrder(null);
                    }}
                    className="w-full bg-[#1e130d] border border-[#d4a373]/30 text-[#d4a373] hover:border-[#d4a373] py-3.5 rounded-xl text-xs font-semibold tracking-wider font-sans transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" /> Go to Order Tracking Page
                  </button>
                  <button
                    onClick={() => {
                      setConfirmedOrder(null);
                      onClose();
                    }}
                    className="w-full text-center text-xs text-[#8d7c6b] hover:text-[#f8f1e9] font-sans py-2.5 transition cursor-pointer font-light"
                  >
                    Dismiss & Back to Menu
                  </button>
                </div>
              </div>
            ) : (
              /* Shopping cart body list */
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cartItems.length === 0 ? (
                  /* Empty state */
                  <div className="h-[55vh] flex flex-col items-center justify-center text-center p-4">
                    <div className="w-20 h-20 rounded-full bg-[#1e130d] flex items-center justify-center text-[#d4a373] mb-4 animate-bounce">
                      <ShoppingBag className="w-10 h-10" />
                    </div>
                    <h4 className="text-lg font-serif font-bold text-[#f8f1e9]">Your basket is empty</h4>
                    <p className="text-sm text-[#8d7c6b] mt-1 max-w-[280px] font-light">
                      Head back to the menu and add some premium fudge or slotted boxes!
                    </p>
                    <button
                      onClick={onClose}
                      className="mt-6 bg-[#d4a373] text-[#120a07] px-6 py-3 rounded-xl text-sm font-semibold transition hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      Browse Brownies
                    </button>
                  </div>
                ) : (
                  /* Non-empty cart with scrolling forms */
                  <div className="space-y-6 pb-12">
                    {/* Cart Items List */}
                    <div className="space-y-3 pb-6 border-b border-[#2a1b12]">
                      <span className="text-[11px] font-sans font-semibold tracking-wider text-[#8d7c6b] uppercase block">
                        Selected Items
                      </span>
                      
                      {cartItems.map((item) => (
                        <div
                          key={item.cartId}
                          className="bg-[#1e130d] p-3 rounded-2xl border border-[#2a1b12] shadow-sm flex gap-3.5 items-center hover:border-[#d4a373]/30 transition"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 rounded-xl object-cover flex-shrink-0 filter brightness-[0.85]"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-serif font-bold text-sm text-[#f8f1e9] truncate leading-tight">
                              {item.name}
                            </h4>
                            <span className="text-xs text-[#d4a373] font-sans block mt-0.5 font-light">
                              {item.pieces} Pieces Box
                            </span>
                            <span className="text-sm font-sans font-semibold text-[#b8a99a] block mt-1">
                              Rs {item.price}
                            </span>
                          </div>

                          {/* Quantity controls */}
                          <div className="flex items-center gap-3 bg-[#120a07] rounded-xl p-1 border border-[#2a1b12]">
                            <button
                              onClick={() => onUpdateQty(item.cartId, -1)}
                              className="w-7 h-7 rounded-lg text-[#8d7c6b] hover:text-[#f8f1e9] hover:bg-[#1e130d] flex items-center justify-center transition cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            
                            <span className="text-xs font-sans font-bold text-[#f8f1e9] w-4 text-center">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() => onUpdateQty(item.cartId, 1)}
                              className="w-7 h-7 rounded-lg text-[#8d7c6b] hover:text-[#f8f1e9] hover:bg-[#1e130d] flex items-center justify-center transition cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Remove item button */}
                          <button
                            onClick={() => onRemoveItem(item.cartId)}
                            className="p-1 rounded-lg text-[#8d7c6b] hover:text-[#ff5252] hover:bg-[#1e130d]/50 transition cursor-pointer"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Delivery checkout coordinates form */}
                    <div className="space-y-4">
                      <span className="text-[11px] font-sans font-semibold tracking-wider text-[#8d7c6b] uppercase block border-b border-[#2a1b12] pb-1">
                        Delivery & Contact Details (WhatsApp Checkout)
                      </span>

                      {/* Customer name */}
                      <div>
                        <label className="text-xs font-semibold text-[#8d7c6b] block mb-1 font-light">
                          Receiver's Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8d7c6b]" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g. Areeba Zainab"
                            className={`w-full bg-[#1e130d] pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition font-sans text-[#f8f1e9] placeholder-[#52443a] ${
                              formErrors.name ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-[#2a1b12] focus:border-[#d4a373]"
                            }`}
                          />
                        </div>
                        {formErrors.name && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
                        )}
                      </div>

                      {/* Phone / whatsapp Contact */}
                      <div>
                        <label className="text-xs font-semibold text-[#8d7c6b] block mb-1 font-light">
                          WhatsApp Contact Number *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8d7c6b]" />
                          <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="e.g. 0300 1234567"
                            className={`w-full bg-[#1e130d] pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition font-sans text-[#f8f1e9] placeholder-[#52443a] ${
                              formErrors.phone ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-[#2a1b12] focus:border-[#d4a373]"
                            }`}
                          />
                        </div>
                        {formErrors.phone && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>
                        )}
                      </div>

                      {/* Reward Points & Repeat Customer Loyalty Section */}
                      <div className="bg-[#1c120c] p-4 rounded-2xl border border-[#d4a373]/25 relative overflow-hidden mt-1">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#d4a373]/5 rounded-bl-full pointer-events-none" />
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-[#d4a373] animate-pulse" />
                            <span className="text-xs font-bold text-[#f8f1e9] font-serif uppercase tracking-wider">
                              Shaaz Sweet Rewards Hub
                            </span>
                          </div>
                          <span className="bg-[#d4a373]/10 text-[#d4a373] text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-[#d4a373]/20">
                            Gold Loyalty Tier
                          </span>
                        </div>
                        
                        {formData.phone.trim() ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-center bg-[#120a07] p-2 rounded-xl border border-[#2a1b12]">
                              <div>
                                <span className="text-[9px] text-[#8d7c6b] block uppercase tracking-wide">Prior Completed Orders</span>
                                <span className="text-sm font-serif font-extrabold text-[#f8f1e9]">
                                  {loyalty.orderCount} Orders
                                </span>
                              </div>
                              <div>
                                <span className="text-[9px] text-[#8d7c6b] block uppercase tracking-wide">My Reward Points</span>
                                <span className="text-sm font-serif font-extrabold text-[#d4a373]">
                                  {loyalty.points} PTS
                                </span>
                              </div>
                            </div>
                            
                            {/* Order milestones tracker bar */}
                            <div>
                              <div className="flex justify-between text-[10px] text-[#b8a99a] mb-1">
                                <span>Milestone to 5th Order Discount:</span>
                                <span className="font-bold text-[#d4a373]">{(loyalty.orderCount) % 5} / 5 completed</span>
                              </div>
                              <div className="w-full h-2 bg-[#120a07] rounded-full overflow-hidden border border-[#2a1b12] flex gap-1 p-[1px]">
                                {Array.from({ length: 5 }).map((_, idx) => {
                                  const fillCount = (loyalty.orderCount) % 5;
                                  const isActive = idx < fillCount;
                                  return (
                                    <div 
                                      key={idx} 
                                      className={`flex-1 h-full rounded-full transition-all duration-500 ${
                                        isActive ? "bg-gradient-to-r from-[#d4a373] to-[#b58c4c]" : "bg-[#1f1612]"
                                      }`}
                                    />
                                  );
                                })}
                              </div>
                            </div>

                            {isLoyaltyDiscountAvailable ? (
                              <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl text-xs text-amber-300 flex items-start gap-2 animate-pulse">
                                👑 <div className="space-y-0.5">
                                  <strong className="block font-bold text-[#f8f1e9] text-[11.5px]">5th Order Repeated Milestone Unlocked!</strong>
                                  <p className="font-light text-[11px] text-[#b8a99a] leading-relaxed">
                                    Incredible support! Because you are placing your 5th order milestone, we have automatically applied a flat <strong>Rs 500 Discount</strong> on your signature brownies!
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="text-[11px] text-[#8d7c6b] leading-relaxed font-light bg-[#120a07]/55 p-2.5 rounded-xl">
                                💡 Each brownie box adds <strong>50 points</strong> to your balance. Reaching 5 orders (every 5th milestone) grants a flat <strong>Rs 500 discount</strong> on the house!
                              </div>
                            )}

                            {/* Simulation buttons to allow immediate user testing */}
                            <div className="pt-2 border-t border-[#2a1b12]/60 flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  saveCustomerLoyalty(formData.phone, { orderCount: 4, points: 200 });
                                  // Update dummy value to trigger react re-render cycle
                                  setFormData(p => ({ ...p, name: p.name }));
                                }}
                                className="flex-1 text-[10px] bg-[#2a1b12] hover:bg-[#d4a373] text-[#b8a99a] hover:text-[#120a07] py-1.5 px-2 rounded-lg font-sans font-bold transition cursor-pointer"
                              >
                                ⚡ Simulate 4 Past Orders (Claim 5th's Discount)
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  saveCustomerLoyalty(formData.phone, { orderCount: 0, points: 0 });
                                  setFormData(p => ({ ...p, name: p.name }));
                                }}
                                className="text-[10px] text-red-400 font-bold hover:bg-red-500/10 border border-red-500/25 py-1.5 px-2 rounded-lg transition animate-pulse"
                                title="Reset Loyalty"
                              >
                                Reset
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-[#8d7c6b] italic font-light p-2.5 bg-[#120a07]/30 rounded-xl leading-relaxed">
                            Please type in your phone/WhatsApp contact above to see order stats, accumulate points, and unlock repeat custom discounts!
                          </div>
                        )}
                      </div>

                      {/* Delivery & Pickup Dropdown Selector */}
                      <div>
                        <label className="text-xs font-semibold text-[#8d7c6b] block mb-1.5 font-light">
                          Delivery or Pickup Method *
                        </label>
                        <div className="relative">
                          <select
                            name="deliveryType"
                            value={formData.deliveryType}
                            onChange={handleInputChange}
                            className="w-full bg-[#1e130d] text-[#f8f1e9] pl-3.5 pr-10 py-3 rounded-xl border border-[#2a1b12] text-xs sm:text-sm outline-none focus:border-[#d4a373] focus:ring-1 focus:ring-[#d4a373]/30 transition appearance-none cursor-pointer font-sans font-medium"
                          >
                            <option value="within5km">🚗 Delivery within 5 KM from Model Town Lahore — Rs 150</option>
                            <option value="above5km">🚗 Delivery above 5 KM from Model Town Lahore — Rs 250</option>
                            <option value="pickup">🏪 Self-Pickup from our Model Town Kitchen — Free</option>
                          </select>
                          <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-[#8d7c6b]">
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </div>
                        <span className="text-[10px] text-[#8d7c6b] block mt-1 font-light italic">
                          {formData.deliveryType === "pickup" 
                            ? "Save Rs 250! Collection from our kitchen in Model Town, Lahore."
                            : formData.deliveryType === "within5km"
                            ? "Estimated under 35-45 minutes from dispatch."
                            : "Standard rider fares apply for distant Lahore neighborhoods."}
                        </span>
                      </div>

                      {/* Delivery Address fields shown conditionally */}
                      {formData.deliveryType !== "pickup" ? (
                        <div>
                          <label className="text-xs font-semibold text-[#8d7c6b] block mb-1 font-light">
                            Full Delivery Address *
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-[#8d7c6b]" />
                            <textarea
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              rows={2}
                              placeholder="e.g. House 45-B, Sector C, Model Town, Lahore"
                              className={`w-full bg-[#1e130d] pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition font-sans resize-none text-[#f8f1e9] placeholder-[#52443a] ${
                                formErrors.address ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-[#2a1b12] focus:border-[#d4a373]"
                              }`}
                            />
                          </div>
                          {formErrors.address && (
                            <p className="text-xs text-red-500 mt-1">{formErrors.address}</p>
                          )}
                          <p className="text-[10px] text-[#d4a373] mt-1.5 flex items-start gap-1 pb-1 font-light leading-relaxed bg-[#2a1b12]/30 p-2.5 rounded-lg">
                            <span className="text-amber-500 font-bold text-[10.5px]">📍 Note:</span> 
                            <span>Please share your <strong>WhatsApp Live Location Pin</strong> with us in the chat right after you click the Checkout button so the rider can reach you smoothly!</span>
                          </p>
                        </div>
                      ) : (
                        <div className="bg-[#1e130d] p-3.5 rounded-xl border border-[#2a1b12] text-xs space-y-1">
                          <span className="font-bold text-[#f8f1e9] block text-[12px]">🏪 Self-Pickup Information</span>
                          <p className="text-[#b8a99a] font-light leading-relaxed">
                            Pickup Location: <strong>Model Town, Lahore</strong>. 
                          </p>
                          <p className="text-[#8d7c6b] font-light">
                            The exact residential street address and pin coordinates will be shared in our WhatsApp message exchange as soon as your brownies are cool!
                          </p>
                        </div>
                      )}

                      {/* Requested Delivery Date with pre-order rules */}
                      <div>
                        <label className="text-xs font-semibold text-[#8d7c6b] block mb-1 font-light">
                          Requested Delivery/Pickup Date *
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8d7c6b]" />
                          <input
                            type="date"
                            name="deliveryDate"
                            min={todayStr}
                            value={formData.deliveryDate}
                            onChange={handleInputChange}
                            className={`w-full bg-[#1e130d] pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none font-sans text-[#f8f1e9] focus:border-[#d4a373] ${
                              formErrors.deliveryDate ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-[#2a1b12]"
                            }`}
                          />
                        </div>
                        {formErrors.deliveryDate && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.deliveryDate}</p>
                        )}

                        {formData.deliveryDate === todayStr && (
                          <div className="bg-[#b58c4c]/10 border border-[#d4a373]/30 p-3.5 rounded-xl space-y-1 mt-2 text-xs text-amber-400">
                            <span className="font-bold flex items-center gap-1.5 text-[#d4a373]">⚡ Same-Day Option Active</span>
                            <p className="font-light leading-relaxed text-[11px] text-[#b8a99a]">
                              Excellent! You have requested same-day baking/pickup. Standard batches require prep time, <strong>and Chef Shaaz will confirm immediate baking slots over WhatsApp chat</strong> once you checkout below.
                            </p>
                          </div>
                        )}

                        <div className="bg-[#291b10] border border-[#d4a373]/20 p-3.5 rounded-xl space-y-1.5 mt-2">
                          <span className="text-xs font-semibold text-[#d4a373] block leading-none">
                            📅 Pre-Order & Baking Target:
                          </span>
                          <p className="text-[11px] text-[#b8a99a] leading-relaxed font-light">
                            We take general pre-orders <strong>at least 1 day in advance</strong> to guarantee our signature fudgy density.
                          </p>
                          <p className="text-[11.5px] text-[#e5b383] leading-relaxed font-semibold pt-1 border-t border-[#d4a373]/10">
                            🔥 Immediate query?
                            <span className="block font-light text-xs mt-0.5 text-[#b8a99a]">
                              For custom urgencies or bulk caterings, contact Chef Shaaz directly at <a href="tel:03009842814" className="underline font-bold text-[#f8f1e9]">0300 9842814</a>.
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Celebration/Gift Pack Toggle */}
                      <div className="bg-[#1e130d] p-4 rounded-2xl border border-[#2a1b12] mt-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            name="isGift"
                            checked={formData.isGift}
                            onChange={handleInputChange}
                            className="w-4 h-4 rounded text-[#120a07] focus:ring-[#d4a373] border-[#2a1b12] bg-[#120a07]"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-bold text-[#f8f1e9] flex items-center gap-1.5 leading-none">
                              <Gift className="w-4 h-4 text-[#d4a373]" /> Send as a Custom Gift Box?
                            </span>
                            <span className="text-[11px] text-[#8d7c6b] block mt-1.5 font-light">
                              We add a beautiful handwriting message card inside for free!
                            </span>
                          </div>
                        </label>

                        {/* Display message card customization */}
                        <AnimatePresence>
                          {formData.isGift && (
                            <motion.div
                               initial={{ opacity: 0, height: 0 }}
                               animate={{ opacity: 1, height: "auto" }}
                               exit={{ opacity: 0, height: 0 }}
                               className="overflow-hidden mt-4 space-y-3"
                            >
                              <div>
                                <label className="text-[11px] font-bold text-[#8d7c6b] block mb-1 uppercase tracking-wide">
                                  Enter your Custom Greeting Message
                                </label>
                                <textarea
                                  name="giftMessage"
                                  value={formData.giftMessage}
                                  onChange={handleInputChange}
                                  rows={2}
                                  maxLength={150}
                                  placeholder="e.g. Wishing you the happiest birthday ever! Hope these fresh-baked chocolate treats sweeten your year. ❤️"
                                  className="w-full bg-[#120a07] p-3 rounded-xl border border-[#2a1b12] text-xs outline-none font-sans focus:border-[#d4a373] text-[#f8f1e9] resize-none"
                                />
                                <span className="text-[10px] text-[#8d7c6b] block text-right mt-0.5">
                                  {formData.giftMessage.length}/150 characters
                                </span>
                              </div>

                              {/* Live Greeting Card Note Preview */}
                              <div className="bg-[#120a07] rounded-2xl border border-[#2a1b12] p-4 shadow-inner relative overflow-hidden flex flex-col items-center">
                                <div className="absolute top-0 right-0 w-12 h-12 rounded-full bg-[#d4a373]/5 -mr-4 -mt-4" />
                                <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-[#d4a373]/5 -ml-6 -mb-6" />

                                <span className="text-[10px] font-sans font-semibold uppercase tracking-widest text-[#d4a373] mb-1 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" /> Live Greeting Card Note Preview
                                </span>

                                <div className="w-full border-t border-[#2a1b12] mb-3" />
                                
                                <p className="text-[#b8a99a] font-sans italic text-xs leading-relaxed text-center font-medium max-w-xs px-2 min-h-[40px] flex items-center justify-center">
                                  {formData.giftMessage.trim() ? `"${formData.giftMessage}"` : '"Your handwritten message card will appear here..."'}
                                </p>

                                <p className="mt-4 text-[9px] font-sans font-semibold text-[#8d7c6b] tracking-wider uppercase">
                                  baked from the heart • brownie by shaaz
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* JazzCash Mobile Wallet Payment Card */}
                    <div className="bg-[#1b1009] border border-red-500/20 rounded-2xl p-5 space-y-3.5 relative overflow-hidden mt-6">
                      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-[#da121a] via-[#f7d110] to-[#da121a]" />
                      
                      <div className="ml-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-[#d4a373]" />
                            <span className="text-xs font-bold font-sans text-[#f8f1e9] uppercase tracking-wider">
                              JazzCash Mobile Wallet
                            </span>
                          </div>
                          <span className="bg-[#da121a]/10 border border-[#da121a]/35 text-[#da121a] text-[9px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wide">
                            Active
                          </span>
                        </div>

                        <p className="text-[11.5px] text-[#b8a99a] mt-2 leading-relaxed font-light">
                          Please transfer your total billing amount to the following phone wallet. Our chef will instantly verify the receipt.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                          <div className="bg-[#120a07] border border-[#2a1b12] p-2.5 rounded-xl flex items-center justify-between gap-2.5">
                            <div>
                              <span className="text-[9px] text-[#8d7c6b] block uppercase tracking-wide">Number</span>
                              <span className="font-mono text-[12.5px] font-bold text-[#f8f1e9] select-all">03270711962</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                try {
                                  navigator.clipboard.writeText("03270711962");
                                  setJazzCashCopied(true);
                                  setTimeout(() => setJazzCashCopied(false), 2000);
                                } catch (e) {}
                              }}
                              className="text-[10px] font-semibold bg-[#1e130d] hover:bg-[#d4a373] text-[#d4a373] hover:text-[#120a07] border border-[#d4a373]/25 px-2.5 py-1.5 rounded-lg transition"
                            >
                              {jazzCashCopied ? "Copied" : "Copy"}
                            </button>
                          </div>

                          <div className="bg-[#120a07] border border-[#2a1b12] p-2.5 rounded-xl">
                            <span className="text-[9px] text-[#8d7c6b] block uppercase tracking-wide">Account Title</span>
                            <span className="font-sans text-[12.5px] font-bold text-[#f8f1e9]">Shazia Anwar</span>
                          </div>
                        </div>

                        <div className="bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl text-[10px] text-amber-300 mt-3 leading-relaxed font-light italic flex items-start gap-1.5">
                          <span className="leading-none text-xs">⚠️</span>
                          <span>
                            <strong>Screenshot Required:</strong> Order will be confirmed completely after sending the payment screenshot on WhatsApp number <strong>03019842814</strong>!
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Check-out breakdown & button moved directly INSIDE the scroll body so it's not fixed/static */}
                    <div className="bg-[#1e130d] border border-[#2a1b12] p-5 rounded-2xl space-y-4 mt-6">
                      <span className="text-[11px] font-sans font-semibold tracking-wider text-[#8d7c6b] uppercase block border-b border-[#2a1b12]/60 pb-1.5">
                        Billing Breakdown & Checkout Action
                      </span>
                      
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between text-[#8d7c6b] font-sans">
                          <span>Subtotal:</span>
                          <span className="font-semibold text-[#f8f1e9]">Rs {grandTotal}</span>
                        </div>
                        {loyaltyDiscount > 0 && (
                          <div className="flex justify-between text-green-400 text-xs sm:text-sm font-medium">
                            <span className="flex items-center gap-1.5">👑 5th Order Discount:</span>
                            <span>-Rs {loyaltyDiscount}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-[#8d7c6b] font-sans">
                          <span>Delivery Fee:</span>
                          <span className="text-[#d4a373] font-bold bg-[#120a07] px-2 py-0.5 rounded-full text-xs border border-[#2a1b12]">
                            {deliveryFee === 0 ? "Free Pick-up" : `Rs ${deliveryFee}`}
                          </span>
                        </div>
                        <div className="flex justify-between text-[#f8f1e9] border-t border-[#2a1b12] pt-3 text-base sm:text-lg">
                          <span className="font-bold">Total Bill:</span>
                          <span className="font-serif font-extrabold text-[#d4a373] text-lg sm:text-xl">
                            Rs {totalBill}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={handleWhatsAppCheckout}
                        className="w-full bg-[#25d366] hover:bg-[#20ba5a] hover:scale-102 active:scale-98 text-white font-sans font-bold py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-md shadow-green-950/20 cursor-pointer text-sm tracking-wide"
                      >
                        <Send className="w-4 h-4 fill-current text-white" />
                        Order on WhatsApp (Rs {totalBill})
                      </button>

                      <p className="text-[10px] text-[#8d7c6b] text-center font-sans font-light leading-relaxed">
                        By clicking above, we pre-fill your order details & generate your unique Order Tracking ID, transferring you to WhatsApp chat dynamically.
                      </p>
                    </div>

                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
