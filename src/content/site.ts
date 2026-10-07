export const site = {
 name: "PRYDE",
 description: "Discover PRYDE eyewear. Explore optical frames, sunglasses, and a different perspective on personal style.",
 logo: null as null | { src: string; width: number; height: number },
 favicon: null as string | null,
 socialImage: null as string | null,
 email: null as string | null,
 phone: null as null | { label: string; href: string },
 address: null as string | null,
 previewNote: "Preview imagery is AI-generated and does not depict actual PRYDE products.",
 contact: { eyebrow: "LET’S TALK", title: "A new perspective starts with a conversation.", intro: "For collection enquiries, stockist information, or a conversation about PRYDE.", emptyTitle: "Contact details coming soon.", emptyText: "Verified contact details are not available yet. Please check back for an official way to reach PRYDE." },
 stockists: { eyebrow: "WHERE TO BUY", title: "Find your perspective.", intro: "Discover where to see PRYDE eyewear in person.", emptyTitle: "Our stockist directory is on its way.", emptyText: "No verified stockists are listed yet. Visit our contact page for the latest contact information." },
 navigation: [{label:"Collections",href:"/collections"},{label:"About PRYDE",href:"/about"},{label:"Where to Buy",href:"/where-to-buy"},{label:"Contact",href:"/contact"}],
};
// Set approved:true only after copy, photographs and details for that page are approved.
export const pages = [
 {path:"/", title:"Own your perspective", description:site.description, approved:true},
 {path:"/about", title:"About PRYDE", description:"Meet PRYDE, an eyewear brand exploring personal style through optical frames and sunglasses.", approved:true},
 {path:"/collections", title:"Eyewear collections", description:"Explore PRYDE optical and sunglasses collections and discover your next perspective.", approved:true},
 {path:"/collections/optical", title:"Optical frames", description:"Discover the PRYDE optical collection and find information about frame styles and collection enquiries.", approved:true},
 {path:"/collections/sunglasses", title:"Sunglasses", description:"Explore the PRYDE sunglasses collection and find information about styles and collection enquiries.", approved:true},
 {path:"/where-to-buy", title:"Where to buy", description:"Find verified PRYDE stockist information and learn where to see the collections in person.", approved:true},
 {path:"/contact", title:"Contact PRYDE", description:"Find official PRYDE contact information for collection enquiries and stockist questions.", approved:true},
];
