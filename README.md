<img align ="right" src ="./logo.png" width="150"/>

# moosic
![Node.js Badge](https://img.shields.io/badge/Node.js-10.20%2B-white?style=for-the-badge&logo=nodedotjs&logoColor=%23ffffff&labelColor=%23141414&color=%23339933)
![Discord.js Badge](https://img.shields.io/badge/discord.js-14.14.1-blue?style=for-the-badge&logo=discord&logoColor=white&labelColor=%23141414&color=%235865F2)
![npm package Badge](https://img.shields.io/badge/npm%20package-10.2.3-red?style=for-the-badge&logo=npm&logoColor=white&labelColor=%23141414&color=%23CB3837)
![MIT License Badge](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge&labelColor=%23141414)

## 🥛 Overview
moosic leverages the power of Discord.js to stream music from various sources, such as YouTube, to be played in a Discord voice channel. moosic offers users the ability to play, disconnect the bot, and view the queue. Developed by Andrew Kwok.

## ✨ Features
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

## ⚙️ Running the Project
1. Clone the project locally
2. Install Node.js (https://nodejs.org/en/download)
3. In terminal, run `npm install` in the directory of the project to install Node Package Manager; should be version 10.2.3
4. Create an application on the Discord developer portal
5. Go to your application's settings
6. Under `Bot`, copy `token`
7. Paste `token` into the `TOKEN=` field in `.env`
8. Set OAuth2 scope to `bot` and `applications.commands`
9. Generate OAuth2 link and sign in with Discord
10. Run `node index.js load` in terminal to load slash commands
11. To run the bot, run `node index.js` in terminal

## 📘 Dependencies
- @discord-player/extractor v4.4.5
- @discordjs/builders v1.7.0
- @discordjs/opus v0.9.0
- @discordjs/rest v2.2.0
- @discordjs/voice v0.16.1
- discord-player v6.6.6
- discord.js v14.14.1
- dotenv v16.3.1
- prism-media v1.3.5
- youtube-ext v1.1.16

## 📝 To-Do List
- Improve embeds
- Add functionality to move songs in queue
