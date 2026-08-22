import React, { useState, useEffect } from "react";
import { BrownieItem } from "../types";
import { adTracker } from "../lib/analytics";
import { BROWNIE_ITEMS } from "../data";
import { Sparkles, ShoppingBag, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MenuSectionProps {
  onAddToCart: (item: BrownieItem, pieces: 4 | 6) => void;
}

export default function MenuSection({ onAddToCart }: MenuSectionProps) {
  // Store the selected size (4 or 6) for each brownie item by its id
  const [selectedSizes, setSelectedSizes] = useState<Record<string, 4 | 6>>({
    fudge: 4,
    oreo: 4,
    dairymilk: 4,
    nutella: 4,
  });

  // Track success animation state per product
  const [addedStates, setAddedStates] = useState<Record<string, boolean>>({});

  // Track high-intent engagement when visitors explore the signature menu
  useEffect(() => {
    // Track primary featured product (Fudge brownie box) as default view
    const mainProduct = BROWNIE_ITEMS.find(item => item.id === "fudge");
    if (mainProduct) {
      adTracker.trackViewContent(
        mainProduct.id,
        `${mainProduct.name} (Menu View)`,
        mainProduct.prices[4]
      );
    }
  }, []);

  const handleSizeChange = (itemId: string, size: 4 | 6) => {
    setSelectedSizes((prev) => ({ ...prev, [itemId]: size }));
    // Track ViewContent event when customer toggles different size packs
    const item = BROWNIE_ITEMS.find(i => i.id === itemId);
    if (item) {
      adTracker.trackViewContent(item.id, `${item.name} (${size} pieces pack)`, item.prices[size]);
    }
  };

  const handleAddClick = (item: BrownieItem) => {
    const size = selectedSizes[item.id] || 4;
    onAddToCart(item, size);

    // Trigger checkmark animation
    setAddedStates((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedStates((prev) => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  return (
    <section id="menu" className="py-20 relative z-10 border-b border-[#2a1b12] bg-[#120a07] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[#d4a373] font-sans font-semibold tracking-[0.25em] text-xs uppercase block mb-3">
            Pure Indulgence Menu
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-[#f8f1e9] font-light tracking-tight leading-none mb-4">
            Our Signature Brownie Menu
          </h2>
          <p className="text-[#b8a99a] font-sans text-sm font-light leading-relaxed">
            Every single brownie is fresh-baked with rich cocoa, farm-fresh eggs, and pure butter. Highly dense, chewy, and incomparable—there is no taste match.
          </p>
        </div>

        {/* Brownies Grid (2x2 layout for 4 items matching brochure) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {BROWNIE_ITEMS.map((item) => {
            const currentSize = selectedSizes[item.id] || 4;
            const currentPrice = item.prices[currentSize];
            const isAdded = addedStates[item.id] || false;

            return (
              <motion.div
                key={item.id}
                id={`product-${item.id}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-[#1e130d] rounded-3xl overflow-hidden border border-[#2a1b12] hover:border-[#d4a373]/60 hover:shadow-2xl hover:shadow-[#d4a373]/5 transition-all duration-300 flex flex-col group"
              >
                {/* Image Container with Hover Zoom */}
                <div className="relative overflow-hidden aspect-square flex-shrink-0 bg-[#0c0908]">
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover filter brightness-[0.9] group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  
                  {/* Premium Flairs */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 z-10">
                    {item.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="bg-[#120a07]/85 backdrop-blur-md text-[#d4a373] border border-[#2a1b12] text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 font-sans"
                      >
                        {tag === "Bestseller" && <Sparkles className="w-3 h-3 text-[#d4a373] fill-[#d4a373]" />}
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-[#120a07]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Card Content */}
                <div className="p-6 sm:p-8 flex flex-col flex-grow">
                  <h3 className="text-xl sm:text-2xl font-serif text-[#f8f1e9] leading-tight mb-2 group-hover:text-[#d4a373] transition-colors">
                    {item.name}
                  </h3>
                  
                  <p className="text-[#b8a99a] font-sans text-xs line-clamp-3 mb-6 flex-grow leading-relaxed font-light">
                    {item.description}
                  </p>

                  <div className="mt-auto space-y-5">
                    {/* Size Selector Tabs */}
                    <div className="bg-[#120a07] p-1 rounded-2xl flex border border-[#2a1b12]">
                      <button
                        onClick={() => handleSizeChange(item.id, 4)}
                        className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-300 cursor-pointer ${
                          currentSize === 4
                            ? "bg-[#d4a373] text-[#120a07] shadow-sm"
                            : "text-[#8d7c6b] hover:text-[#f8f1e9]"
                        }`}
                      >
                        4 Pieces Box
                      </button>
                      <button
                        onClick={() => handleSizeChange(item.id, 6)}
                        className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-300 cursor-pointer ${
                          currentSize === 6
                            ? "bg-[#d4a373] text-[#120a07] shadow-sm"
                            : "text-[#8d7c6b] hover:text-[#f8f1e9]"
                        }`}
                      >
                        6 Pieces Box
                      </button>
                    </div>

                    {/* Pricing & Add to Cart */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[10px] text-[#8d7c6b] block font-sans uppercase tracking-wider">
                          Price
                        </span>
                        <span className="text-2xl font-serif text-[#f8f1e9]">
                          Rs {currentPrice}
                        </span>
                      </div>

                      <button
                        onClick={() => handleAddClick(item)}
                        disabled={isAdded}
                        className={`relative overflow-hidden py-3 px-5 sm:px-6 rounded-2xl font-sans font-bold text-sm tracking-wide transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                          isAdded
                            ? "bg-green-900 text-green-100 scale-[0.98]"
                            : "bg-[#d4a373] text-[#120a07] hover:scale-105 active:scale-95 shadow-lg shadow-[#d4a373]/15"
                        }`}
                      >
                        <AnimatePresence mode="wait">
                          {isAdded ? (
                            <motion.span
                              key="added"
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: -20, opacity: 0 }}
                              className="flex items-center gap-1.5"
                            >
                              <Check className="w-4 h-4" /> Added!
                            </motion.span>
                          ) : (
                            <motion.span
                              key="add"
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: -20, opacity: 0 }}
                              className="flex items-center gap-1.5"
                            >
                              <ShoppingBag className="w-4 h-4" /> Add Box
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Brochure "Order of Make" Process Bar */}
        <div className="mt-16 bg-[#1e130d] border border-[#2a1b12] rounded-3xl p-6 sm:p-8 max-w-5xl mx-auto shadow-xl">
          <div className="text-center mb-6">
            <span className="text-[#d4a373] text-[11px] uppercase tracking-[0.25em] font-semibold block">
              Our Artisanal Process
            </span>
            <h3 className="text-xl sm:text-2xl font-serif text-[#f8f1e9] font-light mt-1">
              Order of Make
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            {[
              { step: "1", title: "Premium Ingredients", desc: "Pure butter & cocoa" },
              { step: "2", title: "Perfect Mixing", desc: "Emulsified batter" },
              { step: "3", title: "Baked with Care", desc: "Precision temperature" },
              { step: "4", title: "Cool & Set Right", desc: "Fudgy core locking" },
              { step: "5", title: "Cut to Perfection", desc: "Clean sharp squares" },
              { step: "6", title: "Packed with Love", desc: "Luxury gift packaging" },
            ].map((item) => (
              <div key={item.step} className="bg-[#120a07]/70 border border-[#2a1b12] rounded-2xl p-3.5 flex flex-col items-center">
                <span className="w-7 h-7 rounded-full bg-[#2a1b12] border border-[#d4a373]/40 text-[#d4a373] text-xs font-serif font-bold flex items-center justify-center mb-2">
                  {item.step}
                </span>
                <span className="text-xs font-semibold text-[#f8f1e9] leading-tight block">
                  {item.title}
                </span>
                <span className="text-[10px] text-[#8d7c6b] mt-1 font-light block">
                  {item.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
