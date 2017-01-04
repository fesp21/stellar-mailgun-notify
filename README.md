# stellar-mailgun-notify
Send email notifications for payment operations fon a stellar account. It can be configured to listen for operations for a signle account or listen for multiple accounts.

**Note: ** This is a standalone implementation that is meant to be to be added to your existing setup. Might be useful to anchors, wallets, etc.

#Installation

Download or clone the repository and run the following command
`npm install` to download the needed dependecies.
You might need to install the npm packages for mysql, pg or sqlite3. Depending on the database you are using.

#Configuration
**Note:** You need to use the mailgun api to send emails. You can create a mailgun account [here.](https://mailgun.com)


Open the file "config/default.json" and set the following values
- "streamType": this can be set to either `SINGLE` or `MULTIPLE`. In `SINLGE` mode it listens to payments made to a particular account. In `MULTIPLE` mode it listens to all payments, matches payments with record in your database and sends a notification to the registered email
- "mode": this can be `TEST` or `LIVE`. `TEST` === Stellar test network. `LIVE` === Stellar public network.
- "accountID": Stellar account ID
- "Database.type": `MULTIPLE` mode supports 3 database types. Values can be either `mysql`, `pg`(postgresql) or `sqlite3`
- "Database.host": host. Set this for either `mysql` or `pg`.
- "Database.dbName": Name of the database you wish to connect to.
- "Database.tableName": Database table holding user information
- "Database.user": Authorised user for database access.
- "Database.password": Password for database user.
- "Database.filename": Location of file. Set this only for sqlite DB
- "Mail.devMode" : Indicates whether to send email or not. 1 === "Do not send", 0 === "Send email"
- "Mail.apiKey": Mailgun API Key
- "Mail.domain" : domain name linked to your mailgun account,
- "Mail.fromAddress": Sender email address,
- "Mail.toAddress": Recepient email address,
- "Mail.fromName": Sender Name,
- "Mail.signature": Sender signature

By default, `tx-notify.js` is set to connect to the Stellar test network. You can change this to public network in the `config/default.json` file.


#Start the app
To run the app, open a terminal navigate to the folder and type

`node tx-notify.js`

#Update
Added feature: Send notifications for all operations not just payments

#How it Works

**SINGLE Mode**
In single mode you have to specify just one account ID and an email address to send notifications. This is done in the Config file, stated above. 
Once a payment is received it is either printed out on the console or sent to the specified email address if `Mail.devMode` is 0.

**MULTIPLE Mode**
In multiple mode you specify a database the app connects to. Once connected it loads the account_id and emails to a local object and listens to all payments on the network. 

Once a payment record is received, It tries to find a match between the  received account ID an entry retrieved from your database. If a match is found, the record is either printed out on the console or sent to the specified email address if `Mail.devMode` is 0.

The repository has an sqlite database with the following values

user2@example.com|GD3LJIQEWEOWKEKW7N7YX255RFJKWLVKIU457LUZPWP22I3HLR5WOCBK
user3@example.com|GAG2RUGQLTZBPRQDDTU7MY445BB2EOT4X3TVQVEVORYOQKOUYF3CSDNM
user1@example.com|GCRUQO55VBD2PIQGH2ELIM4ISHV644424KDXDUKW65Q32NM3HH6AUGQV
user4@example.com|GCN7M4BB4GJK352HKEUMNW5YFPVNWJUI3K22SOY6PEZEPM2BQBALFBFD

Try running the app and send a payment to any of the account ID's. You should see the generated email content printed on the terminal.

Remember to set  `Mail.devMode` = 0 and `mode` = TEST. In order to carry out transactions and not to send emails to invalid addresses.


#For custom implementation, just send a message.

#Comments and Contributions
Kindly use the issue tracker



