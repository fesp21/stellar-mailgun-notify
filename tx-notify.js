var StellarSdk = require('stellar-sdk');
var config = require('config');
var Users = require('./config/users');
var Opsfilter = require('./services/opsfilter.service');

var acctID = config.get('accountID');

var server = "";

if (config.get('mode') === 'TEST') {
  server = new StellarSdk.Server(config.get('testNetworkUrl'));
}

if (config.get('mode') === 'LIVE') {
  server = new StellarSdk.Server(config.get('publicNetworkUrl'));
}

var Mailgun = require('mailgun-js')({apiKey: config.get('Mail.apiKey'), domain: config.get('Mail.domain')});
var from = config.get('Mail.fromName')+' <'+config.get('Mail.fromAddress')+'>';
var to = config.get('Mail.toAddress');
var eStream = "";
var usersObj = [];

// Load account ID's and email from DB.
// You can change email & account_id to match your database table fields
Users.forge().fetchAll({require: true, columns: ['email', 'account_id']})
    .then(function(collection) {
      // store users in object
      usersObj = collection.toJSON();
      console.log(usersObj);
    })
    .catch(function(error) {
      console.log("Empty records\n",error);
    })
    .then(function() {
      switch(config.get('streamType')){
        case 'SINGLE':
              // validate account ID
              if (!StellarSdk.Keypair.isValidPublicKey(acctID)) {

                console.log("Invalid Account ID");
                return false;
              }
              console.log("Waiting for SINGLE stream");
              eStream = server.operations().forAccount(acctID)
                        .cursor('now')
                        .stream({
                          onmessage: processSingle,
                          onerror: processError
                        });

          break;
        case 'MULTIPLE':
        console.log("Waiting for MULTIPLE stream");
        // processMultiple(usersObj);
              eStream = server.operations()
                        .cursor('now')
                        .stream({
                          onmessage: processMultiple,
                          onerror: processError
                        });
          break;
        default:
          console.log("Mode not specified\nExiting ....");
          process.exit(1);

      }

    });

console.log('Waiting for transactions....');


function processSingle(record) {
	console.log("\npayment record\n", record);
	console.log("\nPayment received. Processing....\n");

	var asset = record.asset_type === 'native' ? 'XLM' : record.asset_code;
	var opType = record.from === acctID ? 'Outgoing' : 'Incoming';

  var returnObj = Opsfilter.extractData(record, [acctID]);

  if (returnObj) {
    var data = {
      from: from,
      to: to,
      subject: returnObj.subject,
      html: ` Hello, <br> The following operation has been carried out on your stellar account. 
              <br>
              ${returnObj.html}
        `
    };
    return sendMail(data);
  } else{
    console.log("returnObj: ", returnObj);
    return;
  };

	
}


function processMultiple(record) {
  console.log("record: ", record);
  
  var returnObj = Opsfilter.extractData(record, usersObj);
  
  if (returnObj.emails.length != 0) {
    console.log("\npayment record\n", record);
    var emailList = returnObj.emails.join();
    var data = {
        from: from,
        to: emailList,
        subject: returnObj.subject,
        html: ` Hello, <br> The following operation has been carried out on your stellar account. 
                <br>
                ${returnObj.html}

              `
    };
      return sendMail(data);
  }

}


function processError(error) {
	console.log("An error occured. could not send mail\n")
	console.log("Error\n", error);
  // Can send mail to admin here

}

function findAccount(account) {
  console.log("THIS: ",this.toString());
  return account.account_id === this.toString();
}


function sendMail(data) {
    console.log("Sending Mail...");
    //Invokes the method to send emails given the above data with the helper library
    if (config.get('Mail.devMode') === 1) {
      console.log("Displaying Data not sending mail\n", data);
      
      return true;
    }
    if (config.get('Mail.devMode') === 0) {
      console.log("Sending Mail and showing data \n", data);
      Mailgun.messages().send(data, function (err, body) {
          
          if (err) {
            console.log("got an error: ", err);
          }
          else {
            console.log("Success! \nbody\n",body);
            // return true;
          }
      });      
    }
}