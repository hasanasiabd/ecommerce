// FILE: src/lib/product-images.ts

export const PRODUCT_IMAGE_FALLBACK =
  "/logo.svg";

export function parseProductImages(
  value?: string | null
): string[] {
  if (!value) {
    return [
      PRODUCT_IMAGE_FALLBACK,
    ];
  }

  try {
    const parsed =
      JSON.parse(value);

    if (Array.isArray(parsed)) {
      const validImages =
        parsed.filter(
          (item): item is string =>
            typeof item === "string" &&
            item.trim().length > 0
        );

      if (
        validImages.length > 0
      ) {
        return validImages;
      }

      return [
        PRODUCT_IMAGE_FALLBACK,
      ];
    }
  } catch {
    // The database may contain a
    // single URL instead of JSON.
  }

  const singleImage =
    value.trim();

  if (singleImage) {
    return [singleImage];
  }

  return [
    PRODUCT_IMAGE_FALLBACK,
  ];
}

export function getFirstProductImage(
  value?: string | null
): string {
  return parseProductImages(value)[0];
}

export function isValidProductImage(
  value?: string | null
): boolean {
  return Boolean(
    value &&
      value.trim().length > 0
  );
}