import React, { useState, useRef, useEffect } from "react";
import { 
  Upload, FileText, Download, Loader2, CheckCircle, AlertCircle, 
  Trash2, Shield, Zap, Layers, MousePointerClick, ArrowRight,
  Twitter, Linkedin, Moon, Sun, Menu, X, ChevronRight,
  Mail, Phone, MapPin, Instagram
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedHtml, setConvertedHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Always set dark mode on mount
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setConvertedHtml(null);
      setUploadProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsConverting(true);
    setError(null);
    setUploadProgress(20);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => (prev < 90 ? prev + 10 : prev));
      }, 200);

      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to convert file");
      }

      const data = await response.json();
      setConvertedHtml(data.html);
    } catch (err: any) {
      setError(err.message);
      setUploadProgress(0);
    } finally {
      setIsConverting(false);
    }
  };

  const downloadPdf = async () => {
    if (!previewRef.current) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${file?.name.split(".")[0] || "converted"}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      setError("Failed to generate PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setConvertedHtml(null);
    setError(null);
    setUploadProgress(0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b bg-slate-950/80 border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-700/20">
                <FileText className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-blue-400">PDF.AI</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              {['Home', 'Features', 'Pricing', 'FAQ', 'Contact'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium hover:text-blue-400 transition-colors">
                  {item}
                </a>
              ))}
            </div>

            <div className="md:hidden flex items-center gap-4">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 w-full z-40 md:hidden border-b bg-slate-950 border-white/10"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {['Home', 'Features', 'Pricing', 'FAQ', 'Contact'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-4 text-base font-medium rounded-md hover:bg-white/5"
                >
                  {item}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight"
          >
            Convert Any File to <br />
            <span className="text-blue-400">PDF Instantly</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto"
          >
            Fast, Secure, and Professional PDF Conversion for everyone. 
            No software installation required.
          </motion.p>

          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              {!convertedHtml ? (
                <motion.div
                  key="upload-box"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="relative"
                >
                  <label className={`
                    flex flex-col items-center justify-center w-full h-80 
                    border-2 border-dashed rounded-3xl cursor-pointer
                    transition-all duration-300
                    ${file ? 'border-blue-600 bg-blue-600/5' : 'border-white/20 hover:border-blue-500 hover:bg-blue-500/5'}
                  `}>
                    <div className="flex flex-col items-center justify-center p-10 text-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors ${file ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400'}`}>
                        <Upload className="w-8 h-8" />
                      </div>
                      <p className="text-xl font-bold mb-2">
                        {file ? file.name : "Choose a file or drag it here"}
                      </p>
                      <p className="text-slate-400 text-sm">
                        Supported: DOCX, XLSX, PPTX, MD, TXT, JPG, PNG
                      </p>
                    </div>
                    <input type="file" className="hidden" onChange={handleFileChange} />
                  </label>

                  {file && !isConverting && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleUpload}
                      className="mt-8 w-full py-5 bg-blue-700 text-white font-bold rounded-2xl hover:bg-blue-800 transition-all shadow-xl shadow-blue-700/20 flex items-center justify-center gap-2 text-lg"
                    >
                      Convert Now <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  )}

                  {isConverting && (
                    <div className="mt-8 w-full space-y-4">
                      <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-blue-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-center gap-3 text-slate-400">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        <span className="font-medium text-sm uppercase tracking-widest">Processing your file...</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="success-box"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-3xl p-10 text-left bg-white/5 border-white/10 shadow-xl"
                >
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                        <CheckCircle className="text-emerald-500 w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="font-bold text-2xl tracking-tight">Success!</h3>
                        <p className="text-slate-400">{file?.name}</p>
                      </div>
                    </div>
                    <button 
                      onClick={reset}
                      className="p-3 rounded-xl transition-colors hover:bg-white/10 text-white/40"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={downloadPdf}
                      disabled={isDownloading}
                      className="py-5 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-lg disabled:opacity-50"
                    >
                      {isDownloading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Download className="w-6 h-6" />
                      )}
                      Download PDF
                    </button>
                    <button
                      onClick={() => {
                        const win = window.open("", "_blank");
                        win?.document.write(`
                          <html>
                            <head>
                              <style>
                                body { font-family: sans-serif; padding: 40px; }
                                table { border-collapse: collapse; width: 100%; }
                                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                                img { max-width: 100%; }
                              </style>
                            </head>
                            <body>${convertedHtml}</body>
                          </html>
                        `);
                        win?.document.close();
                      }}
                      className="py-5 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-lg border bg-white/5 border-white/10 hover:bg-white/10"
                    >
                      Preview HTML
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose PDF.AI?</h2>
            <p className="text-slate-400">The most powerful online conversion tool.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: "Fast Conversion", desc: "Convert your files in seconds with our high-speed engine." },
              { icon: Shield, title: "Secure & Private", desc: "Your files are encrypted and deleted immediately after use." },
              { icon: Layers, title: "Multi-file Support", desc: "Support for Word, Excel, Images, and more." },
              { icon: CheckCircle, title: "High Quality", desc: "Maintain layout and formatting with precision." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl border transition-all bg-slate-950 border-white/10"
              >
                <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="text-blue-600 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="faq" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-slate-400">Three simple steps to your PDF.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-blue-600/10 -translate-y-1/2 z-0" />
            {[
              { icon: Upload, title: "Upload File", desc: "Select any document or image from your device." },
              { icon: MousePointerClick, title: "Convert to PDF", desc: "Our engine processes your file instantly." },
              { icon: Download, title: "Download Instantly", desc: "Get your high-quality PDF in one click." }
            ].map((step, i) => (
              <div key={i} className="relative z-10 text-center">
                <div className="w-20 h-20 bg-blue-700 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-700/20 text-white">
                  <step.icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm max-w-[200px] mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h2>
            <p className="text-slate-400">Have questions? We're here to help.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl border bg-slate-950 border-white/10 text-center"
            >
              <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Mail className="text-blue-600 w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Email</h3>
              <a href="mailto:zeeshanjuttokx@gmail.com" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">
                zeeshanjuttokx@gmail.com
              </a>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl border bg-slate-950 border-white/10 text-center"
            >
              <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Phone className="text-blue-600 w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Phone</h3>
              <p className="text-slate-400 text-sm">03291962899</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl border bg-slate-950 border-white/10 text-center"
            >
              <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Instagram className="text-blue-600 w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Instagram</h3>
              <a href="https://www.instagram.com/zeeshanjutt2005" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">
                @zeeshanjutt2005
              </a>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl border bg-slate-950 border-white/10 text-center"
            >
              <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                <MapPin className="text-blue-600 w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Location</h3>
              <p className="text-slate-400 text-sm">Lahore, Pakistan</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t bg-slate-950 border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                  <FileText className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-blue-400">PDF.AI</span>
              </div>
              <p className="text-slate-400 max-w-sm mb-6">
                The world's most intuitive and secure online file to PDF conversion tool. 
                Trusted by millions of users worldwide.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <a href="mailto:zeeshanjuttokx@gmail.com" className="hover:text-blue-400 transition-colors">zeeshanjuttokx@gmail.com</a>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <Phone className="w-4 h-4 text-blue-400" />
                  <span>03291962899</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>Lahore, Pakistan</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-xs">Product</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#" className="hover:text-blue-400">Features</a></li>
                <li><a href="#" className="hover:text-blue-400">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-400">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-xs">Legal</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#" className="hover:text-blue-400">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-400">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-400">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 gap-6">
            <p className="text-slate-400 text-sm">
              © 2026 PDF.AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/zeeshanjutt2005" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Hidden Preview for PDF Generation */}
      <div className="fixed top-[-9999px] left-[-9999px]">
        <div 
          ref={previewRef} 
          className="bg-white text-black p-10 w-[800px]"
          dangerouslySetInnerHTML={{ __html: convertedHtml || "" }}
        />
      </div>
    </div>
  );
}
