# Auto Video Report

A modern web application that combines blockchain technology with AI-generated video creation. This application allows users to create video requests by submitting prompts, making deposits, and receiving videos automatically.

## Features

- **Full-Stack Next.js Application**: Combines frontend and backend in a single project
- **Blockchain Integration**: Uses ethers.js for Ethereum blockchain interaction
- **Database Integration**: Uses Supabase for data storage and retrieval
- **API Routes**: RESTful API endpoints for video requests
- **Responsive UI**: Modern interface with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Ethereum wallet and network access (can be local development network)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/auto-video-report.git
   cd auto-video-report/next-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the project root and add the following variables (see `.env.example` for reference):
   ```
   NEXT_PUBLIC_ETHEREUM_RPC_URL=
   NEXT_PUBLIC_CONTRACT_ADDRESS=
   ETHEREUM_PRIVATE_KEY=
   
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   
   OPENAI_API_KEY=
   ```

4. Set up the Supabase database by running the SQL schema (see `supabase-schema.sql`).

### Development

Start the development server:

```bash
npm run dev
```

Your application will be available at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

- `/src/app` - Next.js application pages and API routes
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions and database clients
- `/src/types` - TypeScript type definitions
- `/public` - Static assets

## API Endpoints

### Video Requests

- `GET /api/videos?userAddress={address}` - Get all video requests for a user
- `POST /api/videos` - Create a new video request
- `GET /api/videos/{id}` - Get details of a specific video request
- `PATCH /api/videos/{id}` - Update a video request status

## Technology Stack

- **Frontend**: React, Next.js, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Blockchain**: Ethereum (ethers.js)
- **Authentication**: Ethereum wallet-based

## License

This project is licensed under the MIT License - see the LICENSE file for details.
