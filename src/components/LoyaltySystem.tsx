import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Award, 
  Coins, 
  Gift, 
  Sparkles, 
  Search, 
  Phone, 
  Check, 
  Info, 
  Percent, 
  Ticket,
  ChevronRight,
  UserCheck
} from "lucide-react";

interface LoyaltySystemProps {
  onSearchCartPhone?: (phone: string) => void;
}

export default function LoyaltySystem({ onSearchCartPhone }: LoyaltySystemProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [searchedData, setSearchedData] = useState<{
    phone: string;
    orderCount: number;
    points: number;
    title: string;
  } | null>(null);
  
  const [signUpName, setSignUpName] = useState("");
  const [signUpPhone, setSignUpPhone] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Helper to standard clean of phone
  const cleanPhone = (p: string) => p.trim().replace(/\s+/g, "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setStatusMessage("Please enter a valid phone or WhatsApp number.");
      return;
    }

    const cleaned = cleanPhone(phoneNumber);
    const stored = localStorage.getItem(`shaaz_loyalty_${cleaned}`);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        let tierTitle = "Bronze Treat Chaser";
        if (parsed.points > 750) tierTitle = "Imperial Gold Connoisseur";
        else if (parsed.points > 250) tierTitle = "Elite Silver Crustum Insider";

        setSearchedData({
          phone: cleaned,
          orderCount: parsed.orderCount || 0,
          points: parsed.points || 0,
          title: tierTitle
        });
        setStatusMessage(null);
      } catch (e) {
        setStatusMessage("Failed to retrieve rewards history. Please try again.");
      }
    } else {
      setSearchedData({
        phone: cleaned,
        orderCount: 0,
        points: 0,
        title: "Fresh Scout Tier"
      });
      setStatusMessage("Welcome! This number has 0 orders recorded yet, but you will automatically earn points on your checkout! Or sign up now for 100 free welcome points.");
    }
  };

  const handleInstantSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName.trim() || !signUpPhone.trim()) {
      setStatusMessage("Please complete both name and mobile phone fields.");
      return;
    }

    const cleaned = cleanPhone(signUpPhone);
    const existing = localStorage.getItem(`shaaz_loyalty_${cleaned}`);
    
    if (existing) {
      setStatusMessage("Account already active! Please use Search above to check your balance.");
      setIsSigningUp(false);
      return;
    }

    // Active instant Best Offer incentive: 120 points welcome bonus!
    const welcomeData = {
      orderCount: 0,
      points: 120 // Welcome reward points instantly
    };
    
    localStorage.setItem(`shaaz_loyalty_${cleaned}`, JSON.stringify(welcomeData));
    setSearchedData({
      phone: cleaned,
      orderCount: 0,
      points: 120,
      title: "Bronze Elite Welcome Member"
    });

    setSignupSuccess(true);
    setStatusMessage("Excellent choice! You've been credited with 120 instant Points on us.");
    
    // Quick callback if user wants this phone copied into their checkout basket
    if (onSearchCartPhone) {
      onSearchCartPhone(cleaned);
    }

    setTimeout(() => {
      setSignupSuccess(false);
      setIsSigningUp(false);
    }, 4000);
  };

  const handleApplyToCart = () => {
    if (searchedData && onSearchCartPhone) {
      onSearchCartPhone(searchedData.phone);
      setStatusMessage("✓ Phone number linked to active cart drawer!");
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleSimulatePurchase = () => {
    if (!searchedData) return;
    const cleaned = cleanPhone(searchedData.phone);
    const currentOrders = searchedData.orderCount;
    // Simulate buying an Rs 2,500 Box bundle
    const nextOrders = currentOrders + 1;
    // 250 points (Rs 2,500 basket value = 250 points at Rs 10 per point) + 50 points bonus
    const nextPoints = searchedData.points + 300; 
    
    const updated = { orderCount: nextOrders, points: nextPoints };
    localStorage.setItem(`shaaz_loyalty_${cleaned}`, JSON.stringify(updated));
    
    let tierTitle = "Bronze Treat Chaser";
    if (nextPoints > 750) tierTitle = "Imperial Gold Connoisseur";
    else if (nextPoints > 250) tierTitle = "Elite Silver Crustum Insider";

    setSearchedData({
      phone: cleaned,
      orderCount: nextOrders,
      points: nextPoints,
      title: tierTitle
    });
    setStatusMessage("⚡ Order checkout simulated! Added +300 reward points (spent Rs 2,500 + bonus) and updated milestone!");
  };

  const handleResetHistory = () => {
    if (!searchedData) return;
    const cleaned = cleanPhone(searchedData.phone);
    localStorage.removeItem(`shaaz_loyalty_${cleaned}`);
    setSearchedData({
      phone: cleaned,
      orderCount: 0,
      points: 0,
      title: "Fresh Scout Tier"
    });
    setStatusMessage("Rewards history has been reset to empty.");
  };

  return (
    <section id="loyalty-rewards" className="py-24 bg-[#120a07] border-b border-[#2a1b12] relative z-10 overflow-hidden">
      {/* Decorative luxury sparkles and gradients */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-[#d4a373]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-80 h-80 bg-[#b58c4c]/4 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-[#d4a373] font-sans font-semibold uppercase tracking-[0.3em] text-xs inline-flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#d4a373]" /> Exclusive VIP Loyalty Hub
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#f8f1e9] tracking-tight leading-tight">
            Shaaz Sweet Rewards System
          </h2>
          <p className="text-[#b8a99a] font-sans text-sm sm:text-base leading-relaxed font-light">
            We cherish our regular dessert lovers! Every order you place with Chef Shaaz brings guaranteed cash rewards, flat discounts, and elite culinary bonuses automatically.
          </p>
        </div>

        {/* Benefits Grid - explaining the Points & Milestone value */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          
          <div className="p-6 sm:p-8 bg-[#1e130d] rounded-2xl border border-[#2a1b12] shadow-xl space-y-4 hover:border-[#d4a373]/50 transition-all duration-300">
            <div className="w-12 h-12 bg-[#2a1b12] text-[#d4a373] rounded-2xl flex items-center justify-center border border-[#d4a373]/10">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif text-[#f8f1e9] font-semibold">
              Points Based on Spent Price
            </h3>
            <div className="space-y-2">
              <p className="text-[#8d7c6b] font-sans text-xs leading-relaxed font-light">
                No complex math! For every <strong className="text-[#f8f1e9]">Rs 10</strong> you place on any brownies, you immediately earn <strong className="text-[#d4a373]">1 Rewards Point</strong>.
              </p>
              <div className="bg-[#120a07] p-2 rounded-xl border border-[#2a1b12] text-[11px] text-[#b8a99a] font-mono">
                Order Value Rs 2,500 = <span className="text-amber-400 font-bold">250 Points</span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 bg-[#1e130d] rounded-2xl border border-[#2a1b12] shadow-xl space-y-4 hover:border-[#d4a373]/50 transition-all duration-300">
            <div className="w-12 h-12 bg-[#2a1b12] text-[#d4a373] rounded-2xl flex items-center justify-center border border-[#d4a373]/10">
              <Gift className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif text-[#f8f1e9] font-semibold">
              The Epic 5th Order Discount
            </h3>
            <p className="text-[#8d7c6b] font-sans text-xs leading-relaxed font-light">
              Our ultimate landmark repeating buyer offer! Every <strong className="text-[#f8f1e9]">5th completed order milestone</strong> drops an automatic <strong className="text-green-400 font-bold">Rs 500 Discount</strong> on top of your entire bill! We reward consistency with big sweet savings.
            </p>
          </div>

          <div className="p-6 sm:p-8 bg-[#1e130d] rounded-2xl border border-[#2a1b12] shadow-xl space-y-4 hover:border-[#d4a373]/50 transition-all duration-300">
            <div className="w-12 h-12 bg-[#2a1b12] text-[#d4a373] rounded-2xl flex items-center justify-center border border-[#d4a373]/10">
              <Ticket className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif text-[#f8f1e9] font-semibold">
              Point Redemption Perks
            </h3>
            <p className="text-[#8d7c6b] font-sans text-xs leading-relaxed font-light">
              Acquire points and spend them! Every <strong className="text-[#d4a373]">500 points</strong> can be instantly exchanged for a <strong className="text-[#f8f1e9]">Free Double Fudge Funtastic cup</strong>, or bank 1000 points to receive a custom Chef choice catering box free!
            </p>
          </div>

        </div>

        {/* Interactive Check Dashboard Panel */}
        <div className="bg-[#1e130d] rounded-3xl border border-[#2a1b12] p-6 sm:p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#d4a373]/10 to-transparent pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
            
            {/* Left side: Search & Registration Inputs */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-serif text-[#f8f1e9] mb-2">
                  My Rewards Balance Desk
                </h3>
                <p className="text-[#8d7c6b] font-sans text-xs leading-relaxed font-light">
                  Type your active WhatsApp contact number to look up accumulated points, review orders, or sign up for welcome perks.
                </p>
              </div>

              {/* Error / Status Notices */}
              <AnimatePresence mode="wait">
                {statusMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3.5 bg-[#d4a373]/10 border border-[#d4a373]/20 rounded-xl text-xs text-[#d4a373] leading-relaxed flex items-start gap-2"
                  >
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{statusMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isSigningUp ? (
                <form onSubmit={handleSearch} className="space-y-3">
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8d7c6b]" />
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter WhatsApp / Mobile Number (e.g. 03009842814)"
                      className="w-full bg-[#120a07] text-[#f8f1e9] placeholder-[#8d7c6b] rounded-xl border border-[#2a1b12] pl-11 pr-4 py-3 text-xs outline-none focus:border-[#d4a373] transition font-sans"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-[#d4a373] hover:bg-[#b58c4c] text-[#120a07] font-semibold text-xs py-3 rounded-xl transition duration-300 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5" /> Check My Perks
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSigningUp(true);
                        setStatusMessage(null);
                      }}
                      className="border border-[#d4a373]/30 hover:border-[#d4a373] text-[#d4a373] hover:bg-[#d4a373]/10 text-xs py-3 px-5 rounded-xl transition duration-300 font-sans cursor-pointer whitespace-nowrap"
                    >
                      New Customer? Sign Up
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleInstantSignUp} className="space-y-3 p-4 bg-[#120a07]/50 rounded-2xl border border-[#2a1b12]">
                  <h4 className="text-xs font-bold text-[#f8f1e9] uppercase tracking-wider mb-2">
                    ⚡ Register & Claim 120 Welcome Points
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      required
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      placeholder="My Full Name"
                      className="w-full bg-[#120a07] text-[#f8f1e9] rounded-xl border border-[#2a1b12] px-4 py-2.5 text-xs outline-none focus:border-[#d4a373] transition font-sans"
                    />
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8d7c6b]" />
                      <input
                        type="text"
                        required
                        value={signUpPhone}
                        onChange={(e) => setSignUpPhone(e.target.value)}
                        placeholder="WhatsApp/Mobile Phone Number"
                        className="w-full bg-[#120a07] text-[#f8f1e9] rounded-xl border border-[#2a1b12] pl-10 pr-4 py-2.5 text-xs outline-none focus:border-[#d4a373] transition font-sans"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={signupSuccess}
                      className="flex-1 bg-gradient-to-r from-[#d4a373] to-[#b58c4c] text-[#120a07] font-sans font-bold text-xs py-2.5 rounded-xl transition hover:opacity-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> {signupSuccess ? "Success!" : "Sign Up & Get Points"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSigningUp(false)}
                      className="text-xs text-[#8d7c6b] hover:text-[#f8f1e9] px-3 font-sans transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

            </div>

            {/* Right side: Visual Live Status Panel */}
            <div className="lg:col-span-6 bg-[#120a07] rounded-3xl border border-[#2a1b12] p-6 relative min-h-[250px] flex flex-col justify-between">
              
              <AnimatePresence mode="wait">
                {searchedData ? (
                  <motion.div
                    key={searchedData.phone}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5 h-full flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-[#8d7c6b] font-mono tracking-widest block uppercase text-left">
                          Member Account: <span className="text-[#f8f1e9]">{searchedData.phone}</span>
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#d4a373] bg-[#d4a373]/10 px-2.5 py-0.5 rounded-full border border-[#d4a373]/20">
                          {searchedData.title}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-center py-4 bg-[#1e130d]/40 rounded-2xl border border-[#2a1b12] mb-4">
                        <div className="border-r border-[#2a1b12]">
                          <span className="text-[10px] text-[#8d7c6b] block font-sans uppercase">Purchased Milestones</span>
                          <span className="text-2xl font-serif font-extrabold text-[#f8f1e9]">
                            {searchedData.orderCount} <span className="text-xs font-sans font-light text-[#8d7c6b]">Orders</span>
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#8d7c6b] block font-sans uppercase">Sweet Balance</span>
                          <span className="text-2xl font-serif font-extrabold text-[#d4a373]">
                            {searchedData.points} <span className="text-xs font-sans font-light text-[#8d7c6b]">PTS</span>
                          </span>
                        </div>
                      </div>

                      {/* Milestone visual gauge tracker */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-[#b8a99a] font-sans">
                          <span className="font-light">Your Route to 5th Order Discount:</span>
                          <span className="font-bold text-[#d4a373]">
                            {(searchedData.orderCount) % 5} / 5 completed
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-[#1e130d] rounded-full overflow-hidden border border-[#2a1b12] flex gap-1 p-[1.5px]">
                          {Array.from({ length: 5 }).map((_, idx) => {
                            const fillCount = (searchedData.orderCount) % 5;
                            const isActive = idx < fillCount;
                            return (
                              <div
                                key={idx}
                                className={`flex-1 h-full rounded-full transition-all duration-700 ${
                                  isActive ? "bg-gradient-to-r from-[#d4a373] to-[#b58c4c]" : "bg-[#1f1612]"
                                }`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#2a1b12] flex flex-col sm:flex-row gap-2.5 justify-between">
                      <div className="text-left">
                        {searchedData.orderCount > 0 && (searchedData.orderCount + 1) % 5 === 0 ? (
                          <p className="text-[11px] text-green-400 font-medium">
                            🎉 Milestone Unlocked! Your next checkout automatically triggers <strong>Rs 500 Discount</strong>!
                          </p>
                        ) : (
                          <p className="text-[10.5px] text-[#8d7c6b] leading-tight font-light">
                            Spend points on next pre-order for gourmet upgrades!
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1.5 self-end">
                        <button
                          type="button"
                          onClick={handleApplyToCart}
                          className="bg-[#1e130d] border border-[#d4a373]/40 hover:border-[#d4a373] text-xs font-sans py-1.5 px-3 rounded-lg text-[#f8f1e9] transition"
                        >
                          Link to Checkout Basket
                        </button>
                        <button
                          type="button"
                          onClick={handleSimulatePurchase}
                          className="bg-[#d4a373]/15 text-[#d4a373] hover:bg-[#d4a373] hover:text-[#120a07] text-[10px] uppercase tracking-wider font-bold py-1.5 px-2.5 rounded-lg transition"
                          title="Simulate complete order of 2500 rupees"
                        >
                          Simulate +300 PTS
                        </button>
                        <button
                          type="button"
                          onClick={handleResetHistory}
                          className="text-[9px] hover:text-red-400 text-[#8d7c6b] p-1 font-mono uppercase"
                          title="Clear data"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty-loyalty-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center text-center py-10 h-full space-y-3"
                  >
                    <div className="w-14 h-14 bg-[#1e130d] text-[#8d7c6b] rounded-full flex items-center justify-center border border-[#2a1b12]">
                      <Sparkles className="w-6 h-6 text-[#d4a373]" />
                    </div>
                    <div className="max-w-xs">
                      <h4 className="text-sm font-semibold text-[#f8f1e9] font-serif">
                        Perk Tracker Pending
                      </h4>
                      <p className="text-[11.5px] text-[#8d7c6b] font-sans font-light mt-1 leading-relaxed">
                        Search your WhatsApp contact above or create a free membership to reveal custom scores, milestones, and reward cards.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
