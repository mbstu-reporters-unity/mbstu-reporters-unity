import { Mail, MapPin, Phone } from 'lucide-react'
import { navLinks, siteContact } from '@/lib/data'
import { Logo } from './logo'
import { SocialLinks } from './social-links'

export function SiteFooter() {
  return (
    <footer id="contact" className="bg-navy text-white/75">
      <div className="h-1 bg-gradient-to-r from-brand via-gold to-crimson" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo inverted />
          <p className="mt-5 max-w-md text-pretty text-sm leading-relaxed">
            {"MBSTU Reporters' Unity (MBSTURU), formally Mawlana Bhashani Science and Technology University Reporters' Unity, is the organisation of campus journalists at Mawlana Bhashani Science and Technology University, Santosh, Tangail, dedicated to truthful, objective and responsible reporting."}
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed">
            মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় রিপোর্টার্স ইউনিটি (মাভাবিপ্রবি রিপোর্টার্স ইউনিটি) — সত্য, বস্তুনিষ্ঠ ও দায়িত্বশীল ক্যাম্পাস সাংবাদিকতার প্রতিশ্রুতি।
          </p>
          <div className="mt-6">
            <SocialLinks />
          </div>
        </div>

        <nav aria-label="Footer quick links">
          <h2 className="font-serif text-base font-bold text-white">Quick Links</h2>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="transition-colors hover:text-gold">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-serif text-base font-bold text-white">Contact Desk / যোগাযোগ</h2>
          <address className="mt-4 space-y-4 text-sm not-italic">
            <p className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
              <span>{siteContact.address}</span>
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
          {"© 2026 MBSTU Reporters' Unity (MBSTURU) | মাভাবিপ্রবি রিপোর্টার্স ইউনিটি. All Rights Reserved."}
        </p>
      </div>
    </footer>
  )
}
