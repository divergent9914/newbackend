import { EventEmitter } from 'events';

/**
 * Event types for the event broker
 */
export enum EventType {
  // User events
  USER_CREATED = 'user:created',
  USER_UPDATED = 'user:updated',
  USER_DELETED = 'user:deleted',
  
  // Product events
  PRODUCT_CREATED = 'product:created',
  PRODUCT_UPDATED = 'product:updated',
  PRODUCT_DELETED = 'product:deleted',
  
  // Order events
  ORDER_CREATED = 'order:created',
  ORDER_UPDATED = 'order:updated',
  ORDER_PAID = 'order:paid',
  ORDER_CANCELLED = 'order:cancelled',
  ORDER_COMPLETED = 'order:completed',
  
  // Payment events
  PAYMENT_CREATED = 'payment:created',
  PAYMENT_UPDATED = 'payment:updated',
  PAYMENT_SUCCEEDED = 'payment:succeeded',
  PAYMENT_FAILED = 'payment:failed',
  
  // Delivery events
  DELIVERY_CREATED = 'delivery:created',
  DELIVERY_UPDATED = 'delivery:updated',
  DELIVERY_ASSIGNED = 'delivery:assigned',
  DELIVERY_STARTED = 'delivery:started',
  DELIVERY_COMPLETED = 'delivery:completed',
  DELIVERY_LOCATION_UPDATED = 'delivery:location:updated',
  
  // ONDC events
  ONDC_ORDER_CREATED = 'ondc:order:created',
  ONDC_ORDER_CONFIRMED = 'ondc:order:confirmed',
  ONDC_ORDER_FULFILLED = 'ondc:order:fulfilled'
}

/**
 * Event handler function type
 */
export type EventHandler = (data: any) => void | Promise<void>;

/**
 * Event broker for publishing and subscribing to events across services
 * Uses Node.js EventEmitter for local events, but could be extended to use
 * Redis, Kafka, RabbitMQ, etc. for distributed events
 */
export class EventBroker {
  private emitter: EventEmitter;
  
  constructor() {
    this.emitter = new EventEmitter();
    // Set max listeners to avoid memory leak warnings
    this.emitter.setMaxListeners(100);
  }
  
  /**
   * Subscribe to an event
   * @param eventType Event type
   * @param handler Event handler
   */
  subscribe(eventType: EventType, handler: EventHandler): void {
    this.emitter.on(eventType, handler);
  }
  
  /**
   * Unsubscribe from an event
   * @param eventType Event type
   * @param handler Event handler
   */
  unsubscribe(eventType: EventType, handler: EventHandler): void {
    this.emitter.off(eventType, handler);
  }
  
  /**
   * Subscribe to an event once
   * @param eventType Event type
   * @param handler Event handler
   */
  subscribeOnce(eventType: EventType, handler: EventHandler): void {
    this.emitter.once(eventType, handler);
  }
  
  /**
   * Publish an event
   * @param eventType Event type
   * @param data Event data
   */
  publish(eventType: EventType, data: any): void {
    this.emitter.emit(eventType, data);
    
    // Log the event if in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`[EVENT] ${eventType}:`, 
        JSON.stringify(data, (key, value) => {
          if (value instanceof Date) {
            return value.toISOString();
          }
          return value;
        }, 2)
      );
    }
  }
}

// Export singleton instance
export const eventBroker = new EventBroker();