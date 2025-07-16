<img align ="right" src ="./logo.png" width="150"/>

# moosic
![Node.js Badge](https://img.shields.io/badge/Node.js-10.20%2B-white?style=for-the-badge&logo=nodedotjs&logoColor=%23ffffff&labelColor=%23141414&color=%23339933)
![MySQL Server Badge](https://img.shields.io/badge/MYSql%20server-8.0.35-blue?style=for-the-badge&logo=mysql&logoColor=white&labelColor=%23141414&color=%234479A1)
![npm package Badge](https://img.shields.io/badge/npm%20package-10.2.3-red?style=for-the-badge&logo=npm&logoColor=white&labelColor=%23141414&color=%23CB3837)
![MIT License Badge](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge&labelColor=%23141414)

## 🥛 Overview
moosic leverages Discord's API to integrate an interactive music player into a Discord channel. moosic offers users music player functionality, as well as built-in search functionality and the ability to save playlists in a MySQL database.

## ✨ Features
- Fully functioning Discord music bot with media player commands and queue functionality
- Supports YouTube and Spotify songs, playlists, and albums
- Supports functional queue storage system with a MySQL server database

## 🎮 Commands
### Basic Commands
- `/play` - Play a song or playlist from a link, or search for a song all with one command!
- `/queue` - View the song currently playing, as well as the queue of songs.
- `/stop` - When you're done listening, stop playing and have the bot leave the voice channel.
- `/pause` - Pause the currently playing song.
- `/resume` - Resume the current song from where you left off.
- `/shuffle` - Shuffle songs in the queue.
- `/skip` - Skip current song.
- `/skipto` Skip to a specified song in the queue.
- `/remove` Remove a specified song from the queue.
- `/info` Display info about a specified song from the queue.
- `/np` - Display info about the currently playing song.
- `/insert` Insert a song or playlist at a specified position in the queue.
- `/move` Move a song at a specified queue position to a new position in the queue.

### Queue Saving with a Database
- `/playqueue` Play a saved queue.
- `/savequeue` Save the current queue into a database.
- `/deletequeue` Delete a specified saved queue from a database.
- `/updatequeue` Update a saved queue with the current queue.

## ⚙️ Running the Project
### Basic Bot
1. Clone the project locally
2. Install [Node.js](https://nodejs.org/en/download) and [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
3. In terminal, run `npm install` in the directory of the project to install Node Package Manager; should be version 10.2.3
4. Create an application on the Discord developer portal
5. Go to your application's settings
6. Under `Bot`, copy `token`
7. Paste `token` into the `TOKEN=` field in `.env`
8. Set OAuth2 scope to `bot` and `applications.commands`
9. Generate OAuth2 link and sign in with Discord
10. If not using database functionality, delete `playqueue.js`, `savequeue.js`, `deletequeue.js`, and `updatequeue.js` from `./slash`
11. Run `node index.js load` in terminal to load slash commands
12. To run the bot, run `node index.js` in terminal

### Database Functionality
1. Download [MySQL server](https://dev.mysql.com/downloads/installer/)
2. Create a MySQL database where you want to store your queues
3. Update .env with `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, and `DATABASE_HOST`
4. Run `node queue.model.js` to test database connectivity

## 📘 Dependencies
- @discord-player/extractor 4.4.5
- @discordjs/builders 1.7.0
- @discordjs/opus 0.9.0
- @discordjs/rest 2.2.0
- @discordjs/voice 0.16.1
- discord-player 6.6.6
- discord.js 14.14.1
- dotenv 16.3.1
- image-url-validator 1.0.4
- mysql2 3.6.5
- prism-media 1.3.5
- sequelize 6.5.32
- youtube-ext 1.1.16
