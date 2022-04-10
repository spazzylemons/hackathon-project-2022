const { SerialPort } = require('serialport')
var messages = []
var relativeLocation;
var toggle = true;
const port = new SerialPort({
  path: 'COM3',
  baudRate: 9600,
})

function portWrite(string) {
  port.write(`${string}\0`, function (err) {
    if (err) {
      return console.log('Error on write: ', err.message)
    }
    console.log('message written')
  })
}

// Open errors will be emitted as an error event
port.on('error', function (err) {
  console.log('Error: ', err.message)
})

port.on(`data`, data => {
  x = data.readInt8(0)
  if (x == 1 || x == -1) {
    console.log(`detected: ${x}`)
    relativeLocation += x;
    if (relativeLocation < 0) relativeLocation = 0;
    if (relativeLocation >= messages.length) relativeLocation = messages.length - 1;
    console.log(`index: ${relativeLocation}`)
    console.log(messages[relativeLocation])
    
    if (toggle) {
      portWrite(messages[relativeLocation]);
    }
    toggle = !(relativeLocation == 0 || relativeLocation == messages.length - 1);
  }
})

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
  messages.push(message.content)
  relativeLocation = messages.length;
});

// Login to Discord with your client's token
client.login(token);
