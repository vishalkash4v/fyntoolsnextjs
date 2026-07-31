
import {
  LayoutDashboard,
  Settings,
  HelpCircle,
  FileText,
  Globe,
  Calculator,
  ListChecks,
  Timer,
  Clock,
  User,
  Calendar,
  CalendarCheck,
  Activity,
  ShieldCheck,
  Baby,
  Apple,
  Percent,
  Coins,
  FileCode2,
  Table,
  PiggyBank,
  IndianRupee,
  Thermometer,
  Layout,
  TextIcon,
  Network,
  StickyNote,
  Share2,
  Link2,
  Hash,
  CalendarDays as CalendarSchedule,
  Type,
  Keyboard,
  Trophy,
  Gamepad2,
  Image as ImageIcon,
  Zap,
  Star,
  Crop,
  RotateCcw,
  Camera,
  FileArchive,
  FileImage,
  Download,
  Video,
  Key,
  Eye,
  ArrowLeftRight,
  Search,
  Palette,
  List,
  Barcode,
  PenTool,
  Eraser,
  CopyCheck,
  Smartphone,
  Volume2,
  QrCode,
  Cloud,
  Receipt,
  MapPin,
  Code2,
  HeartPulse
} from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { MainNavItem, SidebarNavItem } from "@/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";

interface Props {
  items?: SidebarNavItem[];
  mainNav?: MainNavItem[];
}

export function AppSidebar() {
  const sidebarItems = [
    {
      title: "Getting Started",
      items: [
        { title: "Dashboard", url: "/", icon: LayoutDashboard },
        { title: "Tools", url: "/tools", icon: Layout },
        { title: "About", url: "/about", icon: HelpCircle },
        { title: "Contact", url: "/contact", icon: HelpCircle },
      ],
    },
    {
      title: "Text & Writing Tools",
      items: [
        { title: "Word Counter", url: "/word-counter", icon: FileText },
        { title: "Text Case Converter", url: "/text-case-converter", icon: TextIcon },
        { title: "Text Font Changer", url: "/text-font-changer", icon: Type },
        { title: "Base64 Converter", url: "/base64-converter", icon: FileCode2 },
        { title: "Lorem Ipsum Generator", url: "/lorem-ipsum-generator", icon: FileText },
        { title: "Whitespace Remover", url: "/whitespace-remover", icon: Eraser },
        { title: "Duplicate Line Remover", url: "/duplicate-line-remover", icon: CopyCheck },
        { title: "Text Reverser", url: "/text-reverser", icon: RotateCcw },
        { title: "Regex Tester", url: "/regex-tester", icon: Search },
        { title: "AI Text Rewriter", url: "/ai-text-rewriter", icon: Zap },
        { title: "Text to Handwriting", url: "/text-to-handwriting", icon: PenTool },
        { title: "Text to Speech", url: "/text-to-speech", icon: Volume2 },
        { title: "Markdown Editor", url: "/markdown-editor", icon: FileText },
        { title: "Notes", url: "/notes", icon: StickyNote },
        { title: "URL Slug Generator", url: "/url-slug-generator", icon: Link2 },
        { title: "Json Formatter", url: "/json-formatter", icon: FileCode2 },
        { title: "Html Formatter", url: "/html-formatter", icon: FileCode2 },
        { title: "Json Validator", url: "/json-validator", icon: FileCode2 },
      ],
    },
    {
      title: "Image & File Tools",
      items: [
        { title: "Image Compressor", url: "/image-compressor", icon: ImageIcon },
        { title: "Image Resizer", url: "/image-resizer", icon: ImageIcon },
        { title: "Image Upscaler", url: "/image-upscaler", icon: Zap },
        { title: "Image Cropper", url: "/image-cropper", icon: Crop },
        { title: "Image Format Converter", url: "/image-format-converter", icon: RotateCcw },
        { title: "SVG Optimizer", url: "/svg-optimizer", icon: FileCode2 },
        { title: "Image Metadata Viewer", url: "/image-metadata-viewer", icon: Eye },
        { title: "Image to Text", url: "/image-to-text", icon: FileText },
        { title: "PDF Text Extractor", url: "/pdf-text-extractor", icon: FileArchive },
        { title: "Placeholder Image Generator", url: "/placeholder-image-generator", icon: ImageIcon },
        { title: "Logo to Favicon", url: "/logo-to-favicon", icon: Star },
        { title: "Pixelate Tool", url: "/pixelate-tool", icon: ImageIcon },
        { title: "Background Remover", url: "/background-remover", icon: Eraser },
        { title: "Merge Images", url: "/merge-images", icon: ImageIcon },
        { title: "Flip Image", url: "/flip-image", icon: RotateCcw },
        { title: "Blur Image", url: "/blur-image", icon: ImageIcon },
        { title: "Split Image", url: "/split-image", icon: Crop },
        { title: "Invert Image Colors", url: "/invert-image-colors", icon: Palette },
        { title: "Add Name Date Photo", url: "/add-name-date-photo", icon: Camera },
        { title: "Photo Annotation Tool", url: "/photo-annotation-tool", icon: PenTool },
        { title: "QR Scanner", url: "/qr-scanner", icon: QrCode },
      ],
    },
    {
      title: "Design & CSS Tools",
      items: [
        { title: "Box Shadow Generator", url: "/box-shadow-generator", icon: Layout },
        { title: "Border Radius Generator", url: "/border-radius-generator", icon: Layout },
        { title: "Gradient Generator", url: "/gradient-generator", icon: Palette },
        { title: "Button Generator", url: "/button-generator", icon: Layout },
        { title: "Color Converter", url: "/color-converter", icon: Palette },
        { title: "Color Palette Generator", url: "/color-palette-generator", icon: Palette },
        { title: "Color Picker", url: "/color-picker", icon: Palette },
      ],
    },
    {
      title: "Calculator Tools",
      items: [
        { title: "Simple Calculator", url: "/simple-calculator", icon: Calculator },
        { title: "Temperature Converter", url: "/temperature-converter", icon: Thermometer },
        { title: "Unit Converter", url: "/unit-converter", icon: Layout },
        { title: "Enhanced Unit Converter", url: "/enhanced-unit-converter", icon: ArrowLeftRight },
        { title: "Timestamp Converter", url: "/timestamp-converter", icon: Clock },
        { title: "Table to JSON Converter", url: "/table-to-json-converter", icon: Table },
      ],
    },
    {
      title: "Calculation Tools",
      items: [
        { title: "Age Calculator", url: "/age-calculator", icon: Calendar },
        { title: "Date Difference Calculator", url: "/date-difference-calculator", icon: Calendar },
        { title: "Future Date Calculator", url: "/future-date-calculator", icon: Calendar },
        { title: "BMI Calculator", url: "/bmi-calculator", icon: Activity },
        { title: "Percentage Calculator", url: "/percentage-calculator", icon: Percent },
        { title: "Currency Converter", url: "/currency-converter", icon: Coins },
        { title: "GST Calculator", url: "/gst-calculator", icon: IndianRupee },
        { title: "EMI Calculator", url: "/emi-calculator", icon: PiggyBank },
        { title: "SIP Calculator", url: "/sip-calculator", icon: PiggyBank },
        { title: "PPF Calculator", url: "/ppf-calculator", icon: PiggyBank },
        { title: "FD Calculator", url: "/fd-calculator", icon: PiggyBank },
        { title: "Income Tax Calculator", url: "/income-tax-calculator", icon: IndianRupee },
      ],
    },
    {
      title: "Period & Cycle Tools",
      items: [
        { title: "Period Calculator", url: "/period-calculator", icon: Calendar },
        { title: "Ovulation Calculator", url: "/ovulation-calculator", icon: Activity },
        { title: "Safe Days Calculator", url: "/safe-days-calculator", icon: ShieldCheck },
        { title: "Period Tracker", url: "/period-tracker", icon: CalendarCheck },
        { title: "PMS Symptom Tracker", url: "/pms-symptom-tracker", icon: HeartPulse },
      ],
    },
    {
      title: "Pregnancy Tools",
      items: [
        { title: "Pregnancy Due Date Calculator", url: "/pregnancy-due-date-calculator", icon: Baby },
        { title: "Pregnancy Week Calculator", url: "/pregnancy-week-calculator", icon: Calendar },
        { title: "Conception Date Calculator", url: "/conception-date-calculator", icon: Activity },
        { title: "Pregnancy Weight Gain Calculator", url: "/pregnancy-weight-gain-calculator", icon: Percent },
        { title: "Contraction Timer", url: "/contraction-timer", icon: Timer },
        { title: "Baby Kick Counter", url: "/baby-kick-counter", icon: HeartPulse },
        { title: "Pregnancy Diet Planner", url: "/pregnancy-diet-planner", icon: Apple },
      ],
    },

    {
      title: "Utility Tools",
      items: [
        { title: "QR Code Generator", url: "/qr-code-generator", icon: QrCode },
        { title: "Random Number Generator", url: "/random-number-generator", icon: Hash },
        { title: "Yes No Generator", url: "/yes-no-generator", icon: Hash },
        { title: "Coin Flip", url: "/coin-flip", icon: Hash },
        { title: "Dice Roller", url: "/dice-roller", icon: Hash },
        { title: "Todo List", url: "/todo-list", icon: ListChecks },
        { title: "Redirect", url: "/redirect", icon: ArrowLeftRight },
        { title: "List Randomizer", url: "/list-randomizer", icon: List },
        { title: "Barcode Generator", url: "/barcode-generator", icon: Barcode },
        { title: "Password Generator", url: "/password-generator", icon: Key },
        { title: "Url Shortener", url: "/url-shortener", icon: Link2 },
        { title: "Username Generator", url: "/username-generator", icon: User },
        { title: "Name Generator", url: "/name-generator", icon: User },
        { title: "Business Idea Generator", url: "/business-idea-generator", icon: Star },
        { title: "Stopwatch", url: "/stopwatch", icon: Timer },
        { title: "Countdown Timer", url: "/countdown-timer", icon: Clock },
        { title: "Weather Forecast", url: "/weather-forecast", icon: Cloud },
      ],
    },
    {
      title: "Developer Tools",
      items: [
        { title: "Hash Generator", url: "/hash-generator", icon: Hash },
        { title: "JWT Decoder", url: "/jwt-decoder", icon: Key },
        { title: "Meta Tag Previewer", url: "/meta-tag-previewer", icon: Eye },
        { title: "JavaScript Minifier", url: "/javascript-minifier", icon: FileCode2 },
        { title: "CSS Minifier", url: "/css-minifier", icon: FileCode2 },
        { title: "Discord Formatter", url: "/discord-formatter", icon: Hash },
        { title: "Live Preview", url: "/live-preview", icon: Eye },
        { title: "Dummy API Generator", url: "/dummy-api-generator", icon: Code2 },
      ],
    },
    {
      title: "Typing Tools",
      items: [
        { title: "Typing Tutor", url: "/typing-tutor", icon: Keyboard },
        { title: "Typing Test", url: "/typing-test", icon: Timer },
        { title: "Typing Games", url: "/typing-games", icon: Gamepad2 },
        { title: "Typing Competition", url: "/typing-competition", icon: Trophy },
      ],
    },
    {
      title: "Social Media Tools",
      items: [
        { title: "Hashtag Generator", url: "/hashtag-generator", icon: Hash },
        { title: "Social Media Deep Link Generator", url: "/social-media-deep-link-generator", icon: Share2 },
        { title: "Social Media Planner", url: "/social-media-planner", icon: Calendar },
        { title: "Social Media DB Viewer", url: "/social-media-db-viewer", icon: Globe },
        { title: "Social Media Downloader", url: "/social-media-downloader", icon: Download },
      ],
    },
    {
      title: "Network Tools",
      items: [
        { title: "IP Lookup", url: "/ip-lookup", icon: Globe },
        { title: "IP Address to Location Finder", url: "/ip-address-to-location-finder", icon: MapPin },
      ],
    },
    {
      title: "Business Tools",
      items: [
        { title: "Invoice Generator", url: "/invoice-generator", icon: Receipt },
      ],
    },
    {
      title: "Themes",
      items: [
        { title: "Themes", url: "/themes", icon: Layout },
      ],
    },
  ];


  return (
    <div className="w-60 flex-shrink-0 border-r border-border py-4 bg-background">
      <div className="flex flex-col space-y-1">
        {sidebarItems.map((category, index) => (
          <Accordion type="single" collapsible className="w-full" key={index}>
            <AccordionItem value={category.title}>
              <AccordionTrigger className="px-4 font-medium text-sm text-foreground">{category.title}</AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2 py-2">
                  {category.items.map((item) => (
                    <Link to={item.url} key={item.title} className="group flex items-center space-x-2 rounded-md px-4 py-2 text-sm font-medium hover:underline text-foreground hover:bg-muted">
                      <item.icon className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                      <span>{item.title}</span>
                    </Link>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>
    </div>
  );
}
