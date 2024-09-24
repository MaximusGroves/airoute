var express = require('express');
var router = express.Router();
const { openai } = require('../external/openai');
const fs = require('fs');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const stream = require('stream');

//making sure this is in there

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', function (req, res, next) {
  // res.render('index', { title: 'Express' });
  res.send('hi');
});

router.post('/ear', upload.single('file'), async (req, res) => {
  const defaultLocation = './demo-audio/demoaudio.mp3';

  const buffer = req.file.buffer;
  const OPENAI_API_KEY = process.env.openaikey;
  const url = 'https://api.openai.com/v1/audio/transcriptions';
  const headers = {
    Authorization: `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'multipart/form-data',
  };

  let formData = new FormData();
  formData.append('file', buffer, {
    contentType: 'audio/mpeg',
    name: 'file',
    filename: 'audio.mp3',
  });
  formData.append('model', 'whisper-1');

  try {
    let response = await axios.post(url, formData, {
      headers: formData.getHeaders(headers),
    });
    res.send(response.data.text);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while transcribing the audio.');
  }
});

router.post('/feelings', async (req, res) => {
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

  // Creates a client
  const client = new language.LanguageServiceClient();

  /**
   * TODO(developer): Uncomment the following line to run this code.
   */
  const text = req?.body?.text || 'Your text to analyze, e.g. Hello, world!';

  // Prepares a document, representing the provided text
  const document = {
    content: text,
    type: 'PLAIN_TEXT',
  };

  // Detects the sentiment of the document
  const [result] = await client.analyzeSentiment({ document });

  const sentiment = result.documentSentiment;
  console.log('Document sentiment:');
  console.log(`  Score: ${sentiment.score}`);
  console.log(`  Magnitude: ${sentiment.magnitude}`);

  const sentences = result.sentences;
  sentences.forEach((sentence) => {
    console.log(`Sentence: ${sentence.text.content}`);
    console.log(`  Score: ${sentence.sentiment.score}`);
    console.log(`  Magnitude: ${sentence.sentiment.magnitude}`);
  });

  res.send(result);
});

router.post('/brain', async (req, res) => {
  const messages = req?.body?.messages || [
    {
      role: 'system',
      content:
        'You are a helpful assistant for software developers. You come up with new encouraging ways to say hello every time you are queried while the developer further develops his prompts use cases',
    },
    {
      role: 'user',
      content: 'Hello, how are you today computer?',
    },
  ];

  let gptRes;
  let suggestions;
  try {
    gptRes = await openai.createChatCompletion({
      // model: 'text-davinci-003',
      // model: 'gpt-3.5-turbo',
      model: "gpt-4o-mini",
      messages,
      max_tokens: 1000,
      temperature: 1,
    });
    suggestions = gptRes.data.choices[0].message.content;
  } catch (err) {
    console.log(err);
    suggestions = 'error';
  }

  res.send(suggestions);
});

router.post('/mouth', async (req, res) => {
  const text =
    req?.body?.text ||
    'Hey, um, so can I get, like, a spicy chicken sandwich meal with a large Coke Zero, please? Thanks.';
  const stability = req?.body?.stability || 0.2;

  try {
    const response = await axios({
      method: 'post',
      url: 'https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL',
      headers: {
        accept: 'audio/mpeg',
        'xi-api-key': process.env.elevenlabskey,
        'Content-Type': 'application/json',
      },
      data: {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability,
          similarity_boost: 0.9,
        },
      },
      responseType: 'stream',
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    response.data.pipe(res);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

module.exports = router;
