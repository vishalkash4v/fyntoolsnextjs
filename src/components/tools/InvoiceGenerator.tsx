'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Plus, Trash2, Download, Printer, FileImage,
  Check, ChevronRight, ChevronLeft, Pencil, Upload, X
} from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QRCodeSVG } from 'qrcode.react';

interface UserInfo {
  companyName: string;
  address: string;
  email: string;
  phone: string;
  taxId: string;
  logo: string;
  upiId: string;
}

interface ClientInfo {
  name: string;
  email: string;
  address: string;
}

interface SavedProduct {
  id: string;
  description: string;
  unitPrice: number;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface PageSize {
  name: string;
  width: number;
  height: number;
}

const PAGE_SIZES: PageSize[] = [
  { name: 'A4', width: 210, height: 297 },
  { name: 'Letter', width: 216, height: 279 },
  { name: 'Legal', width: 216, height: 356 },
  { name: 'A3', width: 297, height: 420 },
];

type TemplateType = 'modern' | 'classic' | 'minimal' | 'professional' | 'colorful' | 'elegant' | 'corporate' | 'creative' | 'clean' | 'luxury';

const TEMPLATE_INFO: { name: TemplateType; label: string; accent: string }[] = [
  { name: 'modern', label: 'Modern', accent: 'bg-blue-600' },
  { name: 'classic', label: 'Classic', accent: 'bg-gray-700' },
  { name: 'minimal', label: 'Minimal', accent: 'bg-gray-400' },
  { name: 'professional', label: 'Professional', accent: 'bg-gray-900' },
  { name: 'colorful', label: 'Colorful', accent: 'bg-gradient-to-r from-purple-600 to-pink-500' },
  { name: 'elegant', label: 'Elegant', accent: 'bg-amber-600' },
  { name: 'corporate', label: 'Corporate', accent: 'bg-slate-700' },
  { name: 'creative', label: 'Creative', accent: 'bg-teal-500' },
  { name: 'clean', label: 'Clean', accent: 'bg-gray-300' },
  { name: 'luxury', label: 'Luxury', accent: 'bg-indigo-600' },
];

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
];

const STEPS = [
  { id: 1, label: 'Business' },
  { id: 2, label: 'Products' },
  { id: 3, label: 'Client' },
  { id: 4, label: 'Invoice' },
  { id: 5, label: 'Preview' },
];

const InvoiceGenerator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [highestStep, setHighestStep] = useState(1);

  const [userInfo, setUserInfo] = useState<UserInfo>({
    companyName: '', address: '', email: '', phone: '', taxId: '', logo: '', upiId: ''
  });
  const [clientInfo, setClientInfo] = useState<ClientInfo>({ name: '', email: '', address: '' });
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);
  const [savedClients, setSavedClients] = useState<ClientInfo[]>([]);
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductPrice, setNewProductPrice] = useState<number | string>('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editProductDesc, setEditProductDesc] = useState('');
  const [editProductPrice, setEditProductPrice] = useState<number | string>('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [taxRate, setTaxRate] = useState(18);
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern');
  const [pageSize, setPageSize] = useState<PageSize>(PAGE_SIZES[0]);

  const invoiceRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const u = localStorage.getItem('invoiceUserInfo');
    const p = localStorage.getItem('invoiceSavedProducts');
    const cl = localStorage.getItem('invoiceSavedClients');
    const cur = localStorage.getItem('invoiceCurrency');
    if (u) { try { setUserInfo(JSON.parse(u)); } catch {} }
    if (p) {
      try {
        const products: SavedProduct[] = JSON.parse(p);
        setSavedProducts(products.map((pr, i) => ({ ...pr, id: pr.id || `p-${i}-${Date.now()}` })));
      } catch {}
    }
    if (cl) { try { setSavedClients(JSON.parse(cl)); } catch {} }
    if (cur) {
      const found = CURRENCIES.find(c => c.code === cur);
      if (found) setCurrency(found);
    }
    setInvoiceNumber(`INV-${Date.now().toString().slice(-6)}`);
  }, []);

  useEffect(() => {
    if (userInfo.companyName || userInfo.email) localStorage.setItem('invoiceUserInfo', JSON.stringify(userInfo));
  }, [userInfo]);
  useEffect(() => {
    localStorage.setItem('invoiceSavedProducts', JSON.stringify(savedProducts));
  }, [savedProducts]);
  useEffect(() => {
    localStorage.setItem('invoiceSavedClients', JSON.stringify(savedClients));
  }, [savedClients]);
  useEffect(() => {
    localStorage.setItem('invoiceCurrency', currency.code);
  }, [currency]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUserInfo(prev => ({ ...prev, logo: ev.target?.result as string }));
      toast.success('Logo uploaded!');
    };
    reader.readAsDataURL(file);
  };

  const addProduct = () => {
    if (!newProductDesc.trim()) { toast.error('Enter a product name'); return; }
    const price = Number(newProductPrice) || 0;
    if (price <= 0) { toast.error('Enter a valid price'); return; }
    setSavedProducts(prev => [...prev, { id: Date.now().toString(), description: newProductDesc.trim(), unitPrice: price }]);
    setNewProductDesc('');
    setNewProductPrice('');
    toast.success('Product added!');
  };

  const removeProduct = (id: string) => {
    setSavedProducts(prev => prev.filter(p => p.id !== id));
  };

  const startEditProduct = (product: SavedProduct) => {
    setEditingProductId(product.id);
    setEditProductDesc(product.description);
    setEditProductPrice(product.unitPrice);
  };

  const saveEditProduct = () => {
    if (!editingProductId) return;
    if (!editProductDesc.trim()) { toast.error('Enter a product name'); return; }
    const price = Number(editProductPrice) || 0;
    if (price <= 0) { toast.error('Enter a valid price'); return; }
    const oldProduct = savedProducts.find(p => p.id === editingProductId);
    setSavedProducts(prev => prev.map(p => p.id === editingProductId ? { ...p, description: editProductDesc.trim(), unitPrice: price } : p));
    if (oldProduct) {
      setItems(prev => prev.map(i => i.description === oldProduct.description ? { ...i, description: editProductDesc.trim(), unitPrice: price } : i));
    }
    setEditingProductId(null);
    toast.success('Product updated!');
  };

  const cancelEditProduct = () => {
    setEditingProductId(null);
  };

  const addProductToInvoice = (product: SavedProduct) => {
    if (items.some(i => i.description === product.description)) { toast.info('Already added'); return; }
    setItems(prev => [...prev, { id: Date.now().toString(), description: product.description, quantity: 1, unitPrice: product.unitPrice }]);
  };

  const addCustomItem = () => {
    setItems(prev => [...prev, { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }]);
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const saveClient = () => {
    if (!clientInfo.name.trim()) { toast.error('Enter a client name'); return; }
    const exists = savedClients.some(c => c.name === clientInfo.name && c.email === clientInfo.email);
    if (!exists) {
      setSavedClients(prev => [...prev, { ...clientInfo }]);
      toast.success('Client saved!');
    } else {
      toast.info('Client already saved');
    }
  };

  const loadClient = (client: ClientInfo) => {
    setClientInfo(client);
    toast.success('Client loaded!');
  };

  const removeClient = (index: number) => {
    setSavedClients(prev => prev.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const upiURL = userInfo.upiId
    ? `upi://pay?pa=${encodeURIComponent(userInfo.upiId)}&am=${total.toFixed(2)}&cu=${currency.code}&tn=${encodeURIComponent(`Payment for Invoice ${invoiceNumber}`)}`
    : '';

  const goNext = () => {
    const next = currentStep + 1;
    if (next > 5) return;
    setCurrentStep(next);
    setHighestStep(prev => Math.max(prev, next));
  };
  const goPrev = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };
  const goToStep = (step: number) => {
    if (step >= 1 && step <= highestStep) setCurrentStep(step);
  };

  const getTemplateStyles = (template: TemplateType) => {
    const s: Record<TemplateType, { container: string; header: string; title: string; tableHeader: string; totalBox: string }> = {
      modern: {
        container: 'border-l-4 border-l-blue-600',
        header: 'border-b-2 border-blue-600',
        title: 'text-blue-800',
        tableHeader: 'bg-blue-600 text-white',
        totalBox: 'bg-blue-50 border-2 border-blue-500 rounded-lg p-4'
      },
      classic: {
        container: 'border-2 border-gray-400',
        header: 'border-b-2 border-gray-400',
        title: 'text-gray-900',
        tableHeader: 'bg-gray-200 text-gray-900',
        totalBox: 'bg-gray-100 border border-gray-400 rounded p-4'
      },
      minimal: {
        container: 'border border-gray-300',
        header: 'border-b border-dashed border-gray-400',
        title: 'text-gray-800 font-light',
        tableHeader: 'border-b-2 border-gray-400 text-gray-800',
        totalBox: 'border-t-2 border-gray-400 pt-4'
      },
      professional: {
        container: 'border-t-4 border-t-gray-900',
        header: 'border-b-2 border-gray-300',
        title: 'text-gray-900',
        tableHeader: 'bg-gray-800 text-white',
        totalBox: 'bg-gray-100 border-l-4 border-l-gray-900 p-4'
      },
      colorful: {
        container: 'border-2 border-purple-400 bg-gradient-to-br from-purple-50 via-white to-pink-50',
        header: 'border-b-2 border-purple-400',
        title: 'text-purple-800 font-bold',
        tableHeader: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white',
        totalBox: 'bg-purple-50 border-2 border-purple-400 rounded-lg p-4'
      },
      elegant: {
        container: 'border border-amber-400 bg-amber-50/50',
        header: 'border-b-2 border-amber-400',
        title: 'text-amber-900',
        tableHeader: 'bg-amber-200 text-amber-900 border-b border-amber-400',
        totalBox: 'bg-amber-100 border border-amber-400 rounded-lg p-4'
      },
      corporate: {
        container: 'border-l-4 border-l-slate-800',
        header: 'border-b-2 border-slate-600',
        title: 'text-slate-900',
        tableHeader: 'bg-slate-700 text-white',
        totalBox: 'bg-slate-100 border-l-4 border-l-slate-700 p-4'
      },
      creative: {
        container: 'border-2 border-teal-400 bg-gradient-to-br from-teal-50 to-cyan-50',
        header: 'border-b-2 border-teal-400',
        title: 'text-teal-800',
        tableHeader: 'bg-teal-600 text-white',
        totalBox: 'bg-teal-50 border-2 border-teal-400 rounded-xl p-4'
      },
      clean: {
        container: 'border border-gray-300',
        header: 'border-b-2 border-gray-300',
        title: 'text-gray-900',
        tableHeader: 'bg-gray-200 text-gray-900 border-b border-gray-300',
        totalBox: 'bg-gray-100 border border-gray-300 rounded p-4'
      },
      luxury: {
        container: 'border-2 border-indigo-400 bg-gradient-to-br from-indigo-50 via-white to-purple-50',
        header: 'border-b-2 border-indigo-400',
        title: 'text-indigo-900',
        tableHeader: 'bg-indigo-700 text-white',
        totalBox: 'bg-indigo-50 border-2 border-indigo-300 rounded-lg p-4'
      },
    };
    return s[template] || s.modern;
  };

  const handlePDFDownload = async () => {
    if (!invoiceRef.current) return;
    try {
      const mmToPx = 96 / 25.4;
      const targetWidthPx = pageSize.width * mmToPx;
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff',
        width: targetWidthPx, windowWidth: targetWidthPx, logging: false,
        onclone: (_doc: Document, el: HTMLElement) => { el.style.color = '#111827'; el.style.backgroundColor = '#ffffff'; },
      });
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: pageSize.height > pageSize.width ? 'portrait' : 'landscape',
        unit: 'mm', format: [pageSize.width, pageSize.height],
      });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pdfW) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfW, imgH, undefined, 'FAST');
      let left = imgH;
      while (left > pdfH) {
        const pos = left - pdfH;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -pos, pdfW, imgH, undefined, 'FAST');
        left -= pdfH;
      }
      pdf.save(`${invoiceNumber || 'invoice'}.pdf`);
      toast.success('Downloaded as PDF!');
    } catch (err) { console.error(err); toast.error('PDF generation failed'); }
  };

  const handleImageDownload = async () => {
    if (!invoiceRef.current) return;
    try {
      const mmToPx = 96 / 25.4;
      const targetWidthPx = pageSize.width * mmToPx;
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff',
        width: targetWidthPx, windowWidth: targetWidthPx, logging: false,
        onclone: (_doc: Document, el: HTMLElement) => { el.style.color = '#111827'; el.style.backgroundColor = '#ffffff'; },
      });
      const link = document.createElement('a');
      link.download = `${invoiceNumber || 'invoice'}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      toast.success('Downloaded as image!');
    } catch (err) { console.error(err); toast.error('Image generation failed'); }
  };

  const ts = getTemplateStyles(selectedTemplate);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 no-print">

      {/* ─── Stepper ─── */}
      <div className="px-2">
        <div className="flex items-center justify-between">
          {STEPS.map((step, i) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => goToStep(step.id)}
                disabled={step.id > highestStep}
                className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  currentStep === step.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : step.id < currentStep
                      ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600'
                      : step.id <= highestStep
                        ? 'bg-muted text-muted-foreground cursor-pointer hover:bg-muted/80'
                        : 'bg-muted/50 text-muted-foreground/40'
                }`}
              >
                {step.id < currentStep ? <Check className="w-4 h-4" /> : step.id}
              </button>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 sm:mx-2 rounded ${step.id < currentStep ? 'bg-green-400' : 'bg-muted'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {STEPS.map(step => (
            <div key={step.id} className={`text-[10px] sm:text-xs text-center flex-1 font-medium ${
              currentStep === step.id ? 'text-blue-600' : step.id < currentStep ? 'text-green-600' : 'text-muted-foreground/60'
            }`}>
              {step.label}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Step Content ─── */}

      {/* Step 1: Business Info */}
      {currentStep === 1 && (
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold">Your Business Information</h2>
              <p className="text-sm text-muted-foreground mt-1">This info appears on every invoice. It's saved automatically.</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company / Business Name *</Label>
                <Input id="companyName" value={userInfo.companyName} onChange={e => setUserInfo(p => ({ ...p, companyName: e.target.value }))} placeholder="e.g. Acme Corp" />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" value={userInfo.address} onChange={e => setUserInfo(p => ({ ...p, address: e.target.value }))} placeholder="Street, City, State, ZIP" rows={2} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={userInfo.email} onChange={e => setUserInfo(p => ({ ...p, email: e.target.value }))} placeholder="you@company.com" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={userInfo.phone} onChange={e => setUserInfo(p => ({ ...p, phone: e.target.value }))} placeholder="+1 234 567 890" />
                </div>
              </div>
              <div>
                <Label htmlFor="taxId">Tax ID / GST Number (optional)</Label>
                <Input id="taxId" value={userInfo.taxId} onChange={e => setUserInfo(p => ({ ...p, taxId: e.target.value }))} placeholder="e.g. 22AAAAA0000A1Z5" />
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <Label>Company Logo (optional)</Label>
              <p className="text-xs text-muted-foreground mb-2">Upload your logo to display on invoices. PNG, JPG, or SVG recommended.</p>
              <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              {userInfo.logo ? (
                <div className="flex items-center gap-4 p-4 border border-dashed rounded-lg">
                  <img src={userInfo.logo} alt="Logo" className="w-16 h-16 object-contain rounded" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Logo uploaded</p>
                    <p className="text-xs text-muted-foreground">Appears on the top-left of your invoice</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => logoInputRef.current?.click()}>Change</Button>
                    <Button size="sm" variant="outline" onClick={() => setUserInfo(p => ({ ...p, logo: '' }))}><X className="w-4 h-4" /></Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full p-6 border-2 border-dashed rounded-lg flex flex-col items-center gap-2 text-muted-foreground hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  <Upload className="w-8 h-8" />
                  <span className="text-sm font-medium">Click to upload your company logo</span>
                  <span className="text-xs">PNG, JPG, SVG &middot; Max 5MB</span>
                </button>
              )}
            </div>

            {/* UPI */}
            <div>
              <Label htmlFor="upiId">UPI ID for Payment QR Code (optional)</Label>
              <p className="text-xs text-muted-foreground mb-1">Add your UPI ID to generate a scannable QR code on invoices.</p>
              <Input id="upiId" value={userInfo.upiId} onChange={e => setUserInfo(p => ({ ...p, upiId: e.target.value }))} placeholder="yourname@upi or yourname@paytm" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Products Catalog */}
      {currentStep === 2 && (
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold">Your Products & Services</h2>
              <p className="text-sm text-muted-foreground mt-1">Add items you sell or services you offer. These are saved and reusable across invoices.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Label htmlFor="productDesc">Product / Service Name</Label>
                <Input id="productDesc" value={newProductDesc} onChange={e => setNewProductDesc(e.target.value)} placeholder="e.g. Web Design" onKeyDown={e => e.key === 'Enter' && addProduct()} />
              </div>
              <div className="w-full sm:w-36">
                <Label htmlFor="productPrice">Price ({currency.symbol})</Label>
                <Input id="productPrice" type="number" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} placeholder="0.00" min={0} step="0.01" onKeyDown={e => e.key === 'Enter' && addProduct()} />
              </div>
              <div className="flex items-end">
                <Button onClick={addProduct} className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-1" /> Add</Button>
              </div>
            </div>

            {savedProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No products yet. Add your first product above.</p>
                <p className="text-xs mt-1">You can also add custom items directly when creating an invoice.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{savedProducts.length} product{savedProducts.length !== 1 ? 's' : ''} saved</p>
                <div className="grid gap-2">
                  {savedProducts.map(product => (
                    <div key={product.id} className="p-3 rounded-lg border bg-card">
                      {editingProductId === product.id ? (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Input value={editProductDesc} onChange={e => setEditProductDesc(e.target.value)} placeholder="Product name" className="flex-1 h-9" onKeyDown={e => e.key === 'Enter' && saveEditProduct()} />
                          <Input type="number" value={editProductPrice} onChange={e => setEditProductPrice(e.target.value)} placeholder="Price" min={0} step="0.01" className="w-full sm:w-28 h-9" onKeyDown={e => e.key === 'Enter' && saveEditProduct()} />
                          <div className="flex gap-1">
                            <Button size="sm" onClick={saveEditProduct} className="h-9"><Check className="w-4 h-4" /></Button>
                            <Button size="sm" variant="outline" onClick={cancelEditProduct} className="h-9"><X className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm">{product.description}</p>
                            <p className="text-xs text-muted-foreground">{currency.symbol}{product.unitPrice.toFixed(2)}</p>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button size="sm" variant="ghost" onClick={() => startEditProduct(product)}><Pencil className="w-4 h-4" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => removeProduct(product.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Currency selector */}
            <div className="pt-4 border-t">
              <Label>Default Currency</Label>
              <Select value={currency.code} onValueChange={v => { const c = CURRENCIES.find(x => x.code === v); if (c) setCurrency(c); }}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(c => <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code} – {c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Client Details */}
      {currentStep === 3 && (
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold">Client Details</h2>
              <p className="text-sm text-muted-foreground mt-1">Who is this invoice for? You can save clients for quick access later.</p>
            </div>

            {savedClients.length > 0 && (
              <div>
                <Label className="text-xs text-muted-foreground">Saved Clients — click to load</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {savedClients.map((client, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <Button size="sm" variant="outline" onClick={() => loadClient(client)}>{client.name}</Button>
                      <button onClick={() => removeClient(idx)} className="text-red-400 hover:text-red-600 p-0.5"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="clientName">Client Name *</Label>
                <Input id="clientName" value={clientInfo.name} onChange={e => setClientInfo(p => ({ ...p, name: e.target.value }))} placeholder="Client or Company Name" />
              </div>
              <div>
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input id="clientEmail" type="email" value={clientInfo.email} onChange={e => setClientInfo(p => ({ ...p, email: e.target.value }))} placeholder="client@email.com" />
              </div>
              <div>
                <Label htmlFor="clientAddress">Client Address</Label>
                <Textarea id="clientAddress" value={clientInfo.address} onChange={e => setClientInfo(p => ({ ...p, address: e.target.value }))} placeholder="Street, City, State, ZIP" rows={2} />
              </div>
            </div>

            <Button variant="outline" onClick={saveClient} className="w-full sm:w-auto">Save This Client for Later</Button>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Create Invoice */}
      {currentStep === 4 && (
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold">Invoice Details</h2>
              <p className="text-sm text-muted-foreground mt-1">Set dates, pick products, and customize your invoice.</p>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="invNum">Invoice Number</Label>
                <Input id="invNum" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="invDate">Invoice Date</Label>
                <Input id="invDate" type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="invDue">Due Date</Label>
                <Input id="invDue" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input id="taxRate" type="number" value={taxRate} onChange={e => setTaxRate(Math.max(0, Math.min(100, Number(e.target.value))))} min={0} max={100} />
              </div>
              <div>
                <Label htmlFor="payTerms">Payment Terms</Label>
                <Input id="payTerms" value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} placeholder="e.g. Net 30" />
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={currency.code} onValueChange={v => { const c = CURRENCIES.find(x => x.code === v); if (c) setCurrency(c); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CURRENCIES.map(c => <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            {/* Add from catalog */}
            {savedProducts.length > 0 && (
              <div>
                <Label className="text-sm font-semibold">Add from Your Product Catalog</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {savedProducts.map(product => {
                    const alreadyAdded = items.some(i => i.description === product.description);
                    return (
                      <div key={product.id} className={`flex items-center justify-between p-3 rounded-lg border ${alreadyAdded ? 'bg-green-50 border-green-300 dark:bg-green-950/20 dark:border-green-800' : 'bg-card'}`}>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{product.description}</p>
                          <p className="text-xs text-muted-foreground">{currency.symbol}{product.unitPrice.toFixed(2)}</p>
                        </div>
                        <Button size="sm" variant={alreadyAdded ? 'secondary' : 'default'} disabled={alreadyAdded} onClick={() => addProductToInvoice(product)} className="ml-2 flex-shrink-0">
                          {alreadyAdded ? <><Check className="w-3 h-3 mr-1" /> Added</> : <><Plus className="w-3 h-3 mr-1" /> Add</>}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Invoice items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-semibold">Invoice Items</Label>
                <Button size="sm" variant="outline" onClick={addCustomItem}><Plus className="w-3 h-3 mr-1" /> Custom Item</Button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground border rounded-lg border-dashed">
                  <p className="text-sm">No items yet.</p>
                  <p className="text-xs mt-1">{savedProducts.length > 0 ? 'Pick from your catalog above or add a custom item.' : 'Add a custom item or go back to add products first.'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg bg-card">
                      <div className="col-span-12 sm:col-span-5">
                        <Label className="text-xs">Description</Label>
                        <Input value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} placeholder="Item name" className="h-9" />
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <Label className="text-xs">Qty</Label>
                        <Input type="number" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', Math.max(1, Number(e.target.value) || 1))} min={1} className="h-9" />
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <Label className="text-xs">Price ({currency.symbol})</Label>
                        <Input type="number" value={item.unitPrice} onChange={e => updateItem(item.id, 'unitPrice', Math.max(0, Number(e.target.value) || 0))} min={0} step="0.01" className="h-9" />
                      </div>
                      <div className="col-span-3 sm:col-span-2 text-right">
                        <Label className="text-xs">Total</Label>
                        <p className="text-sm font-semibold h-9 flex items-center justify-end">{currency.symbol}{(item.quantity * item.unitPrice).toFixed(2)}</p>
                      </div>
                      <div className="col-span-1 flex items-end justify-end">
                        <Button size="sm" variant="ghost" onClick={() => removeItem(item.id)} className="h-9 w-9 p-0"><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end gap-4 text-sm pt-2 border-t">
                    <span className="text-muted-foreground">Subtotal: <strong>{currency.symbol}{subtotal.toFixed(2)}</strong></span>
                    <span className="text-muted-foreground">Tax: <strong>{currency.symbol}{tax.toFixed(2)}</strong></span>
                    <span className="font-bold">Total: {currency.symbol}{total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Payment instructions, thank you note, etc." rows={2} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Preview & Export */}
      {currentStep === 5 && (
        <div className="space-y-4">
          {/* Quick Edit Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => goToStep(1)}><Pencil className="w-3 h-3 mr-1" /> Business Info</Button>
            <Button size="sm" variant="outline" onClick={() => goToStep(2)}><Pencil className="w-3 h-3 mr-1" /> Products</Button>
            <Button size="sm" variant="outline" onClick={() => goToStep(3)}><Pencil className="w-3 h-3 mr-1" /> Client</Button>
            <Button size="sm" variant="outline" onClick={() => goToStep(4)}><Pencil className="w-3 h-3 mr-1" /> Invoice Items</Button>
          </div>

          {/* Template Selection */}
          <Card>
            <CardContent className="pt-5 space-y-4">
              <Label className="text-sm font-semibold">Choose Template</Label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {TEMPLATE_INFO.map(t => (
                  <button
                    key={t.name}
                    onClick={() => setSelectedTemplate(t.name)}
                    className={`rounded-lg border-2 p-3 text-center transition-all ${
                      selectedTemplate === t.name ? 'border-blue-500 shadow-md bg-blue-50 dark:bg-blue-950/20' : 'border-border hover:border-muted-foreground/40'
                    }`}
                  >
                    <div className={`h-2 rounded-full mb-2 ${t.accent}`} />
                    <span className="text-xs font-medium">{t.label}</span>
                  </button>
                ))}
              </div>

              {/* Page Size */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Label className="text-sm font-semibold mr-2">Page Size:</Label>
                {PAGE_SIZES.map(size => (
                  <Button
                    key={size.name}
                    size="sm"
                    variant={pageSize.name === size.name ? 'default' : 'outline'}
                    onClick={() => setPageSize(size)}
                  >
                    {size.name}
                  </Button>
                ))}
              </div>

              {/* Export Buttons */}
              <div className="flex flex-wrap gap-3 pt-2 border-t">
                <Button onClick={handlePDFDownload} className="flex-1 sm:flex-none"><Download className="w-4 h-4 mr-2" /> Download PDF</Button>
                <Button onClick={handleImageDownload} variant="outline" className="flex-1 sm:flex-none"><FileImage className="w-4 h-4 mr-2" /> Download Image</Button>
                <Button onClick={() => window.print()} variant="outline" className="flex-1 sm:flex-none"><Printer className="w-4 h-4 mr-2" /> Print</Button>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Preview */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 text-center sm:hidden">↔ Scroll horizontally to see the full invoice</p>
            <div className="w-full overflow-x-auto print:overflow-visible rounded-lg border">
              <div
                ref={invoiceRef}
                className={`${ts.container} p-8 shadow-lg print:shadow-none`}
                style={{
                  fontFamily: selectedTemplate === 'minimal' ? '"Helvetica Neue", sans-serif' : 'Arial, sans-serif',
                  width: `${pageSize.width}mm`, minWidth: `${pageSize.width}mm`, maxWidth: 'none',
                  margin: '0 auto', boxSizing: 'border-box', overflow: 'hidden',
                  color: '#111827', backgroundColor: '#ffffff',
                }}
              >
                {/* Header */}
                <div className={`flex justify-between items-start gap-6 mb-8 pb-6 ${ts.header}`}>
                  <div className="flex items-start gap-4 flex-1">
                    {userInfo.logo && <img src={userInfo.logo} alt="Logo" className="w-20 h-20 object-contain flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <h1 className={`text-2xl font-bold ${ts.title}`}>{userInfo.companyName || 'Your Company'}</h1>
                      <div className="text-sm mt-2 whitespace-pre-line" style={{ color: '#4b5563' }}>
                        {userInfo.address}
                        {userInfo.email && <div>{userInfo.email}</div>}
                        {userInfo.phone && <div>{userInfo.phone}</div>}
                        {userInfo.taxId && <div>Tax ID: {userInfo.taxId}</div>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <h2 className={`text-3xl font-bold ${ts.title}`}>INVOICE</h2>
                    <div className="text-sm mt-2" style={{ color: '#4b5563' }}>
                      <div><strong style={{ color: '#1f2937' }}>Invoice #:</strong> {invoiceNumber}</div>
                      <div><strong style={{ color: '#1f2937' }}>Date:</strong> {new Date(invoiceDate).toLocaleDateString()}</div>
                      {dueDate && <div><strong style={{ color: '#1f2937' }}>Due:</strong> {new Date(dueDate).toLocaleDateString()}</div>}
                    </div>
                  </div>
                </div>

                {/* Bill To */}
                <div className="mb-8">
                  <h3 className="text-base font-bold mb-1" style={{ color: '#1f2937' }}>Bill To:</h3>
                  <div style={{ color: '#374151' }}>
                    <div className="font-semibold">{clientInfo.name || 'Client Name'}</div>
                    {clientInfo.email && <div className="text-sm">{clientInfo.email}</div>}
                    {clientInfo.address && <div className="text-sm whitespace-pre-line">{clientInfo.address}</div>}
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-8 w-full">
                  <table className="w-full border-collapse" style={{ tableLayout: 'fixed', width: '100%' }}>
                    <colgroup>
                      <col style={{ width: '50%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '19%' }} />
                      <col style={{ width: '19%' }} />
                    </colgroup>
                    <thead>
                      <tr className={ts.tableHeader}>
                        <th className="text-left py-3 px-3 font-semibold text-sm">Description</th>
                        <th className="text-right py-3 px-3 font-semibold text-sm">Qty</th>
                        <th className="text-right py-3 px-3 font-semibold text-sm">Unit Price</th>
                        <th className="text-right py-3 px-3 font-semibold text-sm">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length > 0 ? items.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td className="py-2.5 px-3 text-sm" style={{ color: '#1f2937' }}>{item.description || '—'}</td>
                          <td className="text-right py-2.5 px-3 text-sm" style={{ color: '#374151' }}>{item.quantity}</td>
                          <td className="text-right py-2.5 px-3 text-sm" style={{ color: '#374151' }}>{currency.symbol}{item.unitPrice.toFixed(2)}</td>
                          <td className="text-right py-2.5 px-3 text-sm font-medium" style={{ color: '#1f2937' }}>{currency.symbol}{(item.quantity * item.unitPrice).toFixed(2)}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} className="py-4 text-center text-sm" style={{ color: '#9ca3af' }}>No items added</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Totals + QR */}
                <div className="flex justify-between items-end gap-6 mb-8">
                  <div className={`w-64 ${ts.totalBox}`}>
                    <div className="flex justify-between py-1 text-sm" style={{ color: '#374151' }}>
                      <span>Subtotal:</span>
                      <span>{currency.symbol}{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 text-sm" style={{ color: '#374151' }}>
                      <span>Tax ({taxRate}%):</span>
                      <span>{currency.symbol}{tax.toFixed(2)}</span>
                    </div>
                    <div style={{ borderTop: '2px solid #d1d5db', margin: '8px 0' }} />
                    <div className="flex justify-between py-1 text-lg font-bold" style={{ color: '#111827' }}>
                      <span>Total:</span>
                      <span>{currency.symbol}{total.toFixed(2)}</span>
                    </div>
                  </div>

                  {userInfo.upiId && (
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-semibold" style={{ color: '#374151' }}>Scan to Pay</span>
                      <div style={{ backgroundColor: '#fff', padding: '6px', borderRadius: '8px', border: '2px solid #e5e7eb' }}>
                        <QRCodeSVG value={upiURL} size={110} level="H" includeMargin />
                      </div>
                      <span className="text-xs" style={{ color: '#6b7280' }}>{userInfo.upiId}</span>
                      <span className="text-xs font-medium" style={{ color: '#374151' }}>{currency.symbol}{total.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="space-y-3 text-sm" style={{ color: '#4b5563' }}>
                  {paymentTerms && <div><strong style={{ color: '#374151' }}>Payment Terms:</strong> {paymentTerms}</div>}
                  {notes && <div><strong style={{ color: '#374151' }}>Notes:</strong><div className="mt-1 whitespace-pre-line">{notes}</div></div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Navigation Buttons ─── */}
      <div className="flex justify-between items-center pt-2">
        <Button variant="outline" onClick={goPrev} disabled={currentStep === 1} className={currentStep === 1 ? 'invisible' : ''}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </Button>
        {currentStep < 5 ? (
          <Button onClick={goNext}>
            {currentStep === 4 ? 'Preview Invoice' : 'Next'} <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handlePDFDownload}>
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
        )}
      </div>
    </div>
  );
};

export default InvoiceGenerator;
