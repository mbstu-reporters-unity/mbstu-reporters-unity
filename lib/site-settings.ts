import { SB_URL, SB_KEY } from "./sb"

export const SITE_SETTINGS_KEY = "site_settings_v1"

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
  | "community_feed"
  | "leadership"
  | "category_sections"
  | "student_corner"
  | "club_news"
  | "club_posts"
  | "community_pages"
  | "notice_board"

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
  menu: {
    items: SiteMenuControlItem[]
    customLinks: SiteCustomMenuLink[]
  }
  homeSections: {
    sections: HomeSectionConfig[]
    homeNoticesLimit: number
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
    univLogoUrl: "https://mbstu.ac.bd/images/logo.png",
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
      { id: "community-clubs", defaultLabel: "কমিউনিটি ও ক্লাব", labelBn: "কমিউনিটি ও ক্লাব", labelEn: "Community & Clubs", visible: true },
      { id: "comm-clubs", defaultLabel: "ক্যাম্পাস ক্লাবসমূহ", labelBn: "ক্যাম্পাস ক্লাবসমূহ", labelEn: "Campus Clubs", visible: true },
      { id: "comm-pages", defaultLabel: "ক্যাম্পাস পেজসমূহ", labelBn: "ক্যাম্পাস পেজসমূহ", labelEn: "Campus Pages", visible: true },
      { id: "comm-student", defaultLabel: "স্টুডেন্ট কর্নার", labelBn: "স্টুডেন্ট কর্নার", labelEn: "Student Corner", visible: true },
      { id: "comm-associations", defaultLabel: "অন্যান্য সাংবাদিক সমিতি", labelBn: "অন্যান্য সাংবাদিক সমিতি", labelEn: "Associations", visible: true },
      { id: "council-about", defaultLabel: "পরিষদ ও পরিচিতি", labelBn: "পরিষদ ও পরিচিতি", labelEn: "Council & About", visible: true },
      { id: "about-leadership", defaultLabel: "কার্যনির্বাহী পরিষদ", labelBn: "কার্যনির্বাহী পরিষদ", labelEn: "Executive Council", visible: true },
      { id: "about-council", defaultLabel: "ডিরেক্টর প্যানেল", labelBn: "ডিরেক্টর প্যানেল", labelEn: "Director Panel", visible: true },
      { id: "about-unity", defaultLabel: "ইউনিটি পরিচিতি", labelBn: "ইউনিটি পরিচিতি", labelEn: "About Unity", visible: true },
      { id: "about-contact", defaultLabel: "যোগাযোগ", labelBn: "যোগাযোগ", labelEn: "Contact", visible: true },
    ],
    customLinks: [],
  },
  homeSections: {
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
        key: "stories",
        name: "২. ফেসবুক স্টোরিজ ট্রে",
        visible: true,
        eyebrow: "",
        titleBn: "স্টোরিজ",
        titleEn: "Stories",
        subtitleBn: "স্টোরি দিন",
        subtitleEn: "Add Story",
      },
      {
        key: "reels",
        name: "৩. রিলস ও ভিডিও গ্যালারি",
        visible: true,
        eyebrow: "LIVE",
        titleBn: "Reels ও ভিডিও গ্যালারি",
        titleEn: "Reels & Video Gallery",
        subtitleBn: "",
        subtitleEn: "",
      },
      {
        key: "general_news",
        name: "৪. ক্যাম্পাস সংবাদ",
        visible: true,
        eyebrow: "Campus News",
        titleBn: "ক্যাম্পাস সংবাদ",
        titleEn: "Latest Campus Reports",
        subtitleBn: "মাভাবিপ্রবির সর্বত্র থেকে যাচাইকৃত নির্ভরযোগ্য প্রতিবেদন।",
        subtitleEn: "Verified reports from across MBSTU.",
      },
      {
        key: "community_feed",
        name: "৫. সবার পোস্ট ও পেজ টাইমলাইন",
        visible: true,
        eyebrow: "Campus Community Feed",
        titleBn: "সবার পোস্ট ও পেজ টাইমলাইন",
        titleEn: "Campus Community Feed",
        subtitleBn: "শিক্ষক, শিক্ষার্থী, কর্মকর্তা ও সাংবাদিকদের নিজস্ব পেজে প্রকাশিত সর্বশেষ লেখা, ছবি ও পোস্টসমূহ।",
        subtitleEn: "Latest posts from teachers, students, staff and campus pages.",
      },
      {
        key: "leadership",
        name: "৬. কার্যনির্বাহী পরিষদ",
        visible: true,
        eyebrow: "Executive Council & At a Glance",
        titleBn: "কার্যনির্বাহী পরিষদ",
        titleEn: "Executive Council",
        subtitleBn: "মাভাবিপ্রবি রিপোর্টার্স ইউনিটির কার্যনির্বাহী পরিষদ — নির্ভীক, নিরপেক্ষ ও তথ্যনির্ভর ক্যাম্পাস সাংবাদিকতায় অঙ্গীকারবদ্ধ।",
        subtitleEn: "Executive Council of MBSTU Reporters' Unity — committed to fearless and factual campus journalism.",
      },
      {
        key: "category_sections",
        name: "৭. সংবাদের ক্যাটাগরিভিত্তিক সেকশন",
        visible: true,
        eyebrow: "News",
        titleBn: "ক্যাটাগরি সংবাদ",
        titleEn: "Category News",
        subtitleBn: "বিভাগের সর্বশেষ সংবাদ ও প্রতিবেদন",
        subtitleEn: "Latest news and reports",
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
        subtitleBn: "মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের বিভিন্ন ক্লাব ও সংগঠনের সাম্প্রতিক অর্জন, কার্যক্রম এবং পূর্ণাঙ্গ পরিচিতি।",
        subtitleEn: "Latest activities and profiles of MBSTU campus clubs and organizations.",
      },
      {
        key: "club_posts",
        name: "১০. সর্বশেষ ক্লাব সংবাদ",
        visible: true,
        eyebrow: "Club Reports",
        titleBn: "সর্বশেষ ক্লাব সংবাদ",
        titleEn: "Latest Club News",
        subtitleBn: "ক্যাম্পাস ক্লাব রিপোর্টারদের প্রকাশিত সর্বশেষ সংবাদ।",
        subtitleEn: "Latest news posted by our campus club reporters.",
      },
      {
        key: "community_pages",
        name: "১১. ক্যাম্পাস পেজ ও কমিউনিটি",
        visible: true,
        eyebrow: "Community & Organizations",
        titleBn: "ক্যাম্পাস পেজ ও কমিউনিটি",
        titleEn: "Campus Pages & Community",
        subtitleBn: "মাভাবিপ্রবির বিভিন্ন সমিতি, হল সংসদ ও ক্যাম্পাস সংগঠনসমূহের অফিসিয়াল পেজ ও সাম্প্রতিক কার্যক্রম।",
        subtitleEn: "Official campus pages and recent updates.",
      },
      {
        key: "notice_board",
        name: "১২. ডিজিটাল নোটিশ বোর্ড",
        visible: true,
        eyebrow: "Digital Notice Board",
        titleBn: "ডিজিটাল নোটিশ বোর্ড",
        titleEn: "Digital Notice Board",
        subtitleBn: "বিশ্ববিদ্যালয়, বিভিন্ন হল, বিভাগ ও মাভাবিপ্রবি রিপোর্টার্স ইউনিটির সর্বশেষ নোটিশসমূহ।",
        subtitleEn: "Latest notices from the university, halls, departments and MBSTURU.",
      },
    ],
    homeNoticesLimit: 5,
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
      { id: "ql-1", labelBn: "হোম", labelEn: "Home", href: "#home", visible: true },
      { id: "ql-2", labelBn: "পরিচিতি", labelEn: "About", href: "#about", visible: true },
      { id: "ql-3", labelBn: "কার্যনির্বাহী পরিষদ", labelEn: "Executive Council", href: "#leadership", visible: true },
      { id: "ql-4", labelBn: "ডিরেক্টর প্যানেল", labelEn: "Director Panel", href: "/council", visible: true },
      { id: "ql-5", labelBn: "ক্যাম্পাস সংবাদ", labelEn: "Campus News", href: "#general-news", visible: true },
      { id: "ql-6", labelBn: "ক্যাম্পাস ক্লাবসমূহ", labelEn: "Campus Clubs", href: "#club-news", visible: true },
      { id: "ql-7", labelBn: "স্টুডেন্ট কর্নার", labelEn: "Student Corner", href: "/student-corner", visible: true },
      { id: "ql-8", labelBn: "নোটিশ", labelEn: "Notices", href: "/notices", visible: true },
      { id: "ql-9", labelBn: "যোগাযোগ", labelEn: "Contact", href: "#contact", visible: true },
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

  const existingMenuIds = new Set((parsed.menu?.items || []).map((i) => i.id))
  const mergedMenuItems = [
    ...(parsed.menu?.items || []),
    ...DEFAULT_SITE_SETTINGS.menu.items.filter((d) => !existingMenuIds.has(d.id)),
  ]

  const existingSectionKeys = new Set((parsed.homeSections?.sections || []).map((s) => s.key))
  const mergedSections = [
    ...(parsed.homeSections?.sections || []),
    ...DEFAULT_SITE_SETTINGS.homeSections.sections.filter((d) => !existingSectionKeys.has(d.key)),
  ]

  return {
    branding: {
      ...DEFAULT_SITE_SETTINGS.branding,
      ...(legacy?.univLogo ? { univLogoUrl: legacy.univLogo } : {}),
      ...(legacy?.univLink ? { univLinkUrl: legacy.univLink } : {}),
      ...(legacy?.univText !== undefined ? { univText: legacy.univText } : {}),
      ...(parsed.branding || {}),
    },
    topBar: {
      ...DEFAULT_SITE_SETTINGS.topBar,
      ...(parsed.topBar || {}),
    },
    menu: {
      items: mergedMenuItems,
      customLinks: parsed.menu?.customLinks || DEFAULT_SITE_SETTINGS.menu.customLinks,
    },
    homeSections: {
      sections: mergedSections,
      homeNoticesLimit:
        parsed.homeSections?.homeNoticesLimit || DEFAULT_SITE_SETTINGS.homeSections.homeNoticesLimit,
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
      quickLinks: parsed.footer?.quickLinks || DEFAULT_SITE_SETTINGS.footer.quickLinks,
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
