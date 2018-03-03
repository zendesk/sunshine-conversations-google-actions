'use strict';

const ActionsSdkApp = require('actions-on-google').ActionsSdkApp;
const MAX_COUNT = 50;
var counter = 0;
var SmoochCore = require('smooch-core');
var smooch = new SmoochCore({
    keyId: 'YOUR_APP_KEY_ID',
    secret: 'YOUR_APP_SECRET_KEY',
    scope: 'app', // account or app
});

var checkForNewMessages = function(appUserId, ts, handlerObj) {
  console.log('ABOUT TO GET MESSAGES');

  smooch.appUsers.getMessages(appUserId, {after: ts}).then((response) => {
    var messages = response.messages
    var replyString;

    console.log('--> GET MESSAGES CALLBACK');

    for(var i=0; i<messages.length; i++) {
      if(messages[i].role == "appMaker") {

        if(!replyString) {
          replyString = messages[i].text;
        } else {
          replyString += " " + messages[i].text;
        }
      }
    }

    if(replyString) {
      console.log('REPLYING: ' + replyString);
      counter = 0;

      var reply = handlerObj.buildInputPrompt(false, replyString);
      handlerObj.ask(reply);
    } else {
      counter++;

      if(counter > MAX_COUNT) {
        counter = 0;
        handlerObj.tell("Haven't heard anything back. Try again later.");
      } else {
        setTimeout(checkForNewMessages, 100, appUserId, ts, handlerObj);
      }
    }
  });
}

var sendMessageAndPoll = function(appUserId, msgText, handlerObj) {
  smooch.appUsers.sendMessage(appUserId, {
      text: msgText,
      role: 'appUser',
      type: 'text'
  }).then((response) => {
      var ts = response.message.received;
      checkForNewMessages(appUserId, ts, handlerObj);
  });
}


exports.http = (request, response) => {
  const app = new ActionsSdkApp({request, response});

  function mainIntent (app) {
    console.log('mainIntent');
    let inputPrompt = app.buildInputPrompt(true, '<speak>Hi! <break time="1"/> ' +
      'Welcome to the Smooch and Google Home demo. ' +
      'Why not start by saying Hi?</speak>');
    app.ask(inputPrompt);
  }

  function rawInput (app) {
    console.log('rawInput');
    if (app.getRawInput() === 'bye') {
      app.tell('Goodbye!');
    } else {
      var theText = app.getRawInput();

      if(theText) {

        console.log(app.getUser());

        var googleUserId = app.getUser().userId;

        //Check if the user exists, if it doesn't then create it
        smooch.appUsers.get(googleUserId).then((response) => {
          sendMessageAndPoll(googleUserId, theText, app)
        }).catch((err) => {
          var options = {
              "platform": "google-assistant",
              "sessionId": app.getConversationId()
          };

          console.log("ABOUT TO CREATE APP USER");
          console.log(options);

          smooch.appUsers.create(googleUserId, options).then((response) => {
            sendMessageAndPoll(googleUserId, theText, app);
          });
        });
      } else {
        let inputPrompt = app.buildInputPrompt(true, "<speak>I didn't quite get that, can you please repeat?</speak>");
        app.ask(inputPrompt)
      }
    }
  }

  let actionMap = new Map();
  actionMap.set(app.StandardIntents.MAIN, mainIntent);
  actionMap.set(app.StandardIntents.TEXT, rawInput);

  app.handleRequest(actionMap);
};
