import mongoose from "mongoose";

export async function connectDb(uri: string): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Connexion en arrière-plan avec nouvelles tentatives : l'API démarre même si MongoDB
 * n'est pas encore prêt (au lieu de s'arrêter, ce que nginx affiche en 502).
 */
export function connectDbWithRetry(uri: string, delayMs = 5_000): void {
  connectDb(uri).then(
    () => console.log("MongoDB connecté"),
    (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`MongoDB indisponible (${message}) — nouvel essai dans ${delayMs / 1000}s`);
      setTimeout(() => connectDbWithRetry(uri, delayMs), delayMs);
    }
  );
}
