import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, PenSquare, BookOpen } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/";
  };

  return (
    <nav className="border-b border-border/30 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center space-x-2 group">
              <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight hover:text-accent transition-colors">
                My Article
              </h1>
            </a>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-8">
            <Link href="/articles">
              <a className="label-caps text-muted-foreground hover:text-foreground transition-colors">
                บทความ
              </a>
            </Link>

            {isAuthenticated ? (
              <>
                <Link href="/write">
                  <a className="label-caps text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                    <PenSquare className="w-4 h-4" />
                    เขียนบทความ
                  </a>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="font-sans">
                      <User className="w-4 h-4 mr-2" />
                      {user?.name || "ผู้ใช้"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setLocation("/my-articles")}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      บทความของฉัน
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation("/profile")}>
                      <User className="w-4 h-4 mr-2" />
                      โปรไฟล์
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      ออกจากระบบ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="font-sans"
                onClick={() => (window.location.href = getLoginUrl())}
              >
                เข้าสู่ระบบ
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
