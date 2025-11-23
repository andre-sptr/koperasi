import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { account, databases, APPWRITE_CONFIG } from "@/lib/appwrite";
import { ID, Permission, Role, Query } from "appwrite";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 8 karakter"),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().min(1, "Nama harus diisi"),
  phone: z.string().min(10, "Nomor HP minimal 10 digit"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await account.get();
        
        if (user) {
          const adminCheck = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.userRoles,
            [
              Query.equal("user_id", user.$id),
              Query.equal("role", "admin")
            ]
          );

          if (adminCheck.total > 0) {
            navigate("/admin");
          } else {
            navigate("/menu");
          }
        }
      } catch (error) {
      }
    };
    checkUser();
  }, [navigate]);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onLogin = async (data: any) => {
    setLoading(true);
    try {
      await account.createEmailPasswordSession(data.email, data.password);

      const user = await account.get();
      const adminCheck = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.userRoles,
        [
          Query.equal("user_id", user.$id),
          Query.equal("role", "admin")
        ]
      );
      
      toast.success("Login berhasil!");

      if (adminCheck.total > 0) {
        navigate("/admin");
      } else {
        navigate("/menu");
      }
    } catch (error: any) {
      toast.error(error.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  const onSignup = async (data: any) => {
    setLoading(true);
    try {
      const user = await account.create(ID.unique(), data.email, data.password, data.fullName);

      await account.createEmailPasswordSession(data.email, data.password);
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.profiles,
        user.$id,
        {
          full_name: data.fullName,
          phone: data.phone,
          user_id: user.$id
        },
        [
          Permission.read(Role.user(user.$id)),
          Permission.update(Role.user(user.$id))
        ]
      );

      toast.success("Registrasi berhasil!");
      navigate("/menu");
    } catch (error: any) {
      toast.error(error.message || "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Koperasi MAN IC Siak</span>
          </Link>
          <p className="text-muted-foreground">
            Masuk atau daftar untuk mulai berbelanja
          </p>
        </div>

        <Card className="p-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Masuk</TabsTrigger>
              <TabsTrigger value="signup">Daftar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    {...loginForm.register("email")}
                    placeholder="nama@gmail.com"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    {...loginForm.register("password")}
                    placeholder="••••••••"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-destructive mt-1">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full btn-primary" disabled={loading}>
                  {loading ? "Memproses..." : "Masuk"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                <div>
                  <Label htmlFor="signup-name">Nama Lengkap</Label>
                  <Input
                    id="signup-name"
                    {...signupForm.register("fullName")}
                    placeholder="Nama lengkap kamu"
                  />
                  {signupForm.formState.errors.fullName && (
                    <p className="text-sm text-destructive mt-1">
                      {signupForm.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* MODIFIKASI 3: Tambahkan Input Nomor HP */}
                <div>
                  <Label htmlFor="signup-phone">Nomor HP / WhatsApp</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    {...signupForm.register("phone")}
                    placeholder="08xxxxxxxxxx"
                  />
                  {signupForm.formState.errors.phone && (
                    <p className="text-sm text-destructive mt-1">
                      {signupForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    {...signupForm.register("email")}
                    placeholder="nama@gmail.com"
                  />
                  {signupForm.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">
                      {signupForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    {...signupForm.register("password")}
                    placeholder="Minimal 6 karakter"
                  />
                  {signupForm.formState.errors.password && (
                    <p className="text-sm text-destructive mt-1">
                      {signupForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="signup-confirm">Konfirmasi Password</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    {...signupForm.register("confirmPassword")}
                    placeholder="Ketik ulang password"
                  />
                  {signupForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive mt-1">
                      {signupForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full btn-accent" disabled={loading}>
                  {loading ? "Memproses..." : "Daftar"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;