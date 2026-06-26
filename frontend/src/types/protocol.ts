export type ProtocolCategory =
  | "general"
  | "products"
  | "orders"
  | "shipping"
  | "returns"
  | "escalation"
  | "tone";

export interface Protocol {
  _id: string;
  userId: string;
  title: string;
  rule: string;
  category: ProtocolCategory;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}
