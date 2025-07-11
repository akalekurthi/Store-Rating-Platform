import { users, stores, ratings, type User, type InsertUser, type Store, type InsertStore, type Rating, type InsertRating } from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, like, or, avg, count, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(id: number, hashedPassword: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  
  // Store operations
  createStore(store: InsertStore): Promise<Store>;
  getAllStores(): Promise<Store[]>;
  getStoreById(id: number): Promise<Store | undefined>;
  getStoresByOwner(ownerId: number): Promise<Store[]>;
  searchStores(query: string): Promise<Store[]>;
  updateStoreRating(storeId: number): Promise<void>;
  
  // Rating operations
  createRating(rating: InsertRating): Promise<Rating>;
  updateRating(userId: number, storeId: number, rating: InsertRating): Promise<Rating>;
  getRatingByUserAndStore(userId: number, storeId: number): Promise<Rating | undefined>;
  getRatingsByStore(storeId: number): Promise<Rating[]>;
  getRatingsByUser(userId: number): Promise<Rating[]>;
  
  // Stats operations
  getStatistics(): Promise<{ totalUsers: number; totalStores: number; totalRatings: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...userData, password: hashedPassword })
      .returning();
    return user;
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<void> {
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.name));
  }

  async createStore(storeData: InsertStore): Promise<Store> {
    const [store] = await db
      .insert(stores)
      .values(storeData)
      .returning();
    return store;
  }

  async getAllStores(): Promise<Store[]> {
    return await db.select().from(stores).orderBy(asc(stores.name));
  }

  async getStoreById(id: number): Promise<Store | undefined> {
    const [store] = await db.select().from(stores).where(eq(stores.id, id));
    return store;
  }

  async getStoresByOwner(ownerId: number): Promise<Store[]> {
    return await db.select().from(stores).where(eq(stores.ownerId, ownerId));
  }

  async searchStores(query: string): Promise<Store[]> {
    return await db
      .select()
      .from(stores)
      .where(
        or(
          like(stores.name, `%${query}%`),
          like(stores.address, `%${query}%`)
        )
      )
      .orderBy(asc(stores.name));
  }

  async updateStoreRating(storeId: number): Promise<void> {
    const [result] = await db
      .select({
        avgRating: avg(ratings.rating),
        totalRatings: count(ratings.id)
      })
      .from(ratings)
      .where(eq(ratings.storeId, storeId));

    await db
      .update(stores)
      .set({
        averageRating: result.avgRating ? parseFloat(result.avgRating).toFixed(2) : "0.00",
        totalRatings: result.totalRatings || 0
      })
      .where(eq(stores.id, storeId));
  }

  async createRating(ratingData: InsertRating): Promise<Rating> {
    const [rating] = await db
      .insert(ratings)
      .values(ratingData)
      .returning();
    
    await this.updateStoreRating(ratingData.storeId);
    return rating;
  }

  async updateRating(userId: number, storeId: number, ratingData: InsertRating): Promise<Rating> {
    const [rating] = await db
      .update(ratings)
      .set(ratingData)
      .where(and(eq(ratings.userId, userId), eq(ratings.storeId, storeId)))
      .returning();
    
    await this.updateStoreRating(storeId);
    return rating;
  }

  async getRatingByUserAndStore(userId: number, storeId: number): Promise<Rating | undefined> {
    const [rating] = await db
      .select()
      .from(ratings)
      .where(and(eq(ratings.userId, userId), eq(ratings.storeId, storeId)));
    return rating;
  }

  async getRatingsByStore(storeId: number): Promise<Rating[]> {
    return await db
      .select()
      .from(ratings)
      .where(eq(ratings.storeId, storeId))
      .orderBy(desc(ratings.createdAt));
  }

  async getRatingsByUser(userId: number): Promise<Rating[]> {
    return await db
      .select()
      .from(ratings)
      .where(eq(ratings.userId, userId))
      .orderBy(desc(ratings.createdAt));
  }

  async getStatistics(): Promise<{ totalUsers: number; totalStores: number; totalRatings: number }> {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [storeCount] = await db.select({ count: count() }).from(stores);
    const [ratingCount] = await db.select({ count: count() }).from(ratings);

    return {
      totalUsers: userCount.count,
      totalStores: storeCount.count,
      totalRatings: ratingCount.count
    };
  }
}

export const storage = new DatabaseStorage();
