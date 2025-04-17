# ResQ Frontend (पहिलो उद्धार)

The frontend application for ResQ (पहिलो उद्धार), built with React Native and Expo.

## Features

- **Real-time Location Tracking**

  - Live location updates
  - Visual tracking of service providers
  - Distance and ETA calculations
  - Map visualization with React Native Maps

- **Emergency Request System**

  - Multiple service types (Ambulance, Fire Brigade, Police, Rescue)
  - Location-based service provider matching
  - Real-time status updates

- **User Interface**
  - Clean and intuitive design
  - Responsive layout
  - Real-time notifications
  - Emergency history tracking

## Tech Stack

- React Native with Expo
- TypeScript
- Zustand for state management
- Socket.IO Client for real-time communication
- React Native Maps for location visualization
- Expo Location for GPS tracking
- Expo Secure Store for secure data storage

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (for development)
- Expo Go app on your mobile device (for testing)

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   ```bash
   cp .env.example .env
   # Update .env with your backend URL
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

### Running the Application

After running `npm start`, you'll see a QR code in your terminal. You have several options to run the app:

#### Using Expo Go (Recommended for Development)

1. **Install Expo Go**

   - [Download Expo Go for iOS](https://apps.apple.com/app/apple-store/id982107779)
   - [Download Expo Go for Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Run on Physical Device**

   - Scan the QR code with your device's camera (iOS)
   - Scan the QR code with the Expo Go app (Android)
   - The app will open in Expo Go

3. **Run on Emulator/Simulator**
   - Press `i` to open in iOS simulator
   - Press `a` to open in Android emulator
   - Press `w` to open in web browser

#### Development Tips

- **Hot Reloading**: Changes are automatically reflected in the app
- **Debugging**: Shake your device to open the developer menu
- **Logs**: View logs in the terminal or in Expo Go's developer menu
- **Reload**: Pull down to refresh the app in Expo Go

### Environment Variables

```env
BASE_URL=http://localhost:3000
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── services/       # API and service integrations
├── store/          # State management
└── utils/          # Utility functions
```

## State Management

The application uses Zustand for state management with the following stores:

- `authStore`: Authentication state
- `socketStore`: WebSocket connection and real-time updates
- `locationStore`: Location tracking and permissions

## Real-time Features

### Socket Events

- `JOIN_EMERGENCY_ROOM`: Join an emergency response room
- `SEND_LOCATION`: Send location updates
- `UPDATE_LOCATION`: Receive location updates
- `NEED_LOCATION`: Request location updates
- `PROVIDER_FOUND`: Notify when a provider is found

## Location Tracking

The application uses Expo Location for GPS tracking with the following features:

- High-accuracy location updates
- Background location tracking
- Distance-based updates
- Permission handling

## Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
# For iOS
npm run build:ios

# For Android
npm run build:android
```

## Troubleshooting

### Common Issues

1. **Expo Go Connection Issues**

   - Ensure your device and computer are on the same network
   - Check if your firewall is blocking the connection
   - Try restarting the Expo development server

2. **Location Permission Issues**

   - Make sure location services are enabled on your device
   - Grant location permissions to Expo Go
   - Check app settings for location permissions

3. **Socket Connection Issues**
   - Verify the backend server is running
   - Check if the BASE_URL in .env is correct
   - Ensure your device can reach the backend server

## Contributing

We welcome contributions from everyone! Please follow these guidelines when contributing to the project.

### Branch Naming Convention

All branches should follow this naming pattern:

```
<type>/<description>
```

Types:

- `feat/`: New features
- `fix/`: Bug fixes
- `chore/`: Maintenance tasks
- `docs/`: Documentation updates
- `test/`: Adding or modifying tests
- `refactor/`: Code refactoring
- `style/`: Code style changes

Examples:

```
feat/live-location-tracking
fix/socket-connection-error
chore/update-dependencies
docs/update-readme
test/add-unit-tests
refactor/cleanup-code
style/fix-linting
```

### Pull Request Process

1. **Create a Branch**

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make Changes**

   - Follow the code style guidelines
   - Write or update tests
   - Update documentation if needed

3. **Commit Changes**

   ```bash
   git commit -m "feat: add new feature"
   ```

4. **Push Changes**

   ```bash
   git push origin feat/your-feature-name
   ```

5. **Create Pull Request**
   - Fill out the PR template
   - Link related issues
   - Request reviews from team members

### Code Style

- Use TypeScript for all new code
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages
- Add comments for complex logic

### Testing Requirements

- Write unit tests for new features
- Update existing tests if needed
- Ensure all tests pass before submitting PR
- Add integration tests for critical features

### Documentation

- Update README.md for significant changes
- Add comments for complex code
- Document API changes
- Update TypeScript types

### Review Process

1. Code review by at least one team member
2. Address all review comments
3. Ensure CI checks pass
4. Get final approval before merging

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

### MIT License

```
MIT License

Copyright (c) 2024 ResQ (पहिलो उद्धार)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Additional Requirements

1. **Security**

   - Report security vulnerabilities privately
   - Follow secure coding practices
   - Don't commit sensitive information

2. **Accessibility**

   - Follow WCAG guidelines
   - Test with screen readers
   - Ensure color contrast meets standards

3. **Performance**

   - Optimize images and assets
   - Minimize API calls
   - Use efficient algorithms

4. **Dependencies**

   - Keep dependencies up to date
   - Document major version changes
   - Use secure versions of packages

5. **Deployment**
   - Follow deployment checklist
   - Test in staging environment
   - Document deployment process
