# INDOR — Frontend Architecture Plan
> `indor/apps/web/` | Next.js App Router + TypeScript

---

## Folder Structure

```
indor/apps/web/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth group (no main layout)
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/              # Authenticated area
│   │   ├── layout.tsx            # Main nav + auth guard
│   │   ├── dashboard/page.tsx    # Home Dashboard
│   │   ├── properties/
│   │   │   ├── page.tsx          # Property list
│   │   │   ├── add/page.tsx      # Add Property flow
│   │   │   └── [id]/page.tsx     # Property detail + House Facts
│   │   ├── marketplace/
│   │   │   ├── page.tsx          # Service Marketplace
│   │   │   └── [serviceId]/
│   │   │       ├── page.tsx      # Service Detail
│   │   │       └── book/page.tsx # Booking flow (multi-step)
│   │   ├── orders/
│   │   │   ├── page.tsx          # Orders list
│   │   │   └── [orderId]/
│   │   │       ├── page.tsx      # Order detail
│   │   │       └── tracking/page.tsx # Live tracking
│   │   ├── payments/page.tsx     # Payment dashboard
│   │   ├── notifications/page.tsx
│   │   └── profile/page.tsx
│   ├── admin/                    # Admin area (role-gated)
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Admin dashboard
│   │   ├── orders/page.tsx
│   │   ├── providers/page.tsx
│   │   └── customers/page.tsx
│   ├── provider/                 # Provider portal (role-gated)
│   │   ├── layout.tsx
│   │   └── orders/
│   │       ├── page.tsx
│   │       └── [orderId]/page.tsx
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Splash / Welcome
│   └── not-found.tsx
├── components/
│   ├── ui/                       # Primitive components (Button, Input, etc.)
│   ├── layout/                   # Nav, Sidebar, Footer
│   ├── auth/                     # AuthGuard, RoleGuard
│   ├── property/                 # PropertyCard, AddPropertyForm
│   ├── marketplace/              # ServiceCard, ServiceGrid, SearchBar
│   ├── booking/                  # BookingSteps, BookingSummary
│   ├── orders/                   # OrderCard, OrderStatus, OrderTimeline
│   ├── tracking/                 # LiveTrackingMap, ProviderCard, StatusBadge
│   └── payments/                 # PaymentForm, PaymentDashboard
├── lib/
│   ├── api/                      # API client (generated from OpenAPI)
│   │   ├── client.ts             # Axios/fetch base client
│   │   ├── auth.ts
│   │   ├── orders.ts
│   │   ├── properties.ts
│   │   └── services.ts
│   ├── socket/                   # Socket.io client + hooks
│   │   ├── socket-client.ts
│   │   └── useOrderTracking.ts
│   ├── store/                    # Zustand stores
│   │   ├── auth.store.ts
│   │   └── property.store.ts
│   └── utils/                    # Helpers, formatters
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts
│   ├── useProperty.ts
│   └── useOrder.ts
├── types/                        # TypeScript types (synced with API)
├── tests/
│   └── e2e/                      # Playwright tests
│       ├── auth.spec.ts
│       ├── booking-flow.spec.ts  # Critical: full booking loop
│       └── order-tracking.spec.ts
├── public/
├── playwright.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Routing Plan by Role

| Route | Roles | Description |
|-------|-------|-------------|
| `/` | Public | Splash / Welcome |
| `/login`, `/signup` | Public | Auth screens |
| `/dashboard` | homeowner, renter, realtor, property_manager | Home Dashboard |
| `/properties/*` | homeowner, renter, realtor, property_manager | Property management |
| `/marketplace/*` | homeowner, renter | Browse + book services |
| `/orders/*` | homeowner, renter | Order list + tracking |
| `/payments` | homeowner, renter | Payment dashboard |
| `/profile` | All authenticated | Account settings |
| `/admin/*` | admin only | Admin operations |
| `/provider/*` | provider only | Provider portal |

---

## State Management Strategy

### Server Components (default — Next.js App Router)
- Static pages: splash, service catalog (public)
- Data fetched via server-side API calls
- No client-side JS for initial render

### Client Components (only when needed)
- Real-time tracking (Socket.io hooks)
- Multi-step booking form (local form state)
- Live notification bell

### Zustand (global client state — minimal)
- `auth.store.ts` — current user session
- `property.store.ts` — selected property (multi-property UX)

---

## Real-Time Tracking (Socket.io)

```typescript
// lib/socket/useOrderTracking.ts
// Connects to Socket.io server when order is in active tracking states
// Events to subscribe:
// - order:status_changed  { orderId, newStatus, previousStatus }
// - provider:location     { orderId, lat, lng, eta }
// - order:message         { orderId, message }
```

Active tracking states: `ProviderAssigned`, `OnTheWay`, `Arrived`, `WorkInProgress`

---

## API Client Layer

After Phase 1 delivers the OpenAPI spec (`indor/services/api/openapi.json`), generate the client:

```bash
npx openapi-typescript indor/services/api/openapi.json -o indor/apps/web/types/api.ts
```

Manual client in `lib/api/client.ts`:
- Base URL: `NEXT_PUBLIC_API_URL` env var
- Auth: Bearer token from Zustand auth store
- Interceptor: auto-refresh token on 401

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Key Dependencies (Phase 2)

```json
{
  "next": "15.x",
  "react": "19.x",
  "typescript": "5.x",
  "socket.io-client": "^4.x",
  "zustand": "^5.x",
  "@stripe/stripe-js": "^4.x",
  "@googlemaps/js-api-loader": "^1.x",
  "axios": "^1.x",
  "react-hook-form": "^7.x",
  "zod": "^3.x"
}
```
