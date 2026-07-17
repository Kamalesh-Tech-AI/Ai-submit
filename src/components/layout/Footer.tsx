import React from 'react';
import Link from 'next/link';
import { Cpu, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#D2E0EE] py-12 md:py-16 text-[#002060]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Logo & Description */}
          <div className="md:col-span-2 flex flex-col space-y-4 text-left">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-8.5 h-8.5 rounded-md bg-[#2563EB] flex items-center justify-center shadow-md shadow-[#2563EB]/15">
                <Cpu className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-display font-black text-lg tracking-wider text-[#002060]">
                AI SUBMIT <span className="text-[#2563EB]">2026</span>
              </span>
            </Link>
            <p className="text-[#476282] text-sm max-w-sm leading-relaxed font-medium">
              Organised by <span className="text-[#002060] font-bold">unAi Tech Pvt. Ltd.</span>, an AI engineering and EdTech company based in Chennai. We are dedicated to architecting autonomous systems and building practical AI and engineering skills in students.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-[#476282] hover:text-[#2563EB] transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[#476282] hover:text-[#2563EB] transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-[#476282] hover:text-[#2563EB] transition-colors" aria-label="YouTube">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-left">
            <h4 className="font-display text-sm font-bold tracking-wider text-[#002060] uppercase mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="text-[#476282] hover:text-[#002060] font-semibold transition-colors">
                  About Event
                </Link>
              </li>
              <li>
                <Link href="/chief-guests" className="text-[#476282] hover:text-[#002060] font-semibold transition-colors">
                  Chief Guests & Speakers
                </Link>
              </li>
              <li>
                <Link href="/agenda" className="text-[#476282] hover:text-[#002060] font-semibold transition-colors">
                  Conference Agenda
                </Link>
              </li>
              <li>
                <Link href="/venue" className="text-[#476282] hover:text-[#002060] font-semibold transition-colors">
                  Venue & Travel Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="text-left">
            <h4 className="font-display text-sm font-bold tracking-wider text-[#002060] uppercase mb-4">
              Get in Touch
            </h4>
            <ul className="space-y-3 text-sm text-[#476282] font-semibold">
              <li className="flex items-start space-x-2.5">
                <Mail className="w-4.5 h-4.5 text-[#2563EB] shrink-0 mt-0.5" />
                <span className="break-all">contact@unaitech.com</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <Phone className="w-4.5 h-4.5 text-[#2563EB] shrink-0 mt-0.5" />
                <span>+91 90439 88697</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4.5 h-4.5 text-[#2563EB] shrink-0 mt-0.5" />
                <span>IITM Research Park, Taramani, Chennai, TN, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#D2E0EE] mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-[#476282] font-medium">
          <p>© {new Date().getFullYear()} UNAI Tech. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/contact" className="hover:text-[#002060] transition-colors font-bold">
              Contact Us
            </Link>
            <span className="text-[#D2E0EE]">|</span>
            <span className="hover:text-[#002060] cursor-default font-bold">AI Submit 2026 Chennai</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
