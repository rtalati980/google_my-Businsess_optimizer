/**
 * Audit Submissions Database Schema & Operations
 * MongoDB collection for storing free audit form submissions
 */

import { MongoClient, Db, Collection } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';
const DATABASE_NAME = 'bizlocalpilot';
const COLLECTION_NAME = 'audit_submissions';

interface AuditSubmission {
  _id?: string;
  business_name: string;
  email: string;
  phone: string;
  business_type: string;
  city: string;
  gmb_url?: string;
  created_at: Date;
  status: 'new' | 'audit_generated' | 'email_sent' | 'contacted';
  audit_report_url?: string;
  notes?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

let cachedDb: Db | null = null;

async function connectToDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  const client = await MongoClient.connect(MONGODB_URI);
  cachedDb = client.db(DATABASE_NAME);

  return cachedDb;
}

async function getSubmissionsCollection(): Promise<Collection<AuditSubmission>> {
  const db = await connectToDatabase();
  return db.collection<AuditSubmission>(COLLECTION_NAME);
}

/**
 * Create a new audit submission
 */
export async function createAuditSubmission(
  data: Omit<AuditSubmission, '_id' | 'created_at' | 'status'>
): Promise<AuditSubmission> {
  const collection = await getSubmissionsCollection();

  const submission: AuditSubmission = {
    ...data,
    created_at: new Date(),
    status: 'new',
  };

  const result = await collection.insertOne(submission);

  return {
    ...submission,
    _id: result.insertedId.toString(),
  };
}

/**
 * Get submission by email
 */
export async function getSubmissionByEmail(email: string): Promise<AuditSubmission | null> {
  const collection = await getSubmissionsCollection();
  return collection.findOne({ email: email.toLowerCase() });
}

/**
 * Get submission by ID
 */
export async function getSubmissionById(id: string): Promise<AuditSubmission | null> {
  const collection = await getSubmissionsCollection();
  return collection.findOne({ _id: id });
}

/**
 * Get all submissions (for admin)
 */
export async function getAllSubmissions(
  filter?: Record<string, unknown>,
  limit: number = 100,
  skip: number = 0
): Promise<AuditSubmission[]> {
  const collection = await getSubmissionsCollection();
  return collection.find(filter || {}).limit(limit).skip(skip).toArray();
}

/**
 * Get submissions count
 */
export async function getSubmissionsCount(filter?: Record<string, unknown>): Promise<number> {
  const collection = await getSubmissionsCollection();
  return collection.countDocuments(filter || {});
}

/**
 * Update submission status
 */
export async function updateSubmissionStatus(
  id: string,
  status: AuditSubmission['status'],
  additionalData?: Partial<AuditSubmission>
): Promise<boolean> {
  const collection = await getSubmissionsCollection();

  const result = await collection.updateOne(
    { _id: id },
    {
      $set: {
        status,
        ...additionalData,
      },
    }
  );

  return result.modifiedCount > 0;
}

/**
 * Get submissions by status (for batch processing)
 */
export async function getSubmissionsByStatus(
  status: AuditSubmission['status'],
  limit: number = 10
): Promise<AuditSubmission[]> {
  const collection = await getSubmissionsCollection();
  return collection.find({ status }).limit(limit).toArray();
}

/**
 * Get analytics for submissions
 */
export async function getSubmissionsAnalytics() {
  const collection = await getSubmissionsCollection();

  const total = await collection.countDocuments();
  const byStatus = await collection
    .aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ])
    .toArray();

  const byBusinessType = await collection
    .aggregate([
      {
        $group: {
          _id: '$business_type',
          count: { $sum: 1 },
        },
      },
    ])
    .toArray();

  const byCity = await collection
    .aggregate([
      {
        $group: {
          _id: '$city',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])
    .toArray();

  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  const recentCount = await collection.countDocuments({
    created_at: { $gte: last7Days },
  });

  return {
    total,
    byStatus,
    byBusinessType,
    byCity,
    recentCount,
    submissionsLast7Days: recentCount,
  };
}

export type { AuditSubmission };
