import { db } from '../../shared/db';
import { products, categories } from '../../shared/schema';
import { eq, like, or, sql } from 'drizzle-orm';
import { 
  Product, 
  InsertProduct, 
  Category,
  InsertCategory,
  IProductStorage,
  ICategoryStorage 
} from '../../shared/storage';

/**
 * Product Storage implementation using database
 * Implements the IProductStorage interface
 */
export class ProductStorage implements IProductStorage {
  /**
   * Get a product by ID
   * @param id Product ID
   */
  async getById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }
  
  /**
   * Get all products
   */
  async getAll(): Promise<Product[]> {
    return await db.select().from(products);
  }
  
  /**
   * Create a new product
   * @param data Product data
   */
  async create(data: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(data).returning();
    return newProduct;
  }
  
  /**
   * Update a product
   * @param id Product ID
   * @param data Product data
   */
  async update(id: number, data: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct || undefined;
  }
  
  /**
   * Delete a product
   * @param id Product ID
   */
  async delete(id: number): Promise<boolean> {
    const [deletedProduct] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();
    return !!deletedProduct;
  }
  
  /**
   * Get products by category ID
   * @param categoryId Category ID
   */
  async getByCategoryId(categoryId: number): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.categoryId, categoryId));
  }
  
  /**
   * Search products by name or description
   * @param query Search query
   */
  async search(query: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(
        or(
          like(products.name, `%${query}%`),
          like(products.description as any, `%${query}%`)
        )
      );
  }
}

/**
 * Category Storage implementation using database
 * Implements the ICategoryStorage interface
 */
export class CategoryStorage implements ICategoryStorage {
  /**
   * Get a category by ID
   * @param id Category ID
   */
  async getById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }
  
  /**
   * Get all categories
   */
  async getAll(): Promise<Category[]> {
    return await db.select().from(categories);
  }
  
  /**
   * Create a new category
   * @param data Category data
   */
  async create(data: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(data).returning();
    return newCategory;
  }
  
  /**
   * Update a category
   * @param id Category ID
   * @param data Category data
   */
  async update(id: number, data: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory || undefined;
  }
  
  /**
   * Delete a category
   * @param id Category ID
   */
  async delete(id: number): Promise<boolean> {
    const [deletedCategory] = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();
    return !!deletedCategory;
  }
  
  /**
   * Get a category by slug
   * @param slug Category slug
   */
  async getBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category || undefined;
  }
}

// Export singleton instances
export const productStorage = new ProductStorage();
export const categoryStorage = new CategoryStorage();