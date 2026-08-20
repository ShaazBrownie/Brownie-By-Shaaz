import React, { useState, useEffect, useRef } from "react";
import { BrownieItem, CartItem, Review } from "./types";
import heroBrowniesImg from "./assets/images/hero_brownies_1781435720665.jpg";
import appLogoImg from "./assets/images/app_logo_1781458498390.jpg";
import { adTracker } from "./lib/analytics";
import { BROWNIE_ITEMS, CUSTOMER_REVIEWS, SOCIAL_LINKS, WHATSAPP_NUMBER } from "./data";
import MenuSection from "./components/MenuSection";
import BoxBuilder from "./components/BoxBuilder";
import CartDrawer from "./components/CartDrawer";
import OrderTracker from "./components/OrderTracker";
import LoyaltySystem from "./components/LoyaltySystem";
import { 
  ChefHat, 
  ShoppingBag, 
  Instagram, 
  Facebook, 
  MapPin, 
  Gift, 
  Truck, 
  Heart, 
  Sparkles, 
  Star, 
  Award, 
  Info,
  ChevronRight,
  MessageSquare,
  ThumbsUp,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Shopping Cart state with standard LocalStorage synchronization
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem("brownie_cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState("");
  
  // Custom reviews list state to allow users to post reviews live in-app
  const [reviews, setReviews] = useState<Review[]>(CUSTOMER_REVIEWS);
  const [newReview, setNewReview] = useState({
    author: "",
    text: "",
    rating: 5,
    platform: "instagram" as "instagram" | "facebook"
  });
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [linkedPhone, setLinkedPhone] = useState("");

  // Synchronize cart with LocalStorage
  useEffect(() => {
    localStorage.setItem("brownie_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Initial page view event tracking for Facebook and Google Ads
  useEffect(() => {
    adTracker.trackPageView();
  }, []);

  // Handle adding standard brownie boxes to cart
  const handleAddToCart = (item: BrownieItem, pieces: 4 | 6) => {
    const cartId = `${item.id}-${pieces}`;
    const price = item.prices[pieces];

    setCartItems((prev) => {
      const existing = prev.find((i) => i.cartId === cartId);
      if (existing) {
        return prev.map((i) => 
          i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          cartId,
          id: item.id,
          name: item.name,
          pieces,
          price,
          quantity: 1,
          image: item.image,
        }
      ];
    });

    // Track Facebook & Google AddToCart events
    adTracker.trackAddToCart(item.id, `${item.name} (${pieces} pieces)`, price, 1);
  };

  // Handle adding custom assortments box builder items to cart
  const handleAddCustomBoxToCart = (
    flavorBreakdown: Record<string, number>,
    size: 4 | 6,
    price: number
  ) => {
    const customId = `custom-mix-${size}-${Date.now()}`;
    
    // Create details name showing custom pieces mix, e.g. "Custom Assortment Box (2x Fudge, 2x Oreo)"
    const breakdownParts = Object.entries(flavorBreakdown)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = BROWNIE_ITEMS.find((b) => b.id === id);
        return `${qty}x ${item?.name.split(" ")[0]}`;
      });

    const customName = `Assorted Mix Box (${breakdownParts.join(", ")})`;

    const customCartItem: CartItem = {
      cartId: customId,
      id: "custom-assorted",
      name: customName,
      pieces: size,
      price: price,
      quantity: 1,
      image: heroBrowniesImg, // default mix thumbnail
    };

    setCartItems((prev) => [...prev, customCartItem]);

    // Track Facebook & Google Ads AddToCart events for the custom compiled box
    adTracker.trackAddToCart("custom-assorted", customName, price, 1);
  };

  // Adjust cart items count
  const handleUpdateQty = (cartId: string, delta: number) => {
    setCartItems((prev) => 
      prev.map((item) => {
        if (item.cartId === cartId) {
          const nextQty = item.quantity + delta;
          return nextQty > 0 ? { ...item, quantity: nextQty } : item;
        }
        return item;
      }).filter((item) => item.quantity > 0)
    );
  };

  // Remove cart item
  const handleRemoveItem = (cartId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  // Clear entire cart
  const handleClearCart = () => {
    setCartItems([]);
  };

  // Submit dynamic review in-app
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.author.trim() || !newReview.text.trim()) return;

    const addedReview: Review = {
      id: `custom-rev-${Date.now()}`,
      author: newReview.author.trim(),
      text: newReview.text.trim(),
      rating: newReview.rating,
      date: "Just now",
      platform: newReview.platform,
      likes: 0
    };

    setReviews((prev) => [addedReview, ...prev]);
    setNewReview({ author: "", text: "", rating: 5, platform: "instagram" });
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  // Calculate items count
  const cartTotalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Subtle bouncing animation trigger when new items are added to the cart
  const [isBouncing, setIsBouncing] = useState(false);
  const prevTotalItemsRef = useRef(cartTotalItems);

  useEffect(() => {
    if (cartTotalItems > prevTotalItemsRef.current) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 800);
      return () => clearTimeout(timer);
    }
    prevTotalItemsRef.current = cartTotalItems;
  }, [cartTotalItems]);

  return (
    <div className="bg-[#120a07] text-[#f8f1e9] font-sans min-h-screen relative overflow-x-hidden selection:bg-[#d4a373] selection:text-[#120a07]">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-[-5%] left-[-10%] w-[500px] h-[500px] bg-[#3d2015] rounded-full blur-[120px] opacity-40 pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#2a1b12] rounded-full blur-[100px] opacity-30 pointer-events-none z-0"></div>
      <div className="absolute top-[35%] right-[-5%] w-[450px] h-[450px] bg-[#3d2015]/60 rounded-full blur-[125px] opacity-35 pointer-events-none z-0"></div>

      {/* Sticky Header Navbar */}
      <header className="sticky top-0 bg-[#120a07]/90 backdrop-blur-md z-40 border-b border-[#2a1b12] shadow-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Brand Title with custom circular logo graphic */}
          <a href="#" className="flex items-center gap-3.5 group">
            <div className="w-12 h-12 border border-[#d4a373]/35 rounded-full overflow-hidden flex items-center justify-center transition-all group-hover:scale-105 duration-300 bg-[#1e130d] shadow-md shadow-[#120a07]">
              <img 
                src={appLogoImg} 
                alt="Brownie by Shaaz Logo Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="font-serif tracking-widest uppercase font-light text-xl text-[#f8f1e9] block sm:text-2xl leading-none">
                Brownie by Shaaz
              </span>
              <span className="text-[9px] text-[#8d7c6b] font-sans uppercase tracking-[0.25em] block mt-1.5 font-semibold">
                Artisanal & Homemade
              </span>
            </div>
          </a>

          {/* Nav items linking scrolling anchors */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold uppercase tracking-[0.2em] text-[#f8f1e9]/80">
            <a href="#about" className="hover:text-[#d4a373] transition-colors">The Story</a>
            <a href="#menu" className="hover:text-[#d4a373] transition-colors">Our Menu</a>
            <a href="#customizer" className="hover:text-[#d4a373] transition-colors">Assortment Builder</a>
            <a href="#reviews" className="hover:text-[#d4a373] transition-colors">Testimonials</a>
            <button
              onClick={() => {
                setTrackingOrderId("");
                setIsTrackingOpen(true);
              }}
              className="hover:text-[#d4a373] transition-colors cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] bg-transparent border-0 outline-none"
            >
              Track Order
            </button>
          </nav>

          {/* Socials Link Icons & Shopping Basket */}
          <div className="flex items-center gap-3 sm:gap-4">
            <a 
              href={SOCIAL_LINKS.instagram} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#8d7c6b] hover:text-[#d4a373] transition p-1.5 hover:bg-[#1e130d] rounded-full hidden xs:inline-flex"
              title="Instagram Page"
            >
              <Instagram className="w-4.5 h-4.5" />
            </a>
            <a 
              href={SOCIAL_LINKS.facebook} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#8d7c6b] hover:text-[#d4a373] transition p-1.5 hover:bg-[#1e130d] rounded-full hidden xs:inline-flex"
              title="Facebook Page"
            >
              <Facebook className="w-4.5 h-4.5" />
            </a>

            {/* Direct Order Tracker Button */}
            <button
              onClick={() => {
                setTrackingOrderId("");
                setIsTrackingOpen(true);
              }}
              className="px-3.5 py-2 border border-[#2a1b12] hover:border-[#d4a373]/40 text-[#8d7c6b] hover:text-[#d4a373] rounded-full transition-all flex items-center gap-1.5 cursor-pointer text-xs font-semibold uppercase tracking-wider h-9"
              title="Track order status"
            >
              <Truck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Track Order</span>
            </button>

            {/* Shopping Basket Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative px-5 py-2 border border-[#d4a373] text-[#d4a373] rounded-full hover:bg-[#d4a373] hover:text-[#120a07] transition-all flex items-center gap-2 cursor-pointer text-xs font-semibold uppercase tracking-wider h-9"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">My Box</span>
              
              {cartTotalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#d4a373] text-[#120a07] text-[10px] font-black rounded-full flex items-center justify-center border border-[#120a07] animate-pulse">
                  {cartTotalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main>
        
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden border-b border-[#2a1b12]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Slogan Brand Narrative */}
              <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
                <span className="inline-block text-[#d4a373] uppercase tracking-[0.3em] text-xs font-semibold bg-[#1e130d] border border-[#2a1b12] px-4 py-2 rounded-full font-sans">
                  ✨ Artisanal & Homemade
                </span>

                <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif text-[#f8f1e9] leading-[1.1] mb-6 font-light">
                  Taste the <br />
                  <span className="italic text-[#d4a373]">Unmatched</span> <br />
                  Perfection
                </h1>

                <p className="text-[#b8a99a] font-sans text-lg md:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                  Welcome to <strong className="text-[#f8f1e9] font-medium">Brownie by Shaaz</strong>. We bake premium, high-end, pure-butter homemade brownies with paper-thin shiny crackly skins and intensely fudgy melt-in-your-mouth centers. No trace of standard dry baking—an incomparable chocolate experience.
                </p>

                {/* Bullets benefits styled with immersive UI borders */}
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0 pt-2 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#1e130d] border border-[#d4a373]/30 flex items-center justify-center text-[#d4a373]">
                      <ChefHat className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-light tracking-wide text-[#b8a99a]">No Preservatives</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#1e130d] border border-[#d4a373]/30 flex items-center justify-center text-[#d4a373]">
                      <Gift className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-light tracking-wide text-[#b8a99a]">Free Greeting Card</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#1e130d] border border-[#d4a373]/30 flex items-center justify-center text-[#d4a373]">
                      <Truck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-light tracking-wide text-[#b8a99a]">Fresh Dispatch</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#1e130d] border border-[#d4a373]/30 flex items-center justify-center text-[#d4a373]">
                      <Heart className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-light tracking-wide text-[#b8a99a]">Pure Butter & Eggs</span>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                  <a
                    href="#menu"
                    className="w-full sm:w-auto flex items-center justify-center space-x-4 bg-[#d4a373] px-8 py-4 rounded-xl text-[#120a07] font-bold group hover:scale-105 transition-all shadow-lg shadow-[#d4a373]/10"
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] uppercase tracking-wider opacity-80">Direct Route</span>
                      <span className="text-base">Our Premium Menu</span>
                    </div>
                    <ChevronRight className="w-4.5 h-4.5 text-[#120a07] stroke-[3]" />
                  </a>
                  <a
                    href="#customizer"
                    className="w-full sm:w-auto flex items-center justify-center bg-transparent border border-[#b8a99a]/40 text-[#f8f1e9] font-sans font-bold py-4 px-8 rounded-xl hover:bg-[#1e130d] hover:border-[#d4a373] transition-all"
                  >
                    Build Custom Gift Box
                  </a>
                </div>
              </div>

              {/* Right Column: Hero Showcase Visual Image */}
              <div className="lg:col-span-6 relative z-10">
                <div className="absolute inset-0 bg-[#3d2015]/30 rounded-3xl blur-2xl -z-10 scale-95" />
                
                <div className="relative rounded-3xl overflow-hidden border border-[#2a1b12] shadow-2xl aspect-[16/11]">
                  <img
                    src={heroBrowniesImg}
                    alt="Premium brownie stack by Shaaz"
                    className="w-full h-full object-cover filter brightness-[0.9]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#120a07]/80 via-transparent to-transparent" />
                  
                  {/* Quote badge floating */}
                  <div className="absolute bottom-6 left-6 right-6 bg-[#1e130d]/95 backdrop-blur-md p-4 rounded-2xl border border-[#2a1b12] flex items-center gap-4.5 shadow-xl">
                    <span className="w-12 h-12 rounded-xl bg-[#2a1b12] text-[#d4a373] border border-[#d4a373]/20 flex items-center justify-center font-serif font-bold text-lg">
                      100%
                    </span>
                    <div>
                      <p className="text-[#f8f1e9] font-serif font-bold text-sm tracking-wide leading-tight">
                        Pure Belgian Cocoa Craft
                      </p>
                      <p className="text-[#8d7c6b] font-sans text-xs mt-0.5">
                        Handcrafted daily in small physical gourmet batches.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Menu Section */}
        <MenuSection onAddToCart={handleAddToCart} />

        {/* Mix & Match Box customizer */}
        <BoxBuilder onAddCustomBoxToCart={handleAddCustomBoxToCart} />

        {/* Brand Values Values Banner */}
        <section id="about" className="py-20 bg-[#120a07] border-b border-[#2a1b12]/50 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="p-8 bg-[#1e130d] rounded-3xl border border-[#2a1b12] space-y-4 hover:border-[#d4a373] transition-colors duration-300">
                <div className="w-12 h-12 bg-[#2a1b12] text-[#d4a373] rounded-full flex items-center justify-center">
                  <ChefHat className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif text-[#f8f1e9]">
                  Unmatched Dense Fudgy Center
                </h3>
                <p className="text-[#8d7c6b] font-sans text-sm leading-relaxed font-light">
                  We don't do floury, dry cakey brownies. Our batter leverages minimal luxury flour and maximal pure cocoas to maintain an intensely dense, heavy block that stays gooey for days.
                </p>
              </div>

              <div className="p-8 bg-[#1e130d] rounded-3xl border border-[#2a1b12] space-y-4 hover:border-[#d4a373] transition-colors duration-300">
                <div className="w-12 h-12 bg-[#2a1b12] text-[#d4a373] rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif text-[#f8f1e9]">
                  Signature Cracked Sugar Skin
                </h3>
                <p className="text-[#8d7c6b] font-sans text-sm leading-relaxed font-light">
                  That paper-thin crinkly crust on top isn't luck—it's precision craft. By melting high-grade chocolates and emulsifying farm eggs perfectly with butter, we bake a crackly glossy skin.
                </p>
              </div>

              <div className="p-8 bg-[#1e130d] rounded-3xl border border-[#2a1b12] space-y-4 hover:border-[#d4a373] transition-colors duration-300">
                <div className="w-12 h-12 bg-[#2a1b12] text-[#d4a373] rounded-full flex items-center justify-center">
                  <Gift className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif text-[#f8f1e9]">
                  Artisanal Custom Gifting
                </h3>
                <p className="text-[#8d7c6b] font-sans text-sm leading-relaxed font-light">
                  Every order intended as a gift gets luxury ribbons and a custom handwritten envelope greeting note absolutely free. Perfect for birthdays, corporate boxes, anniversaries, or sending a sweet smile.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Gifting section banner info */}
        <section id="gift" className="py-20 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#1e130d] rounded-[3rem] p-8 sm:p-12 md:p-16 border border-[#2a1b12] relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center transition-all hover:border-[#d4a373]/60 duration-300">
              
              <div className="lg:col-span-6 space-y-6">
                <span className="text-[#d4a373] font-sans font-semibold uppercase tracking-[0.3em] text-xs inline-flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#d4a373]" /> Celebrate with sweetness
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#f8f1e9] tracking-tight leading-tight font-light col-span-1">
                  Perfect for Birthdays, <br /> Celebrations, & Gifts
                </h2>
                <p className="text-[#b8a99a] font-sans text-base leading-relaxed font-light">
                  Planning to surprise your loved ones? We package our brownies with deep cocoa luxury labels, ribbon bows, and a customized handwritten parchment greeting card carrying your exact notes inside. 
                </p>
                
                <div className="space-y-3 font-light">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#2a1b12] text-[#d4a373] flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                    <span className="text-sm text-[#b8a99a]">Elegant luxury grease-proof parchment liners inside.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#2a1b12] text-[#d4a373] flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                    <span className="text-sm text-[#b8a99a]">Wrapped in gorgeous designer string bows and safety boxes.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#2a1b12] text-[#d4a373] flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                    <span className="text-sm text-[#b8a99a]">Custom message cards written in elegant ink on calligraphic parchment papers.</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="bg-[#d4a373] hover:scale-105 text-[#120a07] font-sans font-bold py-3.5 px-8 rounded-xl text-sm transition tracking-wider cursor-pointer shadow-lg shadow-[#d4a373]/15"
                  >
                    Order Gifting Box
                  </button>
                </div>
              </div>

              {/* Decorative visual block representing a premium box wrapper */}
              <div className="lg:col-span-6 h-full flex items-center justify-center relative">
                <div className="w-full max-w-sm aspect-square bg-[#0c0908] rounded-3xl p-8 text-stone-100 flex flex-col justify-between border-4 border-[#3d2015] relative overflow-hidden shadow-2xl">
                  
                  {/* Decorative golden ribbon bands on physical box representations */}
                  <div className="absolute top-0 bottom-0 left-[48%] right-[48%] bg-[#d4a373]/20 pointer-events-none" />
                  <div className="absolute left-0 right-0 top-[48%] bottom-[48%] bg-[#d4a373]/20 pointer-events-none" />

                  <div className="flex justify-between items-start z-10">
                    <span className="text-[10px] font-sans font-semibold text-[#d4a373] block tracking-widest uppercase">
                      Premium Gift Chest
                    </span>
                    <Gift className="w-6 h-6 text-[#d4a373]" />
                  </div>

                  <div className="my-auto text-center z-10 py-6">
                    <span className="font-serif text-3xl tracking-wide text-[#f8f1e9] block">
                      Brownie by Shaaz
                    </span>
                    <span className="text-[#b8a99a] text-xs italic block mt-1.5 ">
                      "Gourmet homemade brownies made with love"
                    </span>
                  </div>

                  <div className="flex justify-between items-end border-t border-[#2a1b12] pt-4 z-10">
                    <div className="text-left">
                      <span className="text-[9px] text-[#8d7c6b] block tracking-wider uppercase">Standard sizes</span>
                      <span className="text-xs font-bold text-[#b8a99a] block">4 and 6 pieces custom box</span>
                    </div>
                    <span className="font-sans font-black text-[10px] uppercase text-[#d4a373] block bg-[#1e130d] border border-[#2a1b12] px-2.5 py-1 rounded-lg">
                      Fresh & Hot
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Loyalty Reward Points VIP System */}
        <LoyaltySystem onSearchCartPhone={setLinkedPhone} />

        {/* Social Proof Reviews Love section */}
        <section id="reviews" className="py-20 bg-[#120a07] border-t border-[#2a1b12]/50 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Headers */}
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-[#d4a373] font-sans font-semibold uppercase tracking-[0.25em] text-xs block mb-3">
                Loved by Food Lovers
              </span>
              <h2 className="text-4xl font-serif font-light text-[#f8f1e9] tracking-tight leading-none mb-4">
                What Our Customers Say
              </h2>
              <p className="text-[#b8a99a] font-sans text-sm">
                Authentic testimonials imported directly from our active digital spaces on Facebook and Instagram.
              </p>
            </div>

            {/* Layout grid containing reviews on left, submit reviews on right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* Left Column: Customer Testimonials List */}
              <div className="lg:col-span-7 space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-[#1e130d] p-6 rounded-3xl border border-[#2a1b12] shadow-xl space-y-3.5 hover:border-[#d4a373]/40 transition-colors duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Avatar initials placeholder */}
                        <div className="w-10 h-10 rounded-full bg-[#2a1b12] text-[#d4a373] border border-[#d4a373]/20 flex items-center justify-center font-bold font-sans text-sm">
                          {rev.author.split(" ")[0].substring(0, 1)}
                        </div>
                        <div>
                          <h4 className="font-serif text-[#f8f1e9] text-sm">
                            {rev.author}
                          </h4>
                          <span className="text-[10px] text-[#8d7c6b] font-sans">
                            {rev.date}
                          </span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating
                                ? "fill-current text-[#d4a373]"
                                : "text-[#2a1b12]"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-[#b8a99a] font-sans text-sm leading-relaxed whitespace-pre-wrap font-light">
                      "{rev.text}"
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-[#2a1b12]/60 text-xs text-[#8d7c6b]">
                      <span className="flex items-center gap-1.5 font-semibold capitalize font-sans text-[#d4a373]">
                        {rev.platform === "instagram" ? (
                          <>
                            <Instagram className="w-3.5 h-3.5 text-[#8d7c6b]" /> Instagram Review
                          </>
                        ) : (
                          <>
                            <Facebook className="w-3.5 h-3.5 text-[#8d7c6b]" /> Facebook Page
                          </>
                        )}
                      </span>

                      {rev.likes !== undefined && (
                        <span className="flex items-center gap-1 text-[#8d7c6b]">
                          <ThumbsUp className="w-3 h-3 text-[#d4a373] fill-[#d4a373]" /> {rev.likes} hearts
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Submit A Review Card Form */}
              <div className="lg:col-span-5 bg-[#1e130d] p-6 sm:p-8 rounded-[2rem] border border-[#2a1b12] shadow-xl">
                <h3 className="text-xl font-serif text-[#f8f1e9] mb-2 font-light">
                  Share Your Brownie Love
                </h3>
                <p className="text-xs text-[#b8a99a] font-sans mb-6">
                  Loved our fresh gooey brownie box? Post your rating to let other brownie enthusiasts know!
                </p>
                
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  
                  {/* Name field */}
                  <div>
                    <label className="text-xs font-semibold text-[#8d7c6b] block mb-1 uppercase tracking-wide">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newReview.author}
                      onChange={(e) => setNewReview((prev) => ({ ...prev, author: e.target.value }))}
                      placeholder="e.g. Maria Khan"
                      className="w-full bg-[#120a07] text-[#f8f1e9] border border-[#2a1b12] rounded-xl px-4 py-2.5 outline-none font-sans text-xs focus:border-[#d4a373]"
                    />
                  </div>

                  {/* Rating Selector */}
                  <div>
                    <label className="text-xs font-semibold text-[#8d7c6b] block mb-2 uppercase tracking-wide">
                      Your Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((starIdx) => (
                        <button
                          key={starIdx}
                          type="button"
                          onClick={() => setNewReview((prev) => ({ ...prev, rating: starIdx }))}
                          className="p-1 rounded-lg hover:bg-[#120a07]/60 transition cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              starIdx <= newReview.rating
                                ? "fill-current text-[#d4a373]"
                                : "text-[#2a1b12]"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Core Platform toggle */}
                  <div>
                    <label className="text-xs font-semibold text-[#8d7c6b] block mb-1 uppercase tracking-wide">
                      Referenced Platform
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-[#120a07] p-1 rounded-xl border border-[#2a1b12]">
                      <button
                        type="button"
                        onClick={() => setNewReview((prev) => ({ ...prev, platform: "instagram" }))}
                        className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                          newReview.platform === "instagram"
                            ? "bg-[#d4a373] text-[#120a07]"
                            : "text-[#8d7c6b] hover:text-[#f8f1e9]"
                        }`}
                      >
                        Instagram
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewReview((prev) => ({ ...prev, platform: "facebook" }))}
                        className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                          newReview.platform === "facebook"
                            ? "bg-[#d4a373] text-[#120a07]"
                            : "text-[#8d7c6b] hover:text-[#f8f1e9]"
                        }`}
                      >
                        Facebook Page
                      </button>
                    </div>
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="text-xs font-semibold text-[#8d7c6b] block mb-1 uppercase tracking-wide">
                      Your Review Text
                    </label>
                    <textarea
                      required
                      value={newReview.text}
                      onChange={(e) => setNewReview((prev) => ({ ...prev, text: e.target.value }))}
                      rows={3}
                      placeholder="e.g. Tried the classic fudgy chocolate brownies. Highly recommended!"
                      className="w-full bg-[#120a07] text-[#f8f1e9] border border-[#2a1b12] rounded-xl p-3 outline-none font-sans text-xs focus:border-[#d4a373] resize-none"
                    />
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-[#d4a373] hover:scale-105 duration-300 text-[#120a07] font-sans font-bold text-xs tracking-wider transition cursor-pointer"
                  >
                    Post Review
                  </button>

                  {/* Success notification */}
                  <AnimatePresence>
                    {reviewSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="bg-green-950/50 border border-green-800 text-green-400 text-xs rounded-xl p-3 text-center"
                      >
                        Thank you for your rating! Your review is added above. ❤️
                      </motion.div>
                    )}
                  </AnimatePresence>

                </form>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Footer Details */}
      <footer className="bg-[#0c0908] text-[#8d7c6b] py-16 border-t border-[#2a1b12] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            {/* Signature description brand column with inline logo graphic */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 border border-[#d4a373]/30 rounded-full overflow-hidden bg-[#1e130d] flex-shrink-0 shadow-md">
                  <img 
                    src={appLogoImg} 
                    alt="Brownie by Shaaz Logo Graphic" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <span className="font-serif tracking-widest uppercase font-light text-2xl text-[#f8f1e9] block leading-none">
                    Brownie by Shaaz
                  </span>
                  <span className="text-[9px] text-[#8d7c6b] font-sans uppercase tracking-[0.2em] block mt-1">
                    Artisanal & Homemade
                  </span>
                </div>
              </div>
              <p className="text-[#8d7c6b] font-sans text-sm max-w-sm leading-relaxed font-light">
                Premium high-end homemade brownies with standard-setting density, gooey melting chocolate fillings, and cracked glossy skins. Baked fresh to order with pure farm butter and elite cocoas. 
              </p>
              
              <div className="flex items-center gap-4 pt-2">
                <a 
                  href={SOCIAL_LINKS.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#1e130d] border border-[#2a1b12] hover:bg-[#d4a373] hover:text-[#120a07] flex items-center justify-center transition text-[#d4a373]"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href={SOCIAL_LINKS.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#1e130d] border border-[#2a1b12] hover:bg-[#d4a373] hover:text-[#120a07] flex items-center justify-center transition text-[#d4a373]"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Menu options footer links column */}
            <div className="space-y-4 text-sm font-sans font-light">
              <h4 className="font-sans font-semibold text-[#f8f1e9] tracking-widest uppercase text-xs">
                Our Menu
              </h4>
              <ul className="space-y-2.5">
                <li><a href="#menu" className="hover:text-[#d4a373] transition-colors block">Chocolate Fudge Brownies</a></li>
                <li><a href="#menu" className="hover:text-[#d4a373] transition-colors block">Classic Oreo Brownies</a></li>
                <li><a href="#menu" className="hover:text-[#d4a373] transition-colors block">Dairy Milk Chunks Brownies</a></li>
                <li><a href="#menu" className="hover:text-[#d4a373] transition-colors block">Hazelnut Nutella Swirls</a></li>
                <li><a href="#menu" className="hover:text-[#d4a373] transition-colors block">3-Layered Slutty Brownies</a></li>
              </ul>
            </div>

            {/* Contacts details footer column */}
            <div className="space-y-4 text-sm text-[#8d7c6b] font-sans font-light">
              <h4 className="font-sans font-semibold text-[#f8f1e9] tracking-widest uppercase text-xs">
                Order Delivery
              </h4>
              <p className="flex items-start gap-2 max-w-xs leading-relaxed">
                <MapPin className="w-4 h-4 text-[#d4a373] flex-shrink-0 mt-0.5" />
                Delivery charges will be calculated depending on your specific neighborhood sector. All items are baked completely fresh to order.
              </p>
              
              <div className="bg-[#1e130d] p-4 rounded-2xl border border-[#2a1b12] space-y-1">
                <span className="text-[10px] text-[#8d7c6b] uppercase tracking-wider block font-semibold font-sans">WhatsApp Order Desk</span>
                <span className="text-[#f8f1e9] font-bold block text-sm tracking-wide font-sans">
                  +{WHATSAPP_NUMBER}
                </span>
                <span className="text-[#8d7c6b] text-xs block font-sans">
                  Ping anytime for direct custom booking questions.
                </span>
              </div>
            </div>

          </div>

          <div className="border-t border-[#2a1b12] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-light">
            <p className="font-sans text-[#8d7c6b]">
              © {new Date().getFullYear()} Brownie by Shaaz. Hand-crafted premium desserts. All rights reserved.
            </p>
            <p className="flex items-center gap-1 font-sans text-[#8d7c6b]">
              Made with <Heart className="w-3.5 h-3.5 inline text-[#d4a373] fill-[#d4a373]" /> for a gourmet small homemade bakery business.
            </p>
          </div>
        </div>
      </footer>

      {/* Left-side Floating Checkout Action Badge with Add To Box status */}
      <AnimatePresence>
        {cartTotalItems > 0 && (
          <div id="floating-left-checkout" className="fixed left-4 bottom-6 md:left-8 md:bottom-8 z-40 flex flex-col gap-2 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, x: -50, scale: 0.8 }}
              animate={isBouncing ? {
                opacity: 1,
                x: 0,
                y: [0, -14, 0, -7, 0, -2, 0],
                scale: [1, 1.07, 0.98, 1.04, 1]
              } : {
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1
              }}
              exit={{ opacity: 0, x: -50, scale: 0.8 }}
              transition={isBouncing ? {
                duration: 0.75,
                times: [0, 0.25, 0.5, 0.7, 0.85, 0.95, 1],
                ease: "easeOut"
              } : {
                type: "spring",
                damping: 20
              }}
              className="relative group"
            >
              {/* Subtle warm glow background */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r from-[#d4a373] to-[#8d7c6b] rounded-full blur-md transition-all duration-300 ${isBouncing ? "opacity-60 scale-105" : "opacity-25 group-hover:opacity-40"}`} />
              
              <button
                onClick={() => setIsCartOpen(true)}
                className={`relative flex items-center gap-2.5 bg-[#1e130d] border ${isBouncing ? "border-[#d4a373] ring-2 ring-[#d4a373]/50 shadow-[0_0_20px_rgba(212,163,115,0.4)]" : "border-[#d4a373]/80 hover:border-[#f8f1e9]"} text-[#f8f1e9] hover:bg-[#2a1b12] shadow-2xl rounded-full p-2 pr-3.5 transition duration-300 group cursor-pointer`}
                title="Review & Checkout Order"
              >
                {/* Dynamic visual bag badge */}
                <div className={`relative flex items-center justify-center bg-[#d4a373] text-[#120a07] w-8 h-8 rounded-full shadow-inner transition-transform duration-300 ${isBouncing ? "scale-110 rotate-12" : "group-hover:rotate-6"}`}>
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>

                {/* Status Information */}
                <div className="text-left font-sans">
                  <span className="text-[8px] text-[#8d7c6b] uppercase tracking-[0.1em] font-extrabold leading-none block">
                    Fast Checkout
                  </span>
                  <span className="text-[11px] font-bold text-[#f8f1e9] block mt-0.5 font-serif leading-none">
                    {cartTotalItems} {cartTotalItems === 1 ? "Brownie" : "Brownies"} Added
                  </span>
                </div>

                {/* Quick-action helper chevron */}
                <div className="w-4.5 h-4.5 rounded-full bg-[#2a1b12] group-hover:bg-[#d4a373] group-hover:text-[#120a07] flex items-center justify-center text-[#8d7c6b] transition duration-300">
                  <ChevronRight className="w-2.5 h-2.5" />
                </div>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Cart Drawer Slider */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onOpenTracker={(orderId) => {
          if (orderId) {
            setTrackingOrderId(orderId);
          }
          setIsTrackingOpen(true);
        }}
        linkedPhone={linkedPhone}
      />

      {/* Interactive Order Tracker Overlay */}
      <OrderTracker
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        initialOrderId={trackingOrderId}
      />

    </div>
  );
}
