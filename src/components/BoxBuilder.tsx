import React, { useState, useEffect } from "react";
import { BROWNIE_ITEMS } from "../data";
import { adTracker } from "../lib/analytics";
import { Box, Sparkles, Plus, Minus, Trash2, Check, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BoxBuilderProps {
  onAddCustomBoxToCart: (flavorBreakdown: Record<string, number>, size: 4 | 6, price: number) => void;
}

export default function BoxBuilder({ onAddCustomBoxToCart }: BoxBuilderProps) {
  const [boxSize, setBoxSize] = useState<4 | 6>(6);
  // Records how many of each flavor is added in current workbench
  const [selections, setSelections] = useState<Record<string, number>>({
    fudge: 0,
    oreo: 0,
    dairymilk: 0,
    nutella: 0,
  });

  const [isSuccess, setIsSuccess] = useState(false);

  // Set prices for custom curated mix boxes (4 pcs: Rs 1400, 6 pcs: Rs 2000 as per brochure)
  const customBoxPrice = boxSize === 4 ? 1400 : 2000;

  // Trigger ViewContent when builder is active
  useEffect(() => {
    adTracker.trackViewContent("custom-box-builder", `Gourmet Custom Box Builder (${boxSize} Pcs)`, customBoxPrice);
  }, [boxSize]);

  const totalSelected = Object.keys(selections).reduce<number>((acc, key) => {
    return acc + (selections[key] || 0);
  }, 0);
  const remainingSlots = boxSize - totalSelected;

  const handleSizeChange = (size: 4 | 6) => {
    setBoxSize(size);
    // Reset selections on size toggle to avoid over-limit
    setSelections({
      fudge: 0,
      oreo: 0,
      dairymilk: 0,
      nutella: 0,
    });
  };

  const addFlavor = (id: string) => {
    if (totalSelected >= boxSize) return;
    setSelections((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const removeFlavor = (id: string) => {
    if (!selections[id] || selections[id] <= 0) return;
    setSelections((prev) => ({
      ...prev,
      [id]: prev[id] - 1,
    }));
  };

  const clearBox = () => {
    setSelections({
      fudge: 0,
      oreo: 0,
      dairymilk: 0,
      nutella: 0,
    });
  };

  const handleAddCustomBox = () => {
    if (totalSelected < boxSize) return;
    
    onAddCustomBoxToCart(selections, boxSize, customBoxPrice);
    
    // Clear selections & animate success
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      clearBox();
    }, 2000);
  };

  // Create an array representing each slot in the physical box
  const slotsList = [];
  const currentSelectionsList: string[] = [];
  Object.entries(selections).forEach(([flavorId, qty]) => {
    const count = qty as number;
    for (let i = 0; i < count; i++) {
      currentSelectionsList.push(flavorId);
    }
  });

  for (let i = 0; i < boxSize; i++) {
    slotsList.push(currentSelectionsList[i] || null);
  }

  return (
    <section id="customizer" className="py-20 bg-[#120a07] text-[#f8f1e9] font-sans relative z-10 border-b border-[#2a1b12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[#d4a373] font-sans font-semibold tracking-[0.25em] text-xs uppercase block mb-3">
            Gourmet Custom Assortment
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-[#f8f1e9] font-light tracking-tight leading-none mb-4">
            Build Your Custom Box
          </h2>
          <p className="text-[#b8a99a] font-sans text-sm font-light leading-relaxed">
            Can't decide on just one? Hand-pick every item to build your matching gourmet drawer! Choose your box size, add your favorite flavors, and box it up.
          </p>
        </div>

        {/* Workbench Wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left panel: Flavors adder */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#1e130d] p-6 sm:p-8 rounded-3xl border border-[#2a1b12]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-xl font-serif text-[#f8f1e9] flex items-center gap-2 font-medium">
                    <Box className="w-5 h-5 text-[#d4a373]" />
                    1. Select Box Size
                  </h3>
                  <p className="text-xs text-[#8d7c6b] mt-1 font-light">
                    Custom mix boxes are priced at set premium value
                  </p>
                </div>
                
                <div className="bg-[#120a07] p-1 rounded-2xl flex border border-[#2a1b12] self-start sm:self-auto">
                  <button
                    onClick={() => handleSizeChange(4)}
                    className={`py-2 px-5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      boxSize === 4
                        ? "bg-[#d4a373] text-[#120a07] shadow-sm"
                        : "text-[#8d7c6b] hover:text-[#f8f1e9]"
                    }`}
                  >
                    4 Brownies (Rs 1400)
                  </button>
                  <button
                    onClick={() => handleSizeChange(6)}
                    className={`py-2 px-5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      boxSize === 6
                        ? "bg-[#d4a373] text-[#120a07] shadow-sm"
                        : "text-[#8d7c6b] hover:text-[#f8f1e9]"
                    }`}
                  >
                    6 Brownies (Rs 2000)
                  </button>
                </div>
              </div>

              {/* Flavors selections */}
              <h3 className="text-xl font-serif text-[#f8f1e9] mb-6 font-medium">
                2. Tap + to fill the slots
              </h3>
              
              <div className="space-y-4">
                {BROWNIE_ITEMS.map((item) => {
                  const qtySelected = selections[item.id] || 0;
                  return (
                    <div
                      key={item.id}
                      className="bg-[#120a07]/60 hover:bg-[#120a07] p-4 rounded-2xl flex items-center justify-between border border-[#2a1b12] hover:border-[#d4a373]/30 transition"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-xl object-cover filter brightness-[0.8]"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="font-serif font-semibold text-base text-[#f8f1e9]">
                            {item.name}
                          </h4>
                          <span className="text-xs text-[#d4a373] font-sans">
                            {item.tags[0] || "Artisanal recipe"}
                          </span>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => removeFlavor(item.id)}
                          disabled={qtySelected === 0}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center border transition cursor-pointer ${
                            qtySelected > 0
                              ? "border-[#d4a373] hover:bg-[#d4a373] hover:text-[#120a07] text-[#d4a373]"
                              : "border-[#2a1b12] text-[#8d7c6b] cursor-not-allowed"
                          }`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <span className="w-6 text-center font-sans font-bold text-lg text-[#f8f1e9]">
                          {qtySelected}
                        </span>

                        <button
                          onClick={() => addFlavor(item.id)}
                          disabled={totalSelected >= boxSize}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer ${
                            totalSelected < boxSize
                              ? "bg-[#d4a373] text-[#120a07] hover:scale-110"
                              : "bg-[#1e130d] border border-[#2a1b12] text-[#8d7c6b] cursor-not-allowed"
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right panel: Visual rendering of physical box */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-[#1e130d] p-6 sm:p-8 rounded-3xl border border-[#2a1b12] shadow-2xl flex flex-col items-center">
              
              <div className="w-full flex items-center justify-between mb-6 pb-4 border-b border-[#2a1b12]">
                <span className="text-xs font-sans font-medium tracking-wider uppercase text-[#8d7c6b]">
                  Your Box Workbench
                </span>
                <button
                  onClick={clearBox}
                  className="text-xs text-[#8d7c6b] hover:text-[#d4a373] flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
              </div>

              {/* Physical Carton Graphical View */}
              <div className="w-full max-w-[340px] aspect-square bg-[#0c0908] p-5 rounded-3xl border-4 border-[#3d2015] relative shadow-inner overflow-hidden my-4">
                
                {/* Visual Brownie Container Slots */}
                <div
                  className={`w-full h-full grid gap-4 ${
                    boxSize === 4 ? "grid-cols-2 grid-rows-2" : "grid-cols-2 grid-rows-3"
                  }`}
                >
                  <AnimatePresence>
                    {slotsList.map((flavorId, index) => {
                      if (!flavorId) {
                        return (
                          <div
                            key={`empty-${index}`}
                            className="bg-[#120a07]/50 rounded-2xl border-2 border-dashed border-[#2a1b12] flex flex-col items-center justify-center text-[#8d7c6b] text-center p-2"
                          >
                            <span className="text-xs font-sans font-medium text-[#8d7c6b]">Slot {index + 1}</span>
                            <span className="text-[10px] text-[#52443a] mt-1 font-sans">Click +</span>
                          </div>
                        );
                      }

                      const matchedItem = BROWNIE_ITEMS.find((b) => b.id === flavorId);

                      return (
                        <motion.div
                          key={`filled-${index}-${flavorId}`}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="bg-stone-950 rounded-2xl overflow-hidden relative border border-[#3d2015] group shadow-md"
                        >
                          <img
                            src={matchedItem?.image}
                            alt={matchedItem?.name}
                            className="w-full h-full object-cover select-none filter brightness-[0.9]"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-2 opacity-100 md:opacity-0 hover:opacity-100 transition-opacity duration-200">
                            <span className="text-[10px] font-sans font-bold text-[#d4a373] leading-tight block truncate">
                              {matchedItem?.name}
                            </span>
                            <button
                              onClick={() => removeFlavor(flavorId)}
                              className="text-[9px] text-[#ff7171] underline cursor-pointer mt-1 text-left block"
                            >
                              Remove
                            </button>
                          </div>
                          
                          {/* Count index of slots in box */}
                          <span className="absolute top-1.5 left-1.5 bg-[#120a07]/80 backdrop-blur-sm text-[#d4a373] border border-[#2a1b12] text-[9px] font-semibold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                            {index + 1}
                          </span>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {/* Box status details */}
              <div className="w-full mt-6 space-y-4">
                <div className="flex justify-between items-center text-sm font-sans">
                  <span className="text-[#8d7c6b]">Box Capacity:</span>
                  <span className="font-sans font-bold text-[#f8f1e9]">
                    {totalSelected} / {boxSize} Brownies
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm font-sans font-light">
                  <span className="text-[#8d7c6b]">Curated Pack Value:</span>
                  <span className="font-serif font-extrabold text-[#f8f1e9] text-xl">
                    Rs {customBoxPrice}
                  </span>
                </div>

                {/* Warning message if box is not complete */}
                {remainingSlots > 0 ? (
                  <div className="bg-[#291b10]/60 border border-[#4d3215] p-3 rounded-2xl flex items-center gap-2">
                    <span className="text-[#d4a373] font-sans text-xs flex-1">
                      Add <strong className="text-[#f8f1e9] font-semibold">{remainingSlots}</strong> more brownie{remainingSlots > 1 ? "s" : ""} to complete package and add to your cart!
                    </span>
                  </div>
                ) : (
                  <div className="bg-green-950/40 border border-green-800 p-3 rounded-2xl flex items-center gap-2">
                    <span className="text-green-400 font-sans text-xs flex-1 flex items-center gap-1.5 font-light">
                      <Sparkles className="w-3.5 h-3.5" /> Luxury box is fully curated and ready to bake!
                    </span>
                  </div>
                )}

                {/* CTA Action */}
                <button
                  onClick={handleAddCustomBox}
                  disabled={totalSelected < boxSize || isSuccess}
                  className={`w-full py-4 px-6 rounded-2xl font-sans font-bold text-sm tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                    isSuccess
                      ? "bg-green-900 text-green-100"
                      : totalSelected < boxSize
                      ? "bg-[#120a07] text-[#8d7c6b] border border-[#2a1b12] cursor-not-allowed"
                      : "bg-[#d4a373] text-[#120a07] hover:scale-105 active:scale-95 shadow-lg shadow-[#d4a373]/15"
                  }`}
                >
                  {isSuccess ? (
                    <>
                      <Check className="w-4 h-4" /> Added to your Order!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Add Assorted Box
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
