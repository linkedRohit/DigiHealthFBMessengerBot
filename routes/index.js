var express = require('express');
var router = express.Router();
var app = express();
var request = require('request');
var mysql = require('mysql');

var pool      =    mysql.createPool({
    connectionLimit : 100, //important
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'address_book',
    debug    :  false
});

var VALIDATION_TOKEN = 'quiet-mountain-52358-digiHealth';
var PAGE_ACCESS_TOKEN = 'EAAE31e3twm0BAPgJxPtB3RcCNam4edtakjUVWGFsfQ4DdmFKl47RtRTnQRRl55t1BBFjttZAg77KlMZB9REsLNvQ4Ahr3Oav8sK5mD5rQlAkKLUZCZB7rjZCdkEQNFm6qrVALt0ZBlxLz4SVZA8GQi8eHdJUxN8UohDVYZC2gTeThAZDZD';
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});

router.post('/webhook', function (req, res) {
  try {
  var data = req.body;
  console.log(data);
  // Make sure this is a page subscription
  if (data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;
      // Iterate over each messaging event
      pageEntry.messaging.forEach(function(messagingEvent) {
        if (messagingEvent.optin) {
          receivedAuthentication(messagingEvent);
        } else if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.delivery) {
          receivedDeliveryConfirmation(messagingEvent);
        } else if (messagingEvent.postback) {
          receivedPostback(messagingEvent);
        } else {
          console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        }
      });
    });
  }
  // Assume all went well.
  //
  // You must send back a 200, within 20 seconds, to let us know you've 
  // successfully received the callback. Otherwise, the request will time out.
  res.sendStatus(200);
} catch(err){
  console.log(err);
}
});

function receivedAuthentication(event) {
}

function receivedDeliveryConfirmation(event) {
}

function receivedPostback(event) {
}

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  if (message.text) {

    // If we receive a text message, check to see if it matches any special
    // keywords and send back the corresponding example. Otherwise, just echo
    // the text we received.
    switch (message.text) {
      case 'image':
        sendImageMessage(senderID);
        break;

      case 'button':
        sendButtonMessage(senderID);
        break;

      case 'generic':
        sendGenericMessage(senderID);
        break;

      case 'receipt':
        sendReceiptMessage(senderID);
        break;

      default:
        heyBotSendResponse(senderID, message);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function heyBotSendResponse(senderID, message) {

  var messageId = message.mid;
  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;
  processInput(senderID, message);
}

function processInput(senderID, message) {
    NotifyUserAboutProcessing(senderID);
    var inpType = processInputType(senderID, message);
    addToStorage(senderID, message);
    if(inpType == "symptoms") {
      var moreSymptomsOrDisease = processUserSuffering(senderID, message);
    } else if(inpType == "quickReply") {
      
    } else if(inpType == "userDetails") {
      
    }
    //sendTextMessage(senderID, moreSymptomsOrDisease);
}

function NotifyUserAboutProcessing(senderID) {
  var notifyData = {
    "recipient":{
      "id": senderID
    },
    "sender_action":"typing_on"
  };

  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: notifyData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });

}

function processUserSuffering(senderID, message) {
  //process sufferings
  var resp = getResponseForThisInput(senderID, message);
  sendResponseForThisInput(senderID, resp);
}

function getResponseForThisInput(senderID, message) {
  
}
function sendResponseForThisInput(senderID, resp) {

  //process for new symptoms/disease or other responses.
  var quickReply = new Object();

  quickReply['content'] = {
    "recipient":{
      "id": senderID
    },
    "message":{
      "text":"Sufferring from these as well?", //resp.title
      "quick_replies":[
        {
          "content_type":"text",
          "title":"cough",
          "payload":"cough_payload_id" //resp.itemId
        },
        {
          "content_type":"text",
          "title":"cold",
          "payload":"cold_payload_id"
        }
      ]
    }
  };
  callSendAPI(quickReply);
}

function processInputType(senderID, message) {
  return "symptoms";
}

function addToStorage(senderID, message) {

}

function sendQuickReply(recipientId, replyContent) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  }); 
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };
  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}


module.exports = router;
