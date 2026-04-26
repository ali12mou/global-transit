import type { IconType } from "react-icons";
import {
  IoBusinessOutline,
  IoCubeOutline,
  IoFolderOpenOutline,
  IoGridOutline,
  IoInformationCircleOutline,
  IoLayersOutline,
  IoLinkOutline,
  IoMailOutline,
  IoNewspaperOutline,
  IoPeopleOutline,
  IoPersonOutline,
  IoRibbonOutline,
  IoServerOutline,
  IoSettingsOutline,
  IoShieldOutline,
} from "react-icons/io5";

export type AdminNavItem = {
  to: string;
  labelKey: string;
  Icon: IconType;
};

export const adminNavItems: AdminNavItem[] = [
  { to: "/admin", labelKey: "admin.nav.dashboard", Icon: IoGridOutline },
  { to: "/admin/activity-operations", labelKey: "admin.nav.operations", Icon: IoLayersOutline },
  { to: "/admin/activity-services", labelKey: "admin.nav.services", Icon: IoCubeOutline },
  { to: "/admin/careers", labelKey: "admin.nav.careers", Icon: IoRibbonOutline },
  { to: "/admin/clients", labelKey: "admin.nav.clients", Icon: IoBusinessOutline },
  { to: "/admin/infrastructures", labelKey: "admin.nav.infrastructure", Icon: IoServerOutline },
  { to: "/admin/contacts", labelKey: "admin.nav.contacts", Icon: IoMailOutline },
  { to: "/admin/news", labelKey: "admin.nav.news", Icon: IoNewspaperOutline },
  { to: "/admin/about", labelKey: "admin.nav.about", Icon: IoInformationCircleOutline },
  { to: "/admin/partners", labelKey: "admin.nav.partners", Icon: IoLinkOutline },
  { to: "/admin/projects", labelKey: "admin.nav.projects", Icon: IoFolderOpenOutline },
  { to: "/admin/team", labelKey: "admin.nav.team", Icon: IoPeopleOutline },
  { to: "/admin/users", labelKey: "admin.nav.users", Icon: IoPersonOutline },
  { to: "/admin/roles", labelKey: "admin.nav.roles", Icon: IoShieldOutline },
  { to: "/admin/configuration", labelKey: "admin.nav.configuration", Icon: IoSettingsOutline },
];
