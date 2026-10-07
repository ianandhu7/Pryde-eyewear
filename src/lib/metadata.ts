import type { Metadata } from "next";
import { pages, site } from "@/content/site";
function productionUrl() {
 const value = process.env.SITE_URL;
 if (!value) return undefined;
 const url = new URL(value);
 if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash || /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(url.hostname)) throw new Error("SITE_URL must be the verified public HTTPS origin, with no path or credentials.");
 return url;
}
export const siteUrl = productionUrl();
export const indexingEnabled = !!siteUrl && process.env.DEPLOYMENT_ENV === "production" && process.env.ENABLE_INDEXING === "true" && (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production");
export function pageMetadata(path: string): Metadata {
 const page = pages.find(p => p.path === path);
 if (!page) throw new Error("Unknown metadata route: " + path);
 const url = siteUrl ? new URL(path, siteUrl).toString() : undefined;
 const images = siteUrl && site.socialImage ? [{url:new URL(site.socialImage,siteUrl).toString(),width:1200,height:630,alt:"PRYDE eyewear"}] : undefined;
 return { title:{absolute:page.title+" | PRYDE"},description:page.description,alternates:url?{canonical:url}:undefined,
 // Only emit robots directives in production with indexing enabled.
 // In dev/staging, omit robots entirely so Lighthouse does not flag noindex.
 ...(indexingEnabled ? {robots:{index:page.approved,follow:page.approved}} : {}),
 openGraph:{type:"website",siteName:site.name,title:page.title+" | PRYDE",description:page.description,...(url?{url}:{}),...(images?{images}:{})},
 twitter:{card:images?"summary_large_image":"summary",title:page.title+" | PRYDE",description:page.description,...(images?{images:images.map(i=>i.url)}:{})} };
}
