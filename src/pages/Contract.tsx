import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileText, CheckCircle, ArrowRight, ShieldCheck, Building2 } from "lucide-react"; // Tambah ikon baru
import { Button } from "@/components/ui/button";

const Contract = () => {
  const titip_edar = [
    {
      name: "Single",
      price: "Rp 50.000",
      period: "/lagu",
      description: "Untuk artis pemula yang baru memulai",
      features: [
        "Distribusi ke 100+ platform",
        "1 rilisan per lagu",
        "ISRC & UPC gratis",
        "Dashboard analytics lengkap",
        "Email support",
        "Priority support",
        "Royalty split",
        "Pre-save links",
        "Sistem pembagian royalti 70:30",
      ],
      popular: false
    },
    {
      name: "EP",
      price: "Rp 100.000",
      period: "/EP",
      description: "Untuk artis yang serius berkarir",
      features: [
        "Distribusi ke 100+ platform",
        "4-6 lagu per EP",
        "masimal durasi 20-30 Menit",
        "ISRC & UPC gratis",
        "Dashboard analytics lengkap",
        "Priority support",
        "Royalty split",
        "Pre-save links",
        "Sistem pembagian royalti 70:30",
      ],
      popular: false
    },
    {
      name: "Album",
      price: "Rp 100.000",
      period: "/album",
      description: "Untuk artis yang serius berkarir",
      features: [
        "Distribusi ke 100+ platform",
        "10 Lagu per Album",
        "ISRC & UPC gratis",
        "Dashboard analytics lengkap",
        "Priority support",
        "Royalty split",
        "Pre-save links",
        "Sistem pembagian royalti 70:30",
      ],
      popular: false
    },
    
  ];

  const hak_cipta = [
    {
      name: "Hak Cipta - Digital",
      price: "Rp 100.000",
      period: "/3 tahun",
      description: "Lindungi karya Anda dengan Content ID dan sistem proteksi kami.",
      features: [
        "Perlindungan Content ID di YouTube",
        "Manajemen klaim hak cipta",
        "Laporan analitik pelanggaran",
        "Pemantauan pelanggaran",
        "Integrasi platform distribusi",
        "Sistem pembagian royalti 70:30",
      ],
      popular: false
    },
    {
      name: "Hak Cipta - PDKI",
      price: "Rp 1 Jt",
      period: "/10 tahun",
      description: "Pendaftaran resmi ke pangkalan data kekayaan intelektual.",
      features: [
        "Sertifikat resmi PDKI",
        "Dukungan hukum dasar",
        "Konsultasi ahli hak cipta",
        "Pembaruan reguler",
        "Akses sumber daya edukasi",
        "Sistem pembagian royalti 70:30",
      ],
      popular: false
    },
    {
      name: "Hak Cipta - Direct License",
      price: "Rp 100.000",
      period: "/tahun",
      description: "Lisensi langsung untuk penggunaan komersial yang lebih luas.",
      features: [
        "Lisensi penggunaan publik",
        "Laporan royalti hak cipta",
        "Layanan pelanggan prioritas",
        "Manajemen klaim khusus",
        "Integrasi sistem global",
        "Sistem pembagian royalti 70:30",
      ],
      popular: false
    }
  ];

  const label = [
    {
      name: "Whitelabel Soundpub",
      price: "Rp 300.000",
      period: "/3 tahun",
      description: "Gunakan infrastruktur Soundpub untuk brand Anda sendiri.",
      features: [
        "Manajemen artis tak terbatas",
        "Distribusi ke 100+ platform",
        "ISRC & UPC gratis",
        "Dashboard analytics lengkap",
        "Priority support",
        "Royalty split",
        "Pre-save links",
        "Sistem pembagian royalti 70:30",
      ],
      popular: false
    },
    {
      name: "Custom Dashboard",
      price: "Start From Rp 1.3 Jt",
      description: "Dashboard kustom dengan domain dan brand Anda sendiri.",
      features: [
        "Brand kustom (Whitelabel)",
        "Domain kustom",
        "Akses API khusus",
        "Manajemen user/sub-label",
        // "Kontrol royalti penuh",
        "Sistem pembagian royalti 70:30",
      ],
      popular: false
    },
    {
      name: "Custom + Request",
      price: "Contact Admin",
      description: "Solusi enterprise dengan fitur yang disesuaikan kebutuhan.",
      features: [
        "Semua fitur Custom Dashboard",
        "Request fitur khusus",
        "Server dedicated",
        "Account Manager khusus",
        "Prioritas pengembangan",
        "Sistem pembagian royalti 70:30",
      ],
      popular: false
    }
  ];

  // Reusable Component untuk Card agar kode tidak panjang
  const PricingCard = ({ plan, index }: { plan: any, index: number }) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative bg-card border rounded-2xl p-8 flex flex-col ${
        plan.popular 
          ? 'border-primary shadow-lg shadow-primary/20' 
          : 'border-border/50'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
          Populer
        </div>
      )}
      
      <h3 className="text-xl font-bold font-display mb-2">{plan.name}</h3>
      <div className="mb-4">
        <span className="text-3xl font-bold text-gradient">{plan.price}</span>
        {plan.period && <span className="text-muted-foreground text-sm"> {plan.period}</span>}
      </div>
      <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
      
      <ul className="space-y-3 mb-8 flex-grow">
        {plan.features.map((feature: string, i: number) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
            <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      <Button 
        variant={plan.popular ? "hero" : "outline"} 
        className="w-full gap-2 mt-auto"
      >
        Pilih Paket
        <ArrowRight className="w-4 h-4" />
      </Button>
    </motion.div>
  );

return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Main Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm mb-6">
              <FileText className="w-4 h-4" />
              Layanan Distribusi & Proteksi
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
              <span className="text-gradient">Contract</span> & Pricing
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk merilis, melindungi, dan mengelola label musik Anda.
            </p>
          </motion.div>

          {/* SECTION 1: TITIP EDAR */}
          <section className="mb-24">
            {/* Aku buat Text dan Icon Center To Page ( Untuk HP belum responsif ) */}
            <div className="flex items-center gap-3 mb-10 justify-center text-center">
              <FileText className="text-primary w-6 h-6" />
              <h2 className="text-2xl md:text-3xl font-bold font-display">Titip Edar / Distribusi (Digital Store Platform)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {titip_edar.map((plan, index) => (
                <PricingCard key={index} plan={plan} index={index} />
              ))}
            </div>
          </section>

          {/* SECTION 2: HAK CIPTA */}
          <section className="mb-24">
            {/* Aku buat Text dan Icon Center To Page ( Untuk HP belum responsif ) */}
            <div className="flex items-center gap-3 mb-10 justify-center text-center">
              <ShieldCheck className="text-primary w-6 h-6" />
              <h2 className="text-2xl md:text-3xl font-bold font-display">Perlindungan Hak Cipta</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {hak_cipta.map((plan, index) => (
                <PricingCard key={index} plan={plan} index={index} />
              ))}
            </div>
          </section>

          {/* SECTION 3: LABEL / WHITELABEL */}
          <section className="mb-24">
            {/* Aku buat Text dan Icon Center To Page ( Untuk HP belum responsif ) */}
            <div className="flex items-center gap-3 mb-10 justify-center text-center">
              <Building2 className="text-primary w-6 h-6" />
              <h2 className="text-2xl md:text-3xl font-bold font-display">Layanan Whitelabel (Label)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {label.map((plan, index) => (
                <PricingCard key={index} plan={plan} index={index} />
              ))}
            </div>
          </section>

          {/* FAQ Note */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center text-muted-foreground mt-20 p-8 border-t border-border/50"
          >
            <p className="text-lg">Punya kebutuhan khusus atau volume besar?</p>
            <a href="/kolaborasi" className="text-primary font-bold hover:underline flex items-center justify-center gap-2 mt-2">
              Hubungi Tim Sales Kami <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contract;