/** Kategori sampah yang diterima LetsCycle. Satu sumber untuk Home, form setoran, dan server. */
export const WasteCategories = [
  { id: 'paper', name: 'Kertas & kardus', pricePerKg: 1200 },
  { id: 'plastic', name: 'Plastik', pricePerKg: 2500 },
  { id: 'metal', name: 'Logam & kaleng', pricePerKg: 4200 },
  // Harga elektronik bergantung kondisi barang, jadi tidak ada estimasi otomatis.
  { id: 'electronic', name: 'Elektronik', pricePerKg: null },
] as const;

export type WasteCategoryId = (typeof WasteCategories)[number]['id'];

export function findWasteCategory(id: string) {
  return WasteCategories.find((category) => category.id === id);
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}
