import { BrownieItem, Review } from "./types";
import fudgeBrownieImg from "./assets/images/fudge_brownie_1781435743579.jpg";
import oreoBrownieImg from "./assets/images/oreo_brownie_1781435761604.jpg";
import dairymilkBrownieImg from "./assets/images/dairymilk_brownie_1781435800154.jpg";
import nutellaBrownieImg from "./assets/images/nutella_brownie_1781435780714.jpg";
import sluttyBrownieImg from "./assets/images/slutty_brownie_1781435818491.jpg";

export const WHATSAPP_NUMBER = "03019842814";
export const WHATSAPP_LINK = `https://wa.me/923019842814`;

export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/profile.php?id=61566379356614",
  instagram: "https://www.instagram.com/brownie_by_shaaz?utm_source=qr&igsh=eTZzMWF1YTA0NmNj"
};

export const BROWNIE_ITEMS: BrownieItem[] = [
  {
    id: "fudge",
    name: "Chocolate Fudge Brownies",
    description: "The classic gold-standard! Incredibly fudgy, dense, and rich cocoa brownie with our signature shiny, paper-thin crinkled top. Truly irresistible.",
    image: fudgeBrownieImg,
    prices: {
      4: 1300,
      6: 1800
    },
    tags: ["Signature", "Fudgy Classic"]
  },
  {
    id: "oreo",
    name: "Oreo Brownies",
    description: "Gooey chocolate fudge brownies baked on a base of whole Oreos and cookie chunks inside, topped with crushed Oreos for the perfect crunch-meld.",
    image: oreoBrownieImg,
    prices: {
      4: 1400,
      6: 2000
    },
    tags: ["Bestseller", "Crunchy & Gooey"]
  },
  {
    id: "dairymilk",
    name: "DairyMilk Brownies",
    description: "Packed with thick melt-in-your-mouth chunks of premium Cadbury Dairy Milk chocolate, blending smoothly with our rich brownie batter.",
    image: dairymilkBrownieImg,
    prices: {
      4: 1400,
      6: 2000
    },
    tags: ["Premium", "Rich Chunks"]
  },
  {
    id: "nutella",
    name: "Nutella Brownies",
    description: "Marbled with generous swirls of premium hazelnut Nutella spread before baking. Delivers double the creamy, nutty chocolate depth in every slice.",
    image: nutellaBrownieImg,
    prices: {
      4: 1400,
      6: 2000
    },
    tags: ["Staff Pick", "Intensely Rich"]
  }
];

export const CUSTOMER_REVIEWS: Review[] = [
  {
    id: "rev1",
    author: "Zainab K.",
    rating: 5,
    date: "14 days ago",
    text: "Ordered the Oreo & Nutella Brownies for my brother's birthday. They were absolutely out of this world! Dense, gooey, and rich. Unmatched taste in town!",
    platform: "instagram",
    likes: 24
  },
  {
    id: "rev2",
    author: "M. Haris",
    rating: 5,
    date: "1 month ago",
    text: "If you love dense, gooey, and heavy brownies with that perfect crackly parchment top, Brownie by Shaaz is the real deal. No artificial taste. Chocolate Fudge is extremely high-grade.",
    platform: "facebook",
    likes: 18
  },
  {
    id: "rev3",
    author: "Ayesha Ahmed",
    rating: 5,
    date: "3 weeks ago",
    text: "The customized gift box was beautiful. They added a neat handwritten card for my friend and sent me photos before dispatching. The Nutella one is swirled so generously. Recommended!",
    platform: "instagram",
    likes: 15
  },
  {
    id: "rev4",
    author: "Bilal Lodhi",
    rating: 5,
    date: "2 months ago",
    text: "Amazing taste that doesn't feel overly sweet. Baked right, dense, fudgy, and moist inside. The DairyMilk brownie had real chocolate chunks. Fast response on WhatsApp too!",
    platform: "facebook",
    likes: 31
  }
];
