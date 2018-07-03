function TimeTriggered() {
   setLogger();
   var d = new  Date();
   var dt = d.toLocaleDateString();
   var ss = getDriveSpreadsheet(REGISTRATION_SHEET);

   Logger.log("TimeTriggered " + dt);
   searchMessages();
   var triggers = ScriptApp.getUserTriggers(ss);

  triggers.forEach(function(trigger) {
      if(trigger.getHandlerFunction()== 'TimeTriggered' ) {
          id = trigger.getUniqueId();
          Logger.log('deleted trigger:'+trigger.getUniqueId()+' ;source:'+ trigger.getTriggerSource() + '; handler:'+trigger.getHandlerFunction());

          ScriptApp.deleteTrigger(trigger);
      }
  });

}


function TimeTriggeredHourly() {
   setLogger();
   var d = new  Date();
   var dt = d.toLocaleDateString();

   Logger.log("TimeTriggered " + dt);
   searchMessages();
}


function searchMessages()
{
var threads = GmailApp.search('label:"INBOX" subject:"Email Confirmation*"');
var l = threads.length;
var pattern = new RegExp("id:\([0-9]*\)");

for(n=0;n<l;n++) {
  Logger.log('Tt:threads['+n+']:'+threads[n]);
  var s=threads[n].getFirstMessageSubject();
  var res=pattern.exec(s);

  Logger.log('Tt:subject:'+s);

  try {
    if(res.length>1) {
      Logger.log('Tt:found:'+res[1]);
      proc_emailConfirm(res[1]);
      threads[n].moveToTrash();
    }
  } catch(err) {
    Logger.log('Tt:failed email confirm for '+res[1]);
  }
}
// Log the subject lines of your Inbox
// var threads = GmailApp.getInboxThreads();
// for (var i = 0; i < threads.length; i++) {
//   Logger.log(threads[i].getFirstMessageSubject());
// }

}

function proc_emailConfirm(ts)
{

  setLogger();
  var record = new MemberRecord_();

//  record.Name = getData("member_name",theForm);

  var ss = getDriveSpreadsheet(REGISTRATION_SHEET);
  var st = ss.getSheetByName(SHEET_NAME);

   record.dbInit(st);
   record.getRowOnTimestamp(st,ts);
   if(record.email_confirm == true) {
      return;
   }

   record.email_confirm = true;
   record.updateRow(st);

   sendEmailConfirmedNotification(record);

}

/**
 * Delete Message with given ID.
 *
 * @param  {String} userId User's email address. The special value 'me'
 * can be used to indicate the authenticated user.
 * @param  {String} messageId ID of Message to delete.
 */
function deleteMessage(userId, messageId) {
/*  var request = gapi.client.gmail.users.messages.delete({
    'userId': userId,
    'id': messageId
  });
  request.execute(
    function(resp) { });
*/
}


function listLabelInfo() {
  var response =
    Gmail.Users.Labels.list('me');
  for (var i = 0; i < response.labels.length; i++) {
    var label = response.labels[i];
    Logger.log(JSON.stringify(label));
  }
}
/**
 * Lists, for each thread in the user's Inbox, a
 * snippet associated with that thread.
 userId	string	The user's email address. The special value me can be used to indicate the authenticated user.
 */
function listInboxSnippets() {
  var pageToken;
  do {
    var threadList = Gmail.Users.Threads.list('me', {
      q: 'label:inbox',
      pageToken: pageToken
    });'subject:Email Confirmation*'
    if (threadList.threads && threadList.threads.length > 0) {
      threadList.threads.forEach(function(thread) {
        Logger.log('Snippet: %s', thread.snippet);
      });
    }
    pageToken = threadList.nextPageToken;
  } while (pageToken);
}
/**
 * Retrieve Messages in user's mailbox matching query.
 *
 * @param  {String} userId User's email address. The special value 'me'
 * can be used to indicate the authenticated user.
 * @param  {String} query String used to filter the Messages listed.'subject:Email Confirmation*'
 * @param  {Function} callback Function to call when the request is complete.
 */
function listMessages(userId, query, callback) {
  var getPageOfMessages = function(request, result) {
    request.execute(function(resp) {
      result = result.concat(resp.messages);
      var nextPageToken = resp.nextPageToken;
      if (nextPageToken) {
        request = gapi.client.gmail.users.messages.list({
          'userId': userId,
          'pageToken': nextPageToken,
          'q': query
        });
        getPageOfMessages(request, result);
      } else {
        callback(result);
      }
    });
  };
  var initialRequest = gapi.client.gmail.users.messages.list({
    'userId': userId,
    'q': query
  });
  getPageOfMessages(initialRequest, []);
}


// subject format
// Email Confirmation id:1497426418804&body=Confirmation Reply from member, Thankyou

function test_listMessages() {

 listMessages('me','subject:Email Confirmation*', function(result) {
    Logger.log(result);
    });

}

