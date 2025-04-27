# ONDC Protocol Integration Guide

This document provides guidance on integrating with the Open Network for Digital Commerce (ONDC) protocol in our e-commerce system.

## What is ONDC?

Open Network for Digital Commerce (ONDC) is an initiative aimed at promoting open networks for all aspects of exchange of goods and services over digital networks. ONDC is based on open-sourced methodology, using open specifications and open network protocols independent of any specific platform.

## Integration Architecture

Our application implements ONDC protocol integration through these components:

1. **API Gateway**: Routes ONDC requests to appropriate microservices
2. **ONDC Adapters**: Translates between internal data models and ONDC protocol formats
3. **Transaction Manager**: Handles ONDC transaction flows (search, select, init, confirm, status)

## ONDC Protocol Flows

### Search Flow

The search flow allows buyers to discover products from sellers across the network.

```
Buyer App → Gateway → Seller App
                   ↑
                   ↓
             Registry (BPP discovery)
```

Implementation: `POST /api/ondc/search`

### Select Flow

The select flow allows buyers to select specific items and get quotes.

```
Buyer App → Gateway → Seller App
```

Implementation: `POST /api/ondc/select`

### Initialize Flow

The initialize flow creates a draft order with delivery and payment options.

```
Buyer App → Gateway → Seller App
```

Implementation: `POST /api/ondc/init`

### Confirm Flow

The confirm flow finalizes an order after payment authorization.

```
Buyer App → Gateway → Seller App
```

Implementation: `POST /api/ondc/confirm`

### Status Flow

The status flow allows checking the current state of an order.

```
Buyer App → Gateway → Seller App
```

Implementation: `POST /api/ondc/status`

## Database Schema for ONDC

Our database includes specific tables for ONDC integration:

```typescript
// ONDC Integration settings
export const ondcIntegration = pgTable('ondc_integration', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  subscriberId: text('subscriber_id').notNull(),
  subscriberUrl: text('subscriber_url').notNull(),
  type: text('type').notNull(), // 'buyer' or 'seller'
  domain: text('domain').notNull(),
  city: text('city').notNull(),
  country: text('country').notNull(),
  signingPublicKey: text('signing_public_key'),
  signingPrivateKey: text('signing_private_key'),
  encryptionPublicKey: text('encryption_public_key'),
  encryptionPrivateKey: text('encryption_private_key'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

## Implementation in server/routes.ts

The server routes implement the ONDC protocol handlers:

```typescript
// ONDC Search
router.post('/ondc/search', (req: Request, res: Response) => {
  // Implementation details
});

// ONDC Select
router.post('/ondc/select', (req: Request, res: Response) => {
  // Implementation details
});

// ONDC Initialize
router.post('/ondc/init', (req: Request, res: Response) => {
  // Implementation details
});

// ONDC Confirm
router.post('/ondc/confirm', async (req: Request, res: Response) => {
  // Implementation details
});

// ONDC Status
router.post('/ondc/status', (req: Request, res: Response) => {
  // Implementation details
});
```

## Required ONDC Certifications

To deploy in production, the application requires:

1. **ONDC Technical Compliance**: Pass technical validation of API endpoints
2. **ONDC Functional Compliance**: Pass functional testing of buyer/seller flows
3. **ONDC Security Compliance**: Meet security requirements including encryption and signing

## Testing ONDC Integration

Testing can be performed using:

1. **ONDC Reference Apps**: Use official reference buyer/seller apps
2. **ONDC Sandbox**: Test in the ONDC sandbox environment
3. **ONDC Protocol Validator**: Validate request/response formats

## Next Steps for ONDC Integration

1. Implement cryptographic signing for ONDC messages
2. Complete lookup and registry integration
3. Add support for callbacks and webhooks
4. Implement proper error handling per ONDC specifications
5. Complete the admin panel for ONDC configuration management

## References

- [ONDC Official Documentation](https://ondc.org/developer-docs)
- [ONDC Protocol Specifications](https://github.com/ONDC-Official/ONDC-Protocol-Specs)
- [ONDC Reference Implementation](https://github.com/ONDC-Official/reference-implementations)