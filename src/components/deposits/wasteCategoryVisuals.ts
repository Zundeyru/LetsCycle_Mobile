import type MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import type { WasteCategoryId } from '@/shared/wasteCategories';

/** Ikon dan warna tiap kategori sampah (dipakai Home dan halaman Setoran). */
export const wasteCategoryVisuals: Record<
  WasteCategoryId,
  { icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string; tint: string }
> = {
  paper: { icon: 'newspaper-variant-outline', color: '#A96F45', tint: '#F6E9DB' },
  plastic: { icon: 'bottle-soda-outline', color: '#328D91', tint: '#E0F0EC' },
  metal: { icon: 'archive-outline', color: '#C56E55', tint: '#F8E8E1' },
  electronic: { icon: 'laptop', color: '#526A85', tint: '#E7ECF3' },
};
