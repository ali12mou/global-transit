/** Doit correspondre aux catégories acceptées par `POST /api/admin/upload/image?category=` */
export type UploadCategory =
  | "services"
  | "operations"
  | "partners"
  | "clients"
  | "infrastructure"
  | "projects"
  | "news"
  | "team";
