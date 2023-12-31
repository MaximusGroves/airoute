const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
  apiKey: process.env.openaikey,
});
const openai = new OpenAIApi(configuration);

module.exports = {
  openai,
};
