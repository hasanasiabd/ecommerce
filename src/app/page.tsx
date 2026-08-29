// src/app/page.tsx 

import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/navbar"; // গ্লোবাল নেভবার ইম্পোর্ট করা হলো

export default function Home() {
  const featuredProducts = [
    { id: 1, name: "Premium Wireless Headphones", price: "$299", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80" },
    { id: 2, name: "Minimalist Smart Watch", price: "$199", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80" },
    { id: 3, name: "Ergonomic Gaming Mouse", price: "$89", image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80" },
    { id: 4, name: "Professional DSLR Camera", price: "$899", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* গ্লোবাল নেভবার কম্পোনেন্ট */}
      <Navbar />

      {/* হিরো সেকশন */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-400">
              New Collection 2026
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Discover Quality Products for Your <span className="text-indigo-500">Lifestyle</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Explore our curated selection of premium electronics and accessories designed to elevate your daily routine.
            </p>
            <div className="flex gap-4">
              <Link href="/products" className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-500 transition">
                Shop Now
              </Link>
              <Link href="/categories" className="rounded-lg border border-border bg-card px-6 py-3 font-semibold hover:bg-accent transition">
                Explore Categories
              </Link>
            </div>
          </div>
          <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden border border-border bg-card shadow-2xl">
            <Image 
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80" 
              alt="Hero Banner" 
              fill 
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover opacity-85"
              priority
            />
          </div>
        </div>
      </section>

      {/* ফিচারড প্রোডাক্ট সেকশন */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Featured Products</h2>
          <Link href="/products" className="text-sm text-indigo-400 hover:underline">View All →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div key={product.id} className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-lg hover:border-indigo-500/50 transition">
              <div className="relative h-48 w-full rounded-lg overflow-hidden bg-muted">
                <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover" />
              </div>
              <h3 className="font-semibold truncate">{product.name}</h3>
              <div className="flex justify-between items-center">
                <span className="text-indigo-500 font-bold">{product.price}</span>
                <button className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition cursor-pointer">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ফুটার */}
      <footer className="border-t border-border bg-card mt-20 py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} MyShop. All rights reserved.</p>
      </footer>
    </div>
  );
}