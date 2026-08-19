export const PRINT_PER_PAGE = { BW: 5, COLOR: 20 } as const;
export const BINDING_PRICE = { NONE: 0, SPIRAL: 100, STAPLE: 20 } as const;
export function printTotal(pages: number, color: keyof typeof PRINT_PER_PAGE, binding: keyof typeof BINDING_PRICE) {
  return pages * PRINT_PER_PAGE[color] + BINDING_PRICE[binding];
}
