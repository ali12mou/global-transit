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
  /** Champ obligatoire (validé avant l'envoi) */
  required?: boolean;
  /** Aide affichée sous le champ */
  hint?: string;
  placeholder?: string;
};

export type EntityModule = {
  route: string;
  title: string;
  /** Texte d'aide affiché sous le titre de la page */
  description?: string;
  api: string;
  fields: FieldDef[];
  /** Champs formulaire / tableau — organigramme direction (layout compact) */
  teamCompactFields?: FieldDef[];
  /** Champs formulaire / tableau — cartes avec photo (layout standard) */
  teamStandardFields?: FieldDef[];
};

const ORDER_HINT = "Plus le nombre est petit, plus l'élément apparaît en premier.";
const URL_PLACEHOLDER = "https://www.exemple.com";

export const entityModules: EntityModule[] = [
  {
    route: "activity-services",
    title: "Services",
    description:
      "Les services publiés s'affichent sur la page « Nos activités » (menu Services). Ajoutez une image et une description claire pour chaque service.",
    api: "/api/admin/activity-services",
    fields: [
      { key: "title", label: "Titre", type: "text", required: true, placeholder: "Ex. Dédouanement" },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        hint: "Un paragraphe d'introduction, puis une ligne par point au format « **Titre :** texte ».",
      },
      {
        key: "imageUrl",
        label: "Image",
        type: "file-image",
        uploadCategory: "services",
      },
      { key: "order", label: "Ordre d'affichage", type: "number", hint: ORDER_HINT },
      { key: "published", label: "Publié sur le site", type: "checkbox", hint: "Décoché : le service reste en brouillon." },
    ],
  },
  {
    route: "clients",
    title: "Clients",
    description: "Logos des clients de référence affichés sur le site.",
    api: "/api/admin/clients",
    fields: [
      { key: "name", label: "Nom", type: "text", required: true, placeholder: "Nom de l'entreprise" },
      {
        key: "logoUrl",
        label: "Logo",
        type: "file-image",
        uploadCategory: "clients",
      },
      { key: "url", label: "Site web", type: "text", placeholder: URL_PLACEHOLDER },
      { key: "order", label: "Ordre d'affichage", type: "number", hint: ORDER_HINT },
    ],
  },
  {
    route: "infrastructures",
    title: "Infrastructure",
    description: "Photos des infrastructures et équipements, visibles dans la galerie de l'accueil et sur la page Infrastructures.",
    api: "/api/admin/infrastructures",
    fields: [
      { key: "name", label: "Nom", type: "text", required: true, placeholder: "Ex. Entrepôt sous douane" },
      {
        key: "imageUrl",
        label: "Image",
        type: "file-image",
        uploadCategory: "infrastructure",
      },
      { key: "order", label: "Ordre d'affichage", type: "number", hint: ORDER_HINT },
    ],
  },
  {
    route: "partners",
    title: "Partenaires",
    description: "Ports, zones franches et agences partenaires : leurs logos défilent sur la page d'accueil, regroupés par type.",
    api: "/api/admin/partners",
    fields: [
      { key: "name", label: "Nom", type: "text", required: true, placeholder: "Ex. Port de Djibouti" },
      {
        key: "type",
        label: "Type",
        type: "select",
        options: ["Ports", "FREE ZONE", "AGENCE"],
        hint: "Détermine le groupe dans lequel le logo apparaît.",
      },
      { key: "logoUrl", label: "Logo", type: "file-image", uploadCategory: "partners" },
      { key: "url", label: "Site web", type: "text", placeholder: URL_PLACEHOLDER },
      { key: "order", label: "Ordre d'affichage", type: "number", hint: ORDER_HINT },
    ],
  },
  {
    route: "projects",
    title: "Projets",
    description: "Projets réalisés. Les projets « mis en avant » apparaissent sur la page d'accueil ; tous les projets publiés sont listés sur /projets.",
    api: "/api/admin/projects",
    fields: [
      { key: "title", label: "Titre", type: "text", required: true },
      {
        key: "slug",
        label: "Adresse de la page (slug)",
        type: "text",
        placeholder: "genere-automatiquement",
        hint: "Laissez vide lors de la création : il sera généré à partir du titre.",
      },
      { key: "summary", label: "Résumé", type: "textarea", hint: "Deux ou trois phrases affichées sur les cartes." },
      { key: "body", label: "Contenu", type: "textarea" },
      {
        key: "imageUrl",
        label: "Image",
        type: "file-image",
        uploadCategory: "projects",
      },
      { key: "featured", label: "Mis en avant sur l'accueil", type: "checkbox" },
      { key: "published", label: "Publié sur le site", type: "checkbox" },
    ],
  },
  {
    route: "news",
    title: "Actualités",
    description: "Publications de la page /actualites. Seules les actualités cochées « Visible sur le site » sont affichées au public.",
    api: "/api/admin/news",
    fields: [
      { key: "title", label: "Titre", type: "text", required: true },
      {
        key: "slug",
        label: "Adresse de la page (slug)",
        type: "text",
        placeholder: "genere-automatiquement",
        hint: "Utilisé dans l'URL /actualites/votre-slug. Laissez vide lors de la création.",
      },
      { key: "excerpt", label: "Chapô", type: "textarea", hint: "Résumé court affiché dans la liste des actualités." },
      {
        key: "imageUrl",
        label: "Image",
        type: "file-image",
        uploadCategory: "news",
      },
      { key: "published", label: "Visible sur le site", type: "checkbox", hint: "Décoché : l'actualité reste en brouillon." },
      { key: "publishedAt", label: "Date de publication", type: "datetime-local", hint: "Vide : date du jour à la publication." },
      { key: "body", label: "Contenu", type: "textarea" },
    ],
  },
  {
    route: "team",
    title: "Équipe",
    api: "/api/admin/team",
    teamCompactFields: [
      { key: "order", label: "Ordre", type: "number", hint: "100 = carte du PDG, en haut de l'organigramme." },
      { key: "name", label: "Nom", type: "text", required: true },
      { key: "title", label: "Titre / Fonction", type: "text" },
      { key: "phone", label: "WhatsApp", type: "text", placeholder: "+253 77 00 00 00" },
      { key: "email", label: "Email", type: "text", placeholder: "nom@gttsgroup.com" },
    ],
    teamStandardFields: [
      { key: "order", label: "Ordre", type: "number", hint: ORDER_HINT },
      { key: "title", label: "Titre / Fonction", type: "text" },
      { key: "name", label: "Nom", type: "text", required: true },
      { key: "phone", label: "WhatsApp / Téléphone", type: "text", placeholder: "+253 77 00 00 00" },
      { key: "email", label: "Email", type: "text", placeholder: "nom@gttsgroup.com" },
      { key: "website", label: "Profil web pro (LinkedIn, site…)", type: "text", placeholder: "https://www.linkedin.com/in/…" },
      { key: "formation", label: "Formation professionnelle", type: "textarea" },
      { key: "description", label: "Description", type: "textarea" },
      {
        key: "imageUrl",
        label: "Photo",
        type: "file-image",
        uploadCategory: "team",
      },
    ],
    fields: [
      { key: "order", label: "Ordre", type: "number" },
      { key: "title", label: "Titre", type: "text" },
      { key: "name", label: "Nom", type: "text", required: true },
      { key: "phone", label: "WhatsApp", type: "text" },
      { key: "fax", label: "Ligne fixe / Bureau", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "website", label: "Profil web pro (LinkedIn, site…)", type: "text" },
      { key: "layout", label: "Affichage", type: "select", options: ["standard", "compact"] },
      { key: "formation", label: "Formation professionnelle", type: "textarea" },
      { key: "description", label: "Description", type: "textarea" },
      {
        key: "imageUrl",
        label: "Photo",
        type: "file-image",
        uploadCategory: "team",
      },
    ],
  },
  {
    route: "roles",
    title: "Rôles",
    description: "Chaque rôle regroupe des permissions. « * » donne tous les droits ; « news.* » tous les droits sur les actualités.",
    api: "/api/admin/roles",
    fields: [
      { key: "name", label: "Nom", type: "text", required: true, placeholder: "Ex. Éditeur" },
      {
        key: "permissions",
        label: "Permissions",
        type: "textarea",
        placeholder: "news.read\nnews.write\npartners.*",
        hint: "Une permission par ligne (ex. news.read, news.write, contact.read).",
      },
    ],
  },
];
