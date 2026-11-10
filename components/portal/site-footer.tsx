import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'
import { navLinks, siteContact } from '@/lib/data'
import { Logo } from './logo'
import { SocialLinks } from './social-links'
import { Tx } from '@/lib/i18n'

export function SiteFooter() {
  return (
    <footer id="contact" className="bg-navy text-white/75">
      <div className="h-1 bg-gradient-to-r from-brand via-gold to-crimson" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo inverted />
          <p className="mt-5 max-w-md text-pretty text-sm leading-relaxed">
            <Tx
              bn="মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় রিপোর্টার্স ইউনিটি (মাভাবিপ্রবি রিপোর্টার্স ইউনিটি) — সত্য, বস্তুনিষ্ঠ ও দায়িত্বশীল ক্যাম্পাস সাংবাদিকতার প্রতিশ্রুতি।"
              en="MBSTU Reporters' Unity (MBSTURU), formally Mawlana Bhashani Science and Technology University Reporters' Unity, is the organisation of campus journalists at Mawlana Bhashani Science and Technology University, Santosh, Tangail, dedicated to truthful, objective and responsible reporting."
            />
          </p>
          <div className="mt-6">
            <SocialLinks />
          </div>
        </div>

        <nav aria-label="Footer quick links">
          <h2 className="font-serif text-base font-bold text-white"><Tx bn="দ্রুত লিংক" en="Quick Links" /></h2>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-1">
            {navLinks.map((link) => {
              // হ্যাশ লিংক হলে অন্য যেকোনো পেজ থেকেও যাতে হোমপেজে মসৃণভাবে যায়
              const targetHref = link.href.startsWith('#') ? `/${link.href}` : link.href
              return (
                <li key={link.href}>
                  <Link href={targetHref} className="transition-colors hover:text-gold cursor-pointer">
                    <Tx bn={link.bn} en={link.label} />
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div>
          <h2 className="font-serif text-base font-bold text-white"><Tx bn="যোগাযোগ" en="Contact Desk" /></h2>
          <address className="mt-4 space-y-4 text-sm not-italic">
            <p className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
              <span>
                <Tx bn="কক্ষ ২১৪, ছাত্র কল্যাণ / প্রশাসনিক ভবন, মাভাবিপ্রবি, সন্তোষ, টাঙ্গাইল-১৯০২" en={siteContact.address} />
              </span>
            </p>
            <p className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
              <a href={`tel:${siteContact.phone.replace(/[^+\d]/g, '')}`} className="hover:text-gold">
                {siteContact.phone}
              </a>
            </p>
            <p className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
              <a href={`mailto:${siteContact.email}`} className="break-all hover:text-gold">
                {siteContact.email}
              </a>
            </p>
          </address>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-white/55">
          <Tx
            bn="© ২০২৬ মাভাবিপ্রবি রিপোর্টার্স ইউনিটি (MBSTURU)। সর্বস্বত্ব সংরক্ষিত।"
            en="© 2026 MBSTU Reporters' Unity (MBSTURU). All Rights Reserved."
          />
        </p>
      </div>
    </footer>
  )
}
