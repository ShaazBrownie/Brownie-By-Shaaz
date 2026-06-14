export interface BrownieItem {
  id: string;
  name: string;
  description: string;
  image: string;
  prices: {
    4: number; // Price for 4 pieces
    6: number; // Price for 6 pieces
  };
  tags: string[];
}

export interface CartItem {
  cartId: string; // "itemId-pieces"
  id: string;     // itemId
  name: string;
  pieces: 4 | 6;
  price: number;
  quantity: number;
  image: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  platform: "facebook" | "instagram";
  likes?: number;
}
