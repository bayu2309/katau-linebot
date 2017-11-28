import express from 'express';
import { middleware as LineMiddleware, Client as LineClient } from '@line/bot-sdk';

import config from './config';
import HandleEvent from './handleEvent';

const app = express();
const lineConfig = {
  channelAccessToken: config.channelAccessToken,
  channelSecret: config.channelSecret
}
const lineClient = new LineClient(lineConfig);
const handlingEvent = new HandleEvent(lineClient);

//app setup
app.set('port', process.env.PORT || 7777);

//webhook route
app.post('/webhook', LineMiddleware(lineConfig), (req, res) => {
  Promise.all(req.body.events.map(handlingEvent._handling)).then(result => {
    res.json(result);
  });
});

//start the server
app.listen(app.get('port'), () => {
  console.log(`Server starting in : ${ app.get('port') }`);
})
