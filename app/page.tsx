import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";
import PublicEnquiryForm from "@/components/PublicEnquiryForm";
import ThemeToggle from "@/components/ThemeToggle";
import { 
  Compass, 
  Plane, 
  Hotel, 
  PhoneCall, 
  Mail, 
  MapPin, 
  ArrowRight,
  UserCheck
} from "lucide-react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  let packages: any[] = [];
  let hotels: any[] = [];
  let flights: any[] = [];
  const settings: Record<string, string> = {};

  try {
    packages = await prisma.package.findMany({
      where: { isPublic: true, isActive: true },
      orderBy: { id: "desc" },
      take: 9,
    });

    hotels = await prisma.hotel.findMany({
      where: { isPublic: true },
      orderBy: { id: "desc" },
      take: 8,
    });

    flights = await prisma.flight.findMany({
      where: { publicNotice: true },
      orderBy: { departureAt: "asc" },
      take: 8,
    });

    const settingsArr = await prisma.setting.findMany();
    settingsArr.forEach((s) => (settings[s.key] = s.value));
  } catch (error) {
    console.error("Database error on home page:", error);
  }

  const companyName = settings.company_name || "Karvan e Fatima Travel & Tour (Pvt) Ltd.";
  const tagline = settings.public_tagline || "سفر آسان، عبادت خوشگوار — Your Pilgrimage & Travel Partner.";
  const phone = settings.phone || "03169860577";
  const email = settings.email || "karvanefatima@gmail.com";
  const address = settings.address || "Basharat Market Phase #3 Hayatabad, Peshawar";
  const currency = settings.currency || "PKR";

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans transition-colors">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 group-hover:scale-105 transition-transform">
              <Image src="/logo.png" alt="Karvan e Fatima Logo" fill className="object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg text-white tracking-tight block leading-snug">Karvan e Fatima</span>
              <span className="text-xs text-amber-400 font-medium tracking-wider uppercase">Travel & Tour (Pvt) Ltd.</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#home" className="hover:text-amber-400 transition-colors">Home</a>
            <a href="#packages" className="hover:text-amber-400 transition-colors">Packages</a>
            <a href="#services" className="hover:text-amber-400 transition-colors">Services</a>
            <a href="#hotels" className="hover:text-amber-400 transition-colors">Hotels</a>
            <a href="#flights" className="hover:text-amber-400 transition-colors">Flights</a>
            <a href="#contact" className="hover:text-amber-400 transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            >
              <UserCheck className="w-4 h-4" />
              Staff Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,169,28,0.15),rgba(255,255,255,0))]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
          <div className="relative w-48 h-36 mb-4">
            <Image src="/logo.png" alt="Karvan e Fatima Logo" fill className="object-contain" priority />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4">
            <Compass className="w-3.5 h-3.5" />
            KARVAN E FATIMA TRAVEL & TOUR (PVT) LTD.
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
            {tagline}
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Hajj, Umrah, international air tickets, hotel accommodations, visa processing and complete pilgrim group management with dedicated customer support.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#packages"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 transition-all hover:-translate-y-0.5 inline-flex items-center gap-2"
            >
              View Packages
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#contact"
              className="px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold border border-slate-700 transition-all hover:-translate-y-0.5"
            >
              Send Enquiry
            </a>
          </div>
        </div>
      </section>

      {/* Public Hajj & Umrah Packages */}
      <section id="packages" className="py-20 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">HAJJ & UMRAH</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Featured Packages</h2>
            <p className="text-slate-400 mt-3">Choose from our verified pilgrimage travel options with transparent details.</p>
          </div>

          {packages.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center max-w-md mx-auto">
              <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">Packages coming soon</h3>
              <p className="text-sm text-slate-400 mt-1">Contact our office for current Hajj and Umrah package schedules.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packages.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between p-6 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {p.packageType}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{p.days} Days</span>
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors mb-2">
                      {p.name}
                    </h3>

                    <div className="text-2xl font-black text-amber-400 mb-4">
                      {formatMoney(p.price, currency)}
                    </div>

                    <p className="text-sm text-slate-400 line-clamp-3 mb-6">
                      {p.publicDescription || p.inclusions || "Complete package with accommodation, visa support, and transfers."}
                    </p>

                    <div className="space-y-2 text-xs text-slate-300 mb-6 border-t border-slate-800 pt-4">
                      {p.airline && (
                        <div className="flex items-center gap-2">
                          <Plane className="w-3.5 h-3.5 text-amber-400" />
                          <span>Airline: {p.airline}</span>
                        </div>
                      )}
                      {p.makkahHotel && (
                        <div className="flex items-center gap-2">
                          <Hotel className="w-3.5 h-3.5 text-amber-400" />
                          <span>Makkah: {p.makkahHotel}</span>
                        </div>
                      )}
                      {p.madinahHotel && (
                        <div className="flex items-center gap-2">
                          <Hotel className="w-3.5 h-3.5 text-amber-400" />
                          <span>Madinah: {p.madinahHotel}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <a
                    href="#contact"
                    className="w-full py-3 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white font-semibold text-sm text-center transition-colors block"
                  >
                    Request Details & Booking →
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-20 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">SERVICES</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">What We Can Arrange</h2>
            <p className="text-slate-400 mt-3">End-to-end travel management and pilgrim assistance.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-2xl font-bold mb-4">
                🕋
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Hajj & Umrah</h3>
              <p className="text-sm text-slate-400">Customized & group packages, group leader management, family support.</p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-2xl font-bold mb-4">
                ✈️
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Air Tickets</h3>
              <p className="text-sm text-slate-400">International flight bookings, schedule changes, and group reservations.</p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-2xl font-bold mb-4">
                🏨
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Hotels</h3>
              <p className="text-sm text-slate-400">Prime accommodation near Haram in Makkah and Madinah.</p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-2xl font-bold mb-4">
                📄
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Visa Support</h3>
              <p className="text-sm text-slate-400">Visa document preparation, application tracking, and biometric assistance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Published Hotels & Flight Notices */}
      <section id="hotels" className="py-20 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Hotels */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">ACCOMMODATION</span>
                <h2 className="text-2xl font-bold text-white mt-1">Public Hotel Directory</h2>
              </div>
            </div>

            {hotels.length === 0 ? (
              <p className="text-slate-500 italic">No hotel notices published at this time.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.map((h) => (
                  <div key={h.id} className="bg-slate-900 p-5 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded">
                        {h.city}
                      </span>
                      {h.distance && <span className="text-xs text-slate-400">{h.distance}</span>}
                    </div>
                    <h3 className="text-lg font-bold text-white mt-3">{h.name}</h3>
                    {h.notes && <p className="text-xs text-slate-400 mt-2">{h.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Flights */}
          <div id="flights" className="pt-8 border-t border-slate-900">
            <div className="mb-8">
              <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">TRAVEL NOTICES</span>
              <h2 className="text-2xl font-bold text-white mt-1">Flight Information</h2>
            </div>

            {flights.length === 0 ? (
              <p className="text-slate-500 italic">No flight notices published at this time.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {flights.map((f) => (
                  <div key={f.id} className="bg-slate-900 p-5 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                      <Plane className="w-4 h-4" />
                      <span>{f.airline} {f.flightNo}</span>
                    </div>
                    <p className="text-sm font-semibold text-white mt-2">
                      {f.origin} → {f.destination}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Departure: {f.departureAt || 'TBA'}</p>
                    {f.baggage && <p className="text-xs text-amber-500/80 mt-1">Baggage: {f.baggage}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact & Enquiry Form Section */}
      <section id="contact" className="py-20 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">GET IN TOUCH</span>
                <h2 className="text-3xl font-extrabold text-white mt-2">Send Us an Enquiry</h2>
                <p className="text-slate-400 mt-3">
                  Have questions about Hajj, Umrah, air tickets, or visa documentation? Reach out directly to our team.
                </p>
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Office Address</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Phone / WhatsApp</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Email Address</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-slate-950 p-8 rounded-2xl border border-slate-800 shadow-xl">
              <PublicEnquiryForm />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <Image src="/logo.png" alt="Karvan e Fatima Logo" fill className="object-contain" />
            </div>
            <span className="font-semibold text-slate-300">{companyName}</span>
          </div>
          <p>© {new Date().getFullYear()} {companyName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
