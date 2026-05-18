export const FormatAmount = (amount: number) => {
  if (amount >= 1000 && amount < 10000) {
    return (
      (amount / 1000).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + "K"
    );
  } else if (amount >= 10000 && amount < 1000000) {
    return (
      (amount / 1000).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }) + "K"
    );
  } else if (amount >= 1000000 && amount < 10000000) {
    return (
      (amount / 1000000).toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }) + "M"
    );
  } else if (amount >= 10000000) {
    return (
      (amount / 1000000).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }) + "M"
    );
  } else {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
};
