import { CATEGORY_COLORS, CATEGORY_LABELS, type Category } from '@/lib/categories';

export function CategoryChip({ category }: { category: Category }) {
  const c = CATEGORY_COLORS[category];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}
