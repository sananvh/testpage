/** Pages that can appear in the top menu (order and visibility are set in the admin: Menyu). Shared by server and client. */
export const MENU_PAGES = [
  { key: "services", path: "/services", nav: "services" },
  { key: "products", path: "/products", nav: "products" },
  { key: "partners", path: "/partners", nav: "partners" },
  { key: "clients", path: "/clients", nav: "clients" },
  { key: "about", path: "/about", nav: "about" },
  { key: "research", path: "/research", nav: "researchNav" },
  { key: "news", path: "/news", nav: "news" },
  { key: "certificates", path: "/certificates", nav: "certificates" },
  { key: "faq", path: "/faq", nav: "faq" },
  { key: "careers", path: "/careers", nav: "careers" },
  { key: "contact", path: "/contact", nav: "contact" },
] as const;
export type MenuKey = (typeof MENU_PAGES)[number]["key"];
export const DEFAULT_MENU: MenuKey[] = ["services", "products", "partners", "clients", "about", "research"];
