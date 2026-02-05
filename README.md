# Agent Edge - Mission Control Center

Agent Edge is a comprehensive mission control dashboard for managing AI agents and their tasks. It provides a unified interface for monitoring and controlling multiple AI agents, their tasks, memory, projects, and more.

## Features

- **Task Management**: Kanban-style board for managing agent tasks
- **Memory System**: Persistent memory blocks for agent context
- **Agent Dashboard**: Centralized view of all agents and their status
- **Project Management**: Track and manage ongoing projects
- **Skills Registry**: Catalog of available agent skills
- **Documentation**: Integrated documentation system
- **Team Management**: People and roles management

## Architecture

The application uses a hybrid storage approach:
- **Primary Storage**: Firestore database for cloud persistence
- **Fallback Storage**: localStorage for offline capability
- **Cron Integration**: Synchronization with OpenClaw cron system

This ensures that your data persists across browser sessions and devices while maintaining offline capability.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Environment Configuration

The app is pre-configured with a Firebase project. To use your own Firebase project:

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore
3. Update the configuration in `src/services/firestore-service.ts`

## Deployment

The app is configured for deployment on Vercel:

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. The app will be deployed automatically

## Cloud Persistence

All data is stored in Firestore, ensuring:
- Data persists across browser sessions
- Access from multiple devices
- Real-time synchronization
- Backup and recovery

The original localStorage data will be automatically migrated to Firestore on first load if found.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT