import { deliveryStorage, deliveryLocationHistoryStorage } from './storage';
import { eventBroker, EventType } from '../../shared/event-broker';
import config from '../../shared/config';
import { Delivery, InsertDeliveryLocationHistory } from '../../shared/schema';

/**
 * Delivery service class
 * Contains business logic for delivery operations
 */
export class DeliveryService {
  private baseLocation = {
    latitude: config.baseLocation.latitude,
    longitude: config.baseLocation.longitude
  };
  
  /**
   * Update delivery location
   * @param deliveryId Delivery ID
   * @param latitude Latitude
   * @param longitude Longitude
   * @param speed Speed (optional)
   * @param heading Heading (optional)
   * @param accuracy Accuracy (optional)
   * @param batteryLevel Battery level (optional)
   * @param metadata Additional metadata (optional)
   */
  async updateDeliveryLocation(
    deliveryId: number,
    latitude: string,
    longitude: string,
    speed?: number,
    heading?: number,
    accuracy?: number,
    batteryLevel?: number,
    metadata?: any
  ): Promise<Delivery | undefined> {
    // First check if delivery exists
    const delivery = await deliveryStorage.getById(deliveryId);
    if (!delivery) {
      throw new Error('Delivery not found');
    }
    
    // Create location history entry
    const locationData: InsertDeliveryLocationHistory = {
      deliveryId,
      latitude,
      longitude,
      speed: speed || null,
      heading: heading || null,
      accuracy: accuracy || null,
      batteryLevel: batteryLevel || null,
      metadata: metadata || {}
    };
    
    const locationHistory = await deliveryLocationHistoryStorage.create(locationData);
    
    // Update delivery with latest location
    const updatedDelivery = await deliveryStorage.update(deliveryId, {
      currentLat: latitude,
      currentLng: longitude,
      lastLocationUpdateTime: new Date()
    });
    
    // Calculate ETA if destination coordinates are set
    if (updatedDelivery && updatedDelivery.destinationLat && updatedDelivery.destinationLng) {
      const eta = this.calculateETA(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(updatedDelivery.destinationLat),
        parseFloat(updatedDelivery.destinationLng),
        speed || 0
      );
      
      if (eta) {
        await deliveryStorage.update(deliveryId, {
          estimatedArrivalTime: eta
        });
      }
    }
    
    // Publish location updated event
    eventBroker.publish(EventType.DELIVERY_LOCATION_UPDATED, {
      deliveryId,
      latitude,
      longitude,
      speed,
      timestamp: new Date()
    });
    
    return updatedDelivery;
  }
  
  /**
   * Start a delivery
   * @param deliveryId Delivery ID
   */
  async startDelivery(deliveryId: number): Promise<Delivery | undefined> {
    const delivery = await deliveryStorage.getById(deliveryId);
    if (!delivery) {
      throw new Error('Delivery not found');
    }
    
    // Update delivery status and start time
    const updatedDelivery = await deliveryStorage.update(deliveryId, {
      status: 'in_transit',
      startTime: new Date()
    });
    
    // Publish delivery updated event
    eventBroker.publish(EventType.DELIVERY_UPDATED, updatedDelivery);
    
    return updatedDelivery;
  }
  
  /**
   * Complete a delivery
   * @param deliveryId Delivery ID
   */
  async completeDelivery(deliveryId: number): Promise<Delivery | undefined> {
    const delivery = await deliveryStorage.getById(deliveryId);
    if (!delivery) {
      throw new Error('Delivery not found');
    }
    
    // Update delivery status and completion time
    const updatedDelivery = await deliveryStorage.update(deliveryId, {
      status: 'delivered',
      completedTime: new Date()
    });
    
    // Publish delivery completed event
    eventBroker.publish(EventType.DELIVERY_COMPLETED, updatedDelivery);
    
    return updatedDelivery;
  }
  
  /**
   * Simulate a delivery to test tracking functionality
   * @param deliveryId Delivery ID
   */
  async simulateDelivery(deliveryId: number): Promise<void> {
    const delivery = await deliveryStorage.getById(deliveryId);
    if (!delivery) {
      throw new Error('Delivery not found');
    }
    
    // Only simulate deliveries that are pending or in_transit
    if (delivery.status !== 'pending' && delivery.status !== 'in_transit') {
      throw new Error('Cannot simulate delivery with status: ' + delivery.status);
    }
    
    // Start the delivery if it's pending
    if (delivery.status === 'pending') {
      await this.startDelivery(deliveryId);
    }
    
    // Get delivery destination coordinates
    const destLat = delivery.destinationLat 
      ? parseFloat(delivery.destinationLat) 
      : parseFloat(this.baseLocation.latitude);
    
    const destLng = delivery.destinationLng
      ? parseFloat(delivery.destinationLng)
      : parseFloat(this.baseLocation.longitude);
    
    // Get current location or use base location
    const startLat = delivery.currentLat 
      ? parseFloat(delivery.currentLat) 
      : parseFloat(this.baseLocation.latitude);
    
    const startLng = delivery.currentLng
      ? parseFloat(delivery.currentLng)
      : parseFloat(this.baseLocation.longitude);
    
    // Generate waypoints between start and destination
    const waypoints = this.generateWaypoints(
      startLat, startLng,
      destLat, destLng,
      10 // number of waypoints
    );
    
    console.log(`Simulating delivery ${deliveryId} with ${waypoints.length} waypoints`);
    
    // Simulate movement along waypoints
    for (let i = 0; i < waypoints.length; i++) {
      const { lat, lng } = waypoints[i];
      
      // Calculate speed (random between 10-30 km/h)
      const speed = 10 + Math.random() * 20;
      
      // Calculate heading (direction)
      let heading = 0;
      if (i > 0) {
        const prevLat = waypoints[i-1].lat;
        const prevLng = waypoints[i-1].lng;
        heading = this.calculateHeading(prevLat, prevLng, lat, lng);
      }
      
      // Update delivery location
      await this.updateDeliveryLocation(
        deliveryId,
        lat.toString(),
        lng.toString(),
        speed,
        heading,
        5, // accuracy in meters
        100, // battery level (100%)
        { simulated: true }
      );
      
      // Wait 2 seconds between updates
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Complete the delivery
    await this.completeDelivery(deliveryId);
  }
  
  /**
   * Calculate the estimated time of arrival
   * @param lat1 Current latitude
   * @param lng1 Current longitude
   * @param lat2 Destination latitude
   * @param lng2 Destination longitude
   * @param speed Current speed in km/h
   * @returns Estimated arrival time
   */
  private calculateETA(
    lat1: number, 
    lng1: number, 
    lat2: number, 
    lng2: number, 
    speed: number
  ): Date | null {
    if (!speed || speed <= 0) {
      // Use default speed of 20 km/h if speed is not provided or invalid
      speed = 20;
    }
    
    // Calculate distance in kilometers
    const distance = this.calculateDistance(lat1, lng1, lat2, lng2);
    
    // Calculate time in hours
    const timeInHours = distance / speed;
    
    // Calculate arrival time
    const now = new Date();
    const arrivalTime = new Date(now.getTime() + timeInHours * 60 * 60 * 1000);
    
    return arrivalTime;
  }
  
  /**
   * Calculate distance between two points using Haversine formula
   * @param lat1 First latitude
   * @param lng1 First longitude
   * @param lat2 Second latitude
   * @param lng2 Second longitude
   * @returns Distance in kilometers
   */
  private calculateDistance(
    lat1: number, 
    lng1: number, 
    lat2: number, 
    lng2: number
  ): number {
    const R = 6371; // Earth radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }
  
  /**
   * Convert degrees to radians
   * @param degrees Angle in degrees
   * @returns Angle in radians
   */
  private toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }
  
  /**
   * Calculate heading between two points
   * @param lat1 First latitude
   * @param lng1 First longitude
   * @param lat2 Second latitude
   * @param lng2 Second longitude
   * @returns Heading in degrees (0-360)
   */
  private calculateHeading(
    lat1: number, 
    lng1: number, 
    lat2: number, 
    lng2: number
  ): number {
    const dLng = this.toRadians(lng2 - lng1);
    const y = Math.sin(dLng) * Math.cos(this.toRadians(lat2));
    const x = Math.cos(this.toRadians(lat1)) * Math.sin(this.toRadians(lat2)) -
      Math.sin(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.cos(dLng);
    
    let heading = Math.atan2(y, x) * 180 / Math.PI;
    
    // Normalize to 0-360
    heading = (heading + 360) % 360;
    
    return heading;
  }
  
  /**
   * Generate waypoints between two coordinates
   * @param startLat Starting latitude
   * @param startLng Starting longitude
   * @param endLat Ending latitude
   * @param endLng Ending longitude
   * @param numPoints Number of points to generate
   * @returns Array of waypoints
   */
  private generateWaypoints(
    startLat: number, 
    startLng: number, 
    endLat: number, 
    endLng: number, 
    numPoints: number
  ): Array<{lat: number, lng: number}> {
    const waypoints = [];
    
    for (let i = 0; i <= numPoints; i++) {
      const fraction = i / numPoints;
      
      // Add some randomness to make it look natural
      const randomFactor = 0.0001 * (Math.random() - 0.5);
      
      const lat = startLat + fraction * (endLat - startLat) + randomFactor;
      const lng = startLng + fraction * (endLng - startLng) + randomFactor;
      
      waypoints.push({ lat, lng });
    }
    
    return waypoints;
  }
}

// Export singleton instance
export const deliveryService = new DeliveryService();