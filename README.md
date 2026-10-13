# CampusConnect

College event management with JWT authentication, QR tickets and attendance, and an AI event assistant.

## Requirements

- Java 17 or newer
- MySQL with a `campusconnect` database
- Node.js and npm
- An OpenAI API key to use the chatbot

## Local Setup

1. Copy `.env.example` to `.env` and fill in the MySQL password. Set `JWT_SECRET` to a private random value of at least 32 bytes. `OPENAI_API_KEY` is optional for startup but required for AI answers.
2. In the backend terminal, load the environment and start Spring Boot:

   ```sh
   set -a
   source .env
   set +a
   cd backend
   ./mvnw spring-boot:run
   ```

3. In another terminal, start the frontend:

   ```sh
   cd frontend
   npm ci
   npm run dev
   ```

4. Open the Vite URL printed in the frontend terminal. The backend runs on port `8080`.

Never commit `.env` or put real credentials in `application.properties`. For deployment, configure database, JWT, and OpenAI settings as environment variables in the hosting platform, and update the frontend API URL and backend CORS origins for the deployed domains.

## Checks

```sh
cd backend && ./mvnw test
cd ../frontend && npm run build && npm run lint
```