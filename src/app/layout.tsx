import type { Metadata } from "next";
import { site } from "@/content/site";
import { siteUrl } from "@/lib/metadata";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import "./globals.css";
export const metadata: Metadata = { ...(siteUrl?{metadataBase:siteUrl}:{}),title:{default:"PRYDE | Own your perspective",template:"%s | PRYDE"},description:site.description,...(site.favicon?{icons:{icon:site.favicon}}:{}),...(process.env.GOOGLE_SITE_VERIFICATION?{verification:{google:process.env.GOOGLE_SITE_VERIFICATION}}:{}) };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to content</a><Header/><main id="main-content">{children}</main><Footer/><JsonLd/></body></html>;}
