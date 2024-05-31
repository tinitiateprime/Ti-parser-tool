# Ti-parser-tool

# this is the tool that we will build and enchance our product to solve the difficulties for parsing data 

# Required Libraries for the Project

1. **Initialize a new Node.js project:**

   ```bash
    npm init -y
    npm install electron axios @azure/msal-browser
    npm install -g serve

# Required to change package.json

```package.json
{
  "name": "electron-app",
  "version": "1.0.0",
  "description": "An Electron application",
  "main": "main.js",
  "type": "commonjs",
  "scripts": {
    "start": "electron ."
  },
  "devDependencies": {
    "electron": "^24.8.8"
  },
  "dependencies": {
    "@azure/msal-node": "^2.9.0",
    "axios": "^1.7.2",
    "body-parser": "^1.19.0",
    "express": "^4.17.1",
    "node-fetch": "^3.2.10",
    "tailwindcss": "^3.4.3"
  }
}

