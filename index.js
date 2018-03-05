'use strict';

const ActionsSdkApp = require('actions-on-google').ActionsSdkApp;
const SmoochCore = require('smooch-core');
const smooch = new SmoochCore({
    keyId: 'YOUR_APP_KEY_ID',
    secret: 'YOUR_APP_SECRET_KEY',
    scope: 'app' // account or app
});

const MAX_COUNT = 50;
let counter = 0;

const checkForNewMessages = function(appUserId, ts, handlerObj) {
    console.log('ABOUT TO GET MESSAGES');

    smooch.appUsers.getMessages(appUserId, {
        after: ts
    }).then((response) => {
        const messages = response.messages;
        let replyString;

        console.log('--> GET MESSAGES CALLBACK');

        for (let i = 0; i < messages.length; i++) {
            if (messages[i].role == 'appMaker') {

                if (!replyString) {
                    replyString = messages[i].text;
                } else {
                    replyString += ' ' + messages[i].text;
                }
            }
        }

        if (replyString) {
            console.log('REPLYING: ' + replyString);
            counter = 0;

            const reply = handlerObj.buildInputPrompt(false, replyString);
            handlerObj.ask(reply);
        } else {
            counter++;

            if (counter > MAX_COUNT) {
                counter = 0;
                handlerObj.tell('Haven\'t heard anything back. Try again later.');
            } else {
                setTimeout(checkForNewMessages, 100, appUserId, ts, handlerObj);
            }
        }
    });
};

const sendMessageAndPoll = function(appUserId, msgText, handlerObj) {
    smooch.appUsers.sendMessage(appUserId, {
        text: msgText,
        role: 'appUser',
        type: 'text'
    }).then((response) => {
        const ts = response.message.received;
        checkForNewMessages(appUserId, ts, handlerObj);
    });
};


exports.http = (request, response) => {
    const app = new ActionsSdkApp({
        request,
        response
    });

    function mainIntent(app) {
        console.log('mainIntent');
        const inputPrompt = app.buildInputPrompt(true, '<speak>Hi! <break time="1"/> ' +
                'Welcome to the Smooch and Google Home demo. ' +
                'Why not start by saying Hi?</speak>');
        app.ask(inputPrompt);
    }

    function rawInput(app) {
        console.log('rawInput');
        if (app.getRawInput() === 'bye') {
            app.tell('Goodbye!');
        } else {
            const theText = app.getRawInput();

            if (theText) {

                console.log(app.getUser());

                const googleUserId = app.getUser().userId;

                //Check if the user exists, if it doesn't then create it
                smooch.appUsers.get(googleUserId).then(() => {
                    sendMessageAndPoll(googleUserId, theText, app);
                }).catch(() => {
                    const options = {
                        properties: {
                            platform: 'google-assistant',
                            sessionId: app.getConversationId()
                        }
                    };

                    console.log('ABOUT TO CREATE APP USER');
                    console.log(options);

                    smooch.appUsers.create(googleUserId, options).then(() => {
                        sendMessageAndPoll(googleUserId, theText, app);
                    });
                });
            } else {
                const inputPrompt = app.buildInputPrompt(true, '<speak>I didn\'t quite get that, can you please repeat?</speak>');
                app.ask(inputPrompt);
            }
        }
    }

    const actionMap = new Map();
    actionMap.set(app.StandardIntents.MAIN, mainIntent);
    actionMap.set(app.StandardIntents.TEXT, rawInput);

    app.handleRequest(actionMap);
};
