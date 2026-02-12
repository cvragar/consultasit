import { eq, desc, like, or, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, documents, specialCases, itDurations, 
  conversations, messages, InsertConversation, InsertMessage 
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== DOCUMENTS =====

export async function searchDocuments(query: string, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const searchPattern = `%${query}%`;
  const result = await db
    .select()
    .from(documents)
    .where(
      or(
        like(documents.title, searchPattern),
        like(documents.content, searchPattern),
        like(documents.summary, searchPattern)
      )
    )
    .limit(limit);

  return result;
}

export async function getAllDocuments() {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select().from(documents).orderBy(desc(documents.createdAt));
  return result;
}

export async function getDocumentById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ===== SPECIAL CASES =====

export async function getAllSpecialCases() {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select().from(specialCases).orderBy(specialCases.category);
  return result;
}

export async function getSpecialCasesByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(specialCases)
    .where(eq(specialCases.category, category as any));
  return result;
}

export async function getSpecialCaseById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(specialCases).where(eq(specialCases.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function searchSpecialCases(query: string) {
  const db = await getDb();
  if (!db) return [];

  const searchPattern = `%${query}%`;
  const result = await db
    .select()
    .from(specialCases)
    .where(
      or(
        like(specialCases.title, searchPattern),
        like(specialCases.description, searchPattern),
        like(specialCases.procedure, searchPattern)
      )
    );

  return result;
}

// ===== IT DURATIONS =====

export async function searchItDurations(query: string) {
  const db = await getDb();
  if (!db) return [];

  const searchPattern = `%${query}%`;
  const result = await db
    .select()
    .from(itDurations)
    .where(
      or(
        like(itDurations.diagnosis, searchPattern),
        like(itDurations.cie10Code, searchPattern),
        like(itDurations.category, searchPattern)
      )
    )
    .limit(20);

  return result;
}

export async function getItDurationById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(itDurations).where(eq(itDurations.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ===== CONVERSATIONS & MESSAGES =====

export async function createConversation(userId: number, title?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const newConv: InsertConversation = {
    userId,
    title: title || "Nueva consulta",
  };

  const result = await db.insert(conversations).values(newConv);
  return result[0].insertId;
}

export async function getUserConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt));

  return result;
}

export async function getConversationById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getConversationMessages(conversationId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);

  return result;
}

export async function addMessage(
  conversationId: number,
  role: "user" | "assistant" | "system",
  content: string,
  sources?: Array<{ documentId?: number; caseId?: number; title: string }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const newMessage: InsertMessage = {
    conversationId,
    role,
    content,
    sources: sources as any,
  };

  const result = await db.insert(messages).values(newMessage);
  return result[0].insertId;
}

export async function updateConversationTitle(id: number, title: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(conversations).set({ title }).where(eq(conversations.id, id));
}

export async function deleteConversation(conversationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Primero eliminar todos los mensajes de la conversación
  await db.delete(messages).where(eq(messages.conversationId, conversationId));
  
  // Luego eliminar la conversación
  await db.delete(conversations).where(eq(conversations.id, conversationId));
}

// ===== SEARCH CONTEXT FOR RAG =====

export async function getRelevantContext(query: string, limit: number = 5) {
  const db = await getDb();
  if (!db) return { documents: [], cases: [] };

  const searchPattern = `%${query}%`;

  // Buscar documentos relevantes
  const relevantDocs = await db
    .select({
      id: documents.id,
      title: documents.title,
      content: documents.content,
      type: documents.type,
      source: documents.source,
    })
    .from(documents)
    .where(
      or(
        like(documents.title, searchPattern),
        like(documents.content, searchPattern),
        like(documents.tags, searchPattern)
      )
    )
    .limit(limit);

  // Buscar casos especiales relevantes
  const relevantCases = await db
    .select({
      id: specialCases.id,
      title: specialCases.title,
      description: specialCases.description,
      legalBasis: specialCases.legalBasis,
      procedure: specialCases.procedure,
      category: specialCases.category,
    })
    .from(specialCases)
    .where(
      or(
        like(specialCases.title, searchPattern),
        like(specialCases.description, searchPattern),
        like(specialCases.legalBasis, searchPattern),
        like(specialCases.procedure, searchPattern)
      )
    )
    .limit(limit);

  return {
    documents: relevantDocs,
    cases: relevantCases,
  };
}
