# NPM
* npm init -y
* After creating the pasting the following data in the package.json run the next command
* npm install

# Package.json
{
  "name": "ti-apps",
  "version": "1.0.0",
  "description": "Tinitiate Admin and User Management Application",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build:css": "postcss styles.css -o output.css"
  },
  "author": "Tinitiate",
  "license": "ISC",
  "dependencies": {
    "node-fetch": "^3.3.2"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.0",
    "electron": "^23.0.0",
    "postcss-cli": "^8.3.1",
    "tailwindcss": "^2.2.19"
  }
}
