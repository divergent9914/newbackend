run = "node start-app.mjs"
entrypoint = "start-app.mjs"
language = "nodejs"
onBoot = ""
hidden = [".config", "package-lock.json"]

[packager]
language = "nodejs"
ignoredPaths = []

[deployment]
deploymentTarget = "static"
publicDir = "client/dist"
build = ["npm i", "cd client && npm run build"]

[[ports]]
localPort = 3001
externalPort = 80

[[ports]]
localPort = 5173
externalPort = 443