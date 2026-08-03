/**
 * Description Generation Database Operations
 * Handles MongoDB CRUD for AI-generated business descriptions
 */

import { MongoClient, Db, Collection } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';
const DATABASE_NAME = 'bizlocalpilot';
const DESCRIPTIONS_COLLECTION = 'description_generations';
const FAVORITES_COLLECTION = 'favorite_descriptions';

export interface DescriptionGeneration {
  _id?: string;
  userId: string;
  businessName: string;
  businessCategory: string;
  primaryService: string;
  secondaryServices: string[];
  city: string;
  area: string;
  state: string;
  targetCustomers: string;
  yearsInBusiness: number;
  uniqueSellingPoints: string[];
  keywords: string[];
  tone: 'Friendly' | 'Professional' | 'Luxury' | 'Premium' | 'Modern' | 'Local' | 'Family';
  cta: 'Call Now' | 'Book Today' | 'Visit Us' | 'Schedule Appointment' | 'Website' | 'None';
  language: 'English' | 'Hindi'; // Future: more languages

  // Generated outputs
  seoTitle?: string;
  shortDescription?: string; // 80 words
  mediumDescription?: string; // 250 words
  longDescription?: string; // 500 words
  extraLongDescription?: string; // 750 words

  // Analysis
  topKeywordsUsed?: string[];
  suggestedCategories?: string[];
  suggestedServices?: string[];
  suggestedFaqs?: string[];
  suggestedGbpAttributes?: Record<string, string>;
  suggestedHashtags?: string[];
  qualityScore?: number; // 0-100
  qualityMetrics?: {
    seo: number;
    readability: number;
    keywordUsage: number;
    localSeo: number;
    cta: number;
    trustSignals: number;
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  tokenUsage?: number;
  model?: string;
  isFavorite?: boolean;
  regeneratedFromId?: string; // If this is a regeneration of another
}

export interface FavoriteDescription {
  _id?: string;
  userId: string;
  descriptionId: string;
  createdAt: Date;
}

let cachedDb: Db | null = null;

async function connectToDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  try {
    const client = await MongoClient.connect(MONGODB_URI);
    cachedDb = client.db(DATABASE_NAME);

    // Create indexes for performance
    const descriptionsCollection = cachedDb.collection(DESCRIPTIONS_COLLECTION);
    await descriptionsCollection.createIndex({ userId: 1, createdAt: -1 });
    await descriptionsCollection.createIndex({ businessCategory: 1 });
    await descriptionsCollection.createIndex({ city: 1 });

    const favoritesCollection = cachedDb.collection(FAVORITES_COLLECTION);
    await favoritesCollection.createIndex({ userId: 1, descriptionId: 1 }, { unique: true });
    await favoritesCollection.createIndex({ userId: 1, createdAt: -1 });

    return cachedDb;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

/**
 * Create a new description generation record
 */
export async function createDescriptionGeneration(
  data: Omit<DescriptionGeneration, '_id' | 'createdAt' | 'updatedAt'>
): Promise<DescriptionGeneration> {
  const db = await connectToDatabase();
  const collection = db.collection<DescriptionGeneration>(DESCRIPTIONS_COLLECTION);

  const now = new Date();
  const record: DescriptionGeneration = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(record as any);

  return {
    ...record,
    _id: result.insertedId.toString(),
  };
}

/**
 * Get generation history for a user
 */
export async function getUserDescriptionHistory(
  userId: string,
  limit: number = 50,
  skip: number = 0
): Promise<DescriptionGeneration[]> {
  const db = await connectToDatabase();
  const collection = db.collection<DescriptionGeneration>(DESCRIPTIONS_COLLECTION);

  return collection
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .toArray();
}

/**
 * Get a single description by ID
 */
export async function getDescriptionById(id: string): Promise<DescriptionGeneration | null> {
  const db = await connectToDatabase();
  const collection = db.collection<DescriptionGeneration>(DESCRIPTIONS_COLLECTION);

  return collection.findOne({ _id: id } as any);
}

/**
 * Update a description (e.g., regenerate, improve, shorten)
 */
export async function updateDescription(
  id: string,
  updates: Partial<Omit<DescriptionGeneration, '_id' | 'userId' | 'createdAt'>>
): Promise<boolean> {
  const db = await connectToDatabase();
  const collection = db.collection<DescriptionGeneration>(DESCRIPTIONS_COLLECTION);

  const result = await collection.updateOne(
    { _id: id } as any,
    {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    }
  );

  return result.modifiedCount > 0;
}

/**
 * Delete a description
 */
export async function deleteDescription(id: string): Promise<boolean> {
  const db = await connectToDatabase();
  const collection = db.collection<DescriptionGeneration>(DESCRIPTIONS_COLLECTION);

  const result = await collection.deleteOne({ _id: id } as any);
  return result.deletedCount > 0;
}

/**
 * Add to favorites
 */
export async function addToFavorites(userId: string, descriptionId: string): Promise<boolean> {
  const db = await connectToDatabase();
  const collection = db.collection<FavoriteDescription>(FAVORITES_COLLECTION);

  try {
    await collection.insertOne({
      userId,
      descriptionId,
      createdAt: new Date(),
    } as any);

    // Also mark in descriptions collection
    await updateDescription(descriptionId, { isFavorite: true });

    return true;
  } catch (error: any) {
    if (error.code === 11000) {
      // Already favorited
      return false;
    }
    throw error;
  }
}

/**
 * Remove from favorites
 */
export async function removeFromFavorites(userId: string, descriptionId: string): Promise<boolean> {
  const db = await connectToDatabase();
  const collection = db.collection<FavoriteDescription>(FAVORITES_COLLECTION);

  const result = await collection.deleteOne({
    userId,
    descriptionId,
  } as any);

  // Also mark in descriptions collection
  if (result.deletedCount > 0) {
    await updateDescription(descriptionId, { isFavorite: false });
  }

  return result.deletedCount > 0;
}

/**
 * Get user's favorite descriptions
 */
export async function getUserFavorites(
  userId: string,
  limit: number = 50,
  skip: number = 0
): Promise<DescriptionGeneration[]> {
  const db = await connectToDatabase();

  const favoritesCollection = db.collection<FavoriteDescription>(FAVORITES_COLLECTION);
  const favorites = await favoritesCollection
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .toArray();

  const descriptionIds = favorites.map(f => f.descriptionId);

  const descriptionsCollection = db.collection<DescriptionGeneration>(DESCRIPTIONS_COLLECTION);
  return descriptionsCollection
    .find({ _id: { $in: descriptionIds } } as any)
    .toArray();
}

/**
 * Search user's descriptions
 */
export async function searchUserDescriptions(
  userId: string,
  query: string,
  limit: number = 50
): Promise<DescriptionGeneration[]> {
  const db = await connectToDatabase();
  const collection = db.collection<DescriptionGeneration>(DESCRIPTIONS_COLLECTION);

  return collection
    .find({
      userId,
      $or: [
        { businessName: { $regex: query, $options: 'i' } },
        { businessCategory: { $regex: query, $options: 'i' } },
        { city: { $regex: query, $options: 'i' } },
        { keywords: { $regex: query, $options: 'i' } },
      ],
    } as any)
    .limit(limit)
    .toArray();
}

/**
 * Get statistics for user
 */
export async function getUserDescriptionStats(userId: string) {
  const db = await connectToDatabase();
  const collection = db.collection<DescriptionGeneration>(DESCRIPTIONS_COLLECTION);

  const total = await collection.countDocuments({ userId });
  const favorites = await db
    .collection<FavoriteDescription>(FAVORITES_COLLECTION)
    .countDocuments({ userId });

  const avgQualityScore = await collection
    .aggregate([
      { $match: { userId } },
      { $group: { _id: null, avg: { $avg: '$qualityScore' } } },
    ])
    .toArray();

  const categoryCounts = await collection
    .aggregate([
      { $match: { userId } },
      { $group: { _id: '$businessCategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])
    .toArray();

  return {
    total,
    favorites,
    avgQualityScore: avgQualityScore[0]?.avg || 0,
    topCategories: categoryCounts,
  };
}
