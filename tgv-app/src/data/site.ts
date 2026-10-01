export const categories = [
  ["🐄", "Cattle"], ["🥛", "Dairy"], ["🐟", "Fisheries"], ["🐓", "Poultry"], ["🐐", "Goat"],
  ["🐇", "Rabbit"], ["🦚", "Peacock"], ["🌳", "Fruit Orchard"], ["🌾", "Green Fields"], ["🏡", "Agro-Tourism"],
] as const;

export type Opportunity = { tag: string; title: string; text: string; cycle: string; amount: string };

export const opportunities: Opportunity[] = [
  { tag: "CATEGORY BASED", title: "Cattle Farming", text: "Review the operating model, cycle, assumptions, risks and supporting documents.", cycle: "Cycle: To verify", amount: "From: To verify" },
  { tag: "PRODUCTION CYCLE", title: "Fisheries", text: "A structured view of pond operations, production cycle, cost assumptions and reporting.", cycle: "Cycle: To verify", amount: "From: To verify" },
  { tag: "LONG-TERM", title: "Dairy", text: "Understand the operating model, expected reporting structure and material risks.", cycle: "Cycle: To verify", amount: "From: To verify" },
  { tag: "PRODUCTION CYCLE", title: "Poultry", text: "Planned category placeholder. Publish only after the investment structure is approved.", cycle: "Cycle: To verify", amount: "From: To verify" },
  { tag: "CATEGORY BASED", title: "Goat Farming", text: "Planned category placeholder. Add approved terms and verified operating assumptions.", cycle: "Cycle: To verify", amount: "From: To verify" },
  { tag: "PROJECT BASED", title: "Agro-Tourism", text: "Future opportunity placeholder. Keep unavailable until the structure is formally approved.", cycle: "Status: Future", amount: "Terms: To verify" },
];

export const interestOptions = ["Cattle", "Fisheries", "Dairy", "Poultry", "Goat", "Agro-Tourism", "Other"];
