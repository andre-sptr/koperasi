import { useQuery } from "@tanstack/react-query";
import { databases, account, APPWRITE_CONFIG } from "@/lib/appwrite";
import { Query } from "appwrite";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Package, CheckCircle, Truck, XCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

type Order = {
  $id: string;
  $createdAt: string; 
  status: string;
  total_amount: number;
  delivery_method: string;
  student_name: string;
};

const Orders = () => {
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

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      try {
        const user = await account.get();
        
        const response = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.orders,
          [
            Query.equal("user_id", user.$id),
            Query.orderDesc("$createdAt")
          ]
        );

        return response.documents as unknown as Order[];
      } catch (error) {
        return [];
      }
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-5 w-5" />;
      case "processing": return <Package className="h-5 w-5" />;
      case "ready": return <CheckCircle className="h-5 w-5" />;
      case "delivering": return <Truck className="h-5 w-5" />;
      case "completed": return <CheckCircle className="h-5 w-5" />;
      case "cancelled": return <XCircle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
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
      case "pending": return "bg-yellow-500/10 text-yellow-500";
      case "processing": return "bg-blue-500/10 text-blue-500";
      case "ready": return "bg-green-500/10 text-green-500";
      case "delivering": return "bg-purple-500/10 text-purple-500";
      case "completed": return "bg-green-600/10 text-green-600";
      case "cancelled": return "bg-red-500/10 text-red-500";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg">Koperasi MAN IC Siak</Link>
          <div className="flex items-center gap-4">
            <Link to="/menu"><Button variant="ghost">Menu</Button></Link>
            <Button variant="ghost" onClick={async () => { await account.deleteSession("current"); navigate("/"); }}>Keluar</Button>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Pesanan Saya</h1>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Card key={i} className="p-6 animate-pulse h-24" />)}
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link key={order.$id} to={`/orders/${order.$id}`}>
                  <Card className="p-6 card-hover cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {new Date(order.$createdAt).toLocaleDateString("id-ID")}
                        </p>
                        <p className="font-semibold">{order.student_name}</p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {getStatusLabel(order.status)}
                        </span>
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {order.delivery_method === "pickup" ? "Ambil di Koperasi" : "Antar ke Asrama"}
                      </p>
                      <p className="text-xl font-bold text-primary">
                        Rp {order.total_amount.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Belum Ada Pesanan</h3>
              <Link to="/menu"><Button className="btn-primary">Lihat Menu</Button></Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;