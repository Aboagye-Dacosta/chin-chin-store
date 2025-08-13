export function displayMoney(amount: number, showSymbol = true) {
  const result = new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(amount);

  return showSymbol ? result : result.replace("GH", "");
}
