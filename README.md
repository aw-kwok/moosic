<img align ="right" src ="./logo.png" width="150"/>

# moosic
![Node.js Badge](https://img.shields.io/badge/Node.js-10.20%2B-white?style=for-the-badge&logo=nodedotjs&logoColor=%23ffffff&labelColor=%23141414&color=%23339933)

## 🥛 Overview
moosic leverages the power of Discord.js to stream music from various sources, such as YouTube, to be played in a Discord voice channel. moosic offers users the ability to play, disconnect the bot, and view the queue. Developed by Andrew Kwok

## ✨ Features
- `/play` - Play a song or playlist from a link, or search for a song all with one command!
- `/queue` - View the song currently playing, as well as the queue of songs.
- `/quit` - When you're done listening, stop playing and have the bot leave the voice channel.

## ⚙️ Running the Project
1. Clone the project locally
2. Install Node.js and npm
3. In terminal, run `npm install` in the directory of the project
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
- play-dl v1.9.7
- prism-media v1.3.5

## 📝 To-Do List
- Add functionality for pause, resume, info, shuffle, skip, and skipto
- Improve imbeds
- Combine play subfunctions
- Add and test Spotify playlists and tracks
