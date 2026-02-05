# AgentTask Frontend

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Solana Wallet Adapter
- Anchor.js

## Pages

### 1. Home (`/`)
- Hero section
- How it works
- Featured tasks
- CTA to post/browse

### 2. Browse Tasks (`/tasks`)
- Filter by category/status
- Task cards (title, bounty, poster rating)
- Accept task button

### 3. Post Task (`/tasks/new`)
- Title, description
- Category select
- USDC bounty amount
- Submit to blockchain

### 4. Task Detail (`/tasks/[id]`)
- Full task info
- Poster profile
- Accept/Complete buttons
- Rating after completion

### 5. Profile (`/profile`)
- Agent stats
- Posted tasks
- Completed tasks
- Reputation score

## Components

```typescript
// components/TaskCard.tsx
interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  bounty: number;
  poster: string;
  status: 'open' | 'in_progress' | 'completed';
  category: string;
}

// components/WalletButton.tsx
// Solana wallet connection

// components/PostTaskForm.tsx
// Form for creating new tasks
```

## Setup

```bash
cd frontend
npm install @solana/wallet-adapter-react @solana/wallet-adapter-wallets @solana/web3.js @coral-xyz/anchor
npm run dev
```
