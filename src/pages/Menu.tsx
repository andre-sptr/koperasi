import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { databases, APPWRITE_CONFIG } from "@/lib/appwrite";
import { Query } from "appwrite";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
};

type CartItem = Product & { quantity: number };

const Menu = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.products,
        [
          Query.equal("is_available", true),
          Query.orderAsc("category")
        ]
      );

      return response.documents.map((doc) => ({
        id: doc.$id,
        name: doc.name,
        description: doc.description,
        price: doc.price,
        category: doc.category,
        image_url: doc.image_url,
        is_available: doc.is_available,
      })) as Product[];
    },
  });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} ditambahkan ke keranjang`);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      makanan_berat: "Makanan Berat",
      makanan_ringan: "Makanan Ringan",
      minuman: "Minuman",
    };
    return labels[category] || category;
  };

  const categories = ["makanan_berat", "makanan_ringan", "minuman"];

  const goToCart = () => {
    if (cart.length === 0) {
      toast.error("Keranjang masih kosong");
      return;
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    navigate("/cart");
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg">
            Koperasi MAN IC Siak
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/orders">
              <Button variant="ghost">Pesanan Saya</Button>
            </Link>
            <Button
              onClick={goToCart}
              className="relative btn-primary"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Menu Koperasi</h1>
            <p className="text-muted-foreground">
              Pilih makanan dan minuman favoritmu
            </p>
          </div>

          {/* Cart Summary */}
          {totalItems > 0 && (
            <Card className="p-6 mb-8 bg-gradient-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Keranjang</p>
                  <p className="text-2xl font-bold text-primary">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </p>
                  <p className="text-sm text-muted-foreground">{totalItems} item</p>
                </div>
                <Button onClick={goToCart} className="btn-accent">
                  Lihat Keranjang
                </Button>
              </div>
            </Card>
          )}

          {/* Products */}
          <Tabs defaultValue="makanan_berat" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              {categories.map((cat) => (
                <TabsTrigger key={cat} value={cat}>
                  {getCategoryLabel(cat)}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category} value={category}>
                {isLoading ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="p-6 animate-pulse">
                        <div className="h-48 bg-muted rounded-lg mb-4" />
                        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products
                      ?.filter((p) => p.category === category)
                      .map((product) => {
                        const inCart = cart.find((item) => item.id === product.id);
                        return (
                          <Card key={product.id} className="overflow-hidden card-hover">
                            <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ShoppingCart className="h-16 w-16 text-primary/30" />
                              )}
                            </div>
                            <div className="p-6">
                              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                {product.description || "Tidak ada deskripsi"}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-primary">
                                  Rp {product.price.toLocaleString("id-ID")}
                                </span>
                                {inCart ? (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateQuantity(product.id, -1)}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-8 text-center font-semibold">
                                      {inCart.quantity}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateQuantity(product.id, 1)}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => addToCart(product)}
                                    className="btn-primary"
                                  >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Tambah
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Menu;