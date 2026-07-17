'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { submitContactForm } from '@/app/actions/contact';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setLoading(true);
    setStatus(null);

    const res = await submitContactForm(formData);

    setLoading(false);
    if (res.success) {
      setStatus({ type: 'success', msg: 'Message sent! Our team will get back to you shortly.' });
      setFormData({ name: '', email: '', message: '' });
    } else {
      setStatus({ type: 'error', msg: res.error || 'Failed to submit form.' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
      {/* Page Heading */}
      <SectionHeading
        title="CONTACT ORGANISERS"
        subtitle="Have questions about registrations, group bookings, or exhibiting student projects? Drop us a line."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 text-left">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card hoverEffect={false} className="p-6 md:p-8 bg-white border-[#D2E0EE] shadow-sm">
            <h3 className="font-display font-black text-base md:text-lg text-[#002060] mb-6">
              Send a Message
            </h3>

            {status && (
              <div
                className={`mb-6 p-4 rounded-xl border flex items-start space-x-3 text-xs md:text-sm font-semibold ${
                  status.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {status.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                )}
                <span>{status.msg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 font-sans">
              <div>
                <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your name"
                  className="w-full bg-slate-50 border border-[#D2E0EE] rounded-lg px-4 py-2.5 text-[#002060] placeholder-[#476282]/50 text-sm focus:outline-none focus:border-[#2563EB] transition-all font-semibold"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="name@university.edu"
                  className="w-full bg-slate-50 border border-[#D2E0EE] rounded-lg px-4 py-2.5 text-[#002060] placeholder-[#476282]/50 text-sm focus:outline-none focus:border-[#2563EB] transition-all font-semibold"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Message Details
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Write your query here..."
                  className="w-full bg-slate-50 border border-[#D2E0EE] rounded-lg px-4 py-2.5 text-[#002060] placeholder-[#476282]/50 text-sm focus:outline-none focus:border-[#2563EB] transition-all resize-none font-semibold"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || !formData.name || !formData.email || !formData.message}
                  className="w-full sm:w-auto px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold h-11"
                >
                  {loading ? 'Sending Message...' : 'Send Message'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Contact Info Sidebar */}
        <div className="space-y-6">
          <Card hoverEffect={false} className="space-y-5 bg-white border-[#D2E0EE] shadow-sm">
            <h3 className="font-display font-bold text-base text-[#002060] border-b border-slate-100 pb-2">
              Organiser Contact
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
              AI Summit 2026 is managed by the engineering and academic curriculum teams at unAi Tech Pvt. Ltd.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start space-x-3 text-xs md:text-sm text-slate-600 font-medium">
                <Mail className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-display font-bold text-xs text-[#002060]">General Inquiries</h5>
                  <p className="font-mono mt-0.5">contact@unaitech.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs md:text-sm text-slate-600 font-medium">
                <Phone className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-display font-bold text-xs text-[#002060]">Phone Support</h5>
                  <p className="font-mono mt-0.5">+91 90439 88697</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs md:text-sm text-slate-600 font-medium">
                <MapPin className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-display font-bold text-xs text-[#002060]">Headquarters</h5>
                  <p className="mt-0.5 font-sans">IITM Research Park, Chennai, India</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
