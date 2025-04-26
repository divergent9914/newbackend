import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// Get all kitchens
router.get('/', async (req, res) => {
  try {
    const kitchens = await storage.getKitchens();
    res.json(kitchens);
  } catch (error: any) {
    console.error("Error fetching kitchens:", error);
    res.status(500).json({ message: "Error fetching kitchens" });
  }
});

// Get kitchen by ID
router.get('/:id', async (req, res) => {
  try {
    const kitchenId = parseInt(req.params.id);
    const kitchen = await storage.getKitchen(kitchenId);
    
    if (!kitchen) {
      return res.status(404).json({ message: "Kitchen not found" });
    }
    
    res.json(kitchen);
  } catch (error: any) {
    console.error("Error fetching kitchen:", error);
    res.status(500).json({ message: "Error fetching kitchen" });
  }
});

// Create kitchen (admin route)
router.post('/', async (req, res) => {
  try {
    const kitchenData = req.body;
    const newKitchen = await storage.createKitchen(kitchenData);
    res.status(201).json(newKitchen);
  } catch (error: any) {
    console.error("Error creating kitchen:", error);
    res.status(400).json({ message: error.message || "Error creating kitchen" });
  }
});

// Update kitchen (admin route)
router.put('/:id', async (req, res) => {
  try {
    const kitchenId = parseInt(req.params.id);
    const kitchenData = req.body;
    
    const updatedKitchen = await storage.updateKitchen(kitchenId, kitchenData);
    
    if (!updatedKitchen) {
      return res.status(404).json({ message: "Kitchen not found" });
    }
    
    res.json(updatedKitchen);
  } catch (error: any) {
    console.error("Error updating kitchen:", error);
    res.status(400).json({ message: error.message || "Error updating kitchen" });
  }
});

// Delete kitchen (admin route)
router.delete('/:id', async (req, res) => {
  try {
    const kitchenId = parseInt(req.params.id);
    
    // Verify kitchen exists
    const kitchen = await storage.getKitchen(kitchenId);
    if (!kitchen) {
      return res.status(404).json({ message: "Kitchen not found" });
    }
    
    await storage.deleteKitchen(kitchenId);
    res.status(204).end();
  } catch (error: any) {
    console.error("Error deleting kitchen:", error);
    res.status(500).json({ message: error.message || "Error deleting kitchen" });
  }
});

export default router;