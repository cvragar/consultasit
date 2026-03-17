import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, float, json, boolean, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Documentos normativos (leyes, decretos, guías, manuales)
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  type: mysqlEnum("type", ["ley", "decreto", "guia", "manual", "pildora", "otro"]).notNull(),
  source: varchar("source", { length: 255 }), // INSS, Departament Salut, ICS, etc.
  jurisdiction: mysqlEnum("jurisdiction", ["estatal", "autonomica", "ambas"]).default("estatal").notNull(),
  content: text("content").notNull(), // Contenido extraído del documento
  summary: text("summary"), // Resumen del documento
  url: varchar("url", { length: 500 }), // URL original si existe
  fileKey: varchar("fileKey", { length: 500 }), // Clave del archivo en S3
  tags: json("tags").$type<string[]>(), // Etiquetas para búsqueda
  publicationYear: int("publicationYear"), // Any de publicació del document
  status: mysqlEnum("status", ["vigent", "derogada", "en_revisio"]).default("vigent").notNull(), // Estat de vigència
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
}, (table) => ({
  titleIdx: index("title_idx").on(table.title),
  typeIdx: index("type_idx").on(table.type),
  statusIdx: index("status_idx").on(table.status),
  yearIdx: index("year_idx").on(table.publicationYear),
}));

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * Casos especiales y situaciones extremas
 */
export const specialCases = mysqlTable("special_cases", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  category: mysqlEnum("category", [
    "menstruacion",
    "embarazo",
    "lactancia",
    "donacion_organos",
    "baja_retroactiva",
    "pluriempleo",
    "prision",
    "extranjeros",
    "vacaciones",
    "recaida",
    "accident_treball",
    "otro"
  ]).notNull(),
  description: text("description").notNull(),
  legalBasis: text("legalBasis"), // Base legal que lo sustenta
  procedure: text("procedure"), // Procedimiento a seguir
  examples: text("examples"), // Ejemplos prácticos
  relatedDocumentIds: json("relatedDocumentIds").$type<number[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
}, (table) => ({
  categoryIdx: index("category_idx").on(table.category),
}));

export type SpecialCase = typeof specialCases.$inferSelect;
export type InsertSpecialCase = typeof specialCases.$inferInsert;

/**
 * Tiempos estándar de IT por patología
 */
export const itDurations = mysqlTable("it_durations", {
  id: int("id").autoincrement().primaryKey(),
  diagnosis: varchar("diagnosis", { length: 500 }).notNull(),
  cie10Code: varchar("cie10Code", { length: 20 }), // Código CIE-10
  category: varchar("category", { length: 255 }), // Categoría de patología
  minDays: int("minDays").notNull(),
  maxDays: int("maxDays").notNull(),
  averageDays: int("averageDays").notNull(),
  ageAdjustment: json("ageAdjustment").$type<{ range: string; factor: number }[]>(),
  occupationAdjustment: json("occupationAdjustment").$type<{ type: string; factor: number }[]>(),
  notes: text("notes"),
  source: varchar("source", { length: 255 }), // INSS, SEMG, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  diagnosisIdx: index("diagnosis_idx").on(table.diagnosis),
  cie10Idx: index("cie10_idx").on(table.cie10Code),
}));

export type ItDuration = typeof itDurations.$inferSelect;
export type InsertItDuration = typeof itDurations.$inferInsert;

/**
 * Conversaciones de chat
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  title: varchar("title", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
}));

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Mensajes de chat
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").references(() => conversations.id).notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  sources: json("sources").$type<{ documentId?: number; caseId?: number; title: string }[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  conversationIdx: index("conversation_idx").on(table.conversationId),
}));

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Embeddings para búsqueda semántica
 */
export const embeddings = mysqlTable("embeddings", {
  id: int("id").autoincrement().primaryKey(),
  entityType: mysqlEnum("entityType", ["document", "special_case"]).notNull(),
  entityId: int("entityId").notNull(),
  chunkText: text("chunkText").notNull(),
  embedding: json("embedding").$type<number[]>().notNull(), // Vector de embeddings
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  entityIdx: index("entity_idx").on(table.entityType, table.entityId),
}));

export type Embedding = typeof embeddings.$inferSelect;
export type InsertEmbedding = typeof embeddings.$inferInsert;

/**
 * Favorits de l'usuari (documents i casos especials)
 */
export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  entityType: mysqlEnum("entityType", ["document", "special_case"]).notNull(),
  entityId: int("entityId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userEntityIdx: index("user_entity_idx").on(table.userId, table.entityType, table.entityId),
}));

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;
