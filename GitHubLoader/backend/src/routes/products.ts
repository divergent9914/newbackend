import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// Get all products with optional category filter
router.get('/', async (req, res) => {
  try {
    const { categorySlug } = req.query;
    
    if (categorySlug && typeof categorySlug === 'string') {
      const filtered = await storage.getProductsByCategorySlug(categorySlug);
      return res.json(filtered);
    }
    
    const products = await storage.getProducts();
    res.json(products);
  } catch (error: any) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
});

// Get featured products
router.get('/featured', async (req, res) => {
  try {
    const products = await storage.getProducts();
    const featured = products.filter(p => 
      p.categorySlug === "bestseller" || p.categorySlug === "chef-special"
    );
    res.json(featured);
  } catch (error: any) {
    console.error("Error fetching featured products:", error);
    res.status(500).json({ message: "Error fetching featured products" });
  }
});

// Get products grouped by category
router.get('/by-category', async (req, res) => {
  try {
    // Get all products
    const products = await storage.getProducts();
    
    // Get all categories
    const categories = await storage.getCategories();
    
    // Group products by category
    const productsByCategory = categories.reduce<Record<number, any[]>>((acc, category) => {
      const categoryProducts = products.filter(product => product.categoryId === category.id);
      if (categoryProducts.length > 0) {
        acc[category.id] = categoryProducts;
      }
      return acc;
    }, {});
    
    res.json(productsByCategory);
  } catch (error: any) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ message: "Error fetching products by category" });
  }
});

// Get related products
router.get('/related/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = await storage.getProduct(productId);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    // Get products from the same category
    if (product.categoryId) {
      const categoryProducts = await storage.getProductsByCategory(product.categoryId);
      const related = categoryProducts.filter(p => p.id !== productId);
      return res.json(related);
    }
    
    // If no category, return empty array
    res.json([]);
  } catch (error: any) {
    console.error("Error fetching related products:", error);
    res.status(500).json({ message: "Error fetching related products" });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = await storage.getProduct(productId);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(product);
  } catch (error: any) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Error fetching product" });
  }
});

// Create product (admin route)
router.post('/', async (req, res) => {
  try {
    const productData = req.body;
    const newProduct = await storage.createProduct(productData);
    res.status(201).json(newProduct);
  } catch (error: any) {
    console.error("Error creating product:", error);
    res.status(400).json({ message: error.message || "Error creating product" });
  }
});

// Update product (admin route)
router.put('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const productData = req.body;
    
    const updatedProduct = await storage.updateProduct(productId, productData);
    
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(updatedProduct);
  } catch (error: any) {
    console.error("Error updating product:", error);
    res.status(400).json({ message: error.message || "Error updating product" });
  }
});

// Delete product (admin route)
router.delete('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    // Verify product exists
    const product = await storage.getProduct(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    await storage.deleteProduct(productId);
    res.status(204).end();
  } catch (error: any) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: error.message || "Error deleting product" });
  }
});

export default router;