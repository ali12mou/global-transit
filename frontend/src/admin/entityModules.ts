import type { UploadCategory } from "@/uploadCategory";

export type { UploadCategory };

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "checkbox"
  | "datetime-local"
  | "select"
  /** Upload fichier image → URL stockée en base (champ caché) */
  | "file-image";

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  /** Obligatoire pour `select` */
  options?: string[];
  /** Obligatoire pour `file-image` : dossier API + permission RBAC */
  uploadCategory?: UploadCategory;
};

export type EntityModule = {
  route: string;
  title: string;
  api: string;
  fields: FieldDef[];
};

export const entityModules: EntityModule[] = [
  {
    route: "activity-operations",
    title: "Opérations",
    api: "/api/admin/activity-operations",
    fields: [
      { key: "title", label: "Titre", type: "text" },
      { key: "slug", label: "Slug", type: "text" },
      { key: "content", label: "Contenu", type: "textarea" },
      {
        key: "imageUrl",
        label: "Image",
        type: "file-image",
        uploadCategory: "operations",
      },
      { key: "order", label: "Ordre", type: "number" },
      { key: "published", label: "Publié", type: "checkbox" },
    ],
  },
  {
    route: "activity-services",
    title: "Services",
    api: "/api/admin/activity-services",
    fields: [
      { key: "title", label: "Titre", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      {
        key: "imageUrl",
        label: "Image",
        type: "file-image",
        uploadCategory: "services",
      },
      { key: "order", label: "Ordre", type: "number" },
      { key: "published", label: "Publié", type: "checkbox" },
    ],
  },
  {
    route: "careers",
    title: "Carrières",
    api: "/api/admin/careers",
    fields: [
      { key: "title", label: "Titre", type: "text" },
      { key: "location", label: "Lieu", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "publishedAt", label: "Publié le", type: "datetime-local" },
      { key: "active", label: "Actif", type: "checkbox" },
    ],
  },
  {
    route: "clients",
    title: "Clients",
    api: "/api/admin/clients",
    fields: [
      { key: "name", label: "Nom", type: "text" },
      {
        key: "logoUrl",
        label: "Logo",
        type: "file-image",
        uploadCategory: "clients",
      },
      { key: "url", label: "Site web", type: "text" },
      { key: "order", label: "Ordre", type: "number" },
    ],
  },
  {
    route: "infrastructures",
    title: "Infrastructure",
    api: "/api/admin/infrastructures",
    fields: [
      { key: "name", label: "Nom", type: "text" },
      {
        key: "imageUrl",
        label: "Image",
        type: "file-image",
        uploadCategory: "infrastructure",
      },
      { key: "order", label: "Ordre", type: "number" },
    ],
  },
  {
    route: "partners",
    title: "Partenaires",
    api: "/api/admin/partners",
    fields: [
      { key: "name", label: "Nom", type: "text" },
      {
        key: "type",
        label: "Type",
        type: "select",
        options: ["Ports", "FREE ZONE", "AGENCE"],
      },
      { key: "logoUrl", label: "Logo", type: "file-image", uploadCategory: "partners" },
      { key: "url", label: "Site web", type: "text" },
      { key: "order", label: "Ordre", type: "number" },
    ],
  },
  {
    route: "projects",
    title: "Projets",
    api: "/api/admin/projects",
    fields: [
      { key: "title", label: "Titre", type: "text" },
      { key: "slug", label: "Slug", type: "text" },
      { key: "summary", label: "Résumé", type: "textarea" },
      { key: "body", label: "Contenu", type: "textarea" },
      {
        key: "imageUrl",
        label: "Image",
        type: "file-image",
        uploadCategory: "projects",
      },
      { key: "featured", label: "Mis en avant", type: "checkbox" },
      { key: "published", label: "Publié", type: "checkbox" },
    ],
  },
  {
    route: "news",
    title: "Actualités",
    api: "/api/admin/news",
    fields: [
      { key: "title", label: "Titre", type: "text" },
      { key: "slug", label: "Slug (URL)", type: "text" },
      { key: "excerpt", label: "Chapô", type: "textarea" },
      {
        key: "imageUrl",
        label: "Image",
        type: "file-image",
        uploadCategory: "news",
      },
      { key: "published", label: "Visible sur le site (/actualités)", type: "checkbox" },
      { key: "publishedAt", label: "Date de publication", type: "datetime-local" },
      { key: "body", label: "Contenu", type: "textarea" },
    ],
  },
  {
    route: "team",
    title: "Équipe",
    api: "/api/admin/team",
    fields: [
      { key: "order", label: "Ordre", type: "number" },
      { key: "title", label: "Titre", type: "text" },
      { key: "name", label: "Nom", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      {
        key: "imageUrl",
        label: "Image",
        type: "file-image",
        uploadCategory: "team",
      },
    ],
  },
  {
    route: "roles",
    title: "Rôles",
    api: "/api/admin/roles",
    fields: [
      { key: "name", label: "Nom", type: "text" },
      { key: "permissions", label: "Permissions (une par ligne)", type: "textarea" },
    ],
  },
];
