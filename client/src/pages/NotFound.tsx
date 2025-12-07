import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 px-4">
        <h1 className="font-display text-9xl font-bold text-muted-foreground/30">404</h1>
        <h2 className="font-display text-3xl md:text-4xl font-bold">ไม่พบหน้าที่คุณกำลังมองหา</h2>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          หน้าที่คุณพยายามเข้าถึงอาจถูกย้าย ลบ หรือไม่เคยมีอยู่จริง
        </p>
        <Link href="/">
          <Button size="lg" className="font-sans">
            <Home className="w-4 h-4 mr-2" />
            กลับหน้าแรก
          </Button>
        </Link>
      </div>
    </div>
  );
}
