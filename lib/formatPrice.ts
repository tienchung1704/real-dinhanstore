// Exchange rate VND to USD (approximate)
const VND_TO_USD_RATE = 24500;

export function formatPrice(price: number, locale: string = "vi"): string {
  if (locale === "en") {
    // Convert VND to USD
    const usdPrice = price / VND_TO_USD_RATE;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(usdPrice);
  }

  // Vietnamese format
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

// Simple format without currency symbol
export function formatPriceSimple(price: number, locale: string = "vi"): string {
  if (locale === "en") {
    const usdPrice = price / VND_TO_USD_RATE;
    return `$${usdPrice.toFixed(2)}`;
  }
  return `${price.toLocaleString("vi-VN")}đ`;
}
