"use client";

import { useState } from "react";
import Link from "next/link";
import { useOrders } from "@/hooks/use-orders";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, ShoppingCart, ArrowRight } from "lucide-react";
import type { OrderStatus } from "@/types/order";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useOrders(page);

  const filtered = data?.orders.filter(
    (o) =>
      o.orderId.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">View and manage all customer orders</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by order ID, customer name, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : !filtered || filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingCart className="size-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No orders yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Orders will appear here once customers place them</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="text-left text-sm text-muted-foreground">
                <th className="py-3 px-4 font-medium">Order ID</th>
                <th className="py-3 px-4 font-medium">Customer</th>
                <th className="py-3 px-4 font-medium">Items</th>
                <th className="py-3 px-4 font-medium">Total</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((order) => (
                <tr key={order._id} className="text-sm hover:bg-muted/30">
                  <td className="py-3 px-4 font-mono text-xs">{order.orderId}</td>
                  <td className="py-3 px-4">
                    <div>{order.customerName}</div>
                    <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                  </td>
                  <td className="py-3 px-4">
                    {order.items.map((i) => (
                      <div key={i.productId} className="text-xs">
                        {i.productName} x{i.quantity}
                      </div>
                    ))}
                  </td>
                  <td className="py-3 px-4 font-medium">${order.totalAmount.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <Badge className={`text-xs ${STATUS_COLORS[order.status] || ""}`} variant="outline">
                      {order.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/orders/${order.orderId}`}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      View <ArrowRight className="size-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
              <span>
                Page {page} of {data.totalPages} ({data.total} total)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 rounded border text-xs disabled:opacity-40 hover:bg-muted"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= data.totalPages}
                  className="px-3 py-1 rounded border text-xs disabled:opacity-40 hover:bg-muted"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
