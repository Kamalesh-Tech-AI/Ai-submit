import React from 'react';
import { Metadata } from 'next';
import { MapPin, Navigation, Bus, Train, Compass, Shield } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import Card from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Venue & Location Details',
  description: 'Find details, map directions, and transit guidance to IITM Research Park in Taramani, Chennai for AI Submit 2026.',
};

export default function VenuePage() {
  const directions = [
    {
      icon: <Train className="w-5 h-5 text-accent-signal" />,
      title: 'By MRTS Train',
      desc: 'Get down at Taramani MRTS Station. The research park is less than 500 meters walking distance from the station entrance.'
    },
    {
      icon: <Bus className="w-5 h-5 text-accent-signal" />,
      title: 'By Bus',
      desc: 'Multiple city buses halt at Taramani / TIDEL Park bus stops. Board any route going towards Tidel Park / SRP Tools.'
    },
    {
      icon: <Compass className="w-5 h-5 text-accent-signal" />,
      title: 'From Airport',
      desc: 'Chennai International Airport (MAA) is approximately 14 km away. A taxi takes 30-45 minutes depending on traffic.'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
      {/* Page Heading */}
      <SectionHeading
        title="VENUE & DIRECTIONS"
        subtitle="AI Submit 2026 will take place in Taramani, Chennai's premier deep-tech research hub."
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 text-left">
        {/* Map and Address */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#D2E0EE] rounded-xl overflow-hidden h-[350px] md:h-[450px] relative shadow-sm">
            {/* Google Maps Iframe */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.4912954848395!2d80.24068947507567!3d12.99101748731388!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a525d57b566e1d7%3A0x633513a968600a9!2sIIT%20Madras%20Research%20Park!5e0!3m2!1sen!2sin!4v1721200000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="IITM Research Park Map"
            />
          </div>

          <div className="flex flex-col md:flex-row justify-between bg-white border border-[#D2E0EE] p-6 rounded-xl gap-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <MapPin className="w-6 h-6 text-[#2563EB] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-display font-bold text-base text-[#002060]">
                  IIT Madras Research Park
                </h4>
                <p className="text-xs md:text-sm text-slate-600 mt-1 leading-relaxed font-semibold">
                  Kanagam Road, Taramani Area, Taramani, Chennai, Tamil Nadu 600113, India
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center md:justify-end">
              <a
                href="https://maps.google.com/?q=IIT+Madras+Research+Park"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-wider font-bold text-[#2563EB] hover:underline"
              >
                <Navigation className="w-4 h-4" />
                <span>Open in Google Maps</span>
              </a>
            </div>
          </div>
        </div>

        {/* Travel Info Sidebar */}
        <div className="space-y-6">
          <Card hoverEffect={false} className="space-y-5 border-[#D2E0EE] bg-white">
            <h4 className="font-display font-bold text-base text-[#002060] border-b border-slate-100 pb-2">
              Getting to the Venue
            </h4>

            {directions.map((dir, idx) => (
              <div key={idx} className="flex space-x-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <div className="bg-[#2563EB]/5 w-9 h-9 border border-[#D2E0EE] rounded flex items-center justify-center shrink-0">
                  {dir.icon}
                </div>
                <div>
                  <h5 className="font-display font-bold text-xs md:text-sm text-[#002060]">
                    {dir.title}
                  </h5>
                  <p className="text-[11px] md:text-xs text-slate-600 mt-1 leading-normal font-sans font-medium">
                    {dir.desc}
                  </p>
                </div>
              </div>
            ))}
          </Card>

          {/* Security & Access Box */}
          <div className="bg-[#002060]/5 border border-[#D2E0EE] p-6 rounded-xl flex items-start space-x-3.5 shadow-sm">
            <Shield className="w-6 h-6 text-[#0B3A82] shrink-0 mt-0.5" />
            <div>
              <h5 className="font-display font-bold text-sm text-[#002060]">
                Entry Pass Notice
              </h5>
              <p className="text-[11px] md:text-xs text-slate-600 mt-1 leading-relaxed font-sans font-medium">
                Make sure you show your personal QR Entry Pass or have your group&apos;s university QR code ready at the door. Registration is free but mandatory for security clearance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
