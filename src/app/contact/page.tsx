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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card hoverEffect={false} className="p-6 md:p-8">
            <h3 className="font-display font-bold text-base md:text-lg text-text-primary mb-6">
              Send a Message
            </h3>

            {status && (
              <div
                className={`mb-6 p-4 rounded-md border flex items-start space-x-3 text-xs md:text-sm ${
                  status.type === 'success'
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/5 border-red-500/20 text-red-400'
                }`}
              >
                {status.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0" />
                )}
                <span>{status.msg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 font-sans">
              <div>
                <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className="w-full bg-ink border border-border-card rounded-md px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent-signal transition-all"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
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
                  className="w-full bg-ink border border-border-card rounded-md px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent-signal transition-all"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="How can we help you?"
                  className="w-full bg-ink border border-border-card rounded-md px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent-signal transition-all resize-none"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={loading || !formData.name || !formData.email || !formData.message}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card hoverEffect={false} className="space-y-5">
            <h4 className="font-display font-bold text-base text-text-primary">
              Contact Details
            </h4>
            <p className="text-xs text-text-muted leading-relaxed font-sans">
              AI Submit 2026 is managed by the engineering and academic curriculum teams at UNAI Tech.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start space-x-3 text-xs md:text-sm text-text-muted">
                <Mail className="w-5 h-5 text-accent-signal shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-display font-bold text-xs text-text-primary">General Inquiries</h5>
                  <p className="font-mono mt-0.5">hello@unaitech.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs md:text-sm text-text-muted">
                <Phone className="w-5 h-5 text-accent-signal shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-display font-bold text-xs text-text-primary">Phone Support</h5>
                  <p className="font-mono mt-0.5">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs md:text-sm text-text-muted">
                <MapPin className="w-5 h-5 text-accent-signal shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-display font-bold text-xs text-text-primary">Headquarters</h5>
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
