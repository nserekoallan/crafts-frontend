/**
 * Centralized mock data for the Crafts Continent marketplace.
 * Uses local product images from /products/ directory.
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

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
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
  stockStatus: StockStatus;
  stockCount?: number;
  featured?: boolean;
  isNew?: boolean;
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
  category: string;
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

export interface HomepageBanner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface DealZone {
  id: string;
  title: string;
  imageUrl: string;
  itemCount: number;
  href: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function img(n: number): string {
  return `/products/product-${String(n).padStart(2, '0')}.jpg`;
}

function unsplash(id: string, w = 600, h = 600): string {
  return `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;
}

// ---------------------------------------------------------------------------
// Artisans
// ---------------------------------------------------------------------------

export const ARTISANS: Artisan[] = [
  {
    id: 'a1',
    name: 'Akera Komakech',
    region: 'Gulu',
    country: 'Uganda',
    craft: 'Basket Weaving & Wall Art',
    bio: 'A master weaver from Northern Uganda, Akera learned the art of coiled basket weaving from her grandmother. She leads a cooperative of 15 women artisans producing heritage wall plates, storage baskets, and decorative pieces using locally sourced natural fibres and dyes.',
    avatarUrl: unsplash('photo-1531123897727-8f129e1688ce', 200, 200),
    products: 22,
    yearsExperience: 18,
  },
  {
    id: 'a2',
    name: 'Naserian Meeli',
    region: 'Nairobi',
    country: 'Kenya',
    craft: 'Shell & Bead Jewelry',
    bio: 'Naserian is a third-generation Maasai beadwork artist who creates stunning necklaces, bracelets and ceremonial pieces. Her designs blend ancestral Maasai colour codes with contemporary fashion aesthetics.',
    avatarUrl: unsplash('photo-1494790108377-be9c29b29330', 200, 200),
    products: 18,
    yearsExperience: 15,
  },
  {
    id: 'a3',
    name: 'Amina Kyomuhendo',
    region: 'Kampala',
    country: 'Uganda',
    craft: 'African Fashion & Ankara',
    bio: 'Amina is a textile designer who produces vibrant Ankara print accessories and fabric jewelry from her studio in Kampala. She employs 8 women and ships to boutiques across East Africa and Europe.',
    avatarUrl: unsplash('photo-1489424731084-a5d8b219a5bb', 200, 200),
    products: 14,
    yearsExperience: 10,
  },
];

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const CATEGORIES: Category[] = [
  {
    name: 'Heritage Wall Art',
    slug: 'heritage-wall-art',
    imageUrl: img(17),
    itemCount: 12,
  },
  {
    name: 'Artisan Baskets',
    slug: 'artisan-baskets',
    imageUrl: img(8),
    itemCount: 10,
  },
  {
    name: 'Shell & Bead Jewelry',
    slug: 'shell-bead-jewelry',
    imageUrl: img(24),
    itemCount: 8,
  },
  {
    name: 'African Fashion',
    slug: 'african-fashion',
    imageUrl: img(4),
    itemCount: 5,
  },
];

// ---------------------------------------------------------------------------
// Filter options
// ---------------------------------------------------------------------------

export const CATEGORY_FILTERS = [
  'All',
  'Heritage Wall Art',
  'Artisan Baskets',
  'Shell & Bead Jewelry',
  'African Fashion',
] as const;

export const PRICE_RANGES = [
  'All',
  'Under UGX 100K',
  'UGX 100K - 200K',
  'UGX 200K+',
] as const;

// ---------------------------------------------------------------------------
// Products (35 items)
// ---------------------------------------------------------------------------

export const PRODUCTS: Product[] = [
  // --- Heritage Wall Art (1-12) ---
  {
    id: '1',
    name: 'Earth Tones Coiled Wall Plate',
    slug: 'earth-tones-coiled-wall-plate',
    price: 135000,
    originalPrice: 180000,
    currency: 'UGX',
    imageUrl: img(1),
    images: [img(1), img(2), img(3)],
    artisanName: 'Akera Komakech',
    artisanId: 'a1',
    region: 'Uganda',
    category: 'Heritage Wall Art',
    description: 'A hand-coiled decorative wall plate in warm earth tones. Woven from natural sisal and raffia fibres with traditional Acholi patterns. Each plate takes 3-5 days to complete. Perfect as a statement wall piece.',
    rating: 4.9,
    reviewCount: 47,
    stockStatus: 'in_stock',
    featured: true,
  },
  {
    id: '2',
    name: 'Sunset Gradient Wall Disc',
    slug: 'sunset-gradient-wall-disc',
    price: 120000,
    currency: 'UGX',
    imageUrl: img(2),
    images: [img(2), img(1), img(3)],
    artisanName: 'Akera Komakech',
    artisanId: 'a1',
    region: 'Uganda',
    category: 'Heritage Wall Art',
    description: 'A beautiful gradient wall disc transitioning from warm terracotta to golden yellow. Hand-woven with tightly coiled natural fibres. Approximately 30cm diameter.',
    rating: 4.8,
    reviewCount: 31,
    stockStatus: 'in_stock',
    isNew: true,
  },
  {
    id: '3',
    name: 'Monochrome Woven Wall Set',
    slug: 'monochrome-woven-wall-set',
    price: 250000,
    originalPrice: 320000,
    currency: 'UGX',
    imageUrl: img(3),
    images: [img(3), img(1), img(2)],
    artisanName: 'Akera Komakech',
    artisanId: 'a1',
    region: 'Uganda',
    category: 'Heritage Wall Art',
    description: 'Set of three black and white woven wall plates in graduating sizes. The geometric patterns draw on traditional Ugandan symbolism. Creates a stunning gallery wall arrangement.',
    rating: 4.9,
    reviewCount: 19,
    stockStatus: 'low_stock',
    stockCount: 3,
    featured: true,
  },
  {
    id: '4',
    name: 'Vibrant Ankara Wall Plate',
    slug: 'vibrant-ankara-wall-plate',
    price: 95000,
    currency: 'UGX',
    imageUrl: img(4),
    images: [img(4), img(5), img(6)],
    artisanName: 'Amina Kyomuhendo',
    artisanId: 'a3',
    region: 'Uganda',
    category: 'Heritage Wall Art',
    description: 'A striking wall plate wrapped in vibrant Ankara wax print fabric over a coiled grass base. Blends traditional weaving craft with contemporary African textile art.',
    rating: 4.7,
    reviewCount: 38,
    stockStatus: 'in_stock',
    isNew: true,
  },
  {
    id: '5',
    name: 'Natural Fibre Gallery Set',
    slug: 'natural-fibre-gallery-set',
    price: 200000,
    currency: 'UGX',
    imageUrl: img(5),
    images: [img(5), img(6), img(7)],
    artisanName: 'Akera Komakech',
    artisanId: 'a1',
    region: 'Uganda',
    category: 'Heritage Wall Art',
    description: 'A curated set of five small woven wall plates in natural undyed tones. Each plate features a different traditional pattern. Perfect for creating an organic gallery wall.',
    rating: 4.6,
    reviewCount: 22,
    stockStatus: 'in_stock',
  },
  {
    id: '6',
    name: 'Rainbow Spiral Wall Art',
    slug: 'rainbow-spiral-wall-art',
    price: 110000,
    currency: 'UGX',
    imageUrl: img(6),
    images: [img(6), img(4), img(5)],
    artisanName: 'Akera Komakech',
    artisanId: 'a1',
    region: 'Uganda',
    category: 'Heritage Wall Art',
    description: 'A joyful rainbow spiral coiled plate using naturally dyed raffia. The concentric colour rings represent unity and community in Acholi tradition. 25cm diameter.',
    rating: 4.8,
    reviewCount: 33,
    stockStatus: 'in_stock',
    featured: true,
  },
  {
    id: '7',
    name: 'Oversized Statement Basket Plate',
    slug: 'oversized-statement-basket-plate',
    price: 185000,
    originalPrice: 230000,
    currency: 'UGX',
    imageUrl: img(7),
    images: [img(7), img(8), img(9)],
    artisanName: 'Akera Komakech',
    artisanId: 'a1',
    region: 'Uganda',
    category: 'Heritage Wall Art',
    description: 'An oversized 50cm coiled wall plate in rich terracotta and black patterns. A dramatic centrepiece for any room. Comes with a wall-mounting ring on the back.',
    rating: 4.9,
    reviewCount: 15,
    stockStatus: 'low_stock',
    stockCount: 4,
  },
  {
    id: '8',
    name: 'Woven Grass Serving Tray',
    slug: 'woven-grass-serving-tray',
    price: 85000,
    currency: 'UGX',
    imageUrl: img(8),
    images: [img(8), img(9), img(10)],
    artisanName: 'Akera Komakech',
    artisanId: 'a1',
    region: 'Uganda',
    category: 'Artisan Baskets',
    description: 'A flat woven grass serving tray with raised edges. Dual-purpose: use as a wall decoration or a functional serving piece for bread and fruit. Natural and brown tones.',
    rating: 4.7,
    reviewCount: 42,
    stockStatus: 'in_stock',
  },
  {
    id: '9',
    name: 'Lidded Storage Basket — Medium',
    slug: 'lidded-storage-basket-medium',
    price: 125000,
    currency: 'UGX',
    imageUrl: img(9),
    images: [img(9), img(10), img(11)],
    artisanName: 'Akera Komakech',
    artisanId: 'a1',
    region: 'Uganda',
    category: 'Artisan Baskets',
    description: 'A tightly woven lidded basket in earth tones. Perfect for storing small items, jewellery, or serving snacks. The fitted lid keeps contents secure. Hand-woven from sweetgrass.',
    rating: 4.8,
    reviewCount: 56,
    stockStatus: 'in_stock',
    featured: true,
  },
  {
    id: '10',
    name: 'Multi-Color Bowl Basket',
    slug: 'multi-color-bowl-basket',
    price: 75000,
    currency: 'UGX',
    imageUrl: img(10),
    images: [img(10), img(11), img(12)],
    artisanName: 'Akera Komakech',
    artisanId: 'a1',
    region: 'Uganda',
    category: 'Artisan Baskets',
    description: 'A vibrant open bowl basket in warm reds, oranges and natural tones. Great as a bread basket, fruit bowl, or decorative catchall. Approximately 20cm diameter.',
    rating: 4.5,
    reviewCount: 41,
    stockStatus: 'in_stock',
  },
  {
    id: '11',
    name: 'Miniature Decorative Baskets (Set of 3)',
    slug: 'miniature-decorative-baskets-set',
    price: 65000,
    currency: 'UGX',
    imageUrl: img(11),
    images: [img(11), img(10), img(12)],
    artisanName: 'Akera Komakech',
    artisanId: 'a1',
    region: 'Uganda',
    category: 'Artisan Baskets',
    description: 'Set of three miniature coiled baskets in complementary colour palettes. Display on a shelf, use as ring dishes, or gift individually. Each 8-10cm diameter.',
    rating: 4.9,
    reviewCount: 68,
    stockStatus: 'in_stock',
    isNew: true,
  },
  {
    id: '12',
    name: 'Large Market Basket — Natural',
    slug: 'large-market-basket-natural',
    price: 150000,
    originalPrice: 195000,
    currency: 'UGX',
    imageUrl: img(12),
    images: [img(12), img(8), img(9)],
    artisanName: 'Akera Komakech',
    artisanId: 'a1',
    region: 'Uganda',
    category: 'Artisan Baskets',
    description: 'A large open market basket with sturdy handles. Woven from elephant grass in natural undyed tones with subtle pattern accents. Great for shopping, storage, or as a planter cover.',
    rating: 4.6,
    reviewCount: 29,
    stockStatus: 'low_stock',
    stockCount: 5,
  },
  {
    id: '13',
    name: 'Geometric Woven Bowl',
    slug: 'geometric-woven-bowl',
    price: 90000,
    currency: 'UGX',
    imageUrl: img(13),
    images: [img(13), img(14), img(15)],
    artisanName: 'Akera Komakech',
    artisanId: 'a1',
    region: 'Uganda',
    category: 'Artisan Baskets',
    description: 'A medium woven bowl featuring bold geometric patterns in black and natural tones. The wide, shallow shape makes it ideal as a centrepiece or wall art.',
    rating: 4.8,
    reviewCount: 26,
    stockStatus: 'in_stock',
    featured: true,
  },
  {
    id: '14',
    name: 'Rustic Woven Platter',
    slug: 'rustic-woven-platter',
    price: 105000,
    currency: 'UGX',
    imageUrl: img(14),
    images: [img(14), img(13), img(15)],
    artisanName: 'Akera Komakech',
    artisanId: 'a1',
    region: 'Uganda',
    category: 'Artisan Baskets',
    description: 'A rustic flat platter woven from natural palm leaf with a brown and cream pattern. Excellent for cheese boards, serving, or wall display. Approximately 35cm.',
    rating: 4.7,
    reviewCount: 18,
    stockStatus: 'in_stock',
  },
  {
    id: '15',
    name: 'Stacked Nesting Baskets (Set of 4)',
    slug: 'stacked-nesting-baskets-set',
    price: 175000,
    currency: 'UGX',
    imageUrl: img(15),
    images: [img(15), img(13), img(14)],
    artisanName: 'Akera Komakech',
    artisanId: 'a1',
    region: 'Uganda',
    category: 'Artisan Baskets',
    description: 'Four nesting baskets in graduating sizes from 10cm to 25cm. Each features a different colour combination. Stack for storage or display separately.',
    rating: 4.8,
    reviewCount: 17,
    stockStatus: 'out_of_stock',
  },
  {
    id: '16',
    name: 'Wall Art Collection — Warm Palette',
    slug: 'wall-art-collection-warm-palette',
    price: 220000,
    currency: 'UGX',
    imageUrl: img(16),
    images: [img(16), img(17), img(1)],
    artisanName: 'Akera Komakech',
    artisanId: 'a1',
    region: 'Uganda',
    category: 'Heritage Wall Art',
    description: 'A curated collection of four wall plates in warm sunset tones — terracotta, gold, burnt sienna and cream. Arranged together they create a stunning focal wall.',
    rating: 4.9,
    reviewCount: 24,
    stockStatus: 'in_stock',
    featured: true,
  },
  {
    id: '17',
    name: 'Lifestyle Wall Installation',
    slug: 'lifestyle-wall-installation',
    price: 350000,
    currency: 'UGX',
    imageUrl: img(17),
    images: [img(17), img(16), img(1)],
    artisanName: 'Akera Komakech',
    artisanId: 'a1',
    region: 'Uganda',
    category: 'Heritage Wall Art',
    description: 'A complete wall installation set featuring 7 coordinated woven plates in earth tones. Includes a layout guide for creating a professionally styled feature wall. Our signature bestseller.',
    rating: 5.0,
    reviewCount: 12,
    stockStatus: 'low_stock',
    stockCount: 2,
    featured: true,
  },
  {
    id: '18',
    name: 'Teal & Terracotta Plate Pair',
    slug: 'teal-terracotta-plate-pair',
    price: 160000,
    originalPrice: 200000,
    currency: 'UGX',
    imageUrl: img(18),
    images: [img(18), img(16), img(17)],
    artisanName: 'Akera Komakech',
    artisanId: 'a1',
    region: 'Uganda',
    category: 'Heritage Wall Art',
    description: 'A pair of wall plates combining cool teal with warm terracotta. The contrasting colour palette adds depth and visual interest to any wall arrangement.',
    rating: 4.7,
    reviewCount: 35,
    stockStatus: 'in_stock',
  },
  {
    id: '19',
    name: 'Natural Sisal Trivet Set (3)',
    slug: 'natural-sisal-trivet-set',
    price: 55000,
    currency: 'UGX',
    imageUrl: img(19),
    images: [img(19), img(20), img(21)],
    artisanName: 'Akera Komakech',
    artisanId: 'a1',
    region: 'Uganda',
    category: 'Artisan Baskets',
    description: 'Set of three tightly woven sisal trivets in natural tones. Heat-resistant and durable, perfect for protecting your table from hot pots and pans. Food-safe and easy to clean.',
    rating: 4.6,
    reviewCount: 52,
    stockStatus: 'in_stock',
  },
  {
    id: '20',
    name: 'Boho Woven Wall Hanging',
    slug: 'boho-woven-wall-hanging',
    price: 140000,
    currency: 'UGX',
    imageUrl: img(20),
    images: [img(20), img(21), img(22)],
    artisanName: 'Akera Komakech',
    artisanId: 'a1',
    region: 'Uganda',
    category: 'Heritage Wall Art',
    description: 'A large woven wall hanging combining coiled basketry with macramé fringe details. Natural fibres in cream and tan. Brings organic bohemian warmth to any space.',
    rating: 4.8,
    reviewCount: 27,
    stockStatus: 'in_stock',
    isNew: true,
  },
  {
    id: '21',
    name: 'Cowrie Shell Drop Earrings',
    slug: 'cowrie-shell-drop-earrings',
    price: 65000,
    currency: 'UGX',
    imageUrl: img(21),
    images: [img(21), img(22), img(23)],
    artisanName: 'Naserian Meeli',
    artisanId: 'a2',
    region: 'Kenya',
    category: 'Shell & Bead Jewelry',
    description: 'Elegant drop earrings featuring natural cowrie shells on gold-tone wire. Cowrie shells have been used as currency and adornment across Africa for millennia. Hypoallergenic hooks, lightweight for all-day wear.',
    rating: 4.8,
    reviewCount: 44,
    stockStatus: 'in_stock',
    featured: true,
  },
  {
    id: '22',
    name: 'Beaded Cowrie Choker Necklace',
    slug: 'beaded-cowrie-choker-necklace',
    price: 95000,
    originalPrice: 120000,
    currency: 'UGX',
    imageUrl: img(22),
    images: [img(22), img(21), img(23)],
    artisanName: 'Naserian Meeli',
    artisanId: 'a2',
    region: 'Kenya',
    category: 'Shell & Bead Jewelry',
    description: 'A stunning choker necklace combining cowrie shells with hand-beaded Maasai patterns. Adjustable leather tie closure. A perfect blend of traditional and contemporary style.',
    rating: 4.9,
    reviewCount: 36,
    stockStatus: 'in_stock',
    isNew: true,
  },
  {
    id: '23',
    name: 'Layered Shell & Brass Necklace',
    slug: 'layered-shell-brass-necklace',
    price: 130000,
    currency: 'UGX',
    imageUrl: img(23),
    images: [img(23), img(21), img(22)],
    artisanName: 'Naserian Meeli',
    artisanId: 'a2',
    region: 'Kenya',
    category: 'Shell & Bead Jewelry',
    description: 'A multi-layered statement necklace with cowrie shells, hand-hammered brass pendants, and glass seed beads. Three detachable strands that can be worn together or individually.',
    rating: 4.7,
    reviewCount: 21,
    stockStatus: 'low_stock',
    stockCount: 6,
  },
  {
    id: '24',
    name: 'Cowrie & Bead Bracelet Stack (3)',
    slug: 'cowrie-bead-bracelet-stack',
    price: 55000,
    currency: 'UGX',
    imageUrl: img(24),
    images: [img(24), img(25), img(21)],
    artisanName: 'Naserian Meeli',
    artisanId: 'a2',
    region: 'Kenya',
    category: 'Shell & Bead Jewelry',
    description: 'Set of three stretchy bracelets combining cowrie shells with colourful glass seed beads. Layer them together or wear individually. One size fits most.',
    rating: 4.9,
    reviewCount: 68,
    stockStatus: 'in_stock',
  },
  {
    id: '25',
    name: 'Statement Cowrie Collar',
    slug: 'statement-cowrie-collar',
    price: 180000,
    originalPrice: 220000,
    currency: 'UGX',
    imageUrl: img(25),
    images: [img(25), img(24), img(22)],
    artisanName: 'Naserian Meeli',
    artisanId: 'a2',
    region: 'Kenya',
    category: 'Shell & Bead Jewelry',
    description: 'A wide disc-shaped collar necklace densely covered with cowrie shells on a leather base. Inspired by traditional ceremonial pieces. A bold, showstopping accessory.',
    rating: 4.8,
    reviewCount: 14,
    stockStatus: 'in_stock',
    featured: true,
  },
  {
    id: '26',
    name: 'Ankle Shell & Bead Chain',
    slug: 'ankle-shell-bead-chain',
    price: 45000,
    currency: 'UGX',
    imageUrl: img(26),
    images: [img(26), img(24), img(21)],
    artisanName: 'Naserian Meeli',
    artisanId: 'a2',
    region: 'Kenya',
    category: 'Shell & Bead Jewelry',
    description: 'A delicate ankle chain with cowrie shell charms and turquoise seed beads. Adjustable length with a brass lobster clasp. Perfect for summer.',
    rating: 4.5,
    reviewCount: 33,
    stockStatus: 'in_stock',
  },
  {
    id: '27',
    name: 'Ankara Print Head Wrap',
    slug: 'ankara-print-head-wrap',
    price: 50000,
    currency: 'UGX',
    imageUrl: img(27),
    images: [img(27), img(28), img(29)],
    artisanName: 'Amina Kyomuhendo',
    artisanId: 'a3',
    region: 'Uganda',
    category: 'African Fashion',
    description: 'A versatile Ankara wax print head wrap in bold geometric patterns. Pre-shaped for easy tying. Can also be worn as a neck scarf or belt. Machine washable and colour-fast.',
    rating: 4.7,
    reviewCount: 45,
    stockStatus: 'in_stock',
    isNew: true,
  },
  {
    id: '28',
    name: 'Fabric-Wrapped Bangle Set (5)',
    slug: 'fabric-wrapped-bangle-set',
    price: 70000,
    originalPrice: 90000,
    currency: 'UGX',
    imageUrl: img(28),
    images: [img(28), img(27), img(29)],
    artisanName: 'Amina Kyomuhendo',
    artisanId: 'a3',
    region: 'Uganda',
    category: 'African Fashion',
    description: 'Set of five wooden bangles wrapped in vibrant Ankara fabric in coordinated prints. Stack them for a bold statement or mix with metal bangles.',
    rating: 4.6,
    reviewCount: 31,
    stockStatus: 'in_stock',
  },
  {
    id: '29',
    name: 'Ankara Fabric Earrings',
    slug: 'ankara-fabric-earrings',
    price: 35000,
    currency: 'UGX',
    imageUrl: img(29),
    images: [img(29), img(27), img(28)],
    artisanName: 'Amina Kyomuhendo',
    artisanId: 'a3',
    region: 'Uganda',
    category: 'African Fashion',
    description: 'Lightweight disc earrings covered in bright Ankara wax print fabric. Hypoallergenic hooks. Available in multiple print options — each pair is unique.',
    rating: 4.8,
    reviewCount: 57,
    stockStatus: 'in_stock',
  },
  {
    id: '30',
    name: 'Woven Clutch Purse',
    slug: 'woven-clutch-purse',
    price: 110000,
    currency: 'UGX',
    imageUrl: img(30),
    images: [img(30), img(31), img(32)],
    artisanName: 'Akera Komakech',
    artisanId: 'a1',
    region: 'Uganda',
    category: 'Artisan Baskets',
    description: 'A flat woven clutch purse with zip closure and cotton lining. Natural raffia with colourful accent patterns. Fits phone, cards, keys and essentials.',
    rating: 4.7,
    reviewCount: 23,
    stockStatus: 'low_stock',
    stockCount: 7,
  },
  {
    id: '31',
    name: 'African Print Tote Bag',
    slug: 'african-print-tote-bag',
    price: 85000,
    originalPrice: 110000,
    currency: 'UGX',
    imageUrl: img(31),
    images: [img(31), img(30), img(32)],
    artisanName: 'Amina Kyomuhendo',
    artisanId: 'a3',
    region: 'Uganda',
    category: 'African Fashion',
    description: 'A roomy tote bag in bold Ankara print with leather handles. Lined with cotton and featuring an inner zip pocket. Perfect for markets, beach, or everyday use.',
    rating: 4.6,
    reviewCount: 39,
    stockStatus: 'in_stock',
  },
  {
    id: '32',
    name: 'Woven Table Runner',
    slug: 'woven-table-runner',
    price: 95000,
    currency: 'UGX',
    imageUrl: img(32),
    images: [img(32), img(19), img(14)],
    artisanName: 'Akera Komakech',
    artisanId: 'a1',
    region: 'Uganda',
    category: 'Heritage Wall Art',
    description: 'A long woven table runner in natural and brown tones with fringe edges. Adds artisan warmth to dining tables, console tables, or mantles. Approximately 120cm x 30cm.',
    rating: 4.5,
    reviewCount: 16,
    stockStatus: 'in_stock',
  },
  {
    id: '33',
    name: 'Mixed Media Wall Plates (Pair)',
    slug: 'mixed-media-wall-plates-pair',
    price: 195000,
    currency: 'UGX',
    imageUrl: img(33),
    images: [img(33), img(34), img(35)],
    artisanName: 'Akera Komakech',
    artisanId: 'a1',
    region: 'Uganda',
    category: 'Heritage Wall Art',
    description: 'A pair of wall plates combining woven grass with fabric accents and beadwork details. A contemporary take on traditional craft that bridges modern interior design and heritage artistry.',
    rating: 4.8,
    reviewCount: 11,
    stockStatus: 'in_stock',
    isNew: true,
  },
  {
    id: '34',
    name: 'Cowrie Hair Clip Set (4)',
    slug: 'cowrie-hair-clip-set',
    price: 40000,
    currency: 'UGX',
    imageUrl: img(34),
    images: [img(34), img(21), img(26)],
    artisanName: 'Naserian Meeli',
    artisanId: 'a2',
    region: 'Kenya',
    category: 'Shell & Bead Jewelry',
    description: 'Set of four gold-tone hair clips adorned with cowrie shells and seed beads. Perfect for adding an African touch to any hairstyle. Works on all hair types.',
    rating: 4.6,
    reviewCount: 42,
    stockStatus: 'out_of_stock',
  },
  {
    id: '35',
    name: 'Festival Ready Jewelry Box Set',
    slug: 'festival-ready-jewelry-box-set',
    price: 230000,
    originalPrice: 290000,
    currency: 'UGX',
    imageUrl: img(35),
    images: [img(35), img(24), img(25)],
    artisanName: 'Naserian Meeli',
    artisanId: 'a2',
    region: 'Kenya',
    category: 'Shell & Bead Jewelry',
    description: 'A curated gift box containing a cowrie necklace, matching earrings, and two bracelets. Beautifully packaged in a woven gift basket. The perfect present for jewelry lovers.',
    rating: 4.9,
    reviewCount: 8,
    stockStatus: 'low_stock',
    stockCount: 3,
    featured: true,
  },
];

// ---------------------------------------------------------------------------
// Homepage Banners
// ---------------------------------------------------------------------------

export const HOMEPAGE_BANNERS: HomepageBanner[] = [
  {
    id: 'b1',
    imageUrl: img(25),
    title: 'Handcrafted African Elegance',
    subtitle: 'Discover authentic artisan jewelry and wall art',
    ctaLabel: 'Shop Jewelry',
    ctaHref: '/shop?category=Shell+%26+Bead+Jewelry',
  },
  {
    id: 'b2',
    imageUrl: img(17),
    title: 'Transform Your Walls',
    subtitle: 'Heritage woven plates that tell a story',
    ctaLabel: 'Shop Wall Art',
    ctaHref: '/shop?category=Heritage+Wall+Art',
  },
  {
    id: 'b3',
    imageUrl: img(35),
    title: 'Up to 30% Off Select Pieces',
    subtitle: 'Limited time savings on curated collections',
    ctaLabel: 'Shop Sale',
    ctaHref: '/shop?sale=true',
  },
];

// ---------------------------------------------------------------------------
// Deal Zones
// ---------------------------------------------------------------------------

export const DEAL_ZONES: DealZone[] = [
  { id: 'dz1', title: 'New Arrivals', imageUrl: img(22), itemCount: 8, href: '/shop?sort=newest' },
  { id: 'dz2', title: 'Under UGX 100K', imageUrl: img(24), itemCount: 12, href: '/shop?price=under100k' },
  { id: 'dz3', title: 'Artisan Picks', imageUrl: img(9), itemCount: 10, href: '/shop?featured=true' },
  { id: 'dz4', title: 'On Sale', imageUrl: img(3), itemCount: 8, href: '/shop?sale=true' },
];

// ---------------------------------------------------------------------------
// Announcement Messages
// ---------------------------------------------------------------------------

export interface AnnouncementMessage {
  text: string;
  href?: string;
  external?: boolean;
}

export const ANNOUNCEMENT_MESSAGES: AnnouncementMessage[] = [
  { text: 'Free Shipping on Orders Over UGX 300,000' },
  { text: 'New: Cowrie Shell Collection Now Available' },
  { text: 'Pay with Mobile Money — MTN & Airtel Accepted' },
  {
    text: 'Follow us on Instagram, TikTok & X — @craft_continent',
    href: 'https://www.instagram.com/craft_continent',
    external: true,
  },
  { text: 'Learn Our Story — Authentic African Craftsmanship', href: '/about' },
];

// ---------------------------------------------------------------------------
// Cart
// ---------------------------------------------------------------------------

export const INITIAL_CART_ITEMS: CartItem[] = [];

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

export interface Collection {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  itemCount: number;
}

export const COLLECTIONS: Collection[] = [
  {
    id: 'c1',
    title: 'For Your Living Room',
    slug: 'living-room',
    description: 'Statement wall art and baskets that transform any space.',
    imageUrl: img(17),
    itemCount: 12,
  },
  {
    id: 'c2',
    title: 'Wedding Gifts',
    slug: 'wedding-gifts',
    description: 'Thoughtful, handcrafted presents for the couple.',
    imageUrl: img(35),
    itemCount: 8,
  },
  {
    id: 'c3',
    title: 'Under 100K',
    slug: 'under-100k',
    description: 'Beautiful pieces that fit every budget.',
    imageUrl: img(29),
    itemCount: 14,
  },
  {
    id: 'c4',
    title: 'Statement Pieces',
    slug: 'statement-pieces',
    description: 'Bold, eye-catching crafts that start conversations.',
    imageUrl: img(25),
    itemCount: 6,
  },
  {
    id: 'c5',
    title: 'New Arrivals',
    slug: 'new-arrivals',
    description: 'The latest additions to our curated collection.',
    imageUrl: img(22),
    itemCount: 8,
  },
];

// ---------------------------------------------------------------------------
// Mock social proof counts (random-ish for wishlist)
// ---------------------------------------------------------------------------

export const SOCIAL_PROOF_COUNTS: Record<string, number> = {
  '1': 47, '2': 31, '3': 19, '4': 38, '5': 22, '6': 33, '7': 15,
  '8': 42, '9': 56, '10': 41, '11': 68, '12': 29, '13': 26, '14': 18,
  '15': 17, '16': 24, '17': 12, '18': 35, '19': 52, '20': 27, '21': 44,
  '22': 36, '23': 21, '24': 68, '25': 14, '26': 33, '27': 45, '28': 31,
  '29': 57, '30': 23, '31': 39, '32': 16, '33': 11, '34': 42, '35': 8,
};

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
  { label: 'Active Products', value: '35', change: '+11' },
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
  { id: 'u2', name: 'Akera Komakech', email: 'akera@crafts.com', role: 'artisan', joinedDate: '2025-08-20', status: 'active' },
  { id: 'u3', name: 'James Banda', email: 'james@example.com', role: 'customer', joinedDate: '2025-12-01', status: 'active' },
  { id: 'u4', name: 'Naserian Meeli', email: 'naserian@crafts.com', role: 'artisan', joinedDate: '2025-07-10', status: 'active' },
  { id: 'u5', name: 'Admin User', email: 'admin@craftcontinent.com', role: 'admin', joinedDate: '2025-06-01', status: 'active' },
  { id: 'u6', name: 'Olivia Chen', email: 'olivia@example.com', role: 'customer', joinedDate: '2026-01-05', status: 'active' },
  { id: 'u7', name: 'David Okonkwo', email: 'david@example.com', role: 'customer', joinedDate: '2025-09-22', status: 'suspended' },
  { id: 'u8', name: 'Amina Kyomuhendo', email: 'amina@crafts.com', role: 'artisan', joinedDate: '2025-06-15', status: 'active' },
];

export const QC_QUEUE_ITEMS: QcItem[] = [
  { id: 'qc1', productName: 'Handwoven Kente Stole', productImage: img(4), artisanName: 'Amina Kyomuhendo', submittedDate: '2026-03-17', priority: 'urgent', status: 'pending' },
  { id: 'qc2', productName: 'Beaded Anklet Set', productImage: img(26), artisanName: 'Naserian Meeli', submittedDate: '2026-03-16', priority: 'normal', status: 'pending' },
  { id: 'qc3', productName: 'Woven Wall Mirror', productImage: img(20), artisanName: 'Akera Komakech', submittedDate: '2026-03-15', priority: 'normal', status: 'in_review' },
  { id: 'qc4', productName: 'Shell Hairpin Set', productImage: img(34), artisanName: 'Naserian Meeli', submittedDate: '2026-03-15', priority: 'urgent', status: 'pending' },
  { id: 'qc5', productName: 'Raffia Clutch', productImage: img(30), artisanName: 'Akera Komakech', submittedDate: '2026-03-14', priority: 'normal', status: 'pending' },
  { id: 'qc6', productName: 'Ankara Bucket Hat', productImage: img(27), artisanName: 'Amina Kyomuhendo', submittedDate: '2026-03-13', priority: 'normal', status: 'in_review' },
];

export const PAYOUT_REQUESTS: PayoutRequest[] = [
  { id: 'p1', artisanName: 'Akera Komakech', amount: 4850000, status: 'pending', requestedDate: '2026-03-18', processedDate: null },
  { id: 'p2', artisanName: 'Naserian Meeli', amount: 6200000, status: 'processing', requestedDate: '2026-03-16', processedDate: null },
  { id: 'p3', artisanName: 'Amina Kyomuhendo', amount: 3100000, status: 'completed', requestedDate: '2026-03-10', processedDate: '2026-03-12' },
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
  { id: 'ao1', orderNumber: 'CC-2026-0147', customerName: 'Sarah Johnson', date: '2026-03-14', items: [{ productName: 'Earth Tones Coiled Wall Plate', quantity: 2, price: 135000 }, { productName: 'Cowrie Shell Drop Earrings', quantity: 1, price: 65000 }], total: 335000, status: 'delivered' },
  { id: 'ao2', orderNumber: 'CC-2026-0152', customerName: 'James Banda', date: '2026-03-12', items: [{ productName: 'Lifestyle Wall Installation', quantity: 1, price: 350000 }], total: 350000, status: 'shipped' },
  { id: 'ao3', orderNumber: 'CC-2026-0158', customerName: 'Olivia Chen', date: '2026-03-10', items: [{ productName: 'Ankara Print Head Wrap', quantity: 2, price: 50000 }, { productName: 'Cowrie & Bead Bracelet Stack', quantity: 1, price: 55000 }], total: 155000, status: 'shipped' },
  { id: 'ao4', orderNumber: 'CC-2026-0163', customerName: 'David Okonkwo', date: '2026-03-08', items: [{ productName: 'Wall Art Collection — Warm Palette', quantity: 1, price: 220000 }], total: 220000, status: 'processing' },
  { id: 'ao5', orderNumber: 'CC-2026-0171', customerName: 'Maria Santos', date: '2026-03-05', items: [{ productName: 'Festival Ready Jewelry Box Set', quantity: 1, price: 230000 }], total: 230000, status: 'pending' },
];

export const ARTISAN_ANALYTICS: ArtisanAnalytics = {
  totalViews: 12847,
  conversionRate: 3.8,
  repeatCustomers: 24,
  topProducts: [
    { name: 'Earth Tones Coiled Wall Plate', unitsSold: 47, revenue: 6345000 },
    { name: 'Cowrie Shell Drop Earrings', unitsSold: 38, revenue: 2470000 },
    { name: 'Lidded Storage Basket — Medium', unitsSold: 24, revenue: 3000000 },
    { name: 'Cowrie & Bead Bracelet Stack (3)', unitsSold: 68, revenue: 3740000 },
    { name: 'Ankara Print Head Wrap', unitsSold: 52, revenue: 2600000 },
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
