import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingBag, Clock, MapPin, CheckCircle, ArrowRight, LogOut, User, Phone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { account } from "@/lib/appwrite";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const session = await account.get();
        setUser(session);
      } catch (error) {
        console.log("User belum login");
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      toast.success("Berhasil keluar");
      navigate("/"); 
    } catch (error) {
      toast.error("Gagal keluar");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Koperasi MAN IC Siak</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/menu">
              <Button variant="ghost">Menu</Button>
            </Link>
            
            {/* 3. Logika Tampilan Berdasarkan User */}
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    <Link to="/orders">
                      <Button variant="ghost">Pesanan Saya</Button>
                    </Link>
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full">
                      <User className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium truncate max-w-[100px]">
                        {user.name}
                      </span>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      onClick={handleLogout}
                      title="Keluar"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Link to="/auth">
                    <Button className="btn-primary">Masuk</Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-block mb-4 px-4 py-2 bg-secondary rounded-full">
            <span className="text-sm font-medium text-primary">Khusus Siswa MAN IC Siak</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Koperasi Online MAN IC Siak
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Pesan makanan & minuman dari asrama, ambil di koperasi atau diantar ke kamarmu.
            Cepat, praktis, dan hemat waktu.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/menu">
              <Button size="lg" className="btn-accent text-lg px-8">
                Lihat Menu
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            {/* Tombol Pesan Sekarang hanya muncul jika belum login, atau diarahkan ke menu jika sudah login */}
            <Link to={user ? "/menu" : "/auth"}>
              <Button size="lg" variant="outline" className="text-lg px-8">
                {user ? "Pesan Sekarang" : "Daftar / Masuk"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Cara Pesan di Koperasi Online
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center card-hover">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">1. Pilih Menu</h3>
              <p className="text-muted-foreground">
                Login dan pilih makanan atau minuman dari katalog menu
              </p>
            </Card>

            <Card className="p-8 text-center card-hover">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">2. Pilih Pengambilan</h3>
              <p className="text-muted-foreground">
                Pilih mau ambil sendiri di koperasi atau minta diantar ke asrama
              </p>
            </Card>

            <Card className="p-8 text-center card-hover">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">3. Tunggu Notifikasi</h3>
              <p className="text-muted-foreground">
                Tunggu pesanan diproses dan siap diambil atau diantar ke kamarmu
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Kenapa Pesan di Koperasi Online?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Clock, title: "Cepat & Praktis", desc: "Pesan dari kamar, hemat waktu" },
              { icon: CheckCircle, title: "Khusus Siswa", desc: "Hanya untuk siswa MAN IC Siak" },
              { icon: MapPin, title: "Antar ke Asrama", desc: "Bisa diantar langsung ke kamar" },
              { icon: ShoppingBag, title: "Harga Terjangkau", desc: "Harga ramah kantong pelajar" },
            ].map((feature, idx) => (
              <Card key={idx} className="p-6 card-hover">
                <feature.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section (Hanya tampil jika belum login) */}
      {!user && (
        <section className="py-20 px-4 gradient-hero">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Mulai Pesan Sekarang!
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Daftar sekarang dan nikmati kemudahan pesan makanan & minuman dari asrama
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Daftar Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-secondary/30 border-t border-border pt-16 pb-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            
            {/* Kolom 1: Tentang */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-6 w-6 text-primary" />
                <h3 className="font-bold text-xl">Koperasi MAN IC Siak</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Platform koperasi online resmi untuk siswa MAN Insan Cendekia Siak. 
                Nikmati kemudahan pemesanan kebutuhan harian langsung dari asrama.
              </p>
            </div>

            {/* Kolom 2: Kontak */}
            <div>
              <h3 className="font-bold text-lg mb-6">Hubungi Kami</h3>
              <ul className="space-y-4">
                <li>
                  <a 
                    href="https://wa.me/628123456789"
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <div className="h-8 w-8 rounded-full bg-background border border-border flex items-center justify-center group-hover:border-primary transition-colors">
                      <Phone className="h-4 w-4" />
                    </div>
                    <span>WhatsApp Admin</span>
                  </a>
                </li>
                <li>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="h-8 w-8 rounded-full bg-background border border-border flex items-center justify-center">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <span>Kampus MAN IC Siak</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Kolom 3: Jam Operasional */}
            <div>
              <h3 className="font-bold text-lg mb-6">Jam Operasional</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex justify-between items-center border-b border-border/50 pb-2 border-dashed">
                  <span>Senin - Jumat</span>
                  <span className="font-medium text-foreground">07.00 - 20.00</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/50 pb-2 border-dashed">
                  <span>Sabtu - Minggu</span>
                  <span className="font-medium text-foreground">08.00 - 18.00</span>
                </div>
              </div>
            </div>

          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} <span className="font-semibold text-primary">Koperasi Bangkit Insan Cendekia</span>.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;