import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    console.log("Starting database seed process...");

    // Main Aamis Hakimpara coordinates - This is the central location
    const AAMIS_LATITUDE = "26.1965";
    const AAMIS_LONGITUDE = "91.7515";
    
    // Seed kitchens
    const kitchens = [
      {
        name: "Aamis Hakimpara",
        area: "Hakimpara",
        city: "Guwahati",
        openTime: "10:00 AM",
        closeTime: "10:00 PM",
        isActive: true,
        latitude: AAMIS_LATITUDE,
        longitude: AAMIS_LONGITUDE
      },
      {
        name: "Aamis Chandmari",
        area: "Chandmari",
        city: "Guwahati",
        openTime: "10:00 AM",
        closeTime: "10:00 PM",
        isActive: true,
        latitude: "26.1917",
        longitude: "91.7755"
      },
      {
        name: "Aamis Zoo Road",
        area: "Zoo Road",
        city: "Guwahati",
        openTime: "10:00 AM",
        closeTime: "11:00 PM",
        isActive: true,
        latitude: "26.1841",
        longitude: "91.7658"
      }
    ];

    // Check if kitchens exist before inserting
    const existingKitchens = await db.query.kitchens.findMany();
    if (existingKitchens.length === 0) {
      console.log("Seeding kitchens...");
      await db.insert(schema.kitchens).values(kitchens);
    } else {
      console.log("Kitchens already exist, skipping...");
    }

    // Seed categories
    const categories = [
      {
        name: "Chicken",
        slug: "chicken",
        description: "Fresh chicken products and cuts",
        imageUrl: "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?auto=format&fit=crop&q=80&w=200&h=200"
      },
      {
        name: "Mutton",
        slug: "mutton",
        description: "Premium goat meat and cuts",
        imageUrl: "https://images.unsplash.com/photo-1594221708779-94832f4320d1?auto=format&fit=crop&q=80&w=200&h=200"
      },
      {
        name: "Fish",
        slug: "fish",
        description: "Freshly caught and cleaned fish",
        imageUrl: "https://images.unsplash.com/photo-1635321593217-40050ad13c74?auto=format&fit=crop&q=80&w=200&h=200"
      },
      {
        name: "Marinades",
        slug: "marinades",
        description: "Chef's special marinades and seasonings",
        imageUrl: "https://images.unsplash.com/photo-1626200926749-da7eaedd9ce8?auto=format&fit=crop&q=80&w=200&h=200"
      },
      {
        name: "Ready to Cook",
        slug: "ready-to-cook",
        description: "Pre-prepared dishes, just heat and eat",
        imageUrl: "https://images.unsplash.com/photo-1615454299901-de13b71ecaae?auto=format&fit=crop&q=80&w=200&h=200"
      }
    ];

    // Check if categories exist before inserting
    const existingCategories = await db.query.categories.findMany();
    if (existingCategories.length === 0) {
      console.log("Seeding categories...");
      await db.insert(schema.categories).values(categories);
    } else {
      console.log("Categories already exist, skipping...");
    }

    // Get kitchen and category IDs
    const allKitchens = await db.query.kitchens.findMany();
    const allCategories = await db.query.categories.findMany();

    // Create a map for categories by slug
    const categoryMap = new Map(allCategories.map(c => [c.slug, c.id]));

    // Seed products
    const products = [
      {
        name: "Fresh Chicken Breast",
        description: "Premium boneless chicken breast, farm-raised and antibiotic free. Ideal for grilling, baking, or stir-frying.",
        price: "249.00",
        categoryId: categoryMap.get("chicken"),
        categorySlug: "chicken",
        imageUrl: "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?auto=format&fit=crop&q=80&w=500&h=500",
        inStock: true,
        kitchenId: allKitchens[0].id
      },
      {
        name: "Premium Mutton Curry Cut",
        description: "Fresh goat meat cut perfectly for curries and stews, from grass-fed goats.",
        price: "599.00",
        categoryId: categoryMap.get("mutton"),
        categorySlug: "mutton",
        imageUrl: "https://images.unsplash.com/photo-1594221708779-94832f4320d1?auto=format&fit=crop&q=80&w=500&h=500",
        inStock: true,
        kitchenId: allKitchens[0].id
      },
      {
        name: "Fresh Rohu Fish",
        description: "Freshly caught and cleaned Rohu fish, perfect for Bengali cuisine.",
        price: "349.00",
        categoryId: categoryMap.get("fish"),
        categorySlug: "fish",
        imageUrl: "https://images.unsplash.com/photo-1635321593217-40050ad13c74?auto=format&fit=crop&q=80&w=500&h=500",
        inStock: true,
        kitchenId: allKitchens[0].id
      },
      {
        name: "Chicken Tikka Marinade",
        description: "Traditional spice blend to create the perfect chicken tikka at home.",
        price: "199.00",
        categoryId: categoryMap.get("marinades"),
        categorySlug: "marinades",
        imageUrl: "https://images.unsplash.com/photo-1626200926749-da7eaedd9ce8?auto=format&fit=crop&q=80&w=500&h=500",
        inStock: true,
        kitchenId: allKitchens[0].id
      },
      {
        name: "Premium Duck",
        description: "Farm-raised whole duck, cleaned and ready to cook.",
        price: "499.00",
        categoryId: categoryMap.get("chicken"),
        categorySlug: "chicken",
        imageUrl: "https://images.unsplash.com/photo-1603048297172-c86544341dce?auto=format&fit=crop&q=80&w=500&h=500",
        inStock: false,
        kitchenId: allKitchens[0].id
      },
      {
        name: "Ready to Cook Butter Chicken",
        description: "Pre-marinated chicken pieces with authentic butter chicken sauce, just heat and eat.",
        price: "299.00",
        categoryId: categoryMap.get("ready-to-cook"),
        categorySlug: "ready-to-cook",
        imageUrl: "https://images.unsplash.com/photo-1615454299901-de13b71ecaae?auto=format&fit=crop&q=80&w=500&h=500",
        inStock: true,
        kitchenId: allKitchens[0].id
      }
    ];

    // Check if products exist before inserting
    const existingProducts = await db.query.products.findMany();
    if (existingProducts.length === 0) {
      console.log("Seeding products...");
      await db.insert(schema.products).values(products);
    } else {
      console.log("Products already exist, skipping...");
    }

    // Create delivery slots for the next 14 days
    const existingSlots = await db.query.deliverySlots.findMany();
    if (existingSlots.length === 0) {
      console.log("Seeding delivery slots...");
      const slots = [];
      
      for (const kitchen of allKitchens) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < 14; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() + i);
          
          // Create delivery slots for each day (10AM-12PM, 12PM-2PM, 2PM-4PM, 4PM-6PM, 6PM-8PM)
          const timeSlots = [
            { start: "10:00", end: "12:00" },
            { start: "12:00", end: "14:00" },
            { start: "14:00", end: "16:00" },
            { start: "16:00", end: "18:00" },
            { start: "18:00", end: "20:00" }
          ];
          
          for (const timeSlot of timeSlots) {
            const startTime = new Date(date);
            const [startHour, startMinute] = timeSlot.start.split(":").map(Number);
            startTime.setHours(startHour, startMinute, 0, 0);
            
            const endTime = new Date(date);
            const [endHour, endMinute] = timeSlot.end.split(":").map(Number);
            endTime.setHours(endHour, endMinute, 0, 0);
            
            // Only add future slots
            if (startTime > new Date()) {
              slots.push({
                startTime: startTime,
                endTime: endTime,
                capacity: 10, // Each slot can have 10 orders
                bookedCount: Math.floor(Math.random() * 6), // Random number of booked slots (0-5)
                kitchenId: kitchen.id
              });
            }
          }
        }
      }
      
      // Insert all delivery slots
      if (slots.length > 0) {
        await db.insert(schema.deliverySlots).values(slots);
      }
    } else {
      console.log("Delivery slots already exist, skipping...");
    }

    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Error during seed:", error);
  }
}

seed();
