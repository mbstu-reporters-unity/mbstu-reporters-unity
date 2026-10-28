export const navLinks = [
  { label: 'Home', bn: 'হোম', href: '#home' },
  { label: 'About', bn: 'পরিচিতি', href: '#about' },
  { label: 'Leadership', bn: 'নেতৃত্ব', href: '#leadership' },
  { label: 'General News', bn: 'সাধারণ সংবাদ', href: '#general-news' },
  { label: 'Club News', bn: 'ক্লাব নিউজ', href: '#club-news' },
  { label: 'Student Corner', bn: 'স্টুডেন্ট কর্নার', href: '#student-corner' },
  { label: 'Notices', bn: 'নোটিশ', href: '#notices' },
  { label: 'Contact', bn: 'যোগাযোগ', href: '#contact' },
]

export const socialLinks = [
  { name: 'Facebook', slug: 'facebook', href: 'https://facebook.com' },
  { name: 'YouTube', slug: 'youtube', href: 'https://youtube.com' },
  { name: 'X (Twitter)', slug: 'x', href: 'https://x.com' },
  { name: 'LinkedIn', slug: 'linkedin', href: 'https://linkedin.com' },
  { name: 'Instagram', slug: 'instagram', href: 'https://instagram.com' },
]

export const tickerHeadlines = [
  'মাভাবিপ্রবিতে আন্তর্জাতিক বিজ্ঞান সম্মেলন আগামী মাসে শুরু',
  'MBSTU launches new central research facility for biotechnology',
  'কেন্দ্রীয় গ্রন্থাগার এখন রাত ১০টা পর্যন্ত খোলা থাকবে',
  'Reporters’ Unity hosts campus journalism workshop for first-year students',
  'আন্তঃবিভাগ ক্রিকেট টুর্নামেন্টে চ্যাম্পিয়ন সিএসই বিভাগ',
  'Admission test results for the 2026–27 session published',
  'ক্যাম্পাসে বৃক্ষরোপণ কর্মসূচির উদ্বোধন করলেন উপাচার্য',
]

export const heroSlides = [
  {
    image: '/images/hero-1.png',
    category: 'CAMPUS NEWS',
    date: '28 October 2026',
    title: 'সবুজ ক্যাম্পাসে নতুন একাডেমিক ভবনের কাজ শুরু',
    summary:
      'Construction begins on a new ten-storey academic building that will house modern classrooms, smart labs and a dedicated media centre for students.',
    alt: 'Green MBSTU campus with the administrative building and students walking',
  },
  {
    image: '/images/hero-2.png',
    category: 'WORKSHOP',
    date: '25 October 2026',
    title: 'Campus Journalism Workshop draws 200+ aspiring reporters',
    summary:
      'মাভাবিপ্রবি রিপোর্টার্স ইউনিটির আয়োজনে দিনব্যাপী ক্যাম্পাস সাংবাদিকতা কর্মশালায় অংশ নেন বিভিন্ন বিভাগের শিক্ষার্থীরা।',
    alt: 'Journalism workshop in a seminar hall with students taking notes',
  },
  {
    image: '/images/hero-3.png',
    category: 'RESEARCH',
    date: '21 October 2026',
    title: 'বায়োটেকনোলজি গবেষকদের যুগান্তকারী আবিষ্কার',
    summary:
      'A team from the Department of Biotechnology & Genetic Engineering has published findings on salt-tolerant rice varieties in an international journal.',
    alt: 'Students in lab coats working with microscopes in a research lab',
  },
  {
    image: '/images/hero-4.png',
    category: 'CULTURE',
    date: '18 October 2026',
    title: 'Colourful evening as Cultural Club celebrates Autumn Festival',
    summary:
      'শরৎ উৎসবে গান, নাচ ও আবৃত্তিতে মুখর ছিল মুক্তমঞ্চ। হাজারো শিক্ষার্থীর উপস্থিতিতে উৎসবমুখর পরিবেশ তৈরি হয়।',
    alt: 'Students performing on an outdoor stage at a cultural festival',
  },
]

export const leaders = [
  {
    role: 'President',
    roleBn: 'সভাপতি',
    name: 'Md. Rakibul Hasan',
    dept: 'Dept. of Criminology & Police Science',
    initials: 'RH',
    message:
      'সত্য ও বস্তুনিষ্ঠ সংবাদ পরিবেশনই আমাদের অঙ্গীকার। মাভাবিপ্রবি রিপোর্টার্স ইউনিটি ক্যাম্পাসের প্রতিটি কণ্ঠস্বরকে তুলে ধরতে কাজ করে যাচ্ছে। We believe responsible campus journalism builds a more transparent and engaged university community.',
  },
  {
    role: 'General Secretary',
    roleBn: 'সাধারণ সম্পাদক',
    name: 'Nusrat Jahan Mim',
    dept: 'Dept. of English',
    initials: 'NJ',
    message:
      'Our reporters work every day to bring verified, timely and fair news from every corner of MBSTU. শিক্ষার্থী, শিক্ষক ও প্রশাসনের মধ্যে সেতুবন্ধন তৈরি করাই আমাদের লক্ষ্য। Join us in telling the stories that matter.',
  },
]

export const stats = [
  { label: 'Founded', bn: 'প্রতিষ্ঠা', value: '2026', icon: 'calendar' },
  { label: 'Active Reporters', bn: 'সক্রিয় রিপোর্টার', value: '25+', icon: 'users' },
  { label: 'University Coverage', bn: 'বিশ্ববিদ্যালয় কভারেজ', value: '100%', icon: 'globe' },
  { label: 'Daily Reports', bn: 'প্রতিদিনের প্রতিবেদন', value: '24/7', icon: 'newspaper' },
] as const

export const generalNews = [
  {
    image: '/images/news-1.png',
    alt: 'Students reading in the university central library',
    category: 'Academic',
    title: 'কেন্দ্রীয় গ্রন্থাগারে যুক্ত হলো ৫ হাজার নতুন বই ও ই-জার্নাল',
    excerpt:
      'The central library has added 5,000 new titles and full access to international e-journal databases for all students.',
    date: '27 Oct 2026',
    readTime: '3 min read',
    author: 'Tanvir Ahmed',
  },
  {
    image: '/images/news-2.png',
    alt: 'Students planting saplings on campus',
    category: 'Environment',
    title: 'Green Campus drive: 1,000 saplings planted in a single day',
    excerpt:
      'শিক্ষার্থী ও শিক্ষকদের অংশগ্রহণে ক্যাম্পাসজুড়ে বৃক্ষরোপণ কর্মসূচি পালিত হয়েছে, যা পরিবেশ রক্ষায় নতুন দৃষ্টান্ত।',
    date: '24 Oct 2026',
    readTime: '2 min read',
    author: 'Sadia Islam',
  },
  {
    image: '/images/news-3.png',
    alt: 'Students playing cricket on the university ground',
    category: 'Sports',
    title: 'আন্তঃবিভাগ ক্রিকেটে টানা দ্বিতীয়বার চ্যাম্পিয়ন সিএসই',
    excerpt:
      'The Department of CSE defended its inter-department cricket title in a thrilling final that went down to the last over.',
    date: '20 Oct 2026',
    readTime: '4 min read',
    author: 'Arif Hossain',
  },
]

export const studentFeatured = {
  image: '/images/student-1.png',
  alt: 'Student presenting a research poster at a conference',
  type: 'Research Highlight',
  title: 'Undergrad researcher wins best poster award at national science summit',
  excerpt:
    'ফার্মেসি বিভাগের শিক্ষার্থী ফারহানা আক্তার জাতীয় বিজ্ঞান সম্মেলনে ঔষধি উদ্ভিদ নিয়ে তার গবেষণার জন্য সেরা পোস্টার পুরস্কার জিতেছেন।',
  author: 'Farhana Akter',
  dept: 'Pharmacy',
  batch: '18th Batch',
}

export const studentPosts = [
  {
    type: 'Opinion',
    title: 'ক্যাম্পাসে আবাসন সংকট: সমাধান কোন পথে?',
    author: 'Mahmudul Hasan',
    dept: 'Economics',
    batch: '17th Batch',
  },
  {
    type: 'Creative Writing',
    title: 'Poem: The Rain Over Santosh',
    author: 'Ishrat Jahan',
    dept: 'English',
    batch: '19th Batch',
  },
  {
    type: 'Achievement',
    title: 'আইসিপিসি ঢাকা রিজিওনালে মাভাবিপ্রবির তিন দলের সাফল্য',
    author: 'Rafsan Chowdhury',
    dept: 'CSE',
    batch: '16th Batch',
  },
  {
    type: 'Opinion',
    title: 'Why every student should learn basic media literacy',
    author: 'Tasnim Rahman',
    dept: 'Criminology',
    batch: '18th Batch',
  },
]

export const clubNews = [
  {
    club: 'Debating Society',
    clubBn: 'বিতর্ক সংঘ',
    icon: 'mic',
    title: 'আন্তঃবিশ্ববিদ্যালয় বিতর্ক প্রতিযোগিতায় রানার্সআপ',
    summary: 'MBSTU Debating Society finished runner-up at the National Inter-University Debate Festival.',
    date: '26 Oct 2026',
  },
  {
    club: 'IT Society',
    clubBn: 'আইটি সোসাইটি',
    icon: 'cpu',
    title: 'Hackathon 2026: 40 teams build for social good',
    summary: '২৪ ঘণ্টার হ্যাকাথনে শিক্ষার্থীরা কৃষি ও স্বাস্থ্যসেবা বিষয়ক উদ্ভাবনী সমাধান তৈরি করেন।',
    date: '23 Oct 2026',
  },
  {
    club: 'Cultural Club',
    clubBn: 'সাংস্কৃতিক সংগঠন',
    icon: 'music',
    title: 'শরৎ উৎসবে মুখর মুক্তমঞ্চ',
    summary: 'The Autumn Festival featured folk music, dance and recitation performances by 150 students.',
    date: '18 Oct 2026',
  },
  {
    club: 'Rover Scout',
    clubBn: 'রোভার স্কাউট',
    icon: 'tent',
    title: 'Rover Scouts organise free blood grouping camp',
    summary: 'রোভার স্কাউট গ্রুপের উদ্যোগে ৫০০ জনের বিনামূল্যে রক্তের গ্রুপ নির্ণয় করা হয়।',
    date: '15 Oct 2026',
  },
  {
    club: 'Photographic Society',
    clubBn: 'আলোকচিত্র সংসদ',
    icon: 'camera',
    title: 'আলোকচিত্র প্রদর্শনী “ক্যাম্পাসের রং”',
    summary: 'A week-long exhibition showcased 120 photographs capturing everyday life at MBSTU.',
    date: '12 Oct 2026',
  },
] as const

export const notices = [
  {
    day: '28',
    month: 'Oct',
    ref: 'MBSTU-RU/2026/014',
    title: 'নতুন সদস্য সংগ্রহ বিজ্ঞপ্তি — রিপোর্টার পদে আবেদন আহ্বান',
    titleEn: 'Call for applications: New reporter recruitment 2026',
  },
  {
    day: '22',
    month: 'Oct',
    ref: 'MBSTU-RU/2026/013',
    title: 'Press Release: Statement on campus safety and student welfare',
    titleEn: 'প্রেস বিজ্ঞপ্তি: ক্যাম্পাস নিরাপত্তা ও শিক্ষার্থী কল্যাণ বিষয়ে বিবৃতি',
  },
  {
    day: '15',
    month: 'Oct',
    ref: 'MBSTU-RU/2026/012',
    title: 'সাধারণ সভা আহ্বান — কার্যনির্বাহী কমিটির ত্রৈমাসিক সভা',
    titleEn: 'Notice of quarterly executive committee general meeting',
  },
  {
    day: '08',
    month: 'Oct',
    ref: 'MBSTU-RU/2026/011',
    title: 'Code of Conduct for campus reporters (revised edition)',
    titleEn: 'ক্যাম্পাস রিপোর্টারদের আচরণবিধি (সংশোধিত সংস্করণ)',
  },
]
