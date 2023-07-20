var express = require('express');
var router = express.Router();
const { openai } = require('../external/openai');


/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  res.send('hi');

});

router.post('/brain', async (req, res) => {
  
  const messages = req?.body?.messages;
  
  const demoMessage = [
  {
    role: 'system',
    content:
      'You are a helpful assistant for software developers. You come up with new encouraging ways to say hello every time you are queried while the developer further develops his prompts use cases',
  },
  {
    role: 'user',
    content: 'Hello, how are you today computer?',
  },
  ]


  console.log('sending request');
  let gptRes;
  let suggestions;
  try {
    gptRes = await openai.createChatCompletion({
      // model: 'text-davinci-003',
      model: 'gpt-3.5-turbo',
      messages: messages ? messages : demoMessage,
      max_tokens: 1000,
      temperature: 1,
    });
    suggestions = gptRes.data.choices[0].message.content;
  } catch (err) {
    console.log(err);
    suggestions = 'error'
  }

  res.send(suggestions);

});

router.post('/ear', async (req, res) => {
  
  res.send('ok');
});

router.post('/mouth', async (req, res) => {
  
  res.send('ok');
});


module.exports = router;
