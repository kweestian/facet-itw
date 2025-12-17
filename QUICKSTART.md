# Quick Start Guide

## Prerequisites

- Node.js 18+ and npm
- OpenAI API key (or Anthropic API key if you modify the AI client)

## Setup (5 minutes)

1. **Clone and install:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   ```

3. **Initialize database:**
   ```bash
   npm run setup
   ```
   
   Or manually:
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## First Steps

1. **View sample data:** The seed script creates:
   - 1 demo workspace entity
   - 5 policy rules (Data Privacy, Liability, Termination, IP, Payment)
   - 1 sample agreement with intentionally problematic clauses

2. **Create your first agreement:**
   - Go to `/agreements/new`
   - Enter title and paste agreement text
   - Click "Create Agreement"

3. **Run analysis:**
   - Open the agreement detail page
   - Click "Run Analysis"
   - Watch real-time progress
   - View results in BizDev or Counsel tabs

## Key Features to Try

### Traffic-Light System
- **🟢 Green**: Low risk, compliant
- **🟡 Yellow**: Medium risk, review recommended  
- **🔴 Red**: High risk, show-stopper

### Dual Views
- **BizDev View**: Quick summary with show-stopper list
- **Counsel View**: Detailed audit trail with evidence chains

### Evidence Preservation
Every flagged clause includes:
- Exact text snippet
- Character offsets
- Context before/after
- Rule explanation

## Troubleshooting

**Database errors:**
```bash
# Reset database
rm dev.db dev.db-journal
npm run db:push
npm run db:seed
```

**AI API errors:**
- Verify `OPENAI_API_KEY` in `.env`
- Check API quota/limits
- Review console for detailed error messages

**Build errors:**
```bash
# Clean install
rm -rf node_modules .next
npm install
npm run db:generate
```

## Next Steps

- Add more policy rules via API or extend UI
- Create additional legal entities
- Upload real agreements for analysis
- Customize risk assessment logic
- Export reports (extend UI)

## API Examples

**Create agreement:**
```bash
curl -X POST http://localhost:3000/api/agreements \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Agreement",
    "fullText": "Agreement text here...",
    "entityId": "workspace-1"
  }'
```

**Run analysis:**
```bash
curl -X POST http://localhost:3000/api/agreements/{id}/analyze
```

**List agreements:**
```bash
curl http://localhost:3000/api/agreements
```

