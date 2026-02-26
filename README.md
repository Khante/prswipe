# PRswipe

Swipe through GitHub PRs like Tinder. Review and merge pull requests with a simple swipe interface.

![PRswipe Screenshot](./docs/swipe-demo.png)

## Features

- **Swipe to Review**: Swipe right to merge, left to close PRs
- **Smart Sorting**: PRs shuffled randomly for "fair" review
- **GitHub Integration**: Full merge/close via GitHub API
- **Multi-Repo Support**: Browse all your repos or select a specific one

## Prerequisites

- Docker & Docker Compose
- OR Node.js 18+ and Python 3.11+

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/prswipe.git
cd prswipe
```

### 2. Create a GitHub OAuth App

1. Go to **GitHub Settings** > **Developer settings** > **OAuth Apps** > **New OAuth App**
2. Fill in the details:
   - **Application name**: PRswipe
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/auth/callback`
3. Generate a new **Client Secret**
4. Copy the `.env.template` to `.env` and fill in your credentials:

```bash
cp .env.template .env
```

Edit `.env`:
```
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
SECRET_KEY=your_secret_key
```

To generate a secret key:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### 3. Start the application

Using Docker (recommended):
```bash
docker-compose up --build
```

Or run locally:

**Backend:**
```bash
cd backend
pip install -e .
prswipe
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Usage

1. Open http://localhost:3000
2. Click **Login with GitHub** to authenticate
3. Select a repository or choose "All Repos" to browse PRs across all your accessible repos
4. Swipe through PRs:
   - **Swipe Right** → Merge the PR
   - **Swipe Left** → Close the PR
   - **Press `o`** → Open PR in GitHub
   - **Press `u`** → Undo last action (only for closed PRs)

![Swipe Interface](./docs/swipe-ui.png)

## Requirements

- Push or admin access to the repositories you want to review
- PRs must be mergeable (no conflicts) and not drafts to merge

## Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React + TypeScript + Vite + Tailwind
- **Database**: None (stateless)
- **Auth**: GitHub OAuth
