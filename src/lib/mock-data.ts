/**
 * Centralized mock data for the Crafts Continent marketplace.
 * Uses Unsplash images for realistic African craft product photography.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Category {
  name: string;
  slug: string;
  imageUrl: string;
  itemCount: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  imageUrl: string;
  images: string[];
  artisanName: string;
  artisanId: string;
  region: string;
  category: string;
  description: string;
  rating: number;
  reviewCount: number;
}

export interface Artisan {
  id: string;
  name: string;
  region: string;
  country: string;
  craft: string;
  bio: string;
  avatarUrl: string;
  products: number;
  yearsExperience: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  artisanName: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: OrderStatus;
  itemCount: number;
}

export interface DashboardStat {
  label: string;
  value: string;
  change: string;
}

export interface RecentOrder {
  order: string;
  customer: string;
  status: string;
  total: number;
}

export interface AdminStat {
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'artisan' | 'admin';
  joinedDate: string;
  status: 'active' | 'suspended';
}

export interface QcItem {
  id: string;
  productName: string;
  productImage: string;
  artisanName: string;
  submittedDate: string;
  priority: 'urgent' | 'normal';
  status: 'pending' | 'in_review';
}

export interface PayoutRequest {
  id: string;
  artisanName: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'on_hold';
  requestedDate: string;
  processedDate: string | null;
}

export interface ArtisanEarning {
  month: string;
  revenue: number;
  orders: number;
  payout: number;
}

export interface ArtisanOrderDetailed {
  id: string;
  orderNumber: string;
  customerName: string;
  date: string;
  items: { productName: string; quantity: number; price: number }[];
  total: number;
  status: OrderStatus;
}

export interface ArtisanAnalytics {
  totalViews: number;
  conversionRate: number;
  repeatCustomers: number;
  topProducts: { name: string; unitsSold: number; revenue: number }[];
  monthlySales: { month: string; revenue: number }[];
  trafficSources: { source: string; percentage: number }[];
}

export interface PendingVerification {
  id: string;
  artisanName: string;
  region: string;
  craft: string;
  submittedDate: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function unsplash(id: string, w = 600, h = 600): string {
  return `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;
}

// ---------------------------------------------------------------------------
// Artisans
// ---------------------------------------------------------------------------

export const ARTISANS: Artisan[] = [
  {
    id: 'a1',
    name: 'Kwame Asante',
    region: 'Accra',
    country: 'Ghana',
    craft: 'Kente Weaving',
    bio: 'A master Kente weaver from the Ashanti region, Kwame learned the art from his grandfather at age 12. His bold geometric patterns draw on centuries of Akan symbolism, with each colour and motif carrying deep cultural significance. He now trains young apprentices to preserve this UNESCO-recognised heritage craft.',
    avatarUrl: unsplash('photo-1506794778202-cad84cf45f1d', 200, 200),
    products: 18,
    yearsExperience: 25,
  },
  {
    id: 'a2',
    name: 'Naserian Meeli',
    region: 'Nairobi',
    country: 'Kenya',
    craft: 'Maasai Beadwork',
    bio: 'Naserian is a third-generation Maasai beadwork artist who creates stunning necklaces, bracelets and ceremonial pieces. Her designs blend ancestral Maasai colour codes with contemporary fashion aesthetics, and her work has been featured in Vogue Africa and at Nairobi Design Week.',
    avatarUrl: unsplash('photo-1531123897727-8f129e1688ce', 200, 200),
    products: 24,
    yearsExperience: 15,
  },
  {
    id: 'a3',
    name: 'Moussa Diallo',
    region: 'Bamako',
    country: 'Mali',
    craft: 'Wood Carving',
    bio: 'Moussa is a Bamana wood sculptor whose pieces bridge the ancient and the modern. Using sustainably sourced ebony and iroko wood, he carves masks, figurines and decorative panels that tell stories of West African mythology. His work is collected internationally.',
    avatarUrl: unsplash('photo-1507003211169-0a1dd7228f2d', 200, 200),
    products: 12,
    yearsExperience: 30,
  },
  {
    id: 'a4',
    name: 'Thandi Nkosi',
    region: 'Durban',
    country: 'South Africa',
    craft: 'Zulu Pottery',
    bio: 'Thandi is a renowned Zulu potter who shapes traditional beer pots (ukhamba) and contemporary vessels using coil-building techniques. Her burnished black pottery, finished with natural plant extracts, has earned multiple awards at the Durban International Craft Fair.',
    avatarUrl: unsplash('photo-1489424731084-a5d8b219a5bb', 200, 200),
    products: 16,
    yearsExperience: 20,
  },
  {
    id: 'a5',
    name: 'Abena Osei',
    region: 'Bolgatanga',
    country: 'Ghana',
    craft: 'Basket Weaving',
    bio: 'Abena leads a women\'s cooperative of 30 weavers in northern Ghana. Using elephant grass and recycled plastic, they produce the iconic Bolga baskets prized worldwide. Each basket takes 3-5 days to hand-weave and supports fair wages for rural communities.',
    avatarUrl: unsplash('photo-1523824921871-d6f1a15151f1', 200, 200),
    products: 22,
    yearsExperience: 18,
  },
  {
    id: 'a6',
    name: 'Amara Kamara',
    region: 'Dakar',
    country: 'Senegal',
    craft: 'Leather Work',
    bio: 'Amara is a master leather craftsman from Dakar who creates hand-stitched sandals, bags and accessories using vegetable-tanned goat leather. His family has run the same atelier in the Medina district for four generations, blending Wolof design heritage with modern minimalism.',
    avatarUrl: unsplash('photo-1500648767791-00dcc994a43e', 200, 200),
    products: 14,
    yearsExperience: 22,
  },
  {
    id: 'a7',
    name: 'Ngozi Eze',
    region: 'Lagos',
    country: 'Nigeria',
    craft: 'Ankara & Adire Textile',
    bio: 'Ngozi is a textile designer who produces hand-dyed Adire fabric using traditional indigo resist techniques alongside vibrant Ankara prints. Her studio in Lagos employs 15 women and ships to boutiques across Europe and North America.',
    avatarUrl: unsplash('photo-1494790108377-be9c29b29330', 200, 200),
    products: 20,
    yearsExperience: 12,
  },
  {
    id: 'a8',
    name: 'Tendai Moyo',
    region: 'Harare',
    country: 'Zimbabwe',
    craft: 'Stone Sculpture',
    bio: 'Tendai carves Springstone and Serpentine from the quarries near Tengenenge into expressive figurative sculptures. His abstract human forms and wildlife pieces are exhibited in galleries across Southern Africa and have been featured at the Venice Biennale.',
    avatarUrl: unsplash('photo-1472099645785-5658abf4ff4e', 200, 200),
    products: 10,
    yearsExperience: 28,
  },
];

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const CATEGORIES: Category[] = [
  {
    name: 'Heritage Home & Decor',
    slug: 'home-decor',
    imageUrl: unsplash('photo-1578301978693-85fa9c0320b9', 600, 450),
    itemCount: 86,
  },
  {
    name: 'African Capsule Accessories',
    slug: 'accessories',
    imageUrl: unsplash('photo-1573408301185-9146fe634ad0', 600, 450),
    itemCount: 64,
  },
  {
    name: 'Textiles & Fabrics',
    slug: 'textiles',
    imageUrl: unsplash('photo-1590735213920-68192a487bc2', 600, 450),
    itemCount: 52,
  },
  {
    name: 'DIY Craft Kits',
    slug: 'craft-kits',
    imageUrl: unsplash('photo-1513364776144-60967b0f800f', 600, 450),
    itemCount: 28,
  },
];

// ---------------------------------------------------------------------------
// Filter options
// ---------------------------------------------------------------------------

export const CATEGORY_FILTERS = [
  'All',
  'Home & Decor',
  'Accessories',
  'Textiles',
  'Pottery',
  'Wood Carvings',
  'Baskets',
  'Craft Kits',
] as const;

export const PRICE_RANGES = [
  'All',
  'Under UGX 150K',
  'UGX 150K - 300K',
  'UGX 300K - 600K',
  'Over UGX 600K',
] as const;

// ---------------------------------------------------------------------------
// Products (24 items)
// ---------------------------------------------------------------------------

export const PRODUCTS: Product[] = [
  // --- Home & Decor ---
  {
    id: '1',
    name: 'Bolga Market Basket',
    slug: 'bolga-market-basket',
    price: 175000,
    currency: 'UGX',
    imageUrl: unsplash('photo-1578301978693-85fa9c0320b9'),
    images: [
      unsplash('photo-1578301978693-85fa9c0320b9'),
      unsplash('photo-1584589167171-541ce45f1eea'),
      unsplash('photo-1596461404969-9ae70f2830c1'),
    ],
    artisanName: 'Abena Osei',
    artisanId: 'a5',
    region: 'Ghana',
    category: 'Baskets',
    description: 'Hand-woven from elephant grass by women artisans in Bolgatanga, this sturdy market basket features a reinforced leather-wrapped handle and vivid geometric dye patterns. Perfect as a shopping tote, storage basket, or statement decor piece. Each basket is unique — slight colour variations are part of its handmade charm.',
    rating: 4.9,
    reviewCount: 47,
  },
  {
    id: '2',
    name: 'Zulu Burnished Clay Pot',
    slug: 'zulu-burnished-clay-pot',
    price: 350000,
    currency: 'UGX',
    imageUrl: unsplash('photo-1565193566173-7a0ee3dbe261'),
    images: [
      unsplash('photo-1565193566173-7a0ee3dbe261'),
      unsplash('photo-1595231776515-ddffb1f4eb73'),
      unsplash('photo-1578749556568-bc2c40e68b61'),
    ],
    artisanName: 'Thandi Nkosi',
    artisanId: 'a4',
    region: 'South Africa',
    category: 'Pottery',
    description: 'This traditional Zulu ukhamba pot is coil-built by hand and burnished to a deep satin-black finish using indigenous plant extracts. Historically used for brewing umqombothi (sorghum beer), today it serves as a striking centrepiece or vase. Each pot carries the subtle fingerprints of its maker.',
    rating: 4.8,
    reviewCount: 31,
  },
  {
    id: '3',
    name: 'Ebony Carved Mask — Ancestor Spirit',
    slug: 'ebony-carved-mask-ancestor',
    price: 685000,
    currency: 'UGX',
    imageUrl: unsplash('photo-1582561424760-0321d75e81fa'),
    images: [
      unsplash('photo-1582561424760-0321d75e81fa'),
      unsplash('photo-1580136579312-94651dfd596d'),
      unsplash('photo-1590422749897-47036da0b0ff'),
    ],
    artisanName: 'Moussa Diallo',
    artisanId: 'a3',
    region: 'Mali',
    category: 'Wood Carvings',
    description: 'Carved from a single block of sustainably sourced ebony, this Ancestor Spirit mask draws on Bamana cosmology. The elongated face and scarification marks are hand-chiselled over two weeks, then polished with shea butter for a warm lustrous finish. A powerful wall-mount statement piece.',
    rating: 4.9,
    reviewCount: 19,
  },
  {
    id: '4',
    name: 'Woven Sisal Table Mat Set (4)',
    slug: 'woven-sisal-table-mat-set',
    price: 130000,
    currency: 'UGX',
    imageUrl: unsplash('photo-1596461404969-9ae70f2830c1'),
    images: [
      unsplash('photo-1596461404969-9ae70f2830c1'),
      unsplash('photo-1578301978693-85fa9c0320b9'),
      unsplash('photo-1584589167171-541ce45f1eea'),
    ],
    artisanName: 'Abena Osei',
    artisanId: 'a5',
    region: 'Ghana',
    category: 'Home & Decor',
    description: 'Set of four hand-woven sisal table mats in earthy terracotta and natural tones. Tightly coiled for durability and heat resistance, they protect your table while adding artisan warmth to everyday meals. Food-safe and easy to wipe clean.',
    rating: 4.7,
    reviewCount: 38,
  },
  {
    id: '5',
    name: 'Springstone Abstract Sculpture',
    slug: 'springstone-abstract-sculpture',
    price: 890000,
    currency: 'UGX',
    imageUrl: unsplash('photo-1582561424760-0321d75e81fa'),
    images: [
      unsplash('photo-1582561424760-0321d75e81fa'),
      unsplash('photo-1580136579312-94651dfd596d'),
      unsplash('photo-1590422749897-47036da0b0ff'),
    ],
    artisanName: 'Tendai Moyo',
    artisanId: 'a8',
    region: 'Zimbabwe',
    category: 'Home & Decor',
    description: 'A fluid, abstract figurative sculpture hand-carved from Zimbabwean Springstone. The dark stone is polished on the curves and left rough-textured in recesses, creating a dramatic interplay of light and shadow. Weighs approximately 8 kg — a substantial gallery-quality piece for shelf or mantle.',
    rating: 5.0,
    reviewCount: 12,
  },
  {
    id: '6',
    name: 'Barkcloth Decorative Throw',
    slug: 'barkcloth-decorative-throw',
    price: 285000,
    currency: 'UGX',
    imageUrl: unsplash('photo-1590735213920-68192a487bc2'),
    images: [
      unsplash('photo-1590735213920-68192a487bc2'),
      unsplash('photo-1574180566232-aaad1b5b8450'),
      unsplash('photo-1606722590583-6951b5ea92ad'),
    ],
    artisanName: 'Kwame Asante',
    artisanId: 'a1',
    region: 'Uganda',
    category: 'Home & Decor',
    description: 'Made from the inner bark of the Mutuba tree using a 600-year-old Ugandan technique (UNESCO Intangible Heritage), this barkcloth throw is naturally terracotta-brown with a soft, suede-like texture. Use as a wall hanging, sofa throw, or meditation mat.',
    rating: 4.6,
    reviewCount: 22,
  },

  // --- Accessories ---
  {
    id: '7',
    name: 'Maasai Beaded Collar Necklace',
    slug: 'maasai-beaded-collar-necklace',
    price: 240000,
    currency: 'UGX',
    imageUrl: unsplash('photo-1573408301185-9146fe634ad0'),
    images: [
      unsplash('photo-1573408301185-9146fe634ad0'),
      unsplash('photo-1535632066927-ab7c9ab60908'),
      unsplash('photo-1611085583191-a3b181a88401'),
    ],
    artisanName: 'Naserian Meeli',
    artisanId: 'a2',
    region: 'Kenya',
    category: 'Accessories',
    description: 'A wide disc-shaped collar necklace handcrafted by Maasai women using thousands of tiny glass seed beads on a leather base. The concentric colour bands — red for bravery, blue for sky, white for peace — follow traditional Maasai symbolism. Adjustable leather tie closure.',
    rating: 4.8,
    reviewCount: 56,
  },
  {
    id: '8',
    name: 'Cowrie Shell & Brass Earrings',
    slug: 'cowrie-shell-brass-earrings',
    price: 105000,
    currency: 'UGX',
    imageUrl: unsplash('photo-1535632066927-ab7c9ab60908'),
    images: [
      unsplash('photo-1535632066927-ab7c9ab60908'),
      unsplash('photo-1573408301185-9146fe634ad0'),
      unsplash('photo-1611085583191-a3b181a88401'),
    ],
    artisanName: 'Naserian Meeli',
    artisanId: 'a2',
    region: 'Kenya',
    category: 'Accessories',
    description: 'Delicate drop earrings pairing natural cowrie shells with hand-hammered brass discs. Cowrie shells have been used as currency and adornment across Africa for millennia. Hypoallergenic hooks, lightweight enough for all-day wear.',
    rating: 4.7,
    reviewCount: 42,
  },
  {
    id: '9',
    name: 'Hand-Stitched Leather Sandals',
    slug: 'hand-stitched-leather-sandals',
    price: 200000,
    currency: 'UGX',
    imageUrl: unsplash('photo-1603487742131-4160ec999306'),
    images: [
      unsplash('photo-1603487742131-4160ec999306'),
      unsplash('photo-1559181567-c3190ca9959b'),
      unsplash('photo-1582561424760-0321d75e81fa'),
    ],
    artisanName: 'Amara Kamara',
    artisanId: 'a6',
    region: 'Senegal',
    category: 'Accessories',
    description: 'Classic flat sandals hand-stitched from vegetable-tanned goat leather in Dakar. The T-strap design is inspired by ancient Wolof court footwear. The leather softens and moulds to your feet over time. Available in natural tan and deep brown.',
    rating: 4.6,
    reviewCount: 33,
  },
  {
    id: '10',
    name: 'Beaded Wrap Bracelet Stack (3)',
    slug: 'beaded-wrap-bracelet-stack',
    price: 80000,
    currency: 'UGX',
    imageUrl: unsplash('photo-1611085583191-a3b181a88401'),
    images: [
      unsplash('photo-1611085583191-a3b181a88401'),
      unsplash('photo-1573408301185-9146fe634ad0'),
      unsplash('photo-1535632066927-ab7c9ab60908'),
    ],
    artisanName: 'Naserian Meeli',
    artisanId: 'a2',
    region: 'Kenya',
    category: 'Accessories',
    description: 'Set of three stretchy Maasai-beaded bracelets in complementary colour palettes — sunset (red, orange, gold), ocean (blue, teal, white), and earth (brown, green, cream). Layer them together or wear individually for a pop of African colour.',
    rating: 4.9,
    reviewCount: 68,
  },
  {
    id: '11',
    name: 'Raffia Crossbody Bag',
    slug: 'raffia-crossbody-bag',
    price: 215000,
    currency: 'UGX',
    imageUrl: unsplash('photo-1584589167171-541ce45f1eea'),
    images: [
      unsplash('photo-1584589167171-541ce45f1eea'),
      unsplash('photo-1578301978693-85fa9c0320b9'),
      unsplash('photo-1596461404969-9ae70f2830c1'),
    ],
    artisanName: 'Abena Osei',
    artisanId: 'a5',
    region: 'Ghana',
    category: 'Accessories',
    description: 'A compact crossbody bag crocheted from natural raffia palm fibre and finished with a leather strap and brass clasp. Lined with cotton for durability. Fits a phone, wallet, keys and sunglasses — ideal for markets, travel and everyday outings.',
    rating: 4.7,
    reviewCount: 29,
  },
  {
    id: '12',
    name: 'Tuareg Silver Cuff Bracelet',
    slug: 'tuareg-silver-cuff-bracelet',
    price: 275000,
    currency: 'UGX',
    imageUrl: unsplash('photo-1576020799627-aeac74d58064'),
    images: [
      unsplash('photo-1576020799627-aeac74d58064'),
      unsplash('photo-1573408301185-9146fe634ad0'),
      unsplash('photo-1611085583191-a3b181a88401'),
    ],
    artisanName: 'Amara Kamara',
    artisanId: 'a6',
    region: 'Senegal',
    category: 'Accessories',
    description: 'A wide sterling-silver cuff engraved with geometric Tuareg motifs by Saharan silversmiths. The patterns represent protection, fertility and desert landscapes. Adjustable open back fits most wrist sizes. Comes in a cotton pouch.',
    rating: 4.8,
    reviewCount: 17,
  },

  // --- Textiles ---
  {
    id: '13',
    name: 'Hand-Woven Kente Cloth (Royal)',
    slug: 'hand-woven-kente-cloth-royal',
    price: 535000,
    currency: 'UGX',
    imageUrl: unsplash('photo-1590735213920-68192a487bc2'),
    images: [
      unsplash('photo-1590735213920-68192a487bc2'),
      unsplash('photo-1574180566232-aaad1b5b8450'),
      unsplash('photo-1606722590583-6951b5ea92ad'),
    ],
    artisanName: 'Kwame Asante',
    artisanId: 'a1',
    region: 'Ghana',
    category: 'Textiles',
    description: 'An authentic strip-woven Kente cloth in the prestigious "Adweneasa" (All Ideas Exhausted) pattern — historically reserved for Ashanti royalty. Gold, green and black silk-cotton blend. Approximately 180 cm x 120 cm. Perfect as a wall tapestry, ceremonial wrap, or fashion statement.',
    rating: 4.9,
    reviewCount: 24,
  },
  {
    id: '14',
    name: 'Indigo Adire Fabric (2 yards)',
    slug: 'indigo-adire-fabric',
    price: 155000,
    currency: 'UGX',
    imageUrl: unsplash('photo-1574180566232-aaad1b5b8450'),
    images: [
      unsplash('photo-1574180566232-aaad1b5b8450'),
      unsplash('photo-1590735213920-68192a487bc2'),
      unsplash('photo-1606722590583-6951b5ea92ad'),
    ],
    artisanName: 'Ngozi Eze',
    artisanId: 'a7',
    region: 'Nigeria',
    category: 'Textiles',
    description: 'Deep indigo hand-dyed cotton fabric made using the Yoruba "Adire Eleko" cassava-paste resist technique. The organic, abstract patterns emerge where the paste blocks the dye. Each piece is one-of-a-kind. Ideal for fashion, upholstery, or framing as art.',
    rating: 4.7,
    reviewCount: 35,
  },
  {
    id: '15',
    name: 'Ankara Wax Print Bundle (3 yards)',
    slug: 'ankara-wax-print-bundle',
    price: 120000,
    currency: 'UGX',
    imageUrl: unsplash('photo-1606722590583-6951b5ea92ad'),
    images: [
      unsplash('photo-1606722590583-6951b5ea92ad'),
      unsplash('photo-1574180566232-aaad1b5b8450'),
      unsplash('photo-1590735213920-68192a487bc2'),
    ],
    artisanName: 'Ngozi Eze',
    artisanId: 'a7',
    region: 'Nigeria',
    category: 'Textiles',
    description: 'Vibrant double-sided Ankara wax-print cotton in a bold floral motif. Machine-washable and colour-fast. Three-yard cut is enough for a dress, head wrap, or set of throw pillows. Mix and match with other prints for the signature "Ankara on Ankara" look.',
    rating: 4.6,
    reviewCount: 52,
  },
  {
    id: '16',
    name: 'Mudcloth (Bògòlanfini) Throw',
    slug: 'mudcloth-bogolan-throw',
    price: 325000,
    currency: 'UGX',
    imageUrl: unsplash('photo-1590735213920-68192a487bc2'),
    images: [
      unsplash('photo-1590735213920-68192a487bc2'),
      unsplash('photo-1574180566232-aaad1b5b8450'),
      unsplash('photo-1606722590583-6951b5ea92ad'),
    ],
    artisanName: 'Moussa Diallo',
    artisanId: 'a3',
    region: 'Mali',
    category: 'Textiles',
    description: 'Authentic Malian mudcloth dyed with fermented river mud and plant extracts on hand-spun cotton. The stark black-and-white geometric patterns are symbols of Bamana proverbs and rites of passage. A versatile piece for upholstery, wall art, or fashion.',
    rating: 4.8,
    reviewCount: 27,
  },

  // --- Pottery & Ceramics ---
  {
    id: '17',
    name: 'Terracotta Water Jug',
    slug: 'terracotta-water-jug',
    price: 240000,
    currency: 'UGX',
    imageUrl: unsplash('photo-1565193566173-7a0ee3dbe261'),
    images: [
      unsplash('photo-1565193566173-7a0ee3dbe261'),
      unsplash('photo-1595231776515-ddffb1f4eb73'),
      unsplash('photo-1578749556568-bc2c40e68b61'),
    ],
    artisanName: 'Thandi Nkosi',
    artisanId: 'a4',
    region: 'South Africa',
    category: 'Pottery',
    description: 'A hand-coiled terracotta jug with a narrow neck and wide belly, designed to keep water naturally cool through evaporative cooling. Decorated with incised Zulu diamond patterns and finished with a red-ochre slip.',
    rating: 4.7,
    reviewCount: 18,
  },
  {
    id: '18',
    name: 'Painted Ceramic Bowl Set (3)',
    slug: 'painted-ceramic-bowl-set',
    price: 200000,
    currency: 'UGX',
    imageUrl: unsplash('photo-1595231776515-ddffb1f4eb73'),
    images: [
      unsplash('photo-1595231776515-ddffb1f4eb73'),
      unsplash('photo-1565193566173-7a0ee3dbe261'),
      unsplash('photo-1578749556568-bc2c40e68b61'),
    ],
    artisanName: 'Thandi Nkosi',
    artisanId: 'a4',
    region: 'South Africa',
    category: 'Pottery',
    description: 'Set of three nesting ceramic bowls hand-painted with Ndebele-inspired geometric patterns in bold primary colours. Food-safe glazed interior. Use for serving, keys, or decorative display. Dishwasher safe.',
    rating: 4.5,
    reviewCount: 41,
  },

  // --- Wood Carvings ---
  {
    id: '19',
    name: 'Iroko Wood Serving Board',
    slug: 'iroko-wood-serving-board',
    price: 155000,
    currency: 'UGX',
    imageUrl: unsplash('photo-1580136579312-94651dfd596d'),
    images: [
      unsplash('photo-1580136579312-94651dfd596d'),
      unsplash('photo-1582561424760-0321d75e81fa'),
      unsplash('photo-1590422749897-47036da0b0ff'),
    ],
    artisanName: 'Moussa Diallo',
    artisanId: 'a3',
    region: 'Mali',
    category: 'Wood Carvings',
    description: 'A freeform serving and cheese board carved from a single slab of golden Iroko hardwood, finished with food-safe beeswax. The natural grain and live edge make each board unique. Measures approximately 45 cm x 25 cm.',
    rating: 4.8,
    reviewCount: 26,
  },
  {
    id: '20',
    name: 'Hand-Carved Djembe Drum',
    slug: 'hand-carved-djembe-drum',
    price: 610000,
    currency: 'UGX',
    imageUrl: unsplash('photo-1590422749897-47036da0b0ff'),
    images: [
      unsplash('photo-1590422749897-47036da0b0ff'),
      unsplash('photo-1580136579312-94651dfd596d'),
      unsplash('photo-1582561424760-0321d75e81fa'),
    ],
    artisanName: 'Moussa Diallo',
    artisanId: 'a3',
    region: 'Mali',
    category: 'Wood Carvings',
    description: 'A professional-grade Djembe drum carved from Dimba wood with a goat-skin head tensioned by hand-twisted Mali rope. Rich bass tones and crisp slaps. Height 60 cm, head diameter 33 cm. Includes a carrying strap.',
    rating: 4.9,
    reviewCount: 15,
  },

  // --- Craft Kits ---
  {
    id: '21',
    name: 'Maasai Beadwork Starter Kit',
    slug: 'maasai-beadwork-starter-kit',
    price: 130000,
    currency: 'UGX',
    imageUrl: unsplash('photo-1513364776144-60967b0f800f'),
    images: [
      unsplash('photo-1513364776144-60967b0f800f'),
      unsplash('photo-1611085583191-a3b181a88401'),
      unsplash('photo-1573408301185-9146fe634ad0'),
    ],
    artisanName: 'Naserian Meeli',
    artisanId: 'a2',
    region: 'Kenya',
    category: 'Craft Kits',
    description: 'Everything you need to create your own Maasai-style beaded bracelet: 500+ glass seed beads in 8 traditional colours, beading needle, thread, leather backing, and a step-by-step illustrated guide by Naserian. Makes 3 bracelets. Suitable for beginners.',
    rating: 4.8,
    reviewCount: 44,
  },
  {
    id: '22',
    name: 'Adire Indigo Dye Kit',
    slug: 'adire-indigo-dye-kit',
    price: 165000,
    currency: 'UGX',
    imageUrl: unsplash('photo-1513364776144-60967b0f800f'),
    images: [
      unsplash('photo-1513364776144-60967b0f800f'),
      unsplash('photo-1574180566232-aaad1b5b8450'),
      unsplash('photo-1590735213920-68192a487bc2'),
    ],
    artisanName: 'Ngozi Eze',
    artisanId: 'a7',
    region: 'Nigeria',
    category: 'Craft Kits',
    description: 'Create your own Yoruba-style Adire fabric at home. Kit includes natural indigo powder, cassava paste, applicator, 2 yards of prepared cotton, rubber gloves, and a detailed instruction booklet with 5 traditional patterns to try.',
    rating: 4.6,
    reviewCount: 21,
  },
  {
    id: '23',
    name: 'Dyed Raffia Weaving Bundle',
    slug: 'dyed-raffia-weaving-bundle',
    price: 105000,
    currency: 'UGX',
    imageUrl: unsplash('photo-1513364776144-60967b0f800f'),
    images: [
      unsplash('photo-1513364776144-60967b0f800f'),
      unsplash('photo-1584589167171-541ce45f1eea'),
      unsplash('photo-1596461404969-9ae70f2830c1'),
    ],
    artisanName: 'Abena Osei',
    artisanId: 'a5',
    region: 'Ghana',
    category: 'Craft Kits',
    description: 'A generous bundle of hand-dyed raffia palm fibre in 10 vibrant colours. Enough to weave a small basket, coasters, or a hat. Includes a beginner weaving guide and a wooden needle. Great for craft nights or school projects.',
    rating: 4.5,
    reviewCount: 16,
  },
  {
    id: '24',
    name: 'Recycled Bead Jewellery Kit',
    slug: 'recycled-bead-jewellery-kit',
    price: 110000,
    currency: 'UGX',
    imageUrl: unsplash('photo-1513364776144-60967b0f800f'),
    images: [
      unsplash('photo-1513364776144-60967b0f800f'),
      unsplash('photo-1611085583191-a3b181a88401'),
      unsplash('photo-1535632066927-ab7c9ab60908'),
    ],
    artisanName: 'Abena Osei',
    artisanId: 'a5',
    region: 'Ghana',
    category: 'Craft Kits',
    description: 'Hand-made recycled glass beads from Krobo, Ghana — created by crushing and melting waste glass bottles into clay moulds. Kit contains 60 beads in assorted shapes and colours, elastic cord, clasps, and design inspiration cards. Make 4-5 pieces.',
    rating: 4.7,
    reviewCount: 33,
  },
];

// ---------------------------------------------------------------------------
// Cart
// ---------------------------------------------------------------------------

export const INITIAL_CART_ITEMS: CartItem[] = [
  {
    id: '7',
    name: 'Maasai Beaded Collar Necklace',
    price: 240000,
    quantity: 1,
    imageUrl: unsplash('photo-1573408301185-9146fe634ad0', 120, 120),
    artisanName: 'Naserian Meeli',
  },
  {
    id: '1',
    name: 'Bolga Market Basket',
    price: 175000,
    quantity: 2,
    imageUrl: unsplash('photo-1578301978693-85fa9c0320b9', 120, 120),
    artisanName: 'Abena Osei',
  },
  {
    id: '15',
    name: 'Ankara Wax Print Bundle (3 yards)',
    price: 120000,
    quantity: 1,
    imageUrl: unsplash('photo-1606722590583-6951b5ea92ad', 120, 120),
    artisanName: 'Ngozi Eze',
  },
];

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export const MOCK_ORDERS: Order[] = [
  { id: '1', orderNumber: 'CC-2026-0147', date: '2026-03-14', total: 775000, status: 'delivered', itemCount: 3 },
  { id: '2', orderNumber: 'CC-2026-0152', date: '2026-03-10', total: 535000, status: 'shipped', itemCount: 1 },
  { id: '3', orderNumber: 'CC-2026-0158', date: '2026-03-07', total: 345000, status: 'shipped', itemCount: 2 },
  { id: '4', orderNumber: 'CC-2026-0163', date: '2026-03-03', total: 610000, status: 'processing', itemCount: 2 },
  { id: '5', orderNumber: 'CC-2026-0171', date: '2026-02-25', total: 325000, status: 'delivered', itemCount: 1 },
  { id: '6', orderNumber: 'CC-2026-0180', date: '2026-02-18', total: 1150000, status: 'delivered', itemCount: 4 },
];

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export const DASHBOARD_STATS: DashboardStat[] = [
  { label: 'Total Sales', value: 'UGX 46,200,000', change: '+18%' },
  { label: 'Pending Orders', value: '14', change: '+5' },
  { label: 'Active Products', value: '24', change: '+3' },
  { label: 'This Month', value: 'UGX 11,990,000', change: '+22%' },
];

export const RECENT_DASHBOARD_ORDERS: RecentOrder[] = [
  { order: 'CC-0147', customer: 'Sarah Johnson', status: 'Delivered', total: 775000 },
  { order: 'CC-0152', customer: 'James Banda', status: 'Shipped', total: 535000 },
  { order: 'CC-0158', customer: 'Olivia Chen', status: 'Shipped', total: 345000 },
  { order: 'CC-0163', customer: 'David Okonkwo', status: 'Processing', total: 610000 },
  { order: 'CC-0171', customer: 'Maria Santos', status: 'Delivered', total: 325000 },
];

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

/** Find a product by slug — returns the first match or undefined. */
export function findProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

/** Find an artisan by id. */
export function findArtisan(id: string): Artisan | undefined {
  return ARTISANS.find((a) => a.id === id);
}

// ---------------------------------------------------------------------------
// Admin Data
// ---------------------------------------------------------------------------

export const ADMIN_STATS: AdminStat[] = [
  { label: 'Total Revenue', value: 'UGX 186,400,000', change: '+24%', changeType: 'positive' },
  { label: 'Total Orders', value: '847', change: '+18%', changeType: 'positive' },
  { label: 'Active Artisans', value: '42', change: '+6', changeType: 'positive' },
  { label: 'QC Queue', value: '8', change: '-3', changeType: 'negative' },
];

export const MOCK_USERS: MockUser[] = [
  { id: 'u1', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'customer', joinedDate: '2025-11-15', status: 'active' },
  { id: 'u2', name: 'Kwame Asante', email: 'kwame@crafts.com', role: 'artisan', joinedDate: '2025-08-20', status: 'active' },
  { id: 'u3', name: 'James Banda', email: 'james@example.com', role: 'customer', joinedDate: '2025-12-01', status: 'active' },
  { id: 'u4', name: 'Naserian Meeli', email: 'naserian@crafts.com', role: 'artisan', joinedDate: '2025-07-10', status: 'active' },
  { id: 'u5', name: 'Admin User', email: 'admin@craftcontinent.com', role: 'admin', joinedDate: '2025-06-01', status: 'active' },
  { id: 'u6', name: 'Olivia Chen', email: 'olivia@example.com', role: 'customer', joinedDate: '2026-01-05', status: 'active' },
  { id: 'u7', name: 'David Okonkwo', email: 'david@example.com', role: 'customer', joinedDate: '2025-09-22', status: 'suspended' },
  { id: 'u8', name: 'Moussa Diallo', email: 'moussa@crafts.com', role: 'artisan', joinedDate: '2025-06-15', status: 'active' },
  { id: 'u9', name: 'Thandi Nkosi', email: 'thandi@crafts.com', role: 'artisan', joinedDate: '2025-10-08', status: 'active' },
  { id: 'u10', name: 'Maria Santos', email: 'maria@example.com', role: 'customer', joinedDate: '2026-02-14', status: 'active' },
];

export const QC_QUEUE_ITEMS: QcItem[] = [
  { id: 'qc1', productName: 'Handwoven Kente Stole', productImage: unsplash('photo-1590735213920-68192a487bc2', 120, 120), artisanName: 'Kwame Asante', submittedDate: '2026-03-17', priority: 'urgent', status: 'pending' },
  { id: 'qc2', productName: 'Beaded Anklet Set', productImage: unsplash('photo-1611085583191-a3b181a88401', 120, 120), artisanName: 'Naserian Meeli', submittedDate: '2026-03-16', priority: 'normal', status: 'pending' },
  { id: 'qc3', productName: 'Carved Ebony Chess Set', productImage: unsplash('photo-1580136579312-94651dfd596d', 120, 120), artisanName: 'Moussa Diallo', submittedDate: '2026-03-15', priority: 'normal', status: 'in_review' },
  { id: 'qc4', productName: 'Recycled Glass Vase', productImage: unsplash('photo-1565193566173-7a0ee3dbe261', 120, 120), artisanName: 'Thandi Nkosi', submittedDate: '2026-03-15', priority: 'urgent', status: 'pending' },
  { id: 'qc5', productName: 'Leather Travel Journal', productImage: unsplash('photo-1603487742131-4160ec999306', 120, 120), artisanName: 'Amara Kamara', submittedDate: '2026-03-14', priority: 'normal', status: 'pending' },
  { id: 'qc6', productName: 'Batik Silk Scarf', productImage: unsplash('photo-1574180566232-aaad1b5b8450', 120, 120), artisanName: 'Ngozi Eze', submittedDate: '2026-03-13', priority: 'normal', status: 'in_review' },
];

export const PAYOUT_REQUESTS: PayoutRequest[] = [
  { id: 'p1', artisanName: 'Kwame Asante', amount: 4850000, status: 'pending', requestedDate: '2026-03-18', processedDate: null },
  { id: 'p2', artisanName: 'Naserian Meeli', amount: 6200000, status: 'processing', requestedDate: '2026-03-16', processedDate: null },
  { id: 'p3', artisanName: 'Moussa Diallo', amount: 3100000, status: 'completed', requestedDate: '2026-03-10', processedDate: '2026-03-12' },
  { id: 'p4', artisanName: 'Thandi Nkosi', amount: 2750000, status: 'completed', requestedDate: '2026-03-08', processedDate: '2026-03-10' },
  { id: 'p5', artisanName: 'Abena Osei', amount: 5400000, status: 'pending', requestedDate: '2026-03-17', processedDate: null },
  { id: 'p6', artisanName: 'Amara Kamara', amount: 1900000, status: 'on_hold', requestedDate: '2026-03-14', processedDate: null },
  { id: 'p7', artisanName: 'Ngozi Eze', amount: 4100000, status: 'completed', requestedDate: '2026-03-05', processedDate: '2026-03-07' },
  { id: 'p8', artisanName: 'Tendai Moyo', amount: 3600000, status: 'pending', requestedDate: '2026-03-19', processedDate: null },
];

export const ARTISAN_EARNINGS: ArtisanEarning[] = [
  { month: 'Oct', revenue: 3200000, orders: 18, payout: 2880000 },
  { month: 'Nov', revenue: 4100000, orders: 24, payout: 3690000 },
  { month: 'Dec', revenue: 5800000, orders: 35, payout: 5220000 },
  { month: 'Jan', revenue: 4600000, orders: 28, payout: 4140000 },
  { month: 'Feb', revenue: 5200000, orders: 31, payout: 4680000 },
  { month: 'Mar', revenue: 6100000, orders: 37, payout: 5490000 },
];

export const ARTISAN_ORDERS_DETAILED: ArtisanOrderDetailed[] = [
  { id: 'ao1', orderNumber: 'CC-2026-0147', customerName: 'Sarah Johnson', date: '2026-03-14', items: [{ productName: 'Bolga Market Basket', quantity: 2, price: 175000 }, { productName: 'Maasai Beaded Collar Necklace', quantity: 1, price: 240000 }], total: 590000, status: 'delivered' },
  { id: 'ao2', orderNumber: 'CC-2026-0152', customerName: 'James Banda', date: '2026-03-12', items: [{ productName: 'Hand-Woven Kente Cloth (Royal)', quantity: 1, price: 535000 }], total: 535000, status: 'shipped' },
  { id: 'ao3', orderNumber: 'CC-2026-0158', customerName: 'Olivia Chen', date: '2026-03-10', items: [{ productName: 'Indigo Adire Fabric (2 yards)', quantity: 1, price: 155000 }, { productName: 'Ankara Wax Print Bundle', quantity: 1, price: 120000 }], total: 275000, status: 'shipped' },
  { id: 'ao4', orderNumber: 'CC-2026-0163', customerName: 'David Okonkwo', date: '2026-03-08', items: [{ productName: 'Hand-Carved Djembe Drum', quantity: 1, price: 610000 }], total: 610000, status: 'processing' },
  { id: 'ao5', orderNumber: 'CC-2026-0171', customerName: 'Maria Santos', date: '2026-03-05', items: [{ productName: 'Mudcloth (Bògòlanfini) Throw', quantity: 1, price: 325000 }], total: 325000, status: 'pending' },
  { id: 'ao6', orderNumber: 'CC-2026-0180', customerName: 'Lisa Kimani', date: '2026-03-03', items: [{ productName: 'Cowrie Shell & Brass Earrings', quantity: 2, price: 105000 }, { productName: 'Beaded Wrap Bracelet Stack', quantity: 3, price: 80000 }], total: 450000, status: 'delivered' },
  { id: 'ao7', orderNumber: 'CC-2026-0185', customerName: 'Peter Ndlovu', date: '2026-02-28', items: [{ productName: 'Springstone Abstract Sculpture', quantity: 1, price: 890000 }], total: 890000, status: 'delivered' },
  { id: 'ao8', orderNumber: 'CC-2026-0190', customerName: 'Grace Mutesi', date: '2026-02-25', items: [{ productName: 'Terracotta Water Jug', quantity: 1, price: 240000 }, { productName: 'Painted Ceramic Bowl Set', quantity: 1, price: 200000 }], total: 440000, status: 'delivered' },
];

export const ARTISAN_ANALYTICS: ArtisanAnalytics = {
  totalViews: 12847,
  conversionRate: 3.8,
  repeatCustomers: 24,
  topProducts: [
    { name: 'Bolga Market Basket', unitsSold: 47, revenue: 8225000 },
    { name: 'Maasai Beaded Collar Necklace', unitsSold: 38, revenue: 9120000 },
    { name: 'Hand-Woven Kente Cloth (Royal)', unitsSold: 24, revenue: 12840000 },
    { name: 'Beaded Wrap Bracelet Stack (3)', unitsSold: 68, revenue: 5440000 },
    { name: 'Ankara Wax Print Bundle', unitsSold: 52, revenue: 6240000 },
  ],
  monthlySales: [
    { month: 'Oct', revenue: 3200000 },
    { month: 'Nov', revenue: 4100000 },
    { month: 'Dec', revenue: 5800000 },
    { month: 'Jan', revenue: 4600000 },
    { month: 'Feb', revenue: 5200000 },
    { month: 'Mar', revenue: 6100000 },
  ],
  trafficSources: [
    { source: 'Direct', percentage: 35 },
    { source: 'Social Media', percentage: 28 },
    { source: 'Search Engine', percentage: 22 },
    { source: 'Referral', percentage: 10 },
    { source: 'Email', percentage: 5 },
  ],
};

export const PENDING_VERIFICATIONS: PendingVerification[] = [
  { id: 'pv1', artisanName: 'Fatima Al-Hassan', region: 'Marrakech', craft: 'Zellige Tilework', submittedDate: '2026-03-17' },
  { id: 'pv2', artisanName: 'Kofi Mensah', region: 'Kumasi', craft: 'Brass Casting', submittedDate: '2026-03-16' },
  { id: 'pv3', artisanName: 'Aisha Bello', region: 'Kano', craft: 'Indigo Dyeing', submittedDate: '2026-03-14' },
];

export const ADMIN_RECENT_ORDERS: RecentOrder[] = [
  { order: 'CC-0195', customer: 'Grace Mutesi', status: 'Pending', total: 440000 },
  { order: 'CC-0192', customer: 'Peter Ndlovu', status: 'Processing', total: 890000 },
  { order: 'CC-0190', customer: 'Lisa Kimani', status: 'Shipped', total: 450000 },
  { order: 'CC-0187', customer: 'Sarah Johnson', status: 'Delivered', total: 590000 },
  { order: 'CC-0185', customer: 'James Banda', status: 'Delivered', total: 535000 },
];
