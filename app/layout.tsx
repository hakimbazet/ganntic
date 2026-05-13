import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DM_Serif_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
});

const SITE_URL = "https://ganttsheet.netlify.app";
const DOMAIN = "ganttsheet.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "GanttSheet — Free Excel to Gantt Chart Converter Online",
    template: "%s | GanttSheet",
  },
  description:
    "Turn Excel spreadsheets into beautiful, interactive Gantt charts. Upload .xlsx files, map columns, and visualize project timelines instantly. Export as PNG. Free & no signup required.",
  keywords: [
    "gantt chart",
    "excel to gantt",
    "project timeline",
    "gantt chart maker",
    "free gantt tool",
    "spreadsheet to timeline",
    "gantt chart online",
    "excel gantt converter",
    "project management",
    "task timeline",
    "gantt chart free",
    "online gantt generator",
    "xls to gantt",
    "xlsx to gantt",
  ],
  applicationName: "GanttSheet",
  authors: [{ name: "GanttSheet" }],
  generator: "Next.js",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "GanttSheet",
    locale: "en_US",
    title: "GanttSheet — Free Excel to Gantt Chart Converter",
    description:
      "Turn Excel spreadsheets into beautiful, interactive Gantt charts. Upload .xlsx files, map columns, and visualize project timelines instantly.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GanttSheet - Excel to Gantt Chart Converter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GanttSheet — Free Excel to Gantt Chart Converter",
    description:
      "Turn Excel spreadsheets into beautiful, interactive Gantt charts in seconds.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: "YOUR_GOOGLE_SEARCH_CONSOLE_ID",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f6f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0f" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

const schemaScript = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "GanttSheet",
  url: SITE_URL,
  description:
    "Free online tool that converts Excel spreadsheets into interactive Gantt charts.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Upload Excel .xlsx and .xls files",
    "Auto-map columns for tasks, dates, progress, PIC, category, priority",
    "Interactive Gantt chart with daily, weekly, and monthly views",
    "Export chart as PNG image",
    "Collapsible category grouping",
    "Filter by category, PIC, and priority",
    "In-browser table editor",
    "Save charts to gallery in local storage",
    "Light and dark mode",
  ],
  softwareVersion: "1.0.0",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "42",
  },
});

const themeScript = `
  (function() {
    try {
      const saved = localStorage.getItem('ganntsheet-theme');
      const isDark = saved === 'dark';
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${dmSerif.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schemaScript }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
