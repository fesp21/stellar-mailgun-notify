var StellarSdk = require('stellar-sdk');
var config = require('config');
var Users = require('./config/users');

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
var usersObj = {};

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
              eStream = server.payments().forAccount(acctID)
                        .cursor('now')
                        .stream({
                          onmessage: processSingle,
                          onerror: processError
                        });

          break;
        case 'MULTIPLE':
        console.log("Waiting for MULTIPLE stream");
              eStream = server.payments()
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
	var data = {
      from: from,
      to: to,
      subject: 'New Payment Operation',
      html: ` Hello, <br> The following operation has been carried out on your stellar account. 
      				<br>
      				<p>ID: ${record.id}</p>
      				<p>Type: ${opType} </p>
      				<p>Source Account: ${record.source_account}</p>
      				<p>From: ${record.from}</p>
      				<p>To: ${record.to}</p>
      				<p>Asset: ${asset}</p>
              <p>Amount: ${record.amount}</p>


      			`
  };
    if (config.get('Mail.devMode') === 1) {
      console.log("\nDisplaying Data not sending mail\n", data);
      
      return true;
    }
    if (config.get('Mail.devMode') === 0) {
      console.log("\nSending Mail and showing data \n", data);
      return sendMail(data);
    }
    

}


function processMultiple(record) {

  // get rcvr account id from record
  var rcvr = record.to;

  // get if account id is in array or db send email to email addy
  console.log("\nPayment received. Processing....\n", rcvr );

  for (var i = 0; i < usersObj.length; i++) {

    console.log("\nSearching for a matching account....\n");

     if (usersObj[i].account_id === rcvr) {
      console.log("\nMATCH FOUND\n");
      console.log("\npayment record\n", record);
      var asset = record.asset_type === 'native' ? 'XLM' : record.asset_code;
      var opType = record.from === acctID ? 'Outgoing' : 'Incoming';
      var data = {
          from: from,
          to: usersObj[i].email,
          subject: 'New Payment Operation',
          html: ` Hello, <br> The following operation has been carried out on your stellar account. 
                  <br>
                  <p>ID: ${record.id}</p>
                  <p>Type: ${opType} </p>
                  <p>Source Account: ${record.source_account}</p>
                  <p>From: ${record.from}</p>
                  <p>To: ${record.to}</p>
                  <p>Asset: ${asset}</p>
                  <p>Amount: ${record.amount}</p>

                `
      };

      if (config.get('Mail.devMode') === 1) {
        console.log("Displaying Data not sending mail\n", data);
        
        return true;
      }
      if (config.get('Mail.devMode') === 0) {
        console.log("Sending Mail and showing data \n", data);
        return sendMail(data);
      }
      break;
    };
  };

}


function processError(error) {
	console.log("An error occured. could not send mail\n")
	console.log("Error\n", error);
  // Can send mail to admin here

}



function sendMail(data) {
    console.log("Sending Mail...");
    //Invokes the method to send emails given the above data with the helper library
    Mailgun.messages().send(data, function (err, body) {
        
        if (err) {
            console.log("got an error: ", err);
        }
        //Else we can greet and leave
        else {
           
            console.log("Success! \nbody\n",body);
            // return true;
        }
    });
	}