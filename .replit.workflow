[REPLIT]
modules = ["nodejs-20:v8-20230920-bd784b9"]
entrypoint = "start.js"

[REPLIT.env]
USE_DATABASE = "true"

[WORKFLOW]
configVersion = 1

[workflow.ondc-app]
title = "ONDC E-commerce Application"
description = "Starts both the backend API server and frontend client application"
icon = "rocket_launch"
run = "node start.js"

[workflow.server]
title = "Server Only"
description = "Starts only the backend API server"
icon = "database"
run = "cd server && npx tsx watch ./index.ts"

[workflow.client]
title = "Client Only"
description = "Starts only the frontend client application"
icon = "web"
run = "cd client && npx vite --port 5173 --host 0.0.0.0"

[workflow.db-push]
title = "Update Database Schema"
description = "Pushes current schema to the database"
icon = "sync"
run = "npx drizzle-kit push"