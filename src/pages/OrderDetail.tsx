import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { databases, account, APPWRITE_CONFIG } from "@/lib/appwrite";
import { Query } from "appwrite";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, Package, CheckCircle, Truck, XCircle } from "lucide-react";
import { useEffect } from "react";

type OrderDetail = {
  $id: string;
  $createdAt: string;
  status: string;
  total_amount: number;
  delivery_method: string;
  delivery_address: string | null;
  delivery_time: string | null;
  student_name: string;
  student_dorm: string;
  room_number: string;
  phone: string;
  notes: string | null;
};

type OrderItem = {
  $id: string;
  product_name: string;
  quantity: number;
  price: number;
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await account.get();
      } catch {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      if (!id) throw new Error("No ID");
      
      const response = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.orders,
        id
      );

      return response as unknown as OrderDetail;
    },
  });

  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ["order-items", id],
    queryFn: async () => {
      if (!id) return [];

      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.orderItems,
        [
          Query.equal("order_id", id)
        ]
      );

      return response.documents as unknown as OrderItem[];
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-6 w-6" />;
      case "processing": return <Package className="h-6 w-6" />;
      case "ready": return <CheckCircle className="h-6 w-6" />;
      case "delivering": return <Truck className="h-6 w-6" />;
      case "completed": return <CheckCircle className="h-6 w-6" />;
      case "cancelled": return <XCircle className="h-6 w-6" />;
      default: return <Clock className="h-6 w-6" />;
    }
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "processing": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "ready": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "delivering": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "completed": return "bg-green-600/10 text-green-600 border-green-600/20";
      case "cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const isLoading = orderLoading || itemsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Memuat detail pesanan...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Pesanan tidak ditemukan</p>
          <Link to="/orders">
            <Button>Kembali</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg">Koperasi MAN IC Siak</Link>
          <Link to="/orders">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold mb-8">Detail Pesanan</h1>

          {/* Status */}
          <Card className={`p-8 mb-6 border-2 ${getStatusColor(order.status)}`}>
            <div className="flex items-center gap-4">
              {getStatusIcon(order.status)}
              <div>
                <h2 className="text-2xl font-bold mb-1">{getStatusLabel(order.status)}</h2>
                <p className="text-sm opacity-75">
                  {new Date(order.$createdAt).toLocaleDateString("id-ID", {
                    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </Card>

          {/* Order Items */}
          <Card className="p-6 mb-6">
            <h3 className="font-semibold text-lg mb-4">Item Pesanan</h3>
            <div className="space-y-3">
              {items?.map((item) => (
                <div key={item.$id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x Rp {item.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <p className="font-semibold">
                    Rp {(item.quantity * item.price).toLocaleString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-4 pt-4 flex justify-between items-center">
              <span className="font-semibold text-lg">Total</span>
              <span className="text-2xl font-bold text-primary">
                Rp {order.total_amount.toLocaleString("id-ID")}
              </span>
            </div>
          </Card>

          {/* Delivery Info */}
          <Card className="p-6 mb-6">
            <h3 className="font-semibold text-lg mb-4">Informasi Pengiriman</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nama</span>
                <span className="font-medium">{order.student_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Asrama</span>
                <span className="font-medium">{order.student_dorm}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kamar</span>
                <span className="font-medium">{order.room_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">HP/WA</span>
                <span className="font-medium">{order.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Metode</span>
                <span className="font-medium">
                  {order.delivery_method === "pickup" ? "Ambil di Koperasi" : "Antar ke Asrama"}
                </span>
              </div>
              {order.delivery_address && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Alamat</span>
                  <span className="font-medium">{order.delivery_address}</span>
                </div>
              )}
              {order.delivery_time && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Waktu</span>
                  <span className="font-medium">{order.delivery_time}</span>
                </div>
              )}
              {order.notes && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Catatan</span>
                  <span className="font-medium">{order.notes}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Payment Info */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-2">Metode Pembayaran</h3>
            <p className="text-muted-foreground">
              {order.delivery_method === "pickup" ? "Bayar di Koperasi saat mengambil pesanan" : "Bayar saat pesanan diantar"}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;