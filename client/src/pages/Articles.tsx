import { useState } from "react";
import { trpc } from "@/lib/trpc";
import Navigation from "@/components/Navigation";
import ArticleCard from "@/components/ArticleCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const categoryImageMap: Record<string, string> = {
  "วิทยาศาสตร์และเทคโนโลยี": "/category-science.jpg",
  "การเมือง": "/category-politics.jpg",
  "หุ้นและการลงทุน": "/category-business.jpg",
  "เศรษฐกิจ": "/category-economy.jpg",
  "ท่องเที่ยว": "/category-travel.jpg",
  "เพลง": "/category-music.jpg",
  "ภาพยนตร์": "/category-film.jpg",
  "ดนตรี": "/category-music.jpg",
  "อาหาร": "/category-food.jpg",
};

export default function Articles() {
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: articles, isLoading } = trpc.articles.list.useQuery({
    categoryId: selectedCategory,
    search: searchQuery,
    limit: 50,
  });

  const selectedCategoryName = categories?.find(c => c.id === selectedCategory)?.name;
  const backgroundImage = selectedCategoryName ? categoryImageMap[selectedCategoryName] : "/hero-cover.jpg";

  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="section-spacing relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={backgroundImage}
            alt="Category Background"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="container">
          {/* Header */}
          <div className="mb-16 text-center">
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">บทความทั้งหมด</h1>
            <p className="text-xl text-muted-foreground">
              สำรวจเรื่องราวและแรงบันดาลใจจากนักเขียนทั่วโลก
            </p>
          </div>

          {/* Search & Filter */}
          <div className="mb-12 space-y-6">
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="ค้นหาบทความ..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="font-sans"
                />
                <Button onClick={handleSearch} className="font-sans">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Category Filter */}
            {categories && categories.length > 0 && (
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  variant={selectedCategory === undefined ? "default" : "outline"}
                  onClick={() => setSelectedCategory(undefined)}
                  className="font-sans"
                >
                  ทั้งหมด
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.id)}
                    className="font-sans"
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Articles Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted aspect-[4/3] mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted w-20"></div>
                    <div className="h-8 bg-muted w-full"></div>
                    <div className="h-4 bg-muted w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : articles && articles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">ไม่พบบทความที่ตรงกับเงื่อนไข</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
