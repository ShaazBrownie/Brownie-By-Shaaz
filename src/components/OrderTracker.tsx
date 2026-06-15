import React, { useState, useEffect } from "react";
import { X, Search, Truck, Loader2, CheckCircle2, Clock, MapPin, Gift, Phone, Send, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface OrderTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
}

export default function OrderTracker({ isOpen, onClose, initialOrderId = "" }: OrderTrackerProps) {
  const [orderId, setOrderId] = useState(initialOrderId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any | null>(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    if (initialOrderId) {
      setOrderId(initialOrderId);
      handleSearch(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSearch = async (targetId?: string) => {
    const idToSearch = targetId || orderId.trim().toUpperCase();
    if (!idToSearch) {
      setError("Please key in a valid Order Tracking ID (e.g. SHZ-1234).");
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const response = await fetch(`/api/orders/${idToSearch}`);
      if (!response.ok) {
        // Fallback for Netlify deployment or missing server: check localStorage
        const localSaved = localStorage.getItem(`shaaz_order_${idToSearch}`);
        if (localSaved) {
          try {
            const parsed = JSON.parse(localSaved);
            setOrder(parsed);
            return;
          } catch (e) {}
        }
        throw new Error("We couldn't locate this Order ID. Please double check the ID or place a fresh pre-order first!");
      }
      const data = await response.json();
      setOrder(data);
    } catch (err: any) {
      // Fallback in catch block as well for general network/offline operations
      const localSaved = localStorage.getItem(`shaaz_order_${idToSearch}`);
      if (localSaved) {
        try {
          const parsed = JSON.parse(localSaved);
          setOrder(parsed);
          return;
        } catch (e) {}
      }
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateStatus = async () => {
    if (!order) return;
    setSimulating(true);

    try {
      const response = await fetch(`/api/orders/${order.id}/status`, {
        method: "PATCH"
      });
      if (response.ok) {
        const updatedOrder = await response.json();
        setOrder(updatedOrder);
        setSimulating(false);
        return;
      }
    } catch (err) {
      console.log("Interactive Workbench: API not found, updating via local storage simulation logic");
    }

    // Client-side offline/static simulation fallback (perfect for Netlify)
    try {
      const localSaved = localStorage.getItem(`shaaz_order_${order.id}`);
      const baseOrder = localSaved ? JSON.parse(localSaved) : order;

      const states = ["received", "confirmed", "baking", "dispatched", "delivered"];
      const currentIndex = states.indexOf(baseOrder.status || "received");
      let nextIndex = currentIndex + 1;
      if (nextIndex >= states.length) nextIndex = states.length - 1;

      const nextStatus = states[nextIndex];
      const nowStr = new Date().toISOString();

      let title = "";
      let description = "";

      switch (nextStatus) {
        case "received":
          title = "Order Request Transmitted";
          description = "Bespoke brownie cart sent and order registered in database. Direct WhatsApp link generated.";
          break;
        case "confirmed":
          title = "WhatsApp Confirmed & Verified";
          description = "Chef Shaaz accepted and confirmed your baking request. Ingredients prepped with pure premium butter.";
          break;
        case "baking":
          title = "Mixing Butter & Cocoa 🥣";
          description = "Our kitchen is currently whipping pure dark chocolate chips, melting farm butter, and baking to that rich, fudgy, decadent level.";
          break;
        case "dispatched":
          title = "Out for Dispatch (Rider Assigned)";
          description = "Freshly sealed premium brownie box is packaged with note and handed to local Lahore dispatch rider.";
          break;
        case "delivered":
          title = "Delivered Soft & Chewy! 🍫";
          description = "Handed over warm and rich! We hope these brownie layers sweeten your day. Feel free to review us!";
          break;
      }

      const updatedLocal = {
        ...baseOrder,
        status: nextStatus,
        timeline: [
          ...(baseOrder.timeline || []),
          {
            status: nextStatus,
            title,
            description,
            timestamp: nowStr
          }
        ]
      };

      try {
        localStorage.setItem(`shaaz_order_${order.id}`, JSON.stringify(updatedLocal));
      } catch (e) {}

      setOrder(updatedLocal);
    } catch (e) {
      console.error("Local simulation error:", e);
    } finally {
      setSimulating(false);
    }
  };

  // Status mapping
  const getStatusDetails = (status: string) => {
    switch (status) {
      case "received":
        return {
          title: "Pre-Order Registered",
          desc: "Saved in our kitchen queue. Awaiting WhatsApp message confirmation.",
          color: "text-amber-400",
          stepIndex: 0
        };
      case "confirmed":
        return {
          title: "Baking Confirmed",
          desc: "Recipe verified by Chef Shaaz! Kitchen prep initiated.",
          color: "text-blue-400",
          stepIndex: 1
        };
      case "baking":
        return {
          title: "Fresh in Oven",
          desc: "Our chefs are heating the premium Belgian cocoa fudge right now.",
          color: "text-[#d4a373]",
          stepIndex: 2
        };
      case "dispatched":
        return {
          title: "Out for Dispatch",
          desc: "Wrapped in a custom presentation box and handed to the local Lahore rider.",
          color: "text-purple-400",
          stepIndex: 3
        };
      case "delivered":
        return {
          title: "Delivered & Warm",
          desc: "Delivered to your doorstep! Enjoy with a milk pairing or cold coffee.",
          color: "text-green-400",
          stepIndex: 4
        };
      default:
        return {
          title: "Baking Prep",
          desc: "Pre-order has been logged.",
          color: "text-[#d4a373]",
          stepIndex: 0
        };
    }
  };

  const steps = [
    { key: "received", label: "Ticket Registered" },
    { key: "confirmed", label: "WhatsApp Confirmed" },
    { key: "baking", label: "Fresh Baking" },
    { key: "dispatched", label: "Out with Rider" },
    { key: "delivered", label: "Gooey Arrival" }
  ];

  const currentStatusX = order ? getStatusDetails(order.status) : null;

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
            className="fixed inset-0 bg-stone-950/80 backdrop-blur-md z-50 transition-opacity"
          />

          {/* Dialog Frame Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-[#120a07] border border-[#2a1b12] rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden relative text-[#f8f1e9]"
            >
              {/* Gold Top Flare Aesthetic */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4a373] to-transparent" />

              {/* Header Box */}
              <div className="bg-[#1e130d] px-6 sm:px-8 py-5 border-b border-[#2a1b12] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#d4a373]/10 border border-[#d4a373]/20 flex items-center justify-center text-[#d4a373]">
                    <Truck className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-[#f8f1e9] leading-none">
                      Live Bakery Order Tracker
                    </h3>
                    <span className="text-[10px] text-[#8d7c6b] font-sans uppercase tracking-wider block mt-1">
                      Brownie by Shaaz • Model Town Lahore
                    </span>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-1 rounded-xl hover:bg-[#120a07] text-[#8d7c6b] hover:text-[#f8f1e9] transition cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Interior Scrollable Content */}
              <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto space-y-6">
                
                {/* ID input card */}
                <div className="bg-[#1e130d] p-5 rounded-2xl border border-[#2a1b12] space-y-3 shadow-inner">
                  <label className="text-xs font-semibold text-[#8d7c6b] block uppercase tracking-wider font-sans">
                    Enter Order Tracking ID
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#8d7c6b]" />
                      <input
                        type="text"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        placeholder="e.g. SHZ-3975"
                        className="w-full bg-[#120a07] pl-10 pr-4 py-3 rounded-xl border border-[#2a1b12] text-sm uppercase font-mono tracking-widest text-[#f8f1e9] placeholder-[#52443a] focus:border-[#d4a373] outline-none transition"
                      />
                    </div>
                    <button
                      onClick={() => handleSearch()}
                      disabled={loading}
                      className="bg-[#d4a373] text-[#120a07] hover:bg-[#c99563] disabled:bg-stone-800 disabled:text-stone-600 px-6 py-3 rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Query Pipeline"
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Panel */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-400 font-sans leading-relaxed text-center">
                    ⚠️ {error}
                  </div>
                )}

                {/* Initial Instruction State */}
                {!order && !loading && !error && (
                  <div className="text-center py-6 space-y-3">
                    <div className="max-w-md mx-auto space-y-2">
                      <p className="text-sm text-[#b8a99a] font-light leading-relaxed">
                        To fetch the active status of your baked goods, input the <strong>4-digit Order ID</strong> shown upon checkout.
                      </p>
                      <p className="text-[11px] text-[#8d7c6b] italic font-light">
                        Our premium artisanal brownies are prepared in small customized batches. Enter your ID to monitor temperature stages and rider routes.
                      </p>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {loading && (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <Loader2 className="w-8 h-8 text-[#d4a373] animate-spin" />
                    <span className="text-xs text-[#8d7c6b] font-sans italic">Consulting kitchen databases...</span>
                  </div>
                )}

                {/* Tracking Details Results */}
                {order && currentStatusX && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Visual Status Timeline Progress Tracker */}
                    <div className="bg-[#1e130d] border border-[#2a1b12] rounded-2xl p-5 sm:p-6 space-y-6 shadow-sm">
                      <div className="flex justify-between items-start flex-col sm:flex-row gap-2 border-b border-[#2a1b12] pb-4">
                        <div>
                          <span className="text-[9.5px] uppercase tracking-wider text-[#8d7c6b] font-semibold block">Track Order ID</span>
                          <span className="font-mono text-lg font-bold text-[#d4a373] tracking-widest">{order.id}</span>
                        </div>
                        
                        <div className="text-right sm:text-right text-xs">
                          <span className="text-[#8d7c6b] block">Target Date:</span>
                          <span className="text-[#f8f1e9] font-medium font-sans">{order.deliveryDate || "Next-Day baking"}</span>
                        </div>
                      </div>

                      {/* Interactive Steppers */}
                      <div className="relative pt-2">
                        {/* Connecting Line */}
                        <div className="absolute top-[18px] left-[15px] right-[15px] h-[3px] bg-[#2a1b12] -z-10 hidden sm:block">
                          <div
                            className="bg-[#d4a373] h-full transition-all duration-500"
                            style={{ width: `${(currentStatusX.stepIndex / (steps.length - 1)) * 100}%` }}
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-1">
                          {steps.map((st, idx) => {
                            const isPassed = idx <= currentStatusX.stepIndex;
                            const isCurrent = idx === currentStatusX.stepIndex;

                            return (
                              <div key={st.key} className="flex sm:flex-col items-center gap-3 sm:gap-2 sm:text-center sm:flex-1 relative">
                                <div
                                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                                    isPassed 
                                      ? "bg-[#d4a373] border-[#d4a373] text-[#120a07]" 
                                      : "bg-[#120a07] border-[#2a1b12] text-[#8d7c6b]"
                                  } ${isCurrent ? "ring-4 ring-[#d4a373]/20 scale-105" : ""}`}
                                >
                                  {isPassed ? (
                                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                                  ) : (
                                    <Clock className="w-4.5 h-4.5" />
                                  )}
                                </div>
                                <div>
                                  <span className={`text-xs block font-bold transition-all ${isPassed ? "text-[#f8f1e9]" : "text-[#8d7c6b]"}`}>
                                    {st.label}
                                  </span>
                                  <span className="text-[9.5px] text-[#8d7c6b] sm:hidden block mt-0.5 font-light">
                                    {idx === 0 ? "Baking scheduled" : idx === 1 ? "Chef confirmed" : idx === 2 ? "Fudge rising" : idx === 3 ? "Dispatched" : "Arrived"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Timeline Detail Description text box */}
                      <div className="bg-[#120a07] border border-[#2a1b12] p-4 rounded-xl flex items-start gap-3 mt-4">
                        <div className="p-1.5 rounded-lg bg-[#d4a373]/10 text-[#d4a373] flex-shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <span className={`text-xs font-bold font-sans block ${currentStatusX.color}`}>
                            Current Status: {currentStatusX.title}
                          </span>
                          <p className="text-[11.5px] text-[#b8a99a] mt-0.5 leading-relaxed font-light">
                            {currentStatusX.desc}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Details Breakdown Box */}
                    <div className="border border-[#2a1b12] rounded-2xl p-5 space-y-4">
                      <span className="text-[11px] font-sans font-semibold tracking-wider text-[#8d7c6b] uppercase block">
                        Order Details summary
                      </span>

                      {/* Items */}
                      <div className="space-y-2 border-b border-[#2a1b12] pb-4">
                        {order.cartItems?.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-xs sm:text-sm">
                            <div className="flex items-baseline gap-1.5 text-[#f8f1e9]">
                              <span className="font-serif font-medium">{item.name}</span>
                              <span className="text-[11px] text-[#8d7c6b]">({item.pieces} Pcs Box)</span>
                            </div>
                            <span className="font-mono text-[#b8a99a]">
                              x{item.quantity}  ➔  <span className="text-[#d4a373]">Rs {item.price * item.quantity}</span>
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Recipient Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-[#8d7c6b]">
                            <Phone className="w-3.5 h-3.5 text-[#d4a373]" /> WhatsApp Receiver:
                          </div>
                          <span className="text-[#f8f1e9] block font-medium ml-5">{order.name} ({order.phone})</span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-[#8d7c6b]">
                            <MapPin className="w-3.5 h-3.5 text-[#d4a373]" /> Delivery Location:
                          </div>
                          <span className="text-[#f8f1e9] block font-medium ml-5 leading-normal truncate" title={order.address || "Self-Pickup"}>
                            {order.deliveryType === "pickup" ? "🏪 Kitchen pickup (Model Town)" : order.address || "No address provided"}
                          </span>
                        </div>
                      </div>

                      {/* Billing Totals */}
                      <div className="bg-[#1e130d] p-4 rounded-xl border border-[#2a1b12] flex justify-between items-center text-sm">
                        <span className="font-sans text-[#8d7c6b] text-xs">Total Bill (with Lahore Rider):</span>
                        <span className="font-serif font-bold text-base text-[#d4a373]">Rs {order.totalBill}</span>
                      </div>

                      {/* Greeting Note Preview if present */}
                      {order.isGift && order.giftMessage && (
                        <div className="bg-[#2a1b12]/30 border border-[#d4a373]/10 p-4 rounded-xl space-y-1.5">
                          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#d4a373] flex items-center gap-1">
                            <Gift className="w-3.5 h-3.5" /> Handwritten message card attached
                          </span>
                          <p className="text-xs text-[#b8a99a] italic leading-relaxed">
                            "{order.giftMessage}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Demonstration Simulator Area - Highly interactive and fun! */}
                    <div className="bg-[#291b10] border border-[#d4a373]/15 p-4 rounded-xl space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <span className="text-xs font-bold text-[#e5b383] block">
                            🔥 Order Testing Workbench:
                          </span>
                          <p className="text-[10px] text-[#b8a99a] leading-normal font-light">
                            Want to test status updates? Click to advance this order directly through the baking pipeline stages!
                          </p>
                        </div>
                        <button
                          onClick={handleSimulateStatus}
                          disabled={simulating || order.status === "delivered"}
                          className="px-4 py-2 bg-[#d4a373]/10 border border-[#d4a373]/30 text-[#d4a373] hover:bg-[#d4a373]/20 disabled:border-stone-800 disabled:text-stone-600 disabled:bg-stone-900 rounded-xl font-sans text-xs font-semibold tracking-wider transition cursor-pointer flex items-center gap-1 flex-shrink-0"
                        >
                          {simulating ? "Updating..." : order.status === "delivered" ? "Completed 👌" : "Advance Status ➔"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Sticky Footer */}
              <div className="bg-[#1e130d] px-6 sm:px-8 py-5 border-t border-[#2a1b12] flex justify-between items-center text-xs">
                <span className="text-[#8d7c6b] font-light">
                  Need custom urgent assistance?
                </span>
                <a
                  href="https://wa.me/923019842814"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#d4a373] hover:underline font-bold flex items-center gap-1"
                >
                  <Send className="w-3 h-3" /> Buzz Chef Shaaz
                </a>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
