/**
 * Formats a numeric value into Pakistani Rupee (PKR) representation.
 * Examples:
 *   formatPKR(450) -> "Rs. 450"
 *   formatPKR(2200) -> "Rs. 2,200"
 */
export const formatPKR = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Rs. 0';
  return `Rs. ${Math.round(amount).toLocaleString('en-PK')}`;
};

export const formatPKRDecimal = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Rs. 0.00';
  return `Rs. ${amount.toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
