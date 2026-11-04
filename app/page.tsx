import { TopBar } from '@/components/portal/top-bar'
import { SiteHeader } from '@/components/portal/site-header'
import { NewsTicker } from '@/components/portal/news-ticker'
import HeroSection from '@/components/HeroSection' // আমাদের নতুন আধুনিক স্লাইডার
import { supabase } from '@/lib/supabase' // ডাটাবেজ কানেকশন
import { LeadershipSection } from '@/components/portal/leadership-section'
import { GeneralNews } from '@/components/portal/general-news'
import { CategorySections } from '@/components/portal/category-sections'
import { StudentCorner } from '@/components/portal/student-corner'
import { ClubNews } from '@/components/portal/club-news'
import { ClubPosts } from '@/components/portal/club-posts'
import { NoticeBoard } from '@/components/portal/notice-board'
import { SiteFooter } from '@/components/portal/site-footer'
import { BackToTop } from '@/components/portal/back-to-top'

// প্রতি ১ মিনিট পর পর ডাটাবেজ থেকে স্বয়ংক্রিয়ভাবে নতুন খবর আপডেট হবে
export const revalidate = 60;

export default async function Page() {
  // ১. Supabase থেকে হিরো স্লাইডারের খবর আনা
  const { data: sliderNews } = await supabase
    .from('news')
    .select('*')
    .eq('is_hero_slider', true)
    .order('created_at', { ascending: false })
    .limit(5)

  // ২. Supabase থেকে ডান পাশের ৩টি কার্ডের খবর আনা
  const { data: sideCardsNews } = await supabase
    .from('news')
    .select('*')
    .eq('is_side_card', true)
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <>
      <TopBar />
      <SiteHeader />
      <NewsTicker />
      <main>
        {/* শুধুমাত্র আধুনিক হিরো স্লাইডারটি এখানে যুক্ত হলো */}
        <HeroSection 
          sliderNews={sliderNews || []} 
          sideCardsNews={sideCardsNews || []} 
        />
        
        {/* আপনার আগের বাকি সব সেকশন হুবহু অপরিবর্তিত রয়েছে */}
        <LeadershipSection />
        <GeneralNews />
        <CategorySections />
        <StudentCorner />
        <ClubNews />
        <ClubPosts />
        <NoticeBoard />
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  )
}
