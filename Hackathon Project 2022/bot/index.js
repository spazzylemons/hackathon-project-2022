const { SerialPort } = require('serialport')

const port = new SerialPort({
    path: 'COM3',
    baudRate: 9600,
})

function portWrite(string) {
  port.write(`${string}\0`, function(err) {
    if (err) {
      return console.log('Error on write: ', err.message)
    }
    console.log('message written')
  })
  
  // Open errors will be emitted as an error event
  port.on('error', function(err) {
    console.log('Error: ', err.message)
  })
}
  

// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

client.on('messageCreate', (message) => {
    console.log(portWrite(message.content));
});

// Login to Discord with your client's token
client.login(token);
