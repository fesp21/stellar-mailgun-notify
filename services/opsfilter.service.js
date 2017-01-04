

module.exports = {


  extractData: function (record, usersObj) {
    
    var returnObj = {};
        returnObj.emails = [];
    if (usersObj === 'undefined') {
      usersObj = [];
    }

    switch(record.type_i){
      case 0:
        returnObj.emails = this.getEmail(usersObj,record.source_account,record.account);
        returnObj.subject = 'Stellar Operation: Create Account';
        returnObj.html = `<p>ID: ${record.id}</p>
                          <p>Account: ${record.account}</p>
                          <p>Funder: ${record.funder}</p>
                          <p>Starting Balance: ${record.starting_balance} XLM</p>
                        `;
      break;
      
      case 1:
        returnObj.emails = this.getEmail(usersObj,record.source_account,record.to);
        var asset = record.asset_type === 'native' ? 'XLM' : record.asset_code;
        returnObj.subject = 'Stellar Operation: Payment';
        returnObj.html = `
                          <p>From: ${record.from}</p>
                          <p>To: ${record.to}</p>
                          <p>Asset: ${asset}</p>
                          <p>Amount: ${record.amount}</p>
               `;
      break;

      case 2:
        returnObj.emails = this.getEmail(usersObj,record.source_account,record.to);
        var asset = record.asset_type === 'native' ? 'XLM' : record.asset_code;
        var sent_asset = record.sent_asset_type === 'native' ? 'XLM' : record.sent_asset_code;
        returnObj.subject = 'Stellar Operation: Path Payment';
        returnObj.html = `<p>ID: ${record.id}</p>
                          <p>From: ${record.from}</p>
                          <p>To: ${record.to}</p>
                          <p>Asset: ${asset}</p>
                          <p>Amount: ${record.amount}</p>
                          <p>Sent Asset: ${sent_asset}</p>
                          <p>Source Amount: ${record.source_amount}</p>
                        `;
      break;

      case 3:
        returnObj.emails = this.getEmail(usersObj,record.source_account);        

        var buying_asset = record.buying_asset_type === 'native' ? 'XLM' : record.buying_asset_code;
        var selling_asset = record.selling_asset_type === 'native' ? 'XLM' : record.selling_asset_code;
        

        returnObj.subject = 'Stellar Operation: Manage Offer';
        returnObj.html  = `<p>ID: ${record.id}</p>
                <p>Offer ID: ${record.offer_id}</p>
                <p>Amount: ${record.amount}</p>
                <p>Buying Asset: ${buying_asset}</p>
                <p>Buying Asset Issuer: ${record.buying_asset_issuer}</p>
                <p>Selling Asset: ${selling_asset}</p>
                <p>Selling Asset Issuer: ${record.selling_asset_issuer}</p>
                <p>Price: ${record.price}</p>
                

               `;    
      break;

      case 4:
        returnObj.emails = this.getEmail(usersObj,record.source_account);        

        var buying_asset = record.buying_asset_type === 'native' ? 'XLM' : record.buying_asset_code;
        var selling_asset = record.selling_asset_type === 'native' ? 'XLM' : record.selling_asset_code;
        
        returnObj.subject = 'Stellar Operation: Create Passive Offer';
        returnObj.html = `<p>ID: ${record.id}</p>
                <p>Offer ID: ${record.offer_id}</p>
                <p>Amount: ${record.amount}</p>
                <p>Buying Asset: ${buying_asset}</p>
                <p>Buying Asset Issuer: ${record.buying_asset_issuer}</p>
                <p>Selling Asset: ${selling_asset}</p>
                <p>Price: ${record.price}</p>
                

               `;     
      break;
      case 5:
        returnObj.emails = this.getEmail(usersObj,record.source_account);
        
        returnObj.subject = 'Stellar Operation: Set Options';
        returnObj.html  = `<p>ID: ${record.id}</p>
                <p>Low threshold: ${record.low_threshold}</p>
                <p>Medium threshold: ${record.med_threshold}</p>
                <p>High threshold: ${record.high_threshold}</p>
                <p>Home Domain: ${record.home_domain}</p>
                <p>Signer Key: ${record.signer_key}</p>
                <p>Signer Weight: ${record.signer_weight}</p>
                <p>Master Key Weight: ${record.master_key_weight}</p>
               `;     
      break;
      case 6:
        returnObj.emails = this.getEmail(usersObj,record.source_account,record.trustee);
        var asset = record.asset_type === 'native' ? 'XLM' : record.asset_code;
        returnObj.subject = 'Stellar Operation: Change Trust';
        returnObj.html  = `<p>ID: ${record.id}</p>
                <p>Trustee: ${record.trustee}</p>
                <p>Trustor: ${record.trustor}</p>
                <p>Limit: ${record.limit}</p>
                <p>Asset: ${asset}</p>
                <p>Asset Issuer: ${record.asset_issuer}</p>
               `;     
      break;

      case 7:
        returnObj.emails = this.getEmail(usersObj,record.source_account,record.trustee);

        var asset = record.asset_type === 'native' ? 'XLM' : record.asset_code;
        returnObj.subject = 'Stellar Operation: Allow Trust';
        returnObj.html  = `<p>ID: ${record.id}</p>
                <p>Trustee: ${record.trustee}</p>
                <p>Trustor: ${record.trustor}</p>
                <p>Limit: ${record.limit}</p>
                <p>Asset: ${asset}</p>
                <p>Asset Issuer: ${record.asset_issuer}</p>
                <p>Authorize: ${record.authorize}</p>
               `;       
      break;
      
      case 8:
        returnObj.emails = this.getEmail(usersObj,record.source_account,record.into);
        returnObj.subject = 'Stellar Operation: Merge Account';
        returnObj.html  = `<p>ID: ${record.id}</p>
                <p>Account: ${record.account}</p>
                <p>Into: ${record.into}</p>
                `;    
      break;
      
      default: 
        returnObj.emails.push(usersObj.find(this.findAccount, record.source_account).email);
        
        returnObj.subject = 'Stellar Operation:';
        returnObj.html  = `<p>Error displaying operation. Contact support team</p>
                `;    
      ;
    }    
    
    return returnObj;
  },

  findAccount: function (account) {
    console.log("THIS: ",this.toString());
    return account.account_id === this.toString();
  },

  getEmail: function(usersObj, acct1, acct2) {
    var emails = [];
    if (acct2 === 'undefined') {
      acct2 = '';
    }
    var email1 = usersObj.find(this.findAccount, acct1);
    if (email1) {
      emails.push(email1.email);
    }

    var email2 = usersObj.find(this.findAccount, acct2);
    if (email2) {
      emails.push(email1.email);
    }
    
    return emails;
  },

};

