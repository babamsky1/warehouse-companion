import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Boxes, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar-primary/20 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-sidebar-accent-foreground">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <Boxes className="h-7 w-7 text-sidebar-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">WMS Pro</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-6 leading-tight">
              Streamline Your Warehouse Operations
            </h1>
            <p className="text-lg text-sidebar-foreground leading-relaxed">
              Manage inventory, track shipments, and optimize your supply chain with our comprehensive warehouse management system.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-3xl font-bold text-sidebar-primary">99.9%</p>
              <p className="text-sm text-sidebar-foreground">Uptime</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-sidebar-primary">50K+</p>
              <p className="text-sm text-sidebar-foreground">Daily Transactions</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-sidebar-primary">24/7</p>
              <p className="text-sm text-sidebar-foreground">Support</p>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-sidebar-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-sidebar-primary/5 rounded-full blur-2xl" />
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Boxes className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">WMS Pro</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-2">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-sm text-primary"
                >
                  Forgot password?
                </Button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                Remember me for 30 days
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Don't have an account?{" "}
            <Button variant="link" className="p-0 h-auto text-primary">
              Contact administrator
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
