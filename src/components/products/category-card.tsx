interface CategoryCardProps {
  name: string;
  slug: string;
  imageUrl: string;
  itemCount: number;
}

/**
 * Category card with image, gradient overlay, name and item count.
 */
export function CategoryCard({ name, slug, imageUrl, itemCount }: CategoryCardProps) {
  return (
    <a
      href={`/shop?category=${slug}`}
      className="group relative block aspect-[4/3] overflow-hidden rounded-xl"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={name}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-4 left-4">
        <h3 className="text-lg font-bold text-white">{name}</h3>
        <p className="text-sm text-white/80">{itemCount} items</p>
      </div>
    </a>
  );
}
