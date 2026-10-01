export const bdt = (n: number | string | null | undefined) => "৳" + Number(n ?? 0).toLocaleString("en-IN");
export const dateOnly = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Dhaka" }) : "—";
export const dateTime = (d?: string | null) =>
  d ? new Date(d).toLocaleString("en-GB", { timeZone: "Asia/Dhaka" }) : "—";
