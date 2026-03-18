import { eq, desc, like, or, and, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, documents, specialCases, itDurations, 
  conversations, messages, InsertConversation, InsertMessage,
  favorites, InsertFavorite
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

export async function updateSpecialCase(
  id: number,
  data: {
    title?: string;
    category?: string;
    description?: string;
    legalBasis?: string;
    procedure?: string;
    examples?: string;
  }
) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(specialCases)
    .set({
      ...(data.title !== undefined && { title: data.title }),
      ...(data.category !== undefined && { category: data.category as any }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.legalBasis !== undefined && { legalBasis: data.legalBasis }),
      ...(data.procedure !== undefined && { procedure: data.procedure }),
      ...(data.examples !== undefined && { examples: data.examples }),
    })
    .where(eq(specialCases.id, id));

  return await getSpecialCaseById(id);
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

// ===== FAVORITES =====

export async function addFavorite(userId: number, entityType: "document" | "special_case", entityId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Comprovar si ja existeix
  const existing = await db
    .select()
    .from(favorites)
    .where(and(
      eq(favorites.userId, userId),
      eq(favorites.entityType, entityType),
      eq(favorites.entityId, entityId)
    ))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const newFav: InsertFavorite = { userId, entityType, entityId };
  const result = await db.insert(favorites).values(newFav);
  return { id: result[0].insertId, userId, entityType, entityId };
}

export async function removeFavorite(userId: number, entityType: "document" | "special_case", entityId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(favorites).where(and(
    eq(favorites.userId, userId),
    eq(favorites.entityType, entityType),
    eq(favorites.entityId, entityId)
  ));
}

export async function getUserFavorites(userId: number) {
  const db = await getDb();
  if (!db) return { documents: [], cases: [] };

  const userFavs = await db
    .select()
    .from(favorites)
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt));

  const docIds = userFavs.filter(f => f.entityType === "document").map(f => f.entityId);
  const caseIds = userFavs.filter(f => f.entityType === "special_case").map(f => f.entityId);

  const favDocs = docIds.length > 0
    ? await db.select().from(documents).where(inArray(documents.id, docIds))
    : [];

  const favCases = caseIds.length > 0
    ? await db.select().from(specialCases).where(inArray(specialCases.id, caseIds))
    : [];

  return { documents: favDocs, cases: favCases, raw: userFavs };
}

export async function getUserFavoriteIds(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(favorites).where(eq(favorites.userId, userId));
}

// ===== ADVANCED SEARCH =====

export async function advancedSearchDocuments(params: {
  query?: string;
  type?: string;
  jurisdiction?: string;
  dateFrom?: Date;
  dateTo?: Date;
  publicationYear?: number;
  status?: string;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (params.query) {
    const searchPattern = `%${params.query}%`;
    conditions.push(or(
      like(documents.title, searchPattern),
      like(documents.content, searchPattern),
      like(documents.summary, searchPattern)
    ));
  }

  if (params.type) {
    conditions.push(eq(documents.type, params.type as any));
  }

  if (params.jurisdiction) {
    conditions.push(eq(documents.jurisdiction, params.jurisdiction as any));
  }

  if (params.publicationYear) {
    conditions.push(eq(documents.publicationYear, params.publicationYear));
  }

  if (params.status) {
    conditions.push(eq(documents.status, params.status as any));
  }

  if (params.dateFrom) {
    conditions.push(sql`${documents.createdAt} >= ${params.dateFrom}`);
  }

  if (params.dateTo) {
    conditions.push(sql`${documents.createdAt} <= ${params.dateTo}`);
  }

  const query = db.select().from(documents);
  if (conditions.length > 0) {
    query.where(conditions.length === 1 ? conditions[0]! : and(...conditions as any));
  }

  return query.orderBy(desc(documents.createdAt)).limit(params.limit ?? 20);
}

export async function advancedSearchSpecialCases(params: {
  query?: string;
  category?: string;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (params.query) {
    const searchPattern = `%${params.query}%`;
    conditions.push(or(
      like(specialCases.title, searchPattern),
      like(specialCases.description, searchPattern),
      like(specialCases.legalBasis, searchPattern),
      like(specialCases.procedure, searchPattern),
      like(specialCases.examples, searchPattern)
    ));
  }

  if (params.category) {
    conditions.push(eq(specialCases.category, params.category as any));
  }

  const query = db.select().from(specialCases);
  if (conditions.length > 0) {
    query.where(conditions.length === 1 ? conditions[0]! : and(...conditions as any));
  }

  return query.orderBy(specialCases.category).limit(params.limit ?? 20);
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
