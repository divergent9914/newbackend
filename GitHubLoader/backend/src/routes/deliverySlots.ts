import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// Get all delivery slots with optional kitchen filter
router.get('/', async (req, res) => {
  try {
    const { kitchenId } = req.query;
    
    // If kitchen ID is provided, get slots for that kitchen
    if (kitchenId && typeof kitchenId === 'string') {
      const kitchenIdNum = parseInt(kitchenId);
      const slots = await storage.getDeliverySlotsByKitchen(kitchenIdNum);
      return res.json(slots);
    }
    
    // Otherwise get all slots
    const slots = await storage.getDeliverySlots();
    res.json(slots);
  } catch (error: any) {
    console.error("Error fetching delivery slots:", error);
    res.status(500).json({ message: "Error fetching delivery slots" });
  }
});

// Get delivery slot by ID
router.get('/:id', async (req, res) => {
  try {
    const slotId = parseInt(req.params.id);
    const slot = await storage.getDeliverySlot(slotId);
    
    if (!slot) {
      return res.status(404).json({ message: "Delivery slot not found" });
    }
    
    res.json(slot);
  } catch (error: any) {
    console.error("Error fetching delivery slot:", error);
    res.status(500).json({ message: "Error fetching delivery slot" });
  }
});

// Create delivery slot (admin route)
router.post('/', async (req, res) => {
  try {
    const slotData = req.body;
    const newSlot = await storage.createDeliverySlot(slotData);
    res.status(201).json(newSlot);
  } catch (error: any) {
    console.error("Error creating delivery slot:", error);
    res.status(400).json({ message: error.message || "Error creating delivery slot" });
  }
});

// Update delivery slot (admin route)
router.put('/:id', async (req, res) => {
  try {
    const slotId = parseInt(req.params.id);
    const slotData = req.body;
    
    const updatedSlot = await storage.updateDeliverySlot(slotId, slotData);
    
    if (!updatedSlot) {
      return res.status(404).json({ message: "Delivery slot not found" });
    }
    
    res.json(updatedSlot);
  } catch (error: any) {
    console.error("Error updating delivery slot:", error);
    res.status(400).json({ message: error.message || "Error updating delivery slot" });
  }
});

// Delete delivery slot (admin route)
router.delete('/:id', async (req, res) => {
  try {
    const slotId = parseInt(req.params.id);
    
    // Verify slot exists
    const slot = await storage.getDeliverySlot(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Delivery slot not found" });
    }
    
    await storage.deleteDeliverySlot(slotId);
    res.status(204).end();
  } catch (error: any) {
    console.error("Error deleting delivery slot:", error);
    res.status(500).json({ message: error.message || "Error deleting delivery slot" });
  }
});

export default router;