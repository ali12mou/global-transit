import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDb } from "./config/db.js";
import { Role } from "./models/Role.js";
import { User } from "./models/User.js";
import { Configuration } from "./models/Configuration.js";
import { ActivityService } from "./models/ActivityService.js";
import { Project } from "./models/Project.js";
import { Partner } from "./models/Partner.js";
import { Client } from "./models/Client.js";
import { Team } from "./models/Team.js";

const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/globaltransit";

async function seed() {
  await connectDb(MONGODB_URI);

  const superPerms = ["*"];
  let superRole = await Role.findOne({ name: "Super administrateur" });
  if (!superRole) {
    superRole = await Role.create({ name: "Super administrateur", permissions: superPerms });
  } else {
    superRole.permissions = superPerms;
    await superRole.save();
  }

  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@globaltransit.local";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";
  const resetPassword =
    process.env.SEED_RESET_PASSWORD === "1" ||
    process.env.SEED_RESET_PASSWORD === "true" ||
    process.env.SEED_RESET_PASSWORD === "yes";

  const existing = await User.findOne({ email });
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({
      email,
      passwordHash,
      roleId: superRole._id,
      active: true,
    });
    console.log(`Utilisateur créé: ${email} / ${password}`);
  } else if (resetPassword) {
    const passwordHash = await bcrypt.hash(password, 10);
    await User.updateOne(
      { email },
      { $set: { passwordHash, roleId: superRole._id, active: true } }
    );
    console.log(`Mot de passe et rôle mis à jour pour: ${email} (nouveau mot de passe: ${password})`);
  } else {
    console.log(`Utilisateur existe déjà: ${email} (utilisez SEED_RESET_PASSWORD=1 pour réinitialiser le mot de passe)`);
  }

  const siteDefaults: { key: string; value: unknown }[] = [
    {
      key: "about",
      value: {
        kicker: "À propos",
        title: "Qui sommes-nous ?",
        intro:
          "Global Transit and Transport Service est un partenaire stratégique en transit, logistique et dédouanement entre Djibouti, l'Éthiopie et l'Afrique de l'Est.",
        cardTitle: "Global Transit and Transport Service",
        cardText:
          "Une équipe expérimentée, des opérations sécurisées et une maîtrise complète du corridor Djibouti - Éthiopie.",
        cardCheck: "Conformité, rapidité d'exécution et accompagnement dédié.",
        missionH2: "Notre mission",
        missionP1:
          "Nous facilitons vos opérations d'import-export grâce à des solutions de transit fiables, transparentes et adaptées à chaque cargaison.",
        missionP2:
          "Notre objectif est d'offrir un service durable, avec un haut niveau de qualité opérationnelle et un suivi client continu.",
        strengthsTitle: "Nos points forts",
        standardsBadge: "Standards",
        servicesH2: "Nos services",
        expertsH2: "Notre équipe d'experts",
        expertsBadge: "Professionnels certifiés",
        experienceKicker: "Expérience",
        experienceYears: "15+",
        experienceText:
          "Plus de 15 ans d'expérience dans les opérations de transit et de logistique sur le corridor Djibouti - Éthiopie.",
        asideMissionH3: "Engagement qualité",
        asideMissionText:
          "Nous mettons en place des procédures de contrôle et des indicateurs de performance pour garantir la fiabilité de chaque opération.",
        contactCta: "Parler à notre équipe",
      },
    },
    {
      key: "site",
      value: {
        heroTag: "GLOBAL TRANSIT AND TRANSPORT SERVICES",
        heroTitle: "La Porte vers Djibouti, l'Éthiopie & l'Afrique de l'Est",
        heroSubtitle:
          "Votre partenaire de référence pour l'import-export entre l'Europe, l'Asie et l'Afrique de l'Est — via le port stratégique de Djibouti.",
        yearsExperience: "15+",
        aboutTitle: "Spécialiste du Corridor Djibouti – Éthiopie",
        aboutText:
          "Global Transit accompagne vos flux internationaux avec expertise en dédouanement, logistique et transit vers l'Éthiopie et la région.",
        missionTitle: "Notre Mission",
        missionText:
          "Offrir des solutions logistiques fiables, transparentes et conformes pour vos importations et exportations.",
      },
    },
  ];

  for (const row of siteDefaults) {
    await Configuration.findOneAndUpdate({ key: row.key }, { key: row.key, value: row.value }, { upsert: true });
  }

  await Team.updateMany({ order: { $exists: false } }, { $set: { order: 0 } });

  const servicesCount = await ActivityService.countDocuments();
  if (servicesCount === 0) {
    await ActivityService.insertMany([
      {
        title: "Clearance",
        description: "Dédouanement et procédures administratives.",
        imageUrl: "",
        order: 1,
        published: true,
      },
      {
        title: "Logistics",
        description: "Chaîne logistique et entrepôt.",
        imageUrl: "",
        order: 2,
        published: true,
      },
      {
        title: "Transit",
        description: "Transit routier et multimodal.",
        imageUrl: "",
        order: 3,
        published: true,
      },
      {
        title: "Système douanes",
        description: "Conformité et systèmes douaniers.",
        imageUrl: "",
        order: 4,
        published: true,
      },
      {
        title: "Documents",
        description: "Gestion documentaire et conformité.",
        imageUrl: "",
        order: 5,
        published: true,
      },
    ]);
    console.log("Services par défaut insérés.");
  }

  const projCount = await Project.countDocuments();
  if (projCount === 0) {
    await Project.insertMany([
      {
        title: "Corridor Djibouti – Addis-Abeba",
        slug: "corridor-djibouti-addis",
        summary: "Optimisation du corridor stratégique.",
        imageUrl: "",
        featured: true,
        published: true,
      },
      {
        title: "Expansion du Port de Djibouti",
        slug: "expansion-port-djibouti",
        summary: "Projets liés à l'extension portuaire.",
        imageUrl: "",
        featured: true,
        published: true,
      },
      {
        title: "Relais Humanitaire Afrique de l'Est",
        slug: "relais-humanitaire",
        summary: "Logistique humanitaire régionale.",
        imageUrl: "",
        featured: true,
        published: true,
      },
    ]);
    console.log("Projets phares par défaut insérés.");
  }

  await Partner.updateMany({ type: { $exists: false } }, { $set: { type: "Ports" } });

  if ((await Partner.countDocuments()) === 0) {
    await Partner.create({
      name: "Partenaire (exemple)",
      type: "Ports",
      logoUrl: "",
      url: "",
      order: 0,
    });
  }
  if ((await Client.countDocuments()) === 0) {
    await Client.create({ name: "Client (exemple)", logoUrl: "", url: "", order: 0 });
  }

  console.log("Seed terminé.");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
