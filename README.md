# Seller Payout Intelligence System

A comprehensive dashboard for sellers to track payout timelines, order breakdowns, quality metrics, and payout history in real-time.

**🚀 [Quick Deploy Guide](./SIMPLE_DEPLOYMENT.md)** - Deploy in 5 minutes (no backend needed!)

---

## Features

### 📊 Core Features
1. **Upcoming Payout Visibility** - Real-time view of next payout with confidence indicators
2. **Order Breakdown** - Detailed breakdown of all orders in upcoming payout cycle
3. **Active Blockers** - Visibility into issues preventing or delaying payouts
4. **Quality Score** - Track seller trust score with improvement recommendations
5. **Payout History** - Complete timeline of past payouts with status tracking

### ✨ Additional Features
- Detailed order timeline view
- Mobile responsive design
- Fast loading (~69 KB gzipped)
- No authentication required
- Works with sample data out of the box

---

## Tech Stack

- **Frontend:** React 18.3, TypeScript 5.5
- **Routing:** React Router 7.13
- **Build Tool:** Vite 5.4
- **Styling:** TailwindCSS 3.4
- **Icons:** Lucide React
- **Deployment:** Vercel
- **Data:** Local sample data (no backend required)

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git
- GitHub account
- Vercel account (free)

### Local Development

```bash
# Navigate to project
cd /Users/syedfaezhasan/Downloads/project

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

---

## Deployment

**See [SIMPLE_DEPLOYMENT.md](./SIMPLE_DEPLOYMENT.md) for the easiest deployment method!**

### Quick Deploy (5 minutes):

1. **Create GitHub repo** and push code
2. **Import to Vercel** from GitHub
3. **Deploy** (auto-detected settings)
4. **Done!** 🎉

**No environment variables needed!**
**No backend setup required!**

---

## Project Structure

```
src/
├── components/
│   ├── ActiveBlockers.tsx      # Displays payout blockers
│   ├── Dashboard.tsx            # Main dashboard view
│   ├── ErrorBoundary.tsx        # Error handling boundary
│   ├── Header.tsx               # Navigation header
│   ├── LoadingSpinner.tsx       # Loading indicator
│   ├── OrderDetail.tsx          # Detailed order view
│   ├── OrdersTable.tsx          # Orders listing
│   ├── OrderTimeline.tsx        # Order timeline visualization
│   ├── PayoutHistory.tsx        # Historical payouts
│   ├── PayoutTimeline.tsx       # Upcoming payout widget
│   └── TrustScoreWidget.tsx     # Quality score display
├── data/
│   └── sampleData.ts            # Sample data (customize this!)
├── App.tsx                      # Root application with routing
├── main.tsx                     # Application entry point
└── types.ts                     # TypeScript type definitions
```

---

## Customizing Data

Edit `src/data/sampleData.ts` to customize:

- Order information
- Payout amounts and dates
- Trust scores and drivers
- Seller information
- Payout history

Then commit and push - Vercel auto-deploys!

```bash
git add .
git commit -m "Update sample data"
git push
```

---

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint

---

## Features in Detail

### Upcoming Payout Visibility
- Estimated payout date with countdown
- Total payout amount
- Confidence indicator (high/medium/low)
- Progress bar showing payout cycle progress
- Current payout cycle information

### Order Breakdown
- Interactive table of all orders
- Status indicators (eligible, pending, held)
- Completion dates and amounts
- Hold reasons with detailed explanations
- Click to view detailed order timeline

### Active Blockers
- Real-time blocker notifications
- Severity levels (info, warning, error)
- Estimated resolution times
- Action required indicators
- Clear descriptions and next steps

### Quality Score
- Score out of 100 with trend indicator
- Risk level assessment
- Top factors affecting score
- Improvement suggestions
- Historical trend tracking

### Payout History
- Timeline of past payouts
- Status for each payout (completed, delayed, held)
- Order count per payout
- Date and amount tracking
- Visual timeline with status icons

---

## Performance

- Bundle size: ~69 KB (gzipped)
- Code splitting enabled
- Lazy loading for routes
- Optimized build with Vite
- Fast page loads (< 2 seconds)

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Android)

---

## Deployment Options

### Option 1: Simple Deploy (Recommended)
**See:** [SIMPLE_DEPLOYMENT.md](./SIMPLE_DEPLOYMENT.md)
- Uses local sample data
- No backend required
- 5-minute setup
- Free hosting

### Option 2: With Backend (Advanced)
**See:** Legacy guides in repository
- Supabase integration available (see git history)
- Authentication system
- Real-time data
- Database setup required

---

## Sample Data Included

The application comes with sample data showing:
- 2 orders (1 eligible, 1 pending)
- 1 active blocker (return window)
- Trust score: 72/100
- 5 payout history entries
- Detailed order timelines

**Perfect for demos and testing!**

---

## Contributing

This project follows clean code practices:
- TypeScript strict mode
- ESLint configured
- Component-based architecture
- Responsive design patterns

---

## License

Private - Fleek Internal Project

---

## Deployment Status

✅ Ready for immediate deployment
✅ Production build tested
✅ Git repository initialized
✅ Sample data included
✅ Documentation complete

**Deploy now:** See [SIMPLE_DEPLOYMENT.md](./SIMPLE_DEPLOYMENT.md)

---

## Support

- **Quick Deploy**: [SIMPLE_DEPLOYMENT.md](./SIMPLE_DEPLOYMENT.md)
- **Vercel Docs**: https://vercel.com/docs
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev

---

## Live Demo

After deployment, your dashboard will be live at:
`https://seller-payout-intelligence-xxxxx.vercel.app`

**All features work out of the box!** 🎉

---

Built with ❤️ using React, TypeScript, and Vite
