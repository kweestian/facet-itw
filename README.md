# Facet - Contract Analysis MVP

AI-powered contract risk assessment and compliance analysis system built with Next.js 15, TypeScript, Prisma, and Vercel AI SDK.

## Features

- **Ontology-Based Schema**: LegalEntity, Agreement, Clause, PolicyRule, RiskAssessment, FullText
- **AI-Powered Analysis**: Automatic clause extraction and rule matching using LLM
- **Traffic-Light System**: 🟢 Green (Low Risk), 🟡 Yellow (Medium Risk), 🔴 Red (High Risk)
- **Dual Views**: 
  - **BizDev Dashboard**: Quick traffic-light summary and show-stopper list
  - **Counsel Dashboard**: Detailed audit trail with clause → rule → evidence chain
- **Full Evidence Preservation**: Exact text snippets with character offsets for every flagged clause
- **Streaming Analysis**: Real-time progress updates during analysis

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Prisma + SQLite
- **AI**: Vercel AI SDK with OpenAI
- **UI**: shadcn/ui + Radix UI + Tailwind CSS
- **Validation**: Zod

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL`: SQLite database path (default: `file:./dev.db`)
- `OPENAI_API_KEY`: Your OpenAI API key

### 3. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

Or run the complete setup:

```bash
npm run setup
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### 1. Create Legal Entity

The seed script creates a default "Demo Workspace" entity. You can create additional entities via the API or by extending the UI.

### 2. Create Agreement

- Navigate to `/agreements/new`
- Enter agreement title
- Select legal entity
- Paste or upload agreement text
- Click "Create Agreement"

### 3. Run Analysis

- Open an agreement detail page
- Click "Run Analysis"
- Watch real-time progress as clauses are extracted and analyzed
- View results in BizDev or Counsel tabs

### 4. Review Results

**BizDev View:**
- Traffic-light summary (green/yellow/red counts)
- Show-stopper list (high-risk clauses)

**Counsel View:**
- Detailed clause-by-clause breakdown
- Rule descriptions and explanations
- Exact evidence text with character offsets
- Full audit trail

## API Endpoints

- `GET /api/agreements` - List all agreements
- `POST /api/agreements` - Create new agreement
- `GET /api/agreements/[id]` - Get agreement details
- `DELETE /api/agreements/[id]` - Delete agreement
- `POST /api/agreements/[id]/analyze` - Run analysis (streaming)
- `GET /api/rules` - List policy rules
- `POST /api/rules` - Create policy rule
- `GET /api/entities` - List legal entities
- `POST /api/entities` - Create legal entity

## Database Schema

The ontology includes:

- **LegalEntity**: Companies or parties
- **Agreement**: Contracts with full text
- **Clause**: Individual clauses extracted from agreements
- **PolicyRule**: Compliance rules to check against
- **RiskAssessment**: Results of clause-rule matching
- **FullText**: Evidence snippets with exact text and offsets

## Seed Data

The seed script creates:
- 1 default workspace entity
- 5 sample policy rules (Data Privacy, Liability, Termination, IP, Payment)
- 1 sample agreement with intentionally problematic clauses

## Development

### Database Commands

```bash
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

### Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   ├── agreement/   # Agreement-related components
│   └── analysis/    # Analysis dashboard components
├── lib/             # Utilities and business logic
│   ├── ai/         # AI analysis engine
│   └── validators/ # Zod schemas
└── types/          # TypeScript types
```

## Production Considerations

- Replace SQLite with PostgreSQL for production
- Add authentication/authorization
- Implement rate limiting for AI API calls
- Add caching for analysis results
- Set up proper error monitoring (Sentry)
- Add comprehensive logging
- Implement file upload for agreements
- Add export functionality (PDF reports)

## License

MIT

