import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { databases, account, APPWRITE_CONFIG } from "@/lib/appwrite"; 
import { ID } from "appwrite";
import { toast } from "sonner";

const DORMS = [
  "Abu Bakar",
  "Usman",
  "Umar",
  "Khodijah",
  "Fatimah",
  "Aisyah"
] as const;

const checkoutSchema = z.object({
  studentName: z.string().min(1, "Nama harus diisi"),
  studentDorm: z.enum(DORMS, {
    required_error: "Silakan pilih asrama",
  }),
  roomNumber: z.string().min(1, "Nomor kamar harus diisi"),
  phone: z.string().min(10, "Nomor HP minimal 10 digit"),
  deliveryMethod: z.enum(["pickup", "delivery"]),
  deliveryAddress: z.string().optional(),
  deliveryTime: z.string().optional(),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryMethod: "pickup",
    },
  });

  const deliveryMethod = watch("deliveryMethod");

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      if (parsedCart.length === 0) {
        toast.error("Keranjang kosong");
        navigate("/menu");
      }
      setCart(parsedCart);
    } else {
      navigate("/menu");
    }
  }, [navigate]);

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const onSubmit = async (data: CheckoutForm) => {
    setLoading(true);
    try {
      const user = await account.get();
      
      if (!user) {
        toast.error("Anda harus login terlebih dahulu");
        navigate("/auth");
        return;
      }

      const order = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.orders,
        ID.unique(),
        {
          user_id: user.$id,
          student_name: data.studentName,
          student_dorm: data.studentDorm, 
          room_number: data.roomNumber,
          phone: data.phone,
          delivery_method: data.deliveryMethod,
          delivery_address: data.deliveryAddress || null,
          delivery_time: data.deliveryTime || null,
          status: "pending",
          total_amount: totalPrice,
          notes: data.notes || null,
          created_at: new Date().toISOString(),
        }
      );

      const promises = cart.map((item) => 
        databases.createDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.orderItems,
          ID.unique(),
          {
            order_id: order.$id,
            product_id: item.id,
            quantity: item.quantity,
            price: item.price,
            product_name: item.name,
          }
        )
      );

      await Promise.all(promises);

      localStorage.removeItem("cart");
      
      toast.success("Pesanan berhasil dibuat!");
      navigate(`/orders/${order.$id}`);
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Gagal membuat pesanan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg">
            Koperasi MAN IC Siak
          </Link>
          <Link to="/cart">
            <Button variant="ghost">Kembali</Button>
          </Link>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Checkout</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Data Siswa</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="studentName">Nama Lengkap</Label>
                  <Input
                    id="studentName"
                    {...register("studentName")}
                    placeholder="Nama lengkap kamu"
                  />
                  {errors.studentName && (
                    <p className="text-sm text-destructive mt-1">{errors.studentName.message}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="studentDorm">Asrama</Label>
                    <Select 
                      onValueChange={(value) => {
                        setValue("studentDorm", value as any);
                        trigger("studentDorm");
                      }}
                    >
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Pilih Asrama" />
                      </SelectTrigger>
                      <SelectContent>
                        {DORMS.map((dorm) => (
                          <SelectItem key={dorm} value={dorm}>
                            Asrama {dorm}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.studentDorm && (
                      <p className="text-sm text-destructive mt-1">{errors.studentDorm.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="roomNumber">Nomor Kamar</Label>
                    <Input
                      id="roomNumber"
                      {...register("roomNumber")}
                      placeholder="Contoh: 101"
                      className="mt-1"
                    />
                    {errors.roomNumber && (
                      <p className="text-sm text-destructive mt-1">{errors.roomNumber.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Nomor HP / WhatsApp</Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="08123456789"
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Metode Pengambilan</h2>
              <RadioGroup
                defaultValue="pickup"
                onValueChange={(value) => register("deliveryMethod").onChange({ target: { value } })}
              >
                <div className="flex items-center space-x-2 p-4 rounded-lg border border-border cursor-pointer hover:bg-secondary/50">
                  <RadioGroupItem value="pickup" id="pickup" />
                  <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                    <div className="font-semibold">Ambil di Koperasi</div>
                    <div className="text-sm text-muted-foreground">
                      Kamu akan mengambil pesanan langsung di koperasi
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 rounded-lg border border-border cursor-pointer hover:bg-secondary/50">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                    <div className="font-semibold">Antar ke Asrama</div>
                    <div className="text-sm text-muted-foreground">
                      Pesanan akan diantar langsung ke kamar asrama
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {deliveryMethod === "delivery" && (
                <div className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="deliveryAddress">Detail Lokasi (Gedung/Lantai)</Label>
                    <Input
                      id="deliveryAddress"
                      {...register("deliveryAddress")}
                      placeholder="Contoh: Lantai 2, dekat tangga"
                    />
                  </div>
                </div>
              )}

              <div className="mt-4">
                <Label htmlFor="deliveryTime">Waktu Pengambilan/Pengantaran</Label>
                <Input
                  id="deliveryTime"
                  {...register("deliveryTime")}
                  placeholder="Contoh: Jam istirahat siang"
                />
              </div>

              <div className="mt-4">
                <Label htmlFor="notes">Catatan (Opsional)</Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  placeholder="Tambahkan catatan untuk pesanan..."
                  rows={3}
                />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card">
              <h2 className="text-xl font-semibold mb-4">Ringkasan Pesanan</h2>
              <div className="space-y-2 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span>Rp {(item.price * item.quantity).toLocaleString("id-ID")}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">
                  Rp {totalPrice.toLocaleString("id-ID")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Metode Pembayaran: {deliveryMethod === "pickup" ? "Bayar di Koperasi" : "Bayar saat Diantar"}
              </p>
              <Button type="submit" className="w-full btn-accent text-lg" disabled={loading}>
                {loading ? "Memproses..." : "Buat Pesanan"}
              </Button>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;