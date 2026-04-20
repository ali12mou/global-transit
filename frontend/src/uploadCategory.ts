/** Doit correspondre aux catégories acceptées par `POST /api/admin/upload/image?category=` */
export type UploadCategory =
  | "services"
  | "operations"
  | "partners"
  | "clients"
  | "projects"
  | "news"
  | "team";
