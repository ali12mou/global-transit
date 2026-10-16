import type { IconType } from "react-icons";
import {
  IoBusinessOutline,
  IoCubeOutline,
  IoFolderOpenOutline,
  IoGridOutline,
  IoInformationCircleOutline,
  IoLinkOutline,
  IoMailOutline,
  IoNewspaperOutline,
  IoPeopleOutline,
  IoPersonOutline,
  IoServerOutline,
  IoSettingsOutline,
  IoShieldOutline,
} from "react-icons/io5";

export type AdminNavItem = {
  to: string;
  labelKey: string;
  /** Phrase d'aide affichée sous le titre de la page */
  hintKey: string;
  Icon: IconType;
};

export type AdminNavGroup = {
  labelKey: string;
  items: AdminNavItem[];
};

export const adminNavGroups: AdminNavGroup[] = [
  {
    labelKey: "admin.navGroup.overview",
    items: [
      { to: "/admin", labelKey: "admin.nav.dashboard", hintKey: "admin.hint.dashboard", Icon: IoGridOutline },
      { to: "/admin/contacts", labelKey: "admin.nav.contacts", hintKey: "admin.hint.contacts", Icon: IoMailOutline },
    ],
  },
  {
    labelKey: "admin.navGroup.content",
    items: [
      { to: "/admin/activity-services", labelKey: "admin.nav.services", hintKey: "admin.hint.services", Icon: IoCubeOutline },
      { to: "/admin/news", labelKey: "admin.nav.news", hintKey: "admin.hint.news", Icon: IoNewspaperOutline },
      { to: "/admin/projects", labelKey: "admin.nav.projects", hintKey: "admin.hint.projects", Icon: IoFolderOpenOutline },
      { to: "/admin/partners", labelKey: "admin.nav.partners", hintKey: "admin.hint.partners", Icon: IoLinkOutline },
      { to: "/admin/clients", labelKey: "admin.nav.clients", hintKey: "admin.hint.clients", Icon: IoBusinessOutline },
      {
        to: "/admin/infrastructures",
        labelKey: "admin.nav.infrastructure",
        hintKey: "admin.hint.infrastructure",
        Icon: IoServerOutline,
      },
      { to: "/admin/team", labelKey: "admin.nav.team", hintKey: "admin.hint.team", Icon: IoPeopleOutline },
      { to: "/admin/about", labelKey: "admin.nav.about", hintKey: "admin.hint.about", Icon: IoInformationCircleOutline },
    ],
  },
  {
    labelKey: "admin.navGroup.settings",
    items: [
      { to: "/admin/users", labelKey: "admin.nav.users", hintKey: "admin.hint.users", Icon: IoPersonOutline },
      { to: "/admin/roles", labelKey: "admin.nav.roles", hintKey: "admin.hint.roles", Icon: IoShieldOutline },
      {
        to: "/admin/configuration",
        labelKey: "admin.nav.configuration",
        hintKey: "admin.hint.configuration",
        Icon: IoSettingsOutline,
      },
    ],
  },
];

export const adminNavItems: AdminNavItem[] = adminNavGroups.flatMap((g) => g.items);

/** Entrée de menu correspondant à l'URL courante (la plus spécifique). */
export function findAdminNavItem(pathname: string): AdminNavItem | undefined {
  return [...adminNavItems]
    .sort((a, b) => b.to.length - a.to.length)
    .find((item) => (item.to === "/admin" ? pathname === "/admin" || pathname === "/admin/" : pathname.startsWith(item.to)));
}
