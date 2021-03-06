const accountSid = require("./config.json").twilioID;
const authToken = require("./config.json").twilioToken;
const twilioClient = require('twilio')(accountSid, authToken);
const { SerialPort } = require('serialport')
const language = require('@google-cloud/language');
const langClient = new language.LanguageServiceClient({ keyFilename: './google_auth.json' });

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
const vision = require('@google-cloud/vision');
const video = require('@google-cloud/video-intelligence').v1;
const visionClient = new vision.ImageAnnotatorClient({ keyFilename: './google_auth.json' });
const videoClient = new video.VideoIntelligenceServiceClient({ keyFilename: './google_auth.json' });
const fetch = require('node-fetch');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log('Ready!');
});

client.on('messageCreate', async (message) => {
  document = {
    content: message.content,
    type: "PLAIN_TEXT"
  }
  var [result] = await langClient.analyzeSentiment({ document: document });
  console.log(result);
  var sentiment = result.documentSentiment;
  console.log(message.content)
  console.log(`Sentiment Score: ${sentiment.score}`)
  if (sentiment.score < -.2 && sentiment.magnitude > 0.2) {
    twilioClient.messages
      .create({
        body: `Caution: ${message.author.username} is showing signs of depression/self harm in Discord. The message was ${message.content}`,
        from: require("./config.json").twilioNumber,
        to: require("./config.json").myNumber
      })
      .then(message => console.log(message.sid));
  }
  console.log(`Sentiment Magnitude: ${sentiment.magnitude}`)

  let messageData = undefined;
  if (message.attachments.size > 0) {
    const attachment = message.attachments.at(0);
    if (attachment.contentType?.startsWith('video')) {
      const file = await fetch(attachment.url);
      const array = new Uint8Array(await file.arrayBuffer());
      const [operation] = await videoClient.annotateVideo({
        inputContent: btoa(String.fromCharCode(...new Uint8Array(array))),
        features: ['LABEL_DETECTION'],
      });
      const [operationResult] = await operation.promise();
      const annotations = operationResult.annotationResults[0];
      const labels = annotations.segmentLabelAnnotations;
      messageData = labels.slice(0, 2).map(i => i.entity.description).join(', ');
    } else {
      const [result] = await visionClient.labelDetection(message.attachments.at(0).url);
      if (result.error) console.error(result.error);
      const labelAnnotations = result.labelAnnotations;
      if (labelAnnotations) {
        messageData = labelAnnotations.slice(0, 2).map(i => i.description).join(', ');
      }
    }
  }
  if (messageData === undefined) {
    messageData = message.content;
  }
  console.log(portWrite(messageData));
  messages.push(messageData)
  relativeLocation = messages.length;
});

// Login to Discord with your client's token
client.login(token);
