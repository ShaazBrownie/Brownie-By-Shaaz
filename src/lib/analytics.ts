/**
 * Gourmet Analytics Manager - Brownie by Shaaz
 * Handles Facebook Ads Pixel & Google Ads conversion tracking triggers.
 */

// Safely access dynamic environment variables or fall back to mock ID for testing
export const FB_PIXEL_ID = import.meta.env.VITE_FACEBOOK_PIXEL_ID || "";
export const GOOGLE_ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID || "";

// Declare globals for the TypeScript compiler
declare global {
  interface Window {
    fbq?: any;
    gtag?: any;
    dataLayer?: any[];
  }
}

/**
 * Log analytics event to development console to allow simple debugging
 */
function logTrackerEvent(source: "Facebook" | "Google Ads", eventName: string, data: any) {
  console.log(
    `%c[AD-TRACKING %s]%c ${eventName}`,
    "background: #22c55e; color: #fff; font-weight: bold; padding: 2px 5px; border-radius: 3px;",
    source.toUpperCase(),
    "color: #d4a373; font-weight: 500;",
    data
  );
}

/**
 * Dynamic event analytics suite for Facebook and Google ad conversions
 */
export const adTracker = {
  /**
   * Tracks a pageview event
   */
  trackPageView(): void {
    if (typeof window !== "undefined") {
      if (window.fbq) {
        window.fbq("track", "PageView");
        logTrackerEvent("Facebook", "PageView", {});
      }
      if (window.gtag && GOOGLE_ADS_ID) {
        window.gtag("config", GOOGLE_ADS_ID, { page_path: window.location.pathname });
        logTrackerEvent("Google Ads", "PageView", { page_path: window.location.pathname });
      }
    }
  },

  /**
   * Track when a viewer views a specific brownie product or initiates Custom Box Builder
   * @param id Product ID or 'custom-box'
   * @param name Product name or 'Gourmet Box Builder'
   * @param price Price of item
   */
  trackViewContent(id: string, name: string, price: number): void {
    if (typeof window !== "undefined") {
      const payload = {
        content_ids: [id],
        content_name: name,
        content_type: "product",
        value: price,
        currency: "PKR"
      };

      if (window.fbq) {
        window.fbq("track", "ViewContent", payload);
        logTrackerEvent("Facebook", "ViewContent", payload);
      }
      
      if (window.gtag) {
        window.gtag("event", "view_item", {
          currency: "PKR",
          value: price,
          items: [{ item_id: id, item_name: name, price }]
        });
        logTrackerEvent("Google Ads", "view_item", { id, name, price });
      }
    }
  },

  /**
   * Track when user adds brownie boxes to their checkout container
   */
  trackAddToCart(id: string, name: string, price: number, quantity: number = 1): void {
    if (typeof window !== "undefined") {
      const payload = {
        content_ids: [id],
        content_name: name,
        content_type: "product",
        value: price * quantity,
        currency: "PKR"
      };

      if (window.fbq) {
        window.fbq("track", "AddToCart", payload);
        logTrackerEvent("Facebook", "AddToCart", payload);
      }

      if (window.gtag) {
        window.gtag("event", "add_to_cart", {
          currency: "PKR",
          value: price * quantity,
          items: [{ item_id: id, item_name: name, price, quantity }]
        });
        logTrackerEvent("Google Ads", "add_to_cart", { id, name, price, quantity });
      }
    }
  },

  /**
   * Track when a customer initiates checkout inputs (Form details)
   */
  trackInitiateCheckout(totalValue: number, itemsCount: number): void {
    if (typeof window !== "undefined") {
      const payload = {
        value: totalValue,
        currency: "PKR",
        num_items: itemsCount
      };

      if (window.fbq) {
        window.fbq("track", "InitiateCheckout", payload);
        logTrackerEvent("Facebook", "InitiateCheckout", payload);
      }

      if (window.gtag) {
        window.gtag("event", "begin_checkout", {
          currency: "PKR",
          value: totalValue,
          items: [{ item_list_name: "Gourmet Cart", value: totalValue }]
        });
        logTrackerEvent("Google Ads", "begin_checkout", payload);
      }
    }
  },

  /**
   * Track purchase conversion upon customer generating the secure WhatsApp url/receipt
   */
  trackPurchase(orderId: string, totalValue: number, items: Array<{ id: string; name: string; price: number; quantity: number }>): void {
    if (typeof window !== "undefined") {
      const payload = {
        content_ids: items.map(item => item.id),
        content_type: "product",
        value: totalValue,
        currency: "PKR",
        order_id: orderId
      };

      if (window.fbq) {
        window.fbq("track", "Purchase", payload);
        logTrackerEvent("Facebook", "Purchase", payload);
      }

      if (window.gtag) {
        window.gtag("event", "purchase", {
          transaction_id: orderId,
          value: totalValue,
          currency: "PKR",
          items: items.map(item => ({
            item_id: item.id,
            item_name: item.name,
            price: item.price,
            quantity: item.quantity
          }))
        });
        logTrackerEvent("Google Ads", "purchase", payload);
      }
    }
  }
};
