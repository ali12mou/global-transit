import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDb } from "./config/db.js";
import { Role } from "./models/Role.js";
import { User } from "./models/User.js";
import { Configuration } from "./models/Configuration.js";
import { ActivityService } from "./models/ActivityService.js";
import { ActivityOperation } from "./models/ActivityOperation.js";
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
        strengthsKicker: "Découvrez comment nous accompagnons votre activité",
        strengthsIntro:
          "Une équipe expérimentée, des opérations sécurisées et une maîtrise complète du corridor Djibouti - Éthiopie. Conformité, rapidité d'exécution et accompagnement dédié.",
        strengthsTagline: "— Votre fret, notre engagement.",
        strengths: ["Communication", "Travail d'équipe", "Responsabilité"],
        standardsBadge: "Normes",
        servicesH2: "Nos services",
        expertsH2: "Notre équipe d'experts",
        expertsBadge: "Professionnels certifiés",
        teamEmptyText: "L'équipe sera bientôt présentée ici.",
        teamFallbackTitle: "Expert Global Transit",
        teamFallbackDescription:
          "Professionnel expérimenté en transit, logistique et dédouanement sur le corridor Djibouti – Éthiopie.",
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
  await Team.updateMany({ layout: { $exists: false } }, { $set: { layout: "standard" } });

  await Team.deleteMany({
    layout: "compact",
    name: { $in: ["Direction générale", "Responsable des opérations"] },
  });

  const leadershipTeam = [
    {
      order: 100,
      layout: "compact",
      title: "PDG",
      name: "Monsieur Mohamed Adour",
      phone: "+253 21 35 14 55",
      fax: "+253 21 35 77 48",
      email: "",
    },
    {
      order: 101,
      layout: "compact",
      title: "Directeur général du groupe",
      name: "Monsieur Steve Morrall",
      phone: "+253 21 35 14 55",
      fax: "+253 21 35 77 48",
      email: "steve.morrall@globaltransit.dj",
    },
    {
      order: 102,
      layout: "compact",
      title: "Responsable logistique",
      name: "Monsieur Mohamed Idriss",
      phone: "+253 21 35 14 55",
      fax: "+253 21 35 77 48",
      email: "mohamed.idriss@globaltransit.dj",
    },
    {
      order: 103,
      layout: "compact",
      title: "Responsable des opérations",
      name: "Monsieur Ibrahim Ismail",
      phone: "+253 21 35 14 55",
      fax: "+253 21 35 77 48",
      email: "ibrahim.ismail@globaltransit.dj",
    },
    {
      order: 104,
      layout: "compact",
      title: "Responsable du développement commercial",
      name: "M. Warsama D. Ibrahim",
      phone: "+253 21 35 14 55",
      fax: "+253 21 35 77 48",
      email: "warsama.ibrahim@globaltransit.dj",
    },
  ];

  for (const member of leadershipTeam) {
    await Team.findOneAndUpdate(
      { layout: "compact", name: member.name },
      { $set: member },
      { upsert: true }
    );
  }
  console.log("Organigramme direction (équipe compacte) synchronisé.");

  const opsCount = await ActivityOperation.countDocuments();
  if (opsCount === 0) {
    await ActivityOperation.insertMany([
      {
        title: "Port Logistics",
        slug: "port-logistics",
        order: 1,
        published: true,
        imageUrl: "",
        content: `Our port logistics services provide comprehensive solutions for the efficient handling, storage, and transportation of cargo at ports worldwide. With our expertise and state-of-the-art facilities, we ensure seamless operations and timely delivery of goods.

**Container Handling:** Efficient unloading, loading, and stacking of containers, ensuring smooth cargo flow.
**Break-Bulk Cargo Operations:** Expertise in handling non-containerized cargo, including heavy machinery and oversized items.
**Customs Documentation and Compliance:** Assistance with customs procedures, ensuring compliance with regulations and minimizing delays.`,
      },
      {
        title: "Freezone Logistics",
        slug: "freezone-logistics",
        order: 2,
        published: true,
        imageUrl: "",
        content: `Our freezone logistics services offer specialized solutions for businesses operating within free trade zones. We provide comprehensive support to optimize supply chain operations and facilitate international trade.

**Warehousing and Storage Solutions:** Secure and flexible storage facilities tailored to diverse cargo types and volumes.
**Value-Added Services:** Labeling, packaging, assembly, and quality control to meet specific customer requirements.
**Distribution Center Management:** Efficient order fulfillment, inventory management, and distribution to global markets.`,
      },
      {
        title: "Transportation Services",
        slug: "transportation-services",
        order: 3,
        published: true,
        imageUrl: "",
        content: `Our transportation services ensure reliable and timely delivery of goods across various modes of transport. We offer flexible solutions to meet diverse shipping needs and optimize supply chain efficiency.

**Inland Transportation (Road, Rail):** Efficient movement of cargo within regions, connecting ports, warehouses, and distribution centers.
**Multi-Modal Transport Solutions:** Seamless integration of different transport modes for cost-effective and efficient delivery.
**Last-Mile Delivery:** Reliable delivery to final destinations, ensuring customer satisfaction and on-time fulfillment.`,
      },
      {
        title: "Warehousing & Distributions",
        slug: "warehousing-distributions",
        order: 4,
        published: true,
        imageUrl: "",
        content: `Our warehousing and distribution services provide secure storage and efficient distribution solutions to support your supply chain operations. We offer flexible options to meet varying storage and distribution requirements.

**Bonded Warehouse Facilities:** Secure storage for goods under customs control, facilitating international trade and duty deferral.
**Inventory Management:** Accurate tracking and management of inventory levels, ensuring optimal stock control and order fulfillment.
**Order Picking and Packing:** Efficient order processing, picking, and packing services to meet customer demands and delivery schedules.`,
      },
    ]);
    console.log("Opérations activités par défaut insérées.");
  }

  const servicesCount = await ActivityService.countDocuments();
  if (servicesCount === 0) {
    await ActivityService.insertMany([
      {
        title: "Port Logistics",
        description: `Nos services portuaires couvrent la manutention, le stockage et le transit des marchandises au port de Djibouti.

**Container Handling:** Déchargement, chargement et empilage efficace des conteneurs.
**Break-Bulk Cargo Operations:** Manutention de cargaisons non conteneurisées et projets lourds.
**Customs Documentation and Compliance:** Accompagnement douanier et conformité documentaire.`,
        imageUrl: "",
        order: 1,
        published: true,
      },
      {
        title: "Freezone Logistics",
        description: `Solutions logistiques en zone franche pour optimiser vos flux import-export.

**Warehousing and Storage Solutions:** Entreposage sécurisé et flexible selon vos volumes.
**Value-Added Services:** Étiquetage, conditionnement et contrôle qualité.
**Distribution Center Management:** Préparation de commandes et distribution régionale.`,
        imageUrl: "",
        order: 2,
        published: true,
      },
      {
        title: "Transportation Services",
        description: `Transport fiable sur le corridor Djibouti – Éthiopie et au-delà.

**Inland Transportation (Road, Rail):** Liaison port – entrepôt – frontière.
**Multi-Modal Transport Solutions:** Coordination route, mer et rail.
**Last-Mile Delivery:** Livraison finale vers vos sites en Éthiopie et en région.`,
        imageUrl: "",
        order: 3,
        published: true,
      },
      {
        title: "Clearance",
        description: `Dédouanement et formalités administratives pour vos opérations import-export.

**Import Clearance:** Dédouanement import au port de Djibouti.
**Export Clearance:** Formalités export et conformité documentaire.
**Customs Compliance:** Suivi réglementaire et assistance systèmes douaniers.`,
        imageUrl: "",
        order: 4,
        published: true,
      },
      {
        title: "Documents",
        description: `Gestion documentaire complète pour sécuriser vos opérations logistiques.

**Commercial Invoices:** Vérification et suivi des factures commerciales.
**Certificates & Permits:** Certificats d'origine, licences et autorisations.
**Final Reporting:** Rapports de clôture et traçabilité des dossiers.`,
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
