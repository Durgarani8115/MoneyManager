/**
 * Helper to generate standard UPI Deep Link URL
 * Format: upi://pay?pa=<upi_id>&pn=<name>&am=<amount>&cu=INR&tn=<note>
 */
export function buildUpiLink({ upiId, name, amount, note }) {
  if (!upiId) return "";
  const numAmount = typeof amount === "number" ? amount : parseFloat(amount || 0);
  const params = new URLSearchParams({
    pa: upiId.trim(),
    pn: name ? name.trim() : "Participant",
    am: numAmount.toFixed(2),
    cu: "INR",
    tn: note ? note.trim() : "Trip expense split",
  });
  return `upi://pay?${params.toString()}`;
}

export function isMobileDevice() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}
