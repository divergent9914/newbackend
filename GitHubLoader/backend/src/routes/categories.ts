import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await storage.getCategories();
    res.json(categories);
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Error fetching categories" });
  }
});

// Get category by slug
router.get('/:slug', async (req, res) => {
  try {
    const category = await storage.getCategoryBySlug(req.params.slug);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (error: any) {
    console.error("Error fetching category:", error);
    res.status(500).json({ message: "Error fetching category" });
  }
});

// Create category (admin route)
router.post('/', async (req, res) => {
  try {
    const categoryData = req.body;
    const newCategory = await storage.createCategory(categoryData);
    res.status(201).json(newCategory);
  } catch (error: any) {
    console.error("Error creating category:", error);
    res.status(400).json({ message: error.message || "Error creating category" });
  }
});

// Update category (admin route)
router.put('/:id', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    const categoryData = req.body;
    
    const updatedCategory = await storage.updateCategory(categoryId, categoryData);
    
    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.json(updatedCategory);
  } catch (error: any) {
    console.error("Error updating category:", error);
    res.status(400).json({ message: error.message || "Error updating category" });
  }
});

// Delete category (admin route)
router.delete('/:id', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    
    // Verify category exists
    const category = await storage.getCategory(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    await storage.deleteCategory(categoryId);
    res.status(204).end();
  } catch (error: any) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: error.message || "Error deleting category" });
  }
});

export default router;