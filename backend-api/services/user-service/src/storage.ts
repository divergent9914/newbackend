import { db } from '../../shared/db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { 
  User, 
  InsertUser, 
  IUserStorage 
} from '../../shared/storage';

/**
 * User Storage implementation using database
 * Implements the IUserStorage interface
 */
export class UserStorage implements IUserStorage {
  /**
   * Get a user by ID
   * @param id User ID
   */
  async getById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }
  
  /**
   * Get all users
   */
  async getAll(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  /**
   * Create a new user
   * @param data User data
   */
  async create(data: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(data).returning();
    return newUser;
  }
  
  /**
   * Update a user
   * @param id User ID
   * @param data User data
   */
  async update(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }
  
  /**
   * Delete a user
   * @param id User ID
   */
  async delete(id: number): Promise<boolean> {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    return !!deletedUser;
  }
  
  /**
   * Get a user by username
   * @param username Username
   */
  async getByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  /**
   * Authenticate a user with username and password
   * @param username Username
   * @param password Password
   */
  async authenticate(username: string, password: string): Promise<User | undefined> {
    const user = await this.getByUsername(username);
    if (!user) return undefined;
    
    // Simple password check (in real app, use proper password hashing)
    if (user.password !== password) return undefined;
    
    return user;
  }
}

// Export a singleton instance
export const userStorage = new UserStorage();