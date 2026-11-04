"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, User, ChevronLeft, ChevronRight, Flame } from "lucide-react";

export interface NewsItem {
  id: number | string;
  title: string;
  slug: string;
  category: string;
  image_url: string;
  reporter?: string;
  read_time?: string;
  created_at?: string;
  is_breaking?: boolean;
}

interface HeroSectionProps {
  sliderNews: NewsItem[];
  sideCardsNews: NewsItem[];
}

export default function HeroSection({ sliderNews, sideCardsNews }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const duration = 5000; // ৫ সেকেন্ড পর পর স্লাইড পরিবর্তন

  useEffect(() => {
    if (isPaused || sliderNews.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % sliderNews.length);
    }, duration);
    return () => clearInterval(interval);
  }, [isPaused, sliderNews.length]);

  const activeSlide = sliderNews[current];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-4 my-2">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* বাম পাশের ৭০% বড় স্লাইডার */}
        <div 
          className="lg:col-span-8 relative h-[420px] md:h-[520px] rounded-2xl overflow-hidden bg-slate-900 shadow-2xl"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {sliderNews.length > 0 && activeSlide ? (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide.id}
                  initial={{ scale: 1 }}
                  animate={{ scale: 1.05 }}
                  transition={{ duration: 5, ease: "easeOut" }}
                  className="absolute inset-0 z-0"
                >
                  <Image
                    src={activeSlide.image_url}
                    alt={activeSlide.title}
                    fill
                    unoptimized
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                </motion.div>
              </AnimatePresence>

              <div className="absolute bottom-0 inset-x-0 z-10 p-6 md:p-8 flex flex-col justify-end">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {activeSlide.is_breaking && (
                      <span className="flex items-center gap-1 px-3 py-0.5 text-xs font-bold text-white uppercase bg-red-600 rounded-full animate-pulse">
                        <Flame className="w-3.5 h-3.5" /> ব্রেকিং
                      </span>
                    )}
                    <span className="px-3 py-0.5 text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 rounded-full">
                      {activeSlide.category}
                    </span>
                  </div>

                  <Link href={`/news/${activeSlide.slug}`}>
                    <h2 className="text-2xl md:text-4xl font-extrabold text-white hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                      {activeSlide.title}
                    </h2>
                  </Link>

                  <div className="flex items-center gap-4 text-xs md:text-sm text-gray-300 pt-1">
                    {activeSlide.reporter && (
                      <span className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-red-500" /> {activeSlide.reporter}
                      </span>
                    )}
                    {activeSlide.read_time && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-red-500" /> {activeSlide.read_time}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* কন্ট্রোল বার ও প্রগ্রেস বার */}
                <div className="flex items-center justify-between mt-6 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-white">0{current + 1}</span>
                    <div className="w-24 md:w-32 h-1 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        key={current + (isPaused ? "-paused" : "")}
                        initial={{ width: "0%" }}
                        animate={{ width: isPaused ? "0%" : "100%" }}
                        transition={{ duration: duration / 1000, ease: "linear" }}
                        className="h-full bg-red-600 rounded-full"
                      />
                    </div>
                    <span className="text-xs font-bold text-white/50">0{sliderNews.length}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrent((prev) => (prev === 0 ? sliderNews.length - 1 : prev - 1))}
                      className="p-2 rounded-full bg-black/40 hover:bg-red-600 text-white transition border border-white/10"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrent((prev) => (prev + 1) % sliderNews.length)}
                      className="p-2 rounded-full bg-black/40 hover:bg-red-600 text-white transition border border-white/10"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              কোনো স্লাইডার সংবাদ নেই (Supabase থেকে যুক্ত করুন)
            </div>
          )}
        </div>

        {/* ডান পাশের ৩০% ছোট কার্ড */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-4 h-[420px] md:h-[520px]">
          {sideCardsNews.slice(0, 3).map((item) => (
            <Link
              key={item.id}
              href={`/news/${item.slug}`}
              className="group flex-1 flex items-center gap-4 p-4 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-red-500/50 transition-all shadow-md overflow-hidden"
            >
              <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex-1 space-y-1">
                <span className="text-[11px] font-bold text-red-500 uppercase">
                  {item.category}
                </span>
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-red-400 transition-colors line-clamp-2">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
