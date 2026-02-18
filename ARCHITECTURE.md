# TradeGuard V2 - Architecture

## Overview

TradeGuard V2 follows a **strict layered architecture** based on Domain-Driven Design (DDD) principles. This ensures clean separation of concerns, testability, and maintainability.

## Architecture Layers

```
┌─────────────────────────────────┐
│      UI Layer (Next.js)         │  ← User Interface
├─────────────────────────────────┤
│    API Layer (HTTP Routes)      │  ← HTTP Controllers
├─────────────────────────────────┤
│  Application Layer (Use Cases)  │  ← Business Workflows
├─────────────────────────────────┤
│   Domain Layer (Pure Logic)     │  ← Business Rules
├─────────────────────────────────┤
│ Infrastructure Layer (DB/APIs)  │  ← External Services
└─────────────────────────────────┘
```

## Layer Responsibilities

### 1. Domain Layer (`src/domain/`)

**Purpose:** Pure business logic with zero external dependencies

**What it contains:**
- **Engines** (`engines/`): Pure calculation logic (RiskEngine)
- **Types** (`types.ts`): Core business entities and interfaces
- **Value Objects** (`value-objects/`): Immutable domain objects (Money)

**Rules:**
- ✅ Pure TypeScript only
- ✅ Deterministic functions (same input = same output)
- ❌ No database access
- ❌ No API calls
- ❌ No framework dependencies
- ❌ No side effects

**Example:**
```typescript
// ✅ GOOD - Pure calculation
class RiskEngine {
  calculatePositionSize(params: {...}): number {
    return (riskAmount / priceDistance) * leverage;
  }
}

// ❌ BAD - Side effects
class RiskEngine {
  async calculatePositionSize(params: {...}): Promise<number> {
    const price = await fetch('/api/price'); // ❌ External call
    await prisma.trade.create(...);          // ❌ Database access
    return size;
  }
}
```

### 2. Application Layer (`src/application/`)

**Purpose:** Orchestrate domain logic and infrastructure services

**What it contains:**
- **Use Cases** (`use-cases/`): Business workflows
- **DTOs** (`dtos/`): Data transfer objects

**Rules:**
- ✅ Orchestrates domain + infrastructure
- ✅ Transaction management
- ✅ Business validation
- ❌ No business calculations (use domain)
- ❌ No direct database queries (use repositories)
- ❌ No HTTP logic (that's API layer)

**Example:**
```typescript
// ✅ GOOD - Orchestration
class OpenTradeUseCase {
  async execute(params) {
    // 1. Use domain for calculations
    const analysis = riskEngine.analyze(params);
    
    // 2. Use infrastructure for data
    const price = await priceService.getCurrentPrice(symbol);
    
    // 3. Use repository for persistence
    const trade = await tradeRepository.create(analysis);
    
    return trade;
  }
}

// ❌ BAD - Business logic in use case
class OpenTradeUseCase {
  async execute(params) {
    // ❌ Don't calculate here - use RiskEngine
    const positionSize = (accountBalance * riskPercent) / stopLoss;
    
    // ❌ Don't use Prisma directly - use repository
    const trade = await prisma.trade.create({...});
  }
}
```

### 3. Infrastructure Layer (`src/infrastructure/`)

**Purpose:** Handle external systems (database, APIs, file system)

**What it contains:**
- **Database** (`db/`): Prisma client
- **Repositories** (`repositories/`): Data access patterns
- **Services** (`services/`): External API wrappers

**Rules:**
- ✅ All database operations
- ✅ External API calls
- ✅ File system access
- ❌ No business logic
- ❌ No decision making

**Example:**
```typescript
// ✅ GOOD - Pure data access
class TradeRepository {
  async create(dto: CreateTradeDTO): Promise<Trade> {
    const trade = await prisma.trade.create({ data: dto });
    return this.mapToTradeEntity(trade);
  }
}

// ❌ BAD - Business logic in repository
class TradeRepository {
  async create(dto: CreateTradeDTO): Promise<Trade> {
    // ❌ Don't calculate here
    const positionSize = this.calculatePositionSize(dto);
    
    // ❌ Don't validate business rules here
    if (dto.riskRewardRatio < 1.5) {
      throw new Error("Bad R:R ratio");
    }
    
    return prisma.trade.create({...});
  }
}
```

### 4. API Layer (`src/app/api/`)

**Purpose:** HTTP request handling and response formatting

**What it contains:**
- **Route Handlers**: Next.js API routes

**Rules:**
- ✅ Request validation (Zod schemas)
- ✅ Call use cases
- ✅ Format responses
- ✅ Error handling
- ❌ No business logic
- ❌ No direct database access
- ❌ No calculations

**Example:**
```typescript
// ✅ GOOD - Thin controller
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = analyzeTradeSchema.parse(body);
    
    const result = await analyzeTradeUseCase.execute(validated);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

// ❌ BAD - Business logic in API route
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // ❌ Don't calculate here
  const positionSize = calculatePositionSize(body);
  
  // ❌ Don't access database directly
  const trade = await prisma.trade.create({...});
  
  return NextResponse.json(trade);
}
```

### 5. UI Layer (`src/app/`)

**Purpose:** User interface and client-side logic

**What it contains:**
- **Pages**: Next.js page components
- **Components**: Reusable UI components (future)

**Rules:**
- ✅ Display data
- ✅ Handle user input
- ✅ Call API routes
- ❌ No business logic
- ❌ No direct database access

## Import Rules

### ✅ Allowed Imports

```typescript
// Domain can import: NOTHING (pure)
// (only standard TypeScript/JavaScript)

// Application can import:
import { riskEngine } from '@/domain/engines/risk-engine';
import { tradeRepository } from '@/infrastructure/repositories/trade-repository';

// Infrastructure can import:
import { Trade } from '@/domain/types';
import { PrismaClient } from '@prisma/client';

// API can import:
import { analyzeTradeUseCase } from '@/application/use-cases/analyze-trade';
import { analyzeTradeSchema } from '@/lib/validators';

// UI can import:
// Anything (it's the top layer)
```

### ❌ Forbidden Imports

```typescript
// ❌ Domain importing infrastructure
import { prisma } from '@/infrastructure/db/client'; // WRONG!

// ❌ Domain importing application
import { openTradeUseCase } from '@/application/use-cases/open-trade'; // WRONG!

// ❌ API importing infrastructure directly
import { tradeRepository } from '@/infrastructure/repositories/trade-repository'; // WRONG!
// (use use-cases instead)

// ❌ Use cases importing API
import { POST } from '@/app/api/trade/open/route'; // WRONG!
```

## Benefits of This Architecture

### 1. **Testability**
- Domain layer can be unit tested without database or API mocks
- Each layer can be tested in isolation

### 2. **Maintainability**
- Clear boundaries make changes easier
- Know exactly where to put new code

### 3. **Flexibility**
- Can swap database (Prisma → TypeORM) without touching domain
- Can swap UI (Next.js → React Native) without touching business logic
- Can add new API layer (REST → GraphQL) without changing use cases

### 4. **Understandability**
- New developers can navigate the codebase easily
- Predictable structure

## How to Extend the System

### Adding a New Feature (Example: Position Monitor)

1. **Domain Layer**: Add calculation logic
   ```typescript
   // src/domain/engines/position-monitor.ts
   class PositionMonitor {
     shouldCloseTrade(currentPrice, stopLoss, takeProfit): boolean {
       // Pure logic
     }
   }
   ```

2. **Application Layer**: Add use case
   ```typescript
   // src/application/use-cases/monitor-positions.ts
   class MonitorPositionsUseCase {
     async execute() {
       const trades = await tradeRepository.findOpenTrades();
       const prices = await priceService.getCurrentPrices(...);
       
       for (const trade of trades) {
         if (positionMonitor.shouldCloseTrade(...)) {
           await closeTradeUseCase.execute(trade.id);
         }
       }
     }
   }
   ```

3. **API Layer**: Add route
   ```typescript
   // src/app/api/monitor/route.ts
   export async function POST() {
     await monitorPositionsUseCase.execute();
     return NextResponse.json({ success: true });
   }
   ```

### Adding a New Calculation

1. Add method to `RiskEngine` in domain layer
2. Use it in relevant use cases
3. No other changes needed!

### Changing Database

1. Update repository implementations in infrastructure layer
2. Use cases don't change (they use repository interface)
3. Domain doesn't change (it has no idea about database)

## Folder Structure Summary

```
src/
├── domain/              # Pure business logic
│   ├── engines/        # Calculation engines
│   ├── value-objects/  # Immutable domain objects
│   └── types.ts        # Domain types
│
├── application/        # Business workflows
│   ├── use-cases/     # Feature implementations
│   └── dtos/          # Data transfer objects
│
├── infrastructure/     # External systems
│   ├── db/            # Database client
│   ├── repositories/  # Data access
│   └── services/      # External APIs
│
├── app/               # UI + API routes
│   ├── api/          # HTTP routes
│   ├── page.tsx      # UI pages
│   └── layout.tsx    # App layout
│
├── config/           # Configuration
│   └── env.ts       # Environment validation
│
└── lib/             # Shared utilities
    ├── validators.ts # Input validation
    └── utils.ts     # Helper functions
```

## Key Principles

1. **Dependency Rule**: Dependencies point inward (UI → API → Application → Domain)
2. **Domain Independence**: Domain has zero dependencies
3. **Single Responsibility**: Each layer has one clear purpose
4. **Explicit Over Implicit**: Be explicit about what each file does
5. **Comments Explain WHY**: Code shows WHAT, comments explain WHY

## Questions?

- **Where do I put validation?** API layer (Zod schemas) and application layer (business rules)
- **Where do I put calculations?** Domain layer (RiskEngine)
- **Where do I put database queries?** Infrastructure layer (repositories)
- **Where do I put HTTP logic?** API layer (route handlers)
- **Where do I put external API calls?** Infrastructure layer (services)

---

**Remember:** When in doubt, ask: "Does this have business logic?" 
- YES → Domain or Application
- NO → Infrastructure or API
