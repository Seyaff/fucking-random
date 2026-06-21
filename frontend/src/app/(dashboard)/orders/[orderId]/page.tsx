"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useOrder } from "@/hooks/use-orders";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, ShoppingCart } from "lucide-react";
import type { OrderStatus } from "@/types/order";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading } = useOrder(orderId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShoppingCart className="size-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Order not found</p>
        <Link href="/orders" className="text-sm text-primary hover:underline mt-2">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/orders" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{order.orderId}</h1>
          <p className="text-sm text-muted-foreground">Order details</p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Status</h2>
          <Badge className={`text-xs ${STATUS_COLORS[order.status] || ""}`} variant="outline">
            {order.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Customer</span>
            <p className="font-medium">{order.customerName}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Phone</span>
            <p className="font-medium">{order.customerPhone}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Created</span>
            <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Total</span>
            <p className="font-medium text-lg">${order.totalAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="bg-muted/50 px-4 py-2 text-sm font-medium">Items</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b">
              <th className="py-2 px-4 font-medium">Product</th>
              <th className="py-2 px-4 font-medium">Qty</th>
              <th className="py-2 px-4 font-medium">Unit Price</th>
              <th className="py-2 px-4 font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {order.items.map((item, i) => (
              <tr key={i}>
                <td className="py-2 px-4">{item.productName}</td>
                <td className="py-2 px-4">x{item.quantity}</td>
                <td className="py-2 px-4">${item.unitPrice.toFixed(2)}</td>
                <td className="py-2 px-4 font-medium">${item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-medium border-t">
              <td colSpan={3} className="py-2 px-4 text-right">Total</td>
              <td className="py-2 px-4">${order.totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {order.notes && (
        <div className="rounded-lg border p-4">
          <h2 className="text-sm font-medium mb-1">Notes</h2>
          <p className="text-sm text-muted-foreground">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
