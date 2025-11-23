import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingBag, Clock, MapPin, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
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
            <Link to="/orders">
              <Button variant="ghost">Pesanan Saya</Button>
            </Link>
            <Link to="/auth">
              <Button className="btn-primary">Masuk</Button>
            </Link>
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
            <Link to="/auth">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Pesan Sekarang
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
                Login dan pilih makanan atau minuman favoritmu dari katalog menu yang tersedia
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

      {/* CTA Section */}
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

      {/* Footer */}
      <footer className="py-12 px-4 bg-secondary/30 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Koperasi MAN IC Siak</h3>
              <p className="text-sm text-muted-foreground">
                Koperasi online khusus siswa MAN IC Siak untuk kemudahan pemesanan makanan dan minuman.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Kontak</h3>
              <p className="text-sm text-muted-foreground mb-2">
                MAN Insan Cendekia Siak<br />
                Kabupaten Siak, Riau
              </p>
              <p className="text-sm text-muted-foreground">
                WhatsApp: 0812-3456-7890
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Jam Operasional</h3>
              <p className="text-sm text-muted-foreground">
                Senin - Jumat: 07.00 - 20.00<br />
                Sabtu - Minggu: 08.00 - 18.00
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2024 Koperasi Bangkit Insan Cendekia. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;