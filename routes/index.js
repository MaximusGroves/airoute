var express = require('express');
var router = express.Router();
const { openai } = require('../external/openai');
const fs = require('fs');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './tmp/'); // The location where the uploaded files will be stored temporarily.
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.mp3');
  },
});

const upload = multer({ storage: storage });

/* GET home page. */
router.get('/', function (req, res, next) {
  // res.render('index', { title: 'Express' });
  res.send('hi');
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
      model: 'gpt-3.5-turbo',
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

router.post('/ear', upload.single('file'), async (req, res) => {
  const location = req?.file?.path || './demo-audio/demoaudio.mp3';

  const resp = await openai.createTranscription(
    fs.createReadStream(location),
    'whisper-1'
  );

  if (req?.file?.path) {
    fs.unlink(req?.file?.path, (err) => {
      if (err) {
        console.error('Failed to delete local file:' + err);
      } else {
        console.log('Successfully deleted local file');
      }
    });
  }

  res.send(resp.data.text);
});

router.post('/mouth', async (req, res) => {
  const text =
    req?.body?.text ||
    'Hey, um, so can I get, like, a spicy chicken sandwich meal with a large Coke Zero, please? Thanks.';
  const stability = req?.body?.stability || 0.2;

  try {
    const response = await axios({
      method: 'post',
      url: 'https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL/stream',
      headers: {
        accept: 'audio/mpeg',
        'xi-api-key': '8aaf1c64ece18bb15ed32c4cc992f780',
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
