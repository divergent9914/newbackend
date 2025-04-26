import { db } from "./db";
import { 
  users, 
  kitchens, 
  categories, 
  products, 
  deliverySlots,
  type InsertKitchen,
  type InsertCategory,
  type InsertProduct,
  type InsertDeliverySlot
} from "@shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // First, check if data already exists to avoid duplicates
  const existingCategories = await db.select().from(categories);
  if (existingCategories.length > 0) {
    console.log("Database already seeded. Skipping...");
    return;
  }

  // Seed kitchens
  const kitchenData: InsertKitchen[] = [
    {
      name: "Aamis Central Kitchen",
      area: "Ganeshguri",
      city: "Guwahati",
      openTime: "10:00 AM",
      closeTime: "10:00 PM",
      isActive: true,
      latitude: "26.1445",
      longitude: "91.7362"
    },
    {
      name: "Aamis Downtown",
      area: "Zoo Road",
      city: "Guwahati",
      openTime: "9:00 AM",
      closeTime: "11:00 PM",
      isActive: true,
      latitude: "26.1429",
      longitude: "91.7414"
    },
    {
      name: "Aamis Riverside",
      area: "Uzanbazar",
      city: "Guwahati",
      openTime: "9:30 AM",
      closeTime: "9:30 PM",
      isActive: true,
      latitude: "26.1890",
      longitude: "91.7465"
    }
  ];

  const insertedKitchens = await db.insert(kitchens).values(kitchenData).returning();
  console.log(`Inserted ${insertedKitchens.length} kitchens`);

  // Seed categories
  const categoryData: InsertCategory[] = [
    {
      name: "Duck & Chicken",
      slug: "duck-chicken",
      description: "Traditional Assamese duck and chicken preparations"
    },
    {
      name: "Fish Specialties",
      slug: "fish",
      description: "Fresh fish dishes prepared in authentic Assamese style"
    },
    {
      name: "Pork Dishes",
      slug: "pork",
      description: "Flavorful pork dishes from Assam"
    },
    {
      name: "Vegetarian",
      slug: "vegetarian",
      description: "Authentic vegetarian options from Assamese cuisine"
    },
    {
      name: "Rice & Breads",
      slug: "rice-breads",
      description: "Traditional rice and bread selections"
    },
    {
      name: "Bestseller",
      slug: "bestseller",
      description: "Our most popular dishes"
    },
    {
      name: "Chef's Special",
      slug: "chef-special",
      description: "Special dishes prepared by our master chef"
    }
  ];

  const insertedCategories = await db.insert(categories).values(categoryData).returning();
  console.log(`Inserted ${insertedCategories.length} categories`);

  // Seed products
  const productData: InsertProduct[] = [
    {
      name: "Assamese Duck Curry",
      description: "Traditional duck curry with bamboo shoot and spices",
      price: "320.00",
      categoryId: 1,
      categorySlug: "bestseller",
      imageUrl: "https://images.unsplash.com/photo-1613844237701-8f3664fc2eff?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      inStock: true,
      kitchenId: 1
    },
    {
      name: "Bamboo Shoot Pork",
      description: "Pork cooked with fermented bamboo shoot",
      price: "280.00",
      categoryId: 3,
      categorySlug: "pork",
      imageUrl: "https://images.unsplash.com/photo-1589647363574-f53ef5e5744d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      inStock: true,
      kitchenId: 1
    },
    {
      name: "Masor Tenga",
      description: "Traditional sour fish curry with tomato and lemon",
      price: "250.00",
      categoryId: 2,
      categorySlug: "chef-special",
      imageUrl: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      inStock: true,
      kitchenId: 1
    },
    {
      name: "Khar",
      description: "Traditional starter made with raw papaya and lentils",
      price: "180.00",
      categoryId: 4,
      categorySlug: "vegetarian",
      imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      inStock: true,
      kitchenId: 1
    },
    {
      name: "Chicken with Ash Gourd",
      description: "Tender chicken pieces cooked with ash gourd",
      price: "260.00",
      categoryId: 1,
      categorySlug: "duck-chicken",
      imageUrl: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      inStock: true,
      kitchenId: 1
    },
    {
      name: "Pabda Fish Curry",
      description: "Delicate pabda fish in a light mustard curry",
      price: "290.00",
      categoryId: 2,
      categorySlug: "fish",
      imageUrl: "https://images.unsplash.com/photo-1518732751612-2c0787ff5684?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      inStock: true,
      kitchenId: 1
    }
  ];

  const insertedProducts = await db.insert(products).values(productData).returning();
  console.log(`Inserted ${insertedProducts.length} products`);

  // Seed delivery slots
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const deliverySlotData: InsertDeliverySlot[] = [
    {
      startTime: new Date(tomorrow.setHours(12, 30, 0)),
      endTime: new Date(tomorrow.setHours(13, 0, 0)),
      capacity: 10,
      bookedCount: 3,
      kitchenId: 1
    },
    {
      startTime: new Date(tomorrow.setHours(13, 0, 0)),
      endTime: new Date(tomorrow.setHours(13, 30, 0)),
      capacity: 10,
      bookedCount: 1,
      kitchenId: 1
    },
    {
      startTime: new Date(tomorrow.setHours(13, 30, 0)),
      endTime: new Date(tomorrow.setHours(14, 0, 0)),
      capacity: 10,
      bookedCount: 2,
      kitchenId: 1
    },
    {
      startTime: new Date(tomorrow.setHours(14, 0, 0)),
      endTime: new Date(tomorrow.setHours(14, 30, 0)),
      capacity: 10,
      bookedCount: 0,
      kitchenId: 1
    }
  ];

  const insertedDeliverySlots = await db.insert(deliverySlots).values(deliverySlotData).returning();
  console.log(`Inserted ${insertedDeliverySlots.length} delivery slots`);

  console.log("✅ Seeding completed successfully!");
}

seed().catch(error => {
  console.error("Error seeding database:", error);
  process.exit(1);
}).finally(() => {
  process.exit(0);
});