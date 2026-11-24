import { SB_URL, SB_KEY } from "./sb"

export const SITE_SETTINGS_KEY = "site_settings_v1"
const HOME_LAYOUT_VERSION = 4
const HIDDEN_ON_HOME_MIGRATION = new Set<HomeSectionKey>([
  "stories",
  "category_sections",
  "club_posts",
])
const VISIBLE_ON_HOME_MIGRATION = new Set<HomeSectionKey>([
  "reels",
  "events_popular",
  "polls",
  "club_news",
])

export type DefaultThemeId =
  | "ocean-glass"
  | "sunset-peach"
  | "pure-frost"
  | "midnight-neon"

export type StatIconKey =
  | "calendar"
  | "users"
  | "globe"
  | "newspaper"
  | "award"
  | "star"

export type HomeSectionKey =
  | "hero"
  | "stories"
  | "reels"
  | "general_news"
  | "events_popular"
  | "polls"
  | "community_feed"
  | "leadership"
  | "category_sections"
  | "student_corner"
  | "club_news"
  | "club_posts"
  | "community_pages"
  | "notice_board"
  | "departments"
  | "social_sites"
  | "timeline"
  | "fact_check"
  | "publications"

export interface SiteMenuControlItem {
  id: string
  defaultLabel: string
  labelBn: string
  labelEn: string
  visible: boolean
}

export interface SiteCustomMenuLink {
  id: string
  labelBn: string
  labelEn: string
  href: string
  external: boolean
  placement: "root" | "university" | "news-media" | "community-clubs" | "council-about"
  visible: boolean
}

export interface HomeSectionConfig {
  key: HomeSectionKey
  name: string
  visible: boolean
  priority?: number
  pinned?: boolean
  eyebrow: string
  titleBn: string
  titleEn: string
  subtitleBn: string
  subtitleEn: string
}

export interface StatCardConfig {
  id: string
  value: string
  labelEn: string
  labelBn: string
  icon: StatIconKey
}

export interface QuickLinkConfig {
  id: string
  labelBn: string
  labelEn: string
  href: string
  visible: boolean
}

export interface SocialLinkConfig {
  slug: "facebook" | "youtube" | "x" | "linkedin" | "instagram"
  name: string
  href: string
  visible: boolean
}

export interface SubPageBannerConfig {
  eyebrow: string
  title: string
  subtitle: string
}

export interface AboutPageCustomConfig {
  historyBn?: string
  historyEn?: string
  visionBn?: string
  visionEn?: string
  missionBn?: string
  missionEn?: string
}

export interface ConstitutionPageCustomConfig {
  preambleBn?: string
  preambleEn?: string
  extraRulesBn?: string
  extraRulesEn?: string
}

export interface PoliciesPageCustomConfig {
  correctionsBn?: string
  correctionsEn?: string
  copyrightBn?: string
  copyrightEn?: string
  advertisingBn?: string
  advertisingEn?: string
  recognitionBn?: string
  recognitionEn?: string
  annualReportsBn?: string
  annualReportsEn?: string
  safetyBn?: string
  safetyEn?: string
}

export type FeedRotationMode = "time" | "scroll"

export interface FeedRotationConfig {
  enabled?: boolean
  mode?: FeedRotationMode
  intervalHours?: number
  maxItemsPerRotation?: number
}

export interface SiteSettings {
  branding: {
    orgLogoUrl: string
    orgNameEn: string
    orgNameBn: string
    orgShortEn: string
    univLogoUrl: string
    univLinkUrl: string
    univText: string
  }
  topBar: {
    showTopBar: boolean
    showClock: boolean
    showLangSwitcher: boolean
    showLocation: boolean
    locationBn: string
    locationEn: string
    showThemeSwitcher: boolean
    showSocialLinks: boolean
    defaultLang: "bn" | "en"
    defaultTheme: DefaultThemeId
  }
  moderatorPanel: {
    globalEnabled: boolean
  }
  menu: {
    items: SiteMenuControlItem[]
    customLinks: SiteCustomMenuLink[]
  }
  homeSections: {
    sections: HomeSectionConfig[]
    homeNoticesLimit: number
    layoutVersion: number
    feedRotation?: FeedRotationConfig
    sectionPriorityOverrides?: Record<string, number>
  }
  stats: {
    showStats: boolean
    items: StatCardConfig[]
  }
  footer: {
    descriptionBn: string
    descriptionEn: string
    addressBn: string
    addressEn: string
    phone: string
    email: string
    copyrightBn: string
    copyrightEn: string
    quickLinks: QuickLinkConfig[]
    socialLinks: SocialLinkConfig[]
  }
  behaviorAndPages: {
    photoClickMode: "lightbox" | "album"
    defaultAuthorName: string
    showReactions: boolean
    showComments: boolean
    showShare: boolean
    announcementEnabled: boolean
    announcementText: string
    announcementLink: string
    constitutionPdfUrl?: string
    aboutPage?: AboutPageCustomConfig
    constitutionPage?: ConstitutionPageCustomConfig
    policiesPage?: PoliciesPageCustomConfig
    subPages: {
      editorial: SubPageBannerConfig
      administration: SubPageBannerConfig
      associations: SubPageBannerConfig
      socialSites: SubPageBannerConfig
      studentCorner: SubPageBannerConfig
      notices: SubPageBannerConfig
      council: SubPageBannerConfig
    }
  }
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  branding: {
    orgLogoUrl: "/logo.png",
    orgNameEn: "MBSTU Reporters' Unity",
    orgNameBn: "মাভাবিপ্রবি রিপোর্টার্স ইউনিটি",
    orgShortEn: "MBSTURU",
    univLogoUrl: "https://mbstu.ac.bd/apple-touch-icon.png",
    univLinkUrl: "https://mbstu.ac.bd",
    univText: "",
  },
  topBar: {
    showTopBar: true,
    showClock: true,
    showLangSwitcher: true,
    showLocation: true,
    locationBn: "সন্তোষ, টাঙ্গাইল",
    locationEn: "Santosh, Tangail",
    showThemeSwitcher: true,
    showSocialLinks: true,
    defaultLang: "bn",
    defaultTheme: "ocean-glass",
  },
  moderatorPanel: {
    globalEnabled: true,
  },
  menu: {
    items: [
      { id: "home", defaultLabel: "হোম", labelBn: "হোম", labelEn: "Home", visible: true },
      { id: "editorial", defaultLabel: "সম্পাদকীয় ও মতামত", labelBn: "সম্পাদকীয় ও মতামত", labelEn: "Editorial & Opinion", visible: true },
      { id: "university", defaultLabel: "বিশ্ববিদ্যালয়", labelBn: "বিশ্ববিদ্যালয়", labelEn: "University", visible: true },
      { id: "univ-admin", defaultLabel: "প্রশাসন ও দপ্তর", labelBn: "প্রশাসন ও দপ্তর", labelEn: "Administration", visible: true },
      { id: "univ-faculties", defaultLabel: "অনুষদ ও বিভাগ", labelBn: "অনুষদ ও বিভাগ", labelEn: "Faculties & Depts", visible: true },
      { id: "univ-social", defaultLabel: "সোশ্যাল সাইট", labelBn: "সোশ্যাল সাইট", labelEn: "Social Sites", visible: true },
      { id: "news-media", defaultLabel: "সংবাদ ও মিডিয়া", labelBn: "সংবাদ ও মিডিয়া", labelEn: "News & Media", visible: true },
      { id: "news-campus", defaultLabel: "ক্যাম্পাস সংবাদ", labelBn: "ক্যাম্পাস সংবাদ", labelEn: "Campus News", visible: true },
      { id: "news-notices", defaultLabel: "ডিজিটাল নোটিশ", labelBn: "ডিজিটাল নোটিশ", labelEn: "Digital Notices", visible: true },
      { id: "news-reels", defaultLabel: "রিলস ও ভিডিও হাব", labelBn: "রিলস ও ভিডিও হাব", labelEn: "Reels & Video Hub", visible: true },
      { id: "news-stories", defaultLabel: "ক্যাম্পাস স্টোরিজ", labelBn: "ক্যাম্পাস স্টোরিজ", labelEn: "Campus Stories", visible: true },
      { id: "news-polls", defaultLabel: "ক্যাম্পাস জরিপ", labelBn: "ক্যাম্পাস জরিপ", labelEn: "Campus Polls", visible: true },
      { id: "community-clubs", defaultLabel: "কমিউনিটি ও ক্লাব", labelBn: "কমিউনিটি ও ক্লাব", labelEn: "Community & Clubs", visible: true },
      { id: "comm-clubs", defaultLabel: "ক্যাম্পাস ক্লাবসমূহ", labelBn: "ক্যাম্পাস ক্লাবসমূহ", labelEn: "Campus Clubs", visible: true },
      { id: "comm-pages", defaultLabel: "ক্যাম্পাস পেজসমূহ", labelBn: "ক্যাম্পাস পেজসমূহ", labelEn: "Campus Pages", visible: true },
      { id: "comm-student", defaultLabel: "স্টুডেন্ট কর্নার", labelBn: "স্টুডেন্ট কর্নার", labelEn: "Student Corner", visible: true },
      { id: "comm-associations", defaultLabel: "অন্যান্য সাংবাদিক সমিতি", labelBn: "অন্যান্য সাংবাদিক সমিতি", labelEn: "Associations", visible: true },
      { id: "council-about", defaultLabel: "পরিষদ ও পরিচিতি", labelBn: "পরিষদ ও পরিচিতি", labelEn: "Council & About", visible: true },
      { id: "about-unity", defaultLabel: "আমাদের সম্পর্কে", labelBn: "আমাদের সম্পর্কে", labelEn: "About Us", visible: true },
      { id: "about-leadership", defaultLabel: "কার্যনির্বাহী পরিষদ", labelBn: "কার্যনির্বাহী পরিষদ", labelEn: "Executive Council", visible: true },
      { id: "about-advisors", defaultLabel: "উপদেষ্টা পরিষদ", labelBn: "উপদেষ্টা পরিষদ", labelEn: "Advisory Council", visible: true },
      { id: "about-members", defaultLabel: "সদস্য ডিরেক্টরি", labelBn: "সদস্য ডিরেক্টরি", labelEn: "Member Directory", visible: true },
      { id: "about-constitution", defaultLabel: "গঠনতন্ত্র ও আচরণবিধি", labelBn: "গঠনতন্ত্র ও আচরণবিধি", labelEn: "Constitution & Ethics", visible: true },
      { id: "about-archive", defaultLabel: "প্রাক্তন কমিটি আর্কাইভ", labelBn: "প্রাক্তন কমিটি আর্কাইভ", labelEn: "Past Committee Archive", visible: true },
      { id: "about-council", defaultLabel: "ডিরেক্টর প্যানেল", labelBn: "ডিরেক্টর প্যানেল", labelEn: "Director Panel", visible: true },
      { id: "about-contact", defaultLabel: "যোগাযোগ ও অভিযোগ ডেস্ক", labelBn: "যোগাযোগ ও অভিযোগ ডেস্ক", labelEn: "Contact & Grievance Desk", visible: true },
      { id: "about-policies", defaultLabel: "নীতি ও স্বচ্ছতা", labelBn: "নীতি ও স্বচ্ছতা", labelEn: "Policies & Transparency", visible: true },
    ],
    customLinks: [],
  },
  homeSections: {
    layoutVersion: HOME_LAYOUT_VERSION,
    sections: [
      {
        key: "hero",
        name: "১. হিরো ব্যানার ও স্লাইডার",
        visible: true,
        eyebrow: "",
        titleBn: "",
        titleEn: "",
        subtitleBn: "",
        subtitleEn: "",
      },
      {
        key: "general_news",
        name: "২. সর্বশেষ সংবাদ, কর্নার, ফিচার ও মতামত",
        visible: true,
        eyebrow: "Campus News",
        titleBn: "সর্বশেষ সংবাদ",
        titleEn: "Latest Campus Reports",
        subtitleBn: "সংবাদ, কর্নার, ফিচার, সম্পাদকীয় ও মতামত এক জায়গায়।",
        subtitleEn: "Latest news, features, editorials and student voices.",
      },
      {
        key: "departments",
        name: "৩. বিভাগ ও অনুষদ",
        visible: true,
        eyebrow: "Faculties & Departments",
        titleBn: "বিভাগ ও অনুষদ",
        titleEn: "Faculties & Departments",
        subtitleBn: "মাভাবিপ্রবির অনুষদ ও বিভাগসমূহ।",
        subtitleEn: "Explore MBSTU faculties and departments.",
      },
      {
        key: "reels",
        name: "৪. রিলস ও ভিডিও গ্যালারি",
        visible: true,
        eyebrow: "LIVE",
        titleBn: "Reels ও ভিডিও গ্যালারি",
        titleEn: "Reels & Video Gallery",
        subtitleBn: "",
        subtitleEn: "",
      },
      {
        key: "events_popular",
        name: "৫. ইভেন্ট ও জনপ্রিয় সংবাদ",
        visible: true,
        eyebrow: "Events & Most Read",
        titleBn: "ইভেন্ট ও জনপ্রিয় সংবাদ",
        titleEn: "Events & Most Read",
        subtitleBn: "",
        subtitleEn: "",
      },
      {
        key: "stories",
        name: "৬. ফেসবুক স্টোরিজ ট্রে",
        visible: false,
        eyebrow: "",
        titleBn: "স্টোরিজ",
        titleEn: "Stories",
        subtitleBn: "স্টোরি দিন",
        subtitleEn: "Add Story",
      },
      {
        key: "community_feed",
        name: "৭. সবার পোস্ট ও পেজ টাইমলাইন",
        visible: true,
        eyebrow: "Campus Community Feed",
        titleBn: "সবার পোস্ট ও পেজ টাইমলাইন",
        titleEn: "Campus Community Feed",
        subtitleBn: "শিক্ষক, শিক্ষার্থী, কর্মকর্তা ও সাংবাদিকদের নিজস্ব পেজে প্রকাশিত সর্বশেষ লেখা, ছবি ও পোস্টসমূহ।",
        subtitleEn: "Latest posts from teachers, students, staff and campus pages.",
      },
      {
        key: "student_corner",
        name: "৮. স্টুডেন্ট কর্নার",
        visible: true,
        eyebrow: "Student Corner",
        titleBn: "স্টুডেন্ট কর্নার",
        titleEn: "Student Corner",
        subtitleBn: "মাভাবিপ্রবি শিক্ষার্থীদের মতামত, সাহিত্য, গবেষণা ও অর্জনের উন্মুক্ত মঞ্চ।",
        subtitleEn: "Opinions, creative writing, research highlights and achievements by MBSTU students.",
      },
      {
        key: "club_news",
        name: "৯. ক্যাম্পাস ক্লাব ও সংগঠনসমূহ",
        visible: true,
        eyebrow: "Campus Organizations & Clubs",
        titleBn: "ক্যাম্পাস ক্লাব ও সংগঠনসমূহ",
        titleEn: "Campus Organizations & Clubs",
        subtitleBn: "ক্যাম্পাস ক্লাব ও সংগঠনসমূহের সাম্প্রতিক কার্যক্রম।",
        subtitleEn: "Latest activities of MBSTU clubs and organizations.",
      },
      {
        key: "club_posts",
        name: "১০. সর্বশেষ ক্লাব সংবাদ",
        visible: false,
        eyebrow: "Club Reports",
        titleBn: "সর্বশেষ ক্লাব সংবাদ",
        titleEn: "Latest Club News",
        subtitleBn: "ক্যাম্পাস ক্লাব রিপোর্টারদের প্রকাশিত সর্বশেষ সংবাদ।",
        subtitleEn: "Latest news posted by our campus club reporters.",
      },
      {
        key: "social_sites",
        name: "১১. সোশ্যাল সাইট ও গ্রুপ",
        visible: true,
        eyebrow: "Social Sites & Groups",
        titleBn: "সোশ্যাল সাইট ও গ্রুপ",
        titleEn: "Social Sites & Groups",
        subtitleBn: "বিশ্ববিদ্যালয়ের গুরুত্বপূর্ণ অনলাইন কমিউনিটি ও তথ্যসূত্র।",
        subtitleEn: "Useful university social sites and groups.",
      },
      {
        key: "timeline",
        name: "১২. ক্যাম্পাস টাইমলাইন",
        visible: true,
        eyebrow: "Campus Timeline",
        titleBn: "ক্যাম্পাস টাইমলাইন",
        titleEn: "Campus Timeline",
        subtitleBn: "বিশ্ববিদ্যালয়ের উল্লেখযোগ্য ঘটনা ও মাইলফলক।",
        subtitleEn: "Milestones and events from the university.",
      },
      {
        key: "polls",
        name: "১৩. ক্যাম্পাস জরিপ",
        visible: true,
        eyebrow: "Campus Polls",
        titleBn: "ক্যাম্পাস জরিপ",
        titleEn: "Campus Polls",
        subtitleBn: "",
        subtitleEn: "",
      },
      {
        key: "category_sections",
        name: "১৪. ক্যাটাগরি-ভিত্তিক সংবাদ",
        visible: false,
        eyebrow: "News",
        titleBn: "ক্যাটাগরি সংবাদ",
        titleEn: "Category News",
        subtitleBn: "বিভাগের সর্বশেষ সংবাদ ও প্রতিবেদন",
        subtitleEn: "Latest news and reports",
      },
      {
        key: "fact_check",
        name: "১৫. ফ্যাক্ট চেক",
        visible: true,
        eyebrow: "Fact Check",
        titleBn: "ফ্যাক্ট চেক",
        titleEn: "Fact Check",
        subtitleBn: "যাচাইকৃত তথ্য ও বিভ্রান্তি-নিরসন।",
        subtitleEn: "Verified facts and context.",
      },
      {
        key: "publications",
        name: "১৬. প্রকাশনা",
        visible: true,
        eyebrow: "Publications",
        titleBn: "প্রকাশনা",
        titleEn: "Publications",
        subtitleBn: "রিপোর্টার্স ইউনিটির প্রকাশনা ও বিশেষ সংখ্যা।",
        subtitleEn: "Publications and special editions.",
      },
      {
        key: "community_pages",
        name: "১৭. ক্যাম্পাস পেজ ও কমিউনিটি",
        visible: true,
        eyebrow: "Community & Organizations",
        titleBn: "ক্যাম্পাস পেজ ও কমিউনিটি",
        titleEn: "Campus Pages & Community",
        subtitleBn: "মাভাবিপ্রবির বিভিন্ন সমিতি, হল সংসদ ও ক্যাম্পাস সংগঠনসমূহের অফিসিয়াল পেজ ও সাম্প্রতিক কার্যক্রম।",
        subtitleEn: "Official campus pages and recent updates.",
      },
      {
        key: "notice_board",
        name: "১৮. ডিজিটাল নোটিশ বোর্ড",
        visible: true,
        eyebrow: "Digital Notice Board",
        titleBn: "ডিজিটাল নোটিশ বোর্ড",
        titleEn: "Digital Notice Board",
        subtitleBn: "বিশ্ববিদ্যালয়, বিভিন্ন হল, বিভাগ ও মাভাবিপ্রবি রিপোর্টার্স ইউনিটির সর্বশেষ নোটিশসমূহ।",
        subtitleEn: "Latest notices from the university, halls, departments and MBSTURU.",
      },
      {
        key: "leadership",
        name: "১৯. কার্যনির্বাহী পরিষদ ও পরিসংখ্যান",
        visible: true,
        eyebrow: "Executive Council & At a Glance",
        titleBn: "কার্যনির্বাহী পরিষদ",
        titleEn: "Executive Council",
        subtitleBn: "মাভাবিপ্রবি রিপোর্টার্স ইউনিটির কার্যনির্বাহী পরিষদ — নির্ভীক, নিরপেক্ষ ও তথ্যনির্ভর ক্যাম্পাস সাংবাদিকতায় অঙ্গীকারবদ্ধ।",
        subtitleEn: "Executive Council of MBSTU Reporters' Unity — committed to fearless and factual campus journalism.",
      },
    ],
    homeNoticesLimit: 5,
    feedRotation: {
      enabled: true,
      mode: "time",
      intervalHours: 12,
      maxItemsPerRotation: 1,
    },
    sectionPriorityOverrides: {},
  },
  stats: {
    showStats: true,
    items: [
      { id: "stat-1", value: "2026", labelEn: "Founded", labelBn: "প্রতিষ্ঠা", icon: "calendar" },
      { id: "stat-2", value: "25+", labelEn: "Active Reporters", labelBn: "সক্রিয় রিপোর্টার", icon: "users" },
      { id: "stat-3", value: "100%", labelEn: "University Coverage", labelBn: "বিশ্ববিদ্যালয় কভারেজ", icon: "globe" },
      { id: "stat-4", value: "24/7", labelEn: "Daily Reports", labelBn: "প্রতিদিনের প্রতিবেদন", icon: "newspaper" },
    ],
  },
  footer: {
    descriptionBn:
      "মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় রিপোর্টার্স ইউনিটি (মাভাবিপ্রবি রিপোর্টার্স ইউনিটি) — সত্য, বস্তুনিষ্ঠ ও দায়িত্বশীল ক্যাম্পাস সাংবাদিকতার প্রতিশ্রুতি।",
    descriptionEn:
      "MBSTU Reporters' Unity (MBSTURU), formally Mawlana Bhashani Science and Technology University Reporters' Unity, is the organisation of campus journalists at Mawlana Bhashani Science and Technology University, Santosh, Tangail, dedicated to truthful, objective and responsible reporting.",
    addressBn: "কক্ষ ২১৪, ছাত্র কল্যাণ / প্রশাসনিক ভবন, মাভাবিপ্রবি, সন্তোষ, টাঙ্গাইল-১৯০২",
    addressEn: "Room 214, Student Welfare / Administrative Building, MBSTU, Santosh, Tangail-1902",
    phone: "+880 1753 964870",
    email: "mbstureportersunity@gmail.com",
    copyrightBn: "© ২০২৬ মাভাবিপ্রবি রিপোর্টার্স ইউনিটি (MBSTURU)। সর্বস্বত্ব সংরক্ষিত।",
    copyrightEn: "© 2026 MBSTU Reporters' Unity (MBSTURU). All Rights Reserved.",
    quickLinks: [
      { id: "ql-1", labelBn: "হোম", labelEn: "Home", href: "/", visible: true },
      { id: "ql-2", labelBn: "পরিচিতি", labelEn: "About", href: "/about", visible: true },
      { id: "ql-3", labelBn: "কার্যনির্বাহী পরিষদ", labelEn: "Executive Council", href: "/committee", visible: true },
      { id: "ql-4", labelBn: "ডিরেক্টর প্যানেল", labelEn: "Director Panel", href: "/council", visible: true },
      { id: "ql-5", labelBn: "ক্যাম্পাস সংবাদ", labelEn: "Campus News", href: "/news", visible: true },
      { id: "ql-6", labelBn: "ক্যাম্পাস ক্লাবসমূহ", labelEn: "Campus Clubs", href: "/clubs", visible: true },
      { id: "ql-7", labelBn: "স্টুডেন্ট কর্নার", labelEn: "Student Corner", href: "/student-corner", visible: true },
      { id: "ql-8", labelBn: "নোটিশ", labelEn: "Notices", href: "/notices", visible: true },
      { id: "ql-9", labelBn: "যোগাযোগ", labelEn: "Contact", href: "/contact", visible: true },
    ],
    socialLinks: [
      { slug: "facebook", name: "Facebook", href: "https://www.facebook.com/share/19jdL8Wtk5/", visible: true },
      { slug: "youtube", name: "YouTube", href: "https://youtube.com/@mbstureportersunity?si=Dwz5c6v-J500O_TU", visible: true },
      { slug: "x", name: "X (Twitter)", href: "https://twitter.com", visible: true },
      { slug: "linkedin", name: "LinkedIn", href: "https://linkedin.com", visible: true },
      { slug: "instagram", name: "Instagram", href: "https://instagram.com", visible: true },
    ],
  },
  behaviorAndPages: {
    photoClickMode: "lightbox",
    defaultAuthorName: "মাভাবিপ্রবি রিপোর্টার্স ইউনিটি",
    showReactions: true,
    showComments: true,
    showShare: true,
    announcementEnabled: false,
    announcementText: "",
    announcementLink: "",
    constitutionPdfUrl: "",
    aboutPage: {},
    constitutionPage: {},
    policiesPage: {},
    subPages: {
      editorial: {
        eyebrow: "Editorial & Opinion Column",
        title: "সম্পাদকীয় ও মুক্তমত",
        subtitle: "মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের শিক্ষক ও গবেষকদের সমসাময়িক ভাবনা, শিক্ষা, গবেষণা ও সম্পাদকীয় কলাম।",
      },
      administration: {
        eyebrow: "Mawlana Bhashani Science and Technology University",
        title: "MBSTU Administration (মাভাবিপ্রবি প্রশাসন)",
        subtitle: "বিশ্ববিদ্যালয়ের শীর্ষ প্রশাসন, রেজিস্ট্রার অফিস, প্রক্টর অফিস, অনুষদীয় ডিন এবং সকল প্রশাসনিক দপ্তরের দায়িত্বপ্রাপ্ত ব্যক্তিবর্গের তথ্যাবলি",
      },
      associations: {
        eyebrow: "University Press & Reporters",
        title: "অন্যান্য সাংবাদিক সমিতি",
        subtitle: "Other University Journalist Associations Across Bangladesh",
      },
      socialSites: {
        eyebrow: "University Community & Media",
        title: "MBSTU Social Site",
        subtitle: "মাভাবিপ্রবির বিভিন্ন দপ্তর, মেস-বাসা আপডেট, পরিবহন ও সামাজিক গ্রুপসমূহের কেন্দ্রবিন্দু",
      },
      studentCorner: {
        eyebrow: "Student Corner",
        title: "শিক্ষার্থীদের লেখা ও কর্নার",
        subtitle: "মাভাবিপ্রবি শিক্ষার্থীদের মতামত, সাহিত্য, গবেষণা ও অর্জনের উন্মুক্ত মঞ্চ।",
      },
      notices: {
        eyebrow: "Digital Notice Board",
        title: "ডিজিটাল নোটিশ বোর্ড",
        subtitle: "বিশ্ববিদ্যালয়, হল, বিভাগ ও রিপোর্টার্স ইউনিটির সকল আনুষ্ঠানিক বিজ্ঞপ্তি",
      },
      council: {
        eyebrow: "Management & Moderation Panel",
        title: "ডিরেক্টর প্যানেল / Director Panel",
        subtitle: "মাভাবিপ্রবি রিপোর্টার্স ইউনিটির ওয়েবসাইট পরিচালনা ও মডারেশন প্যানেল",
      },
    },
  },
}

const LEGACY_UNIV_LOGO_URL = "https://mbstu.ac.bd/images/logo.png"

export function normalizeUniversityLogoUrl(url: string | undefined): string {
  if (!url || url === LEGACY_UNIV_LOGO_URL) {
    return DEFAULT_SITE_SETTINGS.branding.univLogoUrl
  }
  return url
}

function mergeSiteSettings(
  rawJson?: string | null,
  legacy?: {
    univLogo?: string
    univLink?: string
    univText?: string
    photoClickMode?: string
  }
): SiteSettings {
  let parsed: Partial<SiteSettings> = {}
  if (rawJson) {
    try {
      parsed = JSON.parse(rawJson)
    } catch {}
  }

  const obsoleteIds = new Set(["about-committee", "about-contact-desk"])
  const cleanStoredMenuItems = (parsed.menu?.items || []).filter((i) => !obsoleteIds.has(i.id))
  const existingMenuIds = new Set(cleanStoredMenuItems.map((i) => i.id))
  const mergedMenuItems = [
    ...cleanStoredMenuItems,
    ...DEFAULT_SITE_SETTINGS.menu.items.filter((d) => !existingMenuIds.has(d.id)),
  ]

  const storedSections = parsed.homeSections?.sections || []
  const storedSectionMap = new Map(storedSections.map((section) => [section.key, section]))
  const existingSectionKeys = new Set(storedSections.map((section) => section.key))
  const mergedSections =
    (parsed.homeSections?.layoutVersion ?? 0) < HOME_LAYOUT_VERSION
      ? [
          ...DEFAULT_SITE_SETTINGS.homeSections.sections.map((defaults) => {
            const stored = storedSectionMap.get(defaults.key)
            const shouldStartHidden = HIDDEN_ON_HOME_MIGRATION.has(defaults.key)
            return {
              ...defaults,
              ...stored,
              name: stored?.name ?? defaults.name,
              visible: VISIBLE_ON_HOME_MIGRATION.has(defaults.key)
                ? true
                : shouldStartHidden
                  ? false
                  : stored?.visible ?? defaults.visible,
              eyebrow: stored?.eyebrow ?? defaults.eyebrow,
              titleBn: stored?.titleBn ?? defaults.titleBn,
              titleEn: stored?.titleEn ?? defaults.titleEn,
              subtitleBn: stored?.subtitleBn ?? defaults.subtitleBn,
              subtitleEn: stored?.subtitleEn ?? defaults.subtitleEn,
            }
          }),
          ...storedSections.filter(
            (section) => !DEFAULT_SITE_SETTINGS.homeSections.sections.some((defaults) => defaults.key === section.key)
          ),
        ]
      : [
          ...storedSections,
          ...DEFAULT_SITE_SETTINGS.homeSections.sections.filter((section) => !existingSectionKeys.has(section.key)),
        ]
  const branding = {
    ...DEFAULT_SITE_SETTINGS.branding,
    ...(legacy?.univLogo ? { univLogoUrl: legacy.univLogo } : {}),
    ...(legacy?.univLink ? { univLinkUrl: legacy.univLink } : {}),
    ...(legacy?.univText !== undefined ? { univText: legacy.univText } : {}),
    ...(parsed.branding || {}),
  }
  branding.univLogoUrl = normalizeUniversityLogoUrl(branding.univLogoUrl)
  const quickLinks = (parsed.footer?.quickLinks || DEFAULT_SITE_SETTINGS.footer.quickLinks).map((link) => {
    if (link.id === "ql-5" && link.href === "/search") {
      return { ...link, href: "/news" }
    }
    if (link.id === "ql-6" && link.href === "#club-news") {
      return { ...link, href: "/clubs" }
    }
    return link
  })

  return {
    branding,
    topBar: {
      ...DEFAULT_SITE_SETTINGS.topBar,
      ...(parsed.topBar || {}),
    },
moderatorPanel: {
      ...DEFAULT_SITE_SETTINGS.moderatorPanel,
      ...(parsed.moderatorPanel || {}),
    },
    menu: {
      items: mergedMenuItems,
      customLinks: parsed.menu?.customLinks || DEFAULT_SITE_SETTINGS.menu.customLinks,
    },
    homeSections: {
      sections: mergedSections,
      layoutVersion: HOME_LAYOUT_VERSION,
      homeNoticesLimit:
        parsed.homeSections?.homeNoticesLimit || DEFAULT_SITE_SETTINGS.homeSections.homeNoticesLimit,
      feedRotation: {
        ...DEFAULT_SITE_SETTINGS.homeSections.feedRotation,
        ...(parsed.homeSections?.feedRotation || {}),
      },
      sectionPriorityOverrides: {
        ...DEFAULT_SITE_SETTINGS.homeSections.sectionPriorityOverrides,
        ...(parsed.homeSections?.sectionPriorityOverrides || {}),
      },
    },
    stats: {
      showStats: parsed.stats?.showStats ?? DEFAULT_SITE_SETTINGS.stats.showStats,
      items:
        parsed.stats?.items && parsed.stats.items.length > 0
          ? parsed.stats.items
          : DEFAULT_SITE_SETTINGS.stats.items,
    },
    footer: {
      ...DEFAULT_SITE_SETTINGS.footer,
      ...(parsed.footer || {}),
      quickLinks,
      socialLinks: parsed.footer?.socialLinks || DEFAULT_SITE_SETTINGS.footer.socialLinks,
    },
    behaviorAndPages: {
      ...DEFAULT_SITE_SETTINGS.behaviorAndPages,
      ...(legacy?.photoClickMode === "album" || legacy?.photoClickMode === "lightbox"
        ? { photoClickMode: legacy.photoClickMode }
        : {}),
      ...(parsed.behaviorAndPages || {}),
      constitutionPdfUrl:
        parsed.behaviorAndPages?.constitutionPdfUrl ??
        (parsed.behaviorAndPages?.subPages as any)?.constitutionPdfUrl ??
        DEFAULT_SITE_SETTINGS.behaviorAndPages.constitutionPdfUrl,
      aboutPage: {
        ...DEFAULT_SITE_SETTINGS.behaviorAndPages.aboutPage,
        ...(parsed.behaviorAndPages?.aboutPage || {}),
      },
      constitutionPage: {
        ...DEFAULT_SITE_SETTINGS.behaviorAndPages.constitutionPage,
        ...(parsed.behaviorAndPages?.constitutionPage || {}),
      },
      policiesPage: {
        ...DEFAULT_SITE_SETTINGS.behaviorAndPages.policiesPage,
        ...(parsed.behaviorAndPages?.policiesPage || {}),
      },
      subPages: {
        ...DEFAULT_SITE_SETTINGS.behaviorAndPages.subPages,
        ...(parsed.behaviorAndPages?.subPages || {}),
      },
    },
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const keys = [SITE_SETTINGS_KEY, "univ_logo_url", "univ_link_url", "univ_text", "photo_click_mode"].join(",")
    const res = await fetch(
      `${SB_URL}/rest/v1/app_config?select=key,value&key=in.(${keys})`,
      {
        headers: { apikey: SB_KEY },
        cache: "no-store",
      }
    )
    if (!res.ok) return DEFAULT_SITE_SETTINGS
    const rows: Array<{ key: string; value: string }> = await res.json()
    let rawJson: string | null = null
    const legacy: {
      univLogo?: string
      univLink?: string
      univText?: string
      photoClickMode?: string
    } = {}

    if (Array.isArray(rows)) {
      for (const r of rows) {
        if (r.key === SITE_SETTINGS_KEY) rawJson = r.value
        if (r.key === "univ_logo_url" && r.value) legacy.univLogo = r.value
        if (r.key === "univ_link_url" && r.value) legacy.univLink = r.value
        if (r.key === "univ_text") legacy.univText = r.value
        if (r.key === "photo_click_mode") legacy.photoClickMode = r.value
      }
    }

    return mergeSiteSettings(rawJson, legacy)
  } catch {
    return DEFAULT_SITE_SETTINGS
  }
}

export async function saveSiteSettings(token: string, settings: SiteSettings): Promise<void> {
  const rows = [
    { key: SITE_SETTINGS_KEY, value: JSON.stringify(settings) },
    { key: "univ_logo_url", value: settings.branding.univLogoUrl.trim() },
    { key: "univ_link_url", value: settings.branding.univLinkUrl.trim() },
    { key: "univ_text", value: settings.branding.univText.trim() },
    { key: "photo_click_mode", value: settings.behaviorAndPages.photoClickMode },
  ]

  const res = await fetch(`${SB_URL}/rest/v1/app_config`, {
    method: "POST",
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || "সাইট সেটিংস সংরক্ষণ করা যায়নি")
  }
}
