import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Package, ShoppingBag } from "lucide-react";

type Order = {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  delivery_method: string;
  student_name: string;
  student_class: string;
  phone: string;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  is_available: boolean;
};

const Admin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductDialog, setShowProductDialog] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const adminRole = roles?.some((r) => r.role === "admin");
      if (!adminRole) {
        toast.error("Akses ditolak. Anda bukan admin.");
        navigate("/");
        return;
      }

      setIsAdmin(true);
    };

    checkAdmin();
  }, [navigate]);

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
    enabled: isAdmin,
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("category", { ascending: true });

      if (error) throw error;
      return data as Product[];
    },
    enabled: isAdmin,
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "pending" | "processing" | "ready" | "delivering" | "completed" | "cancelled" }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Status pesanan diperbarui");
    },
    onError: () => {
      toast.error("Gagal memperbarui status");
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Produk berhasil dihapus");
    },
    onError: () => {
      toast.error("Gagal menghapus produk");
    },
  });

  const toggleProductAvailability = useMutation({
    mutationFn: async ({ id, is_available }: { id: string; is_available: boolean }) => {
      const { error } = await supabase
        .from("products")
        .update({ is_available })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Status ketersediaan diperbarui");
    },
    onError: () => {
      toast.error("Gagal memperbarui ketersediaan");
    },
  });

  const saveProduct = useMutation({
    mutationFn: async (product: any) => {
      if (product.id) {
        const { error } = await supabase
          .from("products")
          .update(product)
          .eq("id", product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert([product]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success(editingProduct ? "Produk berhasil diperbarui" : "Produk berhasil ditambahkan");
      setShowProductDialog(false);
      setEditingProduct(null);
    },
    onError: () => {
      toast.error("Gagal menyimpan produk");
    },
  });

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pesanan Diterima",
      processing: "Sedang Diproses",
      ready: "Siap Diambil",
      delivering: "Sedang Diantar",
      completed: "Selesai",
      cancelled: "Dibatalkan",
    };
    return labels[status] || status;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      makanan_berat: "Makanan Berat",
      makanan_ringan: "Makanan Ringan",
      minuman: "Minuman",
    };
    return labels[category] || category;
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Memeriksa akses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Admin Dashboard</span>
          </div>
          <Button
            variant="ghost"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/");
            }}
          >
            Keluar
          </Button>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-4xl font-bold mb-8">Dashboard Admin</h1>

          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
              <TabsTrigger value="orders">Pesanan</TabsTrigger>
              <TabsTrigger value="products">Kelola Menu</TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              {ordersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-6 animate-pulse">
                      <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </Card>
                  ))}
                </div>
              ) : orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="p-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {new Date(order.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <p className="font-semibold text-lg mb-1">{order.student_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.student_class} • {order.phone}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.delivery_method === "pickup" ? "Ambil di Koperasi" : "Antar ke Asrama"}
                          </p>
                          <p className="text-xl font-bold text-primary mt-2">
                            Rp {order.total_amount.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <div className="flex flex-col justify-between">
                          <div>
                            <Label className="text-sm text-muted-foreground mb-2 block">
                              Status Pesanan
                            </Label>
                            <Select
                              value={order.status}
                              onValueChange={(value) =>
                                updateOrderStatus.mutate({ id: order.id, status: value as any })
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pesanan Diterima</SelectItem>
                                <SelectItem value="processing">Sedang Diproses</SelectItem>
                                <SelectItem value="ready">Siap Diambil</SelectItem>
                                <SelectItem value="delivering">Sedang Diantar</SelectItem>
                                <SelectItem value="completed">Selesai</SelectItem>
                                <SelectItem value="cancelled">Dibatalkan</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => navigate(`/orders/${order.id}`)}
                          >
                            Lihat Detail
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Belum ada pesanan</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="products">
              <div className="mb-6">
                <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                  <DialogTrigger asChild>
                    <Button className="btn-primary" onClick={() => setEditingProduct(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Menu Baru
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingProduct ? "Edit Menu" : "Tambah Menu Baru"}
                      </DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const product = {
                          id: editingProduct?.id,
                          name: formData.get("name") as string,
                          description: formData.get("description") as string,
                          price: parseFloat(formData.get("price") as string),
                          category: formData.get("category") as string,
                          is_available: formData.get("is_available") === "true",
                        };
                        saveProduct.mutate(product);
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="name">Nama Menu</Label>
                        <Input
                          id="name"
                          name="name"
                          defaultValue={editingProduct?.name}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Deskripsi</Label>
                        <Textarea
                          id="description"
                          name="description"
                          defaultValue={editingProduct?.description || ""}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">Harga</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          defaultValue={editingProduct?.price}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Kategori</Label>
                        <Select
                          name="category"
                          defaultValue={editingProduct?.category || "makanan_berat"}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="makanan_berat">Makanan Berat</SelectItem>
                            <SelectItem value="makanan_ringan">Makanan Ringan</SelectItem>
                            <SelectItem value="minuman">Minuman</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="is_available">Status</Label>
                        <Select
                          name="is_available"
                          defaultValue={editingProduct ? editingProduct.is_available.toString() : "true"}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Tersedia</SelectItem>
                            <SelectItem value="false">Tidak Tersedia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full btn-accent">
                        {editingProduct ? "Simpan Perubahan" : "Tambah Menu"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {productsLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-6 animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </Card>
                  ))}
                </div>
              ) : products && products.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <Card key={product.id} className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant={product.is_available ? "default" : "secondary"}>
                          {product.is_available ? "Tersedia" : "Habis"}
                        </Badge>
                        <Badge variant="outline">{getCategoryLabel(product.category)}</Badge>
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.description || "Tidak ada deskripsi"}
                      </p>
                      <p className="text-xl font-bold text-primary mb-4">
                        Rp {product.price.toLocaleString("id-ID")}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingProduct(product);
                            setShowProductDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            toggleProductAvailability.mutate({
                              id: product.id,
                              is_available: !product.is_available,
                            })
                          }
                        >
                          {product.is_available ? "Tandai Habis" : "Tandai Tersedia"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm("Yakin ingin menghapus menu ini?")) {
                              deleteProduct.mutate(product.id);
                            }
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Belum ada menu</p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;