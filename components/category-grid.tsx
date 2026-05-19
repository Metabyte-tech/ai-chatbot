"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { ChevronRight, ArrowRight, Laptop, Baby, Home, Shirt, Activity, ShoppingBag, Wrench, Dog, Car, Briefcase, Gamepad2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

interface CategoryItem {
    name: string;
    price: string;
    url: string;
    image_url: string;
    brand: string;
    rating_avg?: string;
    rating_count?: string;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    subcategories: string[];
    items: CategoryItem[];
}

const CATEGORY_ICONS: Record<string, any> = {
    "Baby & Kids": <Baby className="w-5 h-5" />,
    "Electronics": <Laptop className="w-5 h-5" />,
    "Home & Kitchen": <Home className="w-5 h-5" />,
    "Fashion": <Shirt className="w-5 h-5" />,
    "Beauty & Health": <Activity className="w-5 h-5" />,
    "Sports & Outdoors": <ShoppingBag className="w-5 h-5" />,
    "Grocery": <ShoppingBag className="w-5 h-5" />,
    "Industrial & Scientific": <Wrench className="w-5 h-5" />,
    "Pet Supplies": <Dog className="w-5 h-5" />,
    "Automotive": <Car className="w-5 h-5" />,
    "Office Products": <Briefcase className="w-5 h-5" />,
    "Video Games": <Gamepad2 className="w-5 h-5" />,
};

export function CategoryGrid({ onQuery }: { onQuery: (query: string) => void }) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/categories`);
                const data = await res.json();
                setCategories(data.categories || []);
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 w-full max-w-6xl px-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex flex-col gap-4">
                        <Skeleton className="h-64 w-full rounded-[2.5rem]" />
                    </div>
                ))}
            </div>
        );
    }

    const displayedCategories = showAll ? categories : categories.slice(0, 6);

    return (
        <div className="w-full max-w-6xl px-4 mt-24 pb-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-zinc-900 bg-clip-text text-transparent bg-gradient-to-r from-black to-zinc-500">Universal Intelligence</h2>
                    <p className="text-zinc-500 mt-2 text-lg font-medium">Explore the world's retail supply chain in real-time</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setShowAll(!showAll)}
                    className="rounded-full px-8 h-12 border-zinc-200 hover:bg-zinc-900 hover:text-white transition-all font-bold shadow-sm"
                >
                    {showAll ? "Show Less" : "View All Categories"} <ChevronRight className={showAll ? "ml-2 h-4 w-4 rotate-180" : "ml-2 h-4 w-4"} />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedCategories.map((category) => (
                    <div
                        key={category.id}
                        className="group flex flex-col bg-white rounded-[2.5rem] border border-zinc-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                    >
                        {/* Category Header */}
                        <div className="p-10 pb-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-zinc-50 rounded-2xl group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors duration-500 text-zinc-500">
                                    {CATEGORY_ICONS[category.name] || <ShoppingBag className="w-5 h-5" />}
                                </div>
                                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.1em] shadow-sm">
                                    Global
                                </span>
                            </div>

                            <h3 className="text-2xl font-extrabold text-zinc-900 mb-2 group-hover:text-emerald-900 transition-colors">{category.name}</h3>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mb-8">
                                {category.subcategories.slice(0, 3).map(sub => (
                                    <span
                                        key={sub}
                                        className="text-zinc-400 text-[13px] font-bold hover:text-emerald-600 cursor-pointer transition-colors"
                                        onClick={() => onQuery(sub)}
                                    >
                                        {sub}
                                    </span>
                                ))}
                            </div>

                            {/* Product Preview Stack (Upgraded) */}
                            <div className="relative h-44 w-full mb-4">
                                {category.items.length > 0 ? (
                                    category.items.slice(0, 3).map((item, idx) => (
                                        <div
                                            key={item.url}
                                            className="absolute rounded-[1.5rem] overflow-hidden border-4 border-white shadow-xl transition-all group-hover:scale-105 duration-700 ease-out bg-zinc-100"
                                            style={{
                                                left: `${idx * 20}%`,
                                                top: `${idx * 12}px`,
                                                zIndex: 3 - idx,
                                                width: '65%',
                                                aspectRatio: '1/1',
                                                opacity: 1 - (idx * 0.15)
                                            }}
                                        >
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                                onError={(e) => {
                                                    const img = e.target as HTMLImageElement;
                                                    if (img.src.includes('categories')) return; // Avoid infinite loop
                                                    const slug = category.slug;
                                                    const pngs = ['baby-kids', 'electronics', 'home-kitchen', 'fashion', 'beauty-health', 'sports-outdoors'];
                                                    img.src = pngs.includes(slug) ? `/images/categories/${slug}.png` : `/images/categories/${slug}.jpg`;
                                                }}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="w-full h-full bg-zinc-50 rounded-[1.5rem] overflow-hidden border border-zinc-100">
                                        <img 
                                            src={['baby-kids', 'electronics', 'home-kitchen', 'fashion', 'beauty-health', 'sports-outdoors'].includes(category.slug) ? `/images/categories/${category.slug}.png` : `/images/categories/${category.slug}.jpg`}
                                            alt={category.name}
                                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                                            onError={(e) => {
                                                const img = e.target as HTMLImageElement;
                                                img.style.display = 'none'; // If even hero fails, hide it
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* View Button */}
                        <div className="mt-auto p-6 flex items-center justify-between group-hover:bg-zinc-50 transition-colors duration-300">
                            <div className="flex flex-col">
                                <span className="text-emerald-600 text-xs font-black uppercase tracking-wider">Verified Sourcing</span>
                                <span className="text-zinc-400 text-[11px] font-bold">10k+ Products Available</span>
                            </div>
                            <Button
                                variant="ghost"
                                className="rounded-full w-14 h-14 p-0 bg-white shadow-lg text-black group-hover:bg-zinc-900 group-hover:text-white group-hover:scale-110 transition-all duration-500"
                                onClick={() => onQuery(category.name)}
                            >
                                <ArrowRight className="h-6 w-6" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {showAll && categories.length > 6 && (
                <div className="mt-16 flex justify-center">
                    <Button
                        variant="ghost"
                        onClick={() => setShowAll(false)}
                        className="text-zinc-400 font-bold hover:text-black transition-colors"
                    >
                        Collapse View
                    </Button>
                </div>
            )}
        </div>
    );
}
