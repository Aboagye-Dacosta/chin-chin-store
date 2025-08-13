export const getFormattedTime = (
  date: string,
  options?: Intl.DateTimeFormatOptions,
) => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    ...options,
  });
};
