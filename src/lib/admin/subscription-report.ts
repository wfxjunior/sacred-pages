export type Subscriber = {
  id: string;
  customerId: string;
  name: string | null;
  email: string | null;
  status: string;
  amount: number;
  currency: string;
  interval: string;
  renewsAt: number | null;
  cancelling: boolean;
  paid: boolean;
};

export function payingPeople(subscribers: Subscriber[]): number {
  return new Set(subscribers.filter((s) => s.status === "active" && s.paid && s.amount > 0).map((s) => s.customerId)).size;
}

export function assertBillingAdmin(isAdmin: boolean): void {
  if (!isAdmin) throw new Error("Forbidden: administrator access required");
}

export function isLumenaPrice(lookupKey: string | null, productId: string, productIds: Set<string>): boolean {
  return lookupKey === "premium-monthly" || lookupKey === "premium-yearly" || productIds.has(productId);
}