# ClamCat
This is an open-source discord bot I'm working on that currently only features music but has more to release soon!
## Prerequisites
- FFMPEG
- Node.JS installed
- Some knowledge of javascript potentially
## Adding modules
The folder src/modules is where you can add modules. There is a few things you need to know before starting with ClamCat, one of which is adding modules.
- Firstly, every variable referenced by the main script in any module uses exports. This includes any commands, the setup function, etc.
- There needs to be a function named "setup" that initalizes the module.
- There can also be an array called "commands" where there is a list of key-value pairs
- The key-value pair "id" is the name of the command and what the user will type in
- There also must be a function named "execute" which is going to be executed when the command is run by the user.
