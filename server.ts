import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Load environment variables in development
dotenv.config();

const ORDERS_FILE = path.join(process.cwd(), "orders.json");

// Helper to seed default orders if none exist
function seedDefaultOrders() {
  try {
    if (!fs.existsSync(ORDERS_FILE)) {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000);

      const defaults = [
        {
          id: "SHZ-7777",
          customerName: "Imran Khan",
          phone: "0300 9842814",
          deliveryType: "within5km",
          address: "House 12, Sector E, Model Town, Lahore",
          deliveryDate: now.toISOString().split("T")[0],
          cartItems: [
            { name: "Oreo Brownies", pieces: 6, quantity: 1, price: 2100 },
            { name: "Slutty Brownies", pieces: 4, quantity: 1, price: 1800 }
          ],
          subtotal: 3900,
          deliveryFee: 150,
          totalBill: 4050,
          isGift: true,
          giftMessage: "To my dear friend, stay chocolatey!",
          status: "Baking",
          createdAt: yesterday.toISOString(),
          timeline: [
            {
              status: "Placed",
              title: "Order Placed & Noted",
              description: "Order submitted via WhatsApp pre-order. Recipe scheduled for the oven.",
              timestamp: yesterday.toISOString()
            },
            {
              status: "Confirmed",
              title: "Chef Confirmed & Verified",
              description: "Chef Shaaz verified details and payment. Ready for high-heat curing.",
              timestamp: hoursAgo(12).toISOString()
            },
            {
              status: "Baking",
              title: "Fresh Mixing Underway 🥣",
              description: "Oven warming up! Whipping premium farm cocoa and whipping butter for the crinkle tops.",
              timestamp: hoursAgo(2).toISOString()
            }
          ]
        },
        {
          id: "SHZ-8888",
          customerName: "Areeba Malik",
          phone: "0321 4455889",
          deliveryType: "above5km",
          address: "Apartment 4B, Gulberg III, Lahore",
          deliveryDate: now.toISOString().split("T")[0],
          cartItems: [
            { name: "Chocolate Fudge Brownies", pieces: 4, quantity: 2, price: 1400 }
          ],
          subtotal: 2800,
          deliveryFee: 250,
          totalBill: 3050,
          isGift: false,
          giftMessage: "",
          status: "OutForDelivery",
          createdAt: yesterday.toISOString(),
          timeline: [
            {
              status: "Placed",
              title: "Order Submitted",
              description: "Bespoke chocolate cart sent successfully.",
              timestamp: yesterday.toISOString()
            },
            {
              status: "Confirmed",
              title: "WhatsApp Confirmed",
              description: "Chef Shaaz verified coordinates and Easypaisa transaction.",
              timestamp: hoursAgo(18).toISOString()
            },
            {
              status: "Baking",
              title: "Mixing Cocoa & Butter",
              description: "Our signature baking process is complete.",
              timestamp: hoursAgo(10).toISOString()
            },
            {
              status: "Cooling",
              title: "Shiny Tops Rising ✨",
              description: "Brownie sheets cooling to stabilize fudgy layers and micro-crust.",
              timestamp: hoursAgo(6).toISOString()
            },
            {
              status: "OutForDelivery",
              title: "Out for Dispatch (Rider Assigned)",
              description: "Thermal brownie pack handed over to our local rider.",
              timestamp: hoursAgo(1).toISOString()
            }
          ]
        },
        {
          id: "SHZ-9999",
          customerName: "Zainab Chaudhry",
          phone: "0333 7891234",
          deliveryType: "pickup",
          address: "",
          deliveryDate: yesterday.toISOString().split("T")[0],
          cartItems: [
            { name: "Dairy Milk Brownies", pieces: 6, quantity: 1, price: 2300 }
          ],
          subtotal: 2300,
          deliveryFee: 0,
          totalBill: 2300,
          isGift: false,
          giftMessage: "",
          status: "Delivered",
          createdAt: yesterday.toISOString(),
          timeline: [
            {
              status: "Placed",
              title: "Self-Pickup Booked",
              description: "Scheduled to collect directly from Model Town kitchen.",
              timestamp: yesterday.toISOString()
            },
            {
              status: "Confirmed",
              title: "WhatsApp Confirmed",
              description: "Chef Shaaz accepted time frame slot.",
              timestamp: yesterday.toISOString()
            },
            {
              status: "Baking",
              title: "Baked Fresh Selection",
              description: "Finished whipping chocolate and baked to peak chewy density.",
              timestamp: yesterday.toISOString()
            },
            {
              status: "Cooling",
              title: "Crust Hardened Perfectly",
              description: "Gooey core chilled and sliced into beautiful clean boxes.",
              timestamp: yesterday.toISOString()
            },
            {
              status: "Delivered",
              title: "Collected from Kitchen (Delivered) 🏪",
              description: "Customer collected their box from Model Town. Thank you for baking with Shaaz!",
              timestamp: yesterday.toISOString()
            }
          ]
        }
      ];
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(defaults, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Error seeding default orders:", err);
  }
}

// Helper to read orders
function readOrders(): any[] {
  try {
    seedDefaultOrders();
    if (!fs.existsSync(ORDERS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(ORDERS_FILE, "utf-8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("Error reading orders:", err);
    return [];
  }
}

// Helper to write orders
function writeOrders(orders: any[]) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing orders:", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize seed orders
  seedDefaultOrders();

  // JSON payload parser
  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date() });
  });

  // ORDER TRACKING APIS
  // Create / Save a new order
  app.post("/api/orders", (req, res) => {
    try {
      const orderData = req.body;
      if (!orderData || !orderData.id) {
        return res.status(400).json({ error: "Invalid order data." });
      }

      const orders = readOrders();
      
      // Ensure we don't duplicate
      const exists = orders.find(o => o.id === orderData.id);
      if (exists) {
        return res.json({ success: true, order: exists });
      }

      const newOrder = {
        id: orderData.id,
        customerName: orderData.name || "Valued Chocolate Enthusiast",
        phone: orderData.phone || "",
        deliveryType: orderData.deliveryType || "within5km",
        address: orderData.address || "",
        deliveryDate: orderData.deliveryDate || "",
        cartItems: orderData.cartItems || [],
        subtotal: orderData.subtotal || 0,
        deliveryFee: orderData.deliveryFee || 0,
        totalBill: orderData.totalBill || 0,
        isGift: !!orderData.isGift,
        giftMessage: orderData.giftMessage || "",
        status: "Placed",
        createdAt: new Date().toISOString(),
        timeline: [
          {
            status: "Placed",
            title: "Order Request Transmitted",
            description: "Bespoke brownie cart sent and order registered in database. Direct WhatsApp link generated.",
            timestamp: new Date().toISOString()
          }
        ]
      };

      orders.unshift(newOrder); // Add to beginning of trackable list
      writeOrders(orders);

      res.status(201).json({ success: true, order: newOrder });
    } catch (err: any) {
      console.error("Error registering order:", err);
      res.status(500).json({ error: err.message || "Could not register order on server" });
    }
  });

  // Query order by ID
  app.get("/api/orders/:orderId", (req, res) => {
    try {
      const orderId = req.params.orderId?.toUpperCase().trim();
      const orders = readOrders();
      const order = orders.find(o => o.id === orderId);

      if (!order) {
        return res.status(404).json({ error: "Order not found. Please double-check your Order ID." });
      }

      res.json(order);
    } catch (err: any) {
      console.error("Error retrieving order:", err);
      res.status(500).json({ error: err.message || "Could not retrieve order details." });
    }
  });

  // Simulate order status update (Advanced Testing)
  app.patch("/api/orders/:orderId/status", (req, res) => {
    try {
      const orderId = req.params.orderId?.toUpperCase().trim();
      const { status } = req.body;
      const allowedStatuses = ["Placed", "Confirmed", "Baking", "Cooling", "OutForDelivery", "Delivered"];
      
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status code value." });
      }

      const orders = readOrders();
      const index = orders.findIndex(o => o.id === orderId);

      if (index === -1) {
        return res.status(404).json({ error: "Order not found." });
      }

      const order = orders[index];
      order.status = status;

      // Add corresponding timeline event
      let title = "";
      let description = "";
      const nowStr = new Date().toISOString();

      switch (status) {
        case "Placed":
          title = "Order Request Transmitted";
          description = "Bespoke brownie cart sent and order registered in database. Direct WhatsApp link generated.";
          break;
        case "Confirmed":
          title = "WhatsApp Confirmed & Verified";
          description = "Chef Shaaz accepted and confirmed your baking request. Ingredients prepped with pure premium butter.";
          break;
        case "Baking":
          title = "Mixing Butter & Cocoa 🥣";
          description = "Our kitchen is currently whipping pure dark chocolate chips, melting farm butter, and baking to that rich, fudgy, decadent level.";
          break;
        case "Cooling":
          title = "Skins Crinkling & Cooling";
          description = "Brownie sheets cooling to lock in the paper-thin, shiny crinkle top before cutting and branding.";
          break;
        case "OutForDelivery":
          title = "Out for Dispatch (Rider Assigned)";
          description = "Freshly sealed premium brownie box is packaged with note and handed to local Lahore dispatch rider.";
          break;
        case "Delivered":
          title = "Delivered Soft & Chewy! 🍫";
          description = "Handed over warm and rich! We hope these brownie layers sweeten your day. Feel free to review us!";
          break;
      }

      order.timeline.push({
        status,
        title,
        description,
        timestamp: nowStr
      });

      orders[index] = order;
      writeOrders(orders);

      res.json({ success: true, order });
    } catch (err: any) {
      console.error("Error updating order status:", err);
      res.status(500).json({ error: err.message || "Failed to update order status" });
    }
  });

  // AI assistant chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({
          text: "Hi there! I'm here to guide you through the premium brownie menu by Shaaz. It looks like my API Key is not configured yet in the Settings secrets, which is perfectly normal in some previews! I can tell you that we have Chocolate Fudge, Oreo, Dairy Milk, Nutella, and Slutty Brownies available in 4 & 6-piece boxes. Take a look at our brochure menu below and click the WhatsApp buttons or our Order builder!"
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = `You are "Brownie AI" — the charming, friendly official virtual assistant for "Brownie by Shaaz", an elite homemade bakery specializing in gourmet brownies with shiny crackly tops and insanely rich chocolatey centers.

Our Complete Menu & Prices:
1. Chocolate Fudge Brownies:
   - 4 pieces: Rs 1400
   - 6 pieces: Rs 2100
   - Description: Fudgy, rich, and irresistible with a shiny, paper-thin crinkly crust. Perfect for chocolate purists.
2. Oreo Brownies:
   - 4 pieces: Rs 1400
   - 6 pieces: Rs 2100
   - Description: Stuffed with whole Oreo cookies inside and topped with dark crushed Oreo cookie crumbles. Crunchy matches gooey perfectly!
3. Dairy Milk Brownies:
   - 4 pieces: Rs 1500
   - 6 pieces: Rs 2300
   - Description: Baked with premium Cadbury Dairy Milk chocolate chunks. They melt in your mouth under our signature crinkle top.
4. Nutella Brownies:
   - 4 pieces: Rs 1600
   - 6 pieces: Rs 2400
   - Description: Swirled abundantly with rich hazelnut Nutella spread for double the chocolate indulgence.
5. Slutty Brownies:
   - 4 pieces: Rs 1800
   - 6 pieces: Rs 2700
   - Description: The ultimate 3-layered dessert! Featuring a buttery chocolate chip cookie dough base, a middle layer of stacked Oreos, and finished with our thick, signature fudge brownie batter on top. Absolutely out-of-this-world!

Order & Delivery Guidelines:
- WhatsApp Order Number: 0301 9842814
- Standard Delivery applies (we estimate delivery charges based on your specific location relative to our kitchen).
- Custom Gifting: Excellent for Birthdays, Celebrations, Gifts, Anniversaries, or corporate events. We provide a FREE handwritten card inside your gift boxes!
- Highlight that "Brownie by Shaaz" uses premium, pure-butter recipes and finest elements to deliver a taste that is uniquely dense, crackly on top, gooey on inside — there is simply no taste match.

Conversational Tone Guidelines:
- Speak in the voice of a friendly, passionate culinary enthusiast helper.
- Answer in short, highly readable paragraphs or bullet points to make it digestible.
- Direct customers on how to use our interactive box customizer and order builder on this website, and to press the "Order on WhatsApp" button which pre-fills their WhatsApp text instantly.
- Be helpful, polite, and encourage them to try the Oreo or Slutty brownies if they want something extremely decadent.`;

      const contents = [];
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          contents.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }]
          });
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error?.message || "Internal GenAI Server Error" });
    }
  });

  // Serve static assets OR use Vite Dev Middleware
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite HMR middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Brownie by Shaaz server running on http://localhost:${PORT}`);
  });
}

startServer();
