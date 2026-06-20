"use client";

import { useState, useEffect, useCallback } from "react";
import type { Product } from "@/types/product";
import { productService } from "@/services/product.service";
import { CsvImport } from "@/components/products/csv-import";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      const data = await productService.list();
      setProducts(data.products);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filtered = search
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <p className="text-sm text-muted-foreground">
          Manage your product catalog
        </p>
      </div>

      <CsvImport onImported={fetchProducts} />

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Catalog ({total})</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Package className="size-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                {search ? "No products match your search" : "No products yet — import a CSV above"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">SKU</th>
                    <th className="pb-2 font-medium">Price</th>
                    <th className="pb-2 font-medium">Stock</th>
                    <th className="pb-2 font-medium">Category</th>
                    <th className="pb-2 font-medium">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p._id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-2.5 pr-4 font-medium">{p.name}</td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {p.sku || <span className="italic text-xs">—</span>}
                      </td>
                      <td className="py-2.5 pr-4">₹{p.price}</td>
                      <td className="py-2.5 pr-4">
                        <Badge variant={p.stock > 0 ? "default" : "destructive"} className="text-xs">
                          {p.stock}
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className="text-xs bg-muted rounded-full px-2 py-0.5">{p.category}</span>
                      </td>
                      <td className="py-2.5 text-muted-foreground">{p.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
