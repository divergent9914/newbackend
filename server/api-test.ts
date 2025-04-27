import fetch from 'node-fetch';
import { db } from './db';
import { products } from '../shared/schema';

const BASE_URL = 'http://localhost:3001/api';

async function seedDatabase() {
  console.log('Checking for existing products...');
  const existingProducts = await db.select().from(products);
  
  if (existingProducts.length === 0) {
    console.log('Seeding products...');
    await db.insert(products).values([
      { 
        name: 'Butter Chicken', 
        description: 'Creamy tomato curry with chicken', 
        price: 349, 
        categoryId: 1, 
        stock: 10, 
        imageUrl: 'https://picsum.photos/seed/product1/600/400' 
      },
      { 
        name: 'Vegetable Biryani', 
        description: 'Fragrant rice dish with mixed vegetables', 
        price: 299, 
        categoryId: 1, 
        stock: 15, 
        imageUrl: 'https://picsum.photos/seed/product2/600/400' 
      },
      { 
        name: 'Paneer Tikka', 
        description: 'Grilled cottage cheese with spices', 
        price: 249, 
        categoryId: 2, 
        stock: 8, 
        imageUrl: 'https://picsum.photos/seed/product3/600/400' 
      },
      { 
        name: 'Chocolate Brownie', 
        description: 'Rich chocolate dessert with nuts', 
        price: 199, 
        categoryId: 3, 
        stock: 20, 
        imageUrl: 'https://picsum.photos/seed/product4/600/400' 
      }
    ]);
    console.log('Products seeded successfully!');
  } else {
    console.log(`Found ${existingProducts.length} existing products, skipping seed.`);
  }
}

async function testCategories() {
  console.log('\nTesting categories endpoint...');
  const response = await fetch(`${BASE_URL}/categories`);
  const categories = await response.json();
  console.log('Categories:', categories);
  return categories;
}

async function testProducts() {
  console.log('\nTesting products endpoint...');
  const response = await fetch(`${BASE_URL}/products`);
  const products = await response.json();
  console.log(`Found ${products.length} products`);
  console.log('First product:', products[0]);
  return products;
}

async function testProductById(id: number) {
  console.log(`\nTesting product detail endpoint for ID ${id}...`);
  const response = await fetch(`${BASE_URL}/products/${id}`);
  const product = await response.json();
  console.log('Product details:', product);
  return product;
}

async function testFilteredProducts(categorySlug: string) {
  console.log(`\nTesting filtered products for category ${categorySlug}...`);
  const response = await fetch(`${BASE_URL}/products?category=${categorySlug}`);
  const products = await response.json();
  console.log(`Found ${products.length} products in category ${categorySlug}`);
  return products;
}

async function runTests() {
  try {
    // First seed the database if needed
    await seedDatabase();
    
    // Test categories endpoint
    const categories = await testCategories();
    
    // Test products endpoint
    const products = await testProducts();
    
    // Test product detail endpoint if products exist
    if (products.length > 0) {
      await testProductById(products[0].id);
    }
    
    // Test filtered products endpoint if categories exist
    if (categories.length > 0) {
      await testFilteredProducts(categories[0].slug);
    }
    
    console.log('\nAPI tests completed successfully!');
  } catch (error) {
    console.error('Error during API testing:', error);
  } finally {
    // Close the database connection
    await db.end();
  }
}

// Run the tests
runTests();