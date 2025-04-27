/**
 * Event Broker for Asynchronous Communication
 * 
 * This module provides a broker for publishing and subscribing to events
 * for asynchronous communication between microservices.
 */

import Redis from 'ioredis';
import config from './config';
import { v4 as uuidv4 } from 'uuid';

// Event types for the application
export enum EventType {
  // User events
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
  
  // Product events
  PRODUCT_CREATED = 'product.created',
  PRODUCT_UPDATED = 'product.updated',
  PRODUCT_DELETED = 'product.deleted',
  PRODUCT_STOCK_UPDATED = 'product.stock_updated',
  
  // Order events
  ORDER_CREATED = 'order.created',
  ORDER_UPDATED = 'order.updated',
  ORDER_CANCELLED = 'order.cancelled',
  ORDER_COMPLETED = 'order.completed',
  ORDER_PAYMENT_SUCCESS = 'order.payment.success',
  ORDER_PAYMENT_FAILED = 'order.payment.failed',
  
  // Delivery events
  DELIVERY_CREATED = 'delivery.created',
  DELIVERY_ASSIGNED = 'delivery.assigned',
  DELIVERY_STARTED = 'delivery.started',
  DELIVERY_COMPLETED = 'delivery.completed',
  DELIVERY_CANCELLED = 'delivery.cancelled',
  DELIVERY_LOCATION_UPDATED = 'delivery.location.updated',
  
  // ONDC events
  ONDC_SEARCH_REQUEST = 'ondc.search.request',
  ONDC_SEARCH_RESPONSE = 'ondc.search.response',
  ONDC_SELECT_REQUEST = 'ondc.select.request',
  ONDC_SELECT_RESPONSE = 'ondc.select.response',
  ONDC_INIT_REQUEST = 'ondc.init.request',
  ONDC_INIT_RESPONSE = 'ondc.init.response',
  ONDC_CONFIRM_REQUEST = 'ondc.confirm.request',
  ONDC_CONFIRM_RESPONSE = 'ondc.confirm.response',
  ONDC_STATUS_REQUEST = 'ondc.status.request',
  ONDC_STATUS_RESPONSE = 'ondc.status.response',
  
  // System events
  SYSTEM_ERROR = 'system.error',
  SYSTEM_WARNING = 'system.warning',
  SYSTEM_INFO = 'system.info',
}

// Event structure
export interface Event {
  id: string;
  type: EventType;
  payload: any;
  metadata: {
    timestamp: string;
    source: string;
    userId?: number | string;
    correlationId?: string;
  };
}

// Handler type for event subscribers
export type EventHandler = (event: Event) => Promise<void> | void;

// Event subscription with handler
interface Subscription {
  id: string;
  eventType: EventType;
  handler: EventHandler;
}

// Memory-based implementation for local development
class MemoryEventBroker {
  private handlers: Map<EventType, Subscription[]> = new Map();
  
  // Subscribe to events
  async subscribe(eventType: EventType, handler: EventHandler): Promise<string> {
    const subscriptionId = uuidv4();
    const subscription: Subscription = {
      id: subscriptionId,
      eventType,
      handler,
    };
    
    const existingHandlers = this.handlers.get(eventType) || [];
    this.handlers.set(eventType, [...existingHandlers, subscription]);
    
    console.log(`Subscribed to event: ${eventType} (${subscriptionId})`);
    return subscriptionId;
  }
  
  // Unsubscribe from events
  async unsubscribe(subscriptionId: string): Promise<boolean> {
    let removed = false;
    
    this.handlers.forEach((subscriptions, eventType) => {
      const updatedSubscriptions = subscriptions.filter(sub => sub.id !== subscriptionId);
      
      if (updatedSubscriptions.length !== subscriptions.length) {
        this.handlers.set(eventType, updatedSubscriptions);
        removed = true;
        console.log(`Unsubscribed from event: ${eventType} (${subscriptionId})`);
      }
    });
    
    return removed;
  }
  
  // Publish an event
  async publish(eventType: EventType, payload: any, metadata: Partial<Event['metadata']> = {}): Promise<string> {
    const eventId = uuidv4();
    const event: Event = {
      id: eventId,
      type: eventType,
      payload,
      metadata: {
        timestamp: new Date().toISOString(),
        source: process.env.SERVICE_NAME || 'unknown',
        ...metadata,
        correlationId: metadata.correlationId || uuidv4(),
      },
    };
    
    console.log(`Publishing event: ${eventType} (${eventId})`);
    
    const handlers = this.handlers.get(eventType) || [];
    
    // Execute handlers asynchronously
    handlers.forEach(subscription => {
      try {
        subscription.handler(event);
      } catch (error) {
        console.error(`Error in event handler for ${eventType}:`, error);
      }
    });
    
    return eventId;
  }
}

// Redis-based implementation for production
class RedisEventBroker {
  private publisher: Redis;
  private subscriber: Redis;
  private handlers: Map<EventType, Subscription[]> = new Map();
  private channelPrefix = 'ondc-events:';
  
  constructor(redisUrl: string) {
    this.publisher = new Redis(redisUrl);
    this.subscriber = new Redis(redisUrl);
    
    // Handle Redis connection errors
    this.publisher.on('error', this.handleRedisError);
    this.subscriber.on('error', this.handleRedisError);
    
    // Setup message handler
    this.subscriber.on('message', (channel, message) => {
      try {
        const eventType = channel.replace(this.channelPrefix, '') as EventType;
        const event = JSON.parse(message) as Event;
        
        const handlers = this.handlers.get(eventType) || [];
        
        // Execute handlers
        handlers.forEach(subscription => {
          try {
            subscription.handler(event);
          } catch (error) {
            console.error(`Error in Redis event handler for ${eventType}:`, error);
          }
        });
      } catch (error) {
        console.error('Error processing Redis message:', error);
      }
    });
  }
  
  private handleRedisError(error: Error): void {
    console.error('Redis connection error:', error);
  }
  
  // Subscribe to events
  async subscribe(eventType: EventType, handler: EventHandler): Promise<string> {
    const subscriptionId = uuidv4();
    const subscription: Subscription = {
      id: subscriptionId,
      eventType,
      handler,
    };
    
    const existingHandlers = this.handlers.get(eventType) || [];
    this.handlers.set(eventType, [...existingHandlers, subscription]);
    
    // If this is the first subscription to this event type, subscribe to the Redis channel
    if (existingHandlers.length === 0) {
      await this.subscriber.subscribe(this.channelPrefix + eventType);
    }
    
    console.log(`Subscribed to Redis event: ${eventType} (${subscriptionId})`);
    return subscriptionId;
  }
  
  // Unsubscribe from events
  async unsubscribe(subscriptionId: string): Promise<boolean> {
    let removed = false;
    
    for (const [eventType, subscriptions] of this.handlers.entries()) {
      const updatedSubscriptions = subscriptions.filter(sub => sub.id !== subscriptionId);
      
      if (updatedSubscriptions.length !== subscriptions.length) {
        this.handlers.set(eventType, updatedSubscriptions);
        removed = true;
        
        // If there are no more handlers for this event type, unsubscribe from the Redis channel
        if (updatedSubscriptions.length === 0) {
          await this.subscriber.unsubscribe(this.channelPrefix + eventType);
        }
        
        console.log(`Unsubscribed from Redis event: ${eventType} (${subscriptionId})`);
      }
    }
    
    return removed;
  }
  
  // Publish an event
  async publish(eventType: EventType, payload: any, metadata: Partial<Event['metadata']> = {}): Promise<string> {
    const eventId = uuidv4();
    const event: Event = {
      id: eventId,
      type: eventType,
      payload,
      metadata: {
        timestamp: new Date().toISOString(),
        source: process.env.SERVICE_NAME || 'unknown',
        ...metadata,
        correlationId: metadata.correlationId || uuidv4(),
      },
    };
    
    console.log(`Publishing Redis event: ${eventType} (${eventId})`);
    
    await this.publisher.publish(this.channelPrefix + eventType, JSON.stringify(event));
    
    return eventId;
  }
  
  // Close Redis connections
  async close(): Promise<void> {
    await this.publisher.quit();
    await this.subscriber.quit();
  }
}

// Create the appropriate event broker based on environment
let broker: MemoryEventBroker | RedisEventBroker;

if (config.isProd && process.env.REDIS_URL) {
  console.log('Using Redis event broker');
  broker = new RedisEventBroker(process.env.REDIS_URL);
} else {
  console.log('Using in-memory event broker');
  broker = new MemoryEventBroker();
}

// Export the event broker instance
export const eventBroker = broker;