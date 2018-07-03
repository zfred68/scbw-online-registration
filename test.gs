function showDialog() {
  var html = HtmlService.createHtmlOutputFromFile('about')
      .setWidth(300)
      .setHeight(200);
  SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
      .showModalDialog(html, 'Dialog title');
}


function test0() {
   membership_folder = sget_("MEMBERSHIPFOLDER",DEFAULT_MEMBERSHIPFOLDER);
   registration_currentyear_folder = getBasefolder(membership_folder+'/'+current_year,true);
}

function test1() {
 var d = new Date(); setLogger();
  current_year = d.getFullYear().toString();
  
  var r = Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate());
  Logger.log(d.toISOString());
  Logger.log(d.getDate()+ ' ' + d.getMonth()+1 + ' '+d.getFullYear());
  Logger.log(d.toLocaleDateString());
  Logger.log(r);
  var c = new Date(r);
  Logger.log(c.toLocaleDateString());
 
}

function test2() {
  setLogger();
  test1();
}



var ii = 

'{ "inputs":[{"name":"Radio_MemberAction","type":"radio","value":"MemberRenewal","checked":true},{"name":"member_name","type":"text","value":"fredg"},{"name":"member_address","type":"text","value":"3/12 Lake Parade"},{"name":"member_suburb","type":"text","value":"east corrimal"},{"name":"member_postcode","type":"text","value":"2518"},{"name":"member_phone","type":"text","value":"042850096"},{"name":"member_mobile","type":"text","value":"042850096"},{"name":"member_email","type":"text","value":"zfred68@gmail.com"},{"name":"member_emergency_contact","type":"text","value":"Emergent Partner"},{"name":"member_emergency_contact_phone","type":"text","value":"042859999"},{"name":"Radio_FAid","type":"radio","value":"FAid-xpire","checked":false},{"name":"Radio_member_category","type":"radio","value":"Paym-full","checked":true},{"name":"member_assoc_club_name","type":"text","value":"Sutherland"},{"name":"Chk_clubBadge","type":"checkbox","value":"on","checked":false},{"name":"Radio_PayMethod","type":"radio","value":"PAY_dd","checked":true},{"name":"member_bankref","type":"text","value":"no transaction"},{"name":"Chk_agree_1","type":"checkbox","value":"on","checked":false},{"name":"Chk_agree_2","type":"checkbox","value":"on","checked":true},{"name":"Chk_agree_3","type":"checkbox","value":"on","checked":true},{"name":"pdf_blob","type":"hidden","value":""},{"name":"member_total","type":"hidden","value":"30"}]}';
//===============

function test3() {
  setLogger();
  
 var obj = JSON.parse(ii);
 var name = getData("member_name",obj);
 var d = new Date();
 var r = Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate());

// var inpj = {"name":"submit_date","type":"date","value":r.toString()};
// obj.inputs.push(inpj);
 var formdata = obj;

 var memberFile;
 
 membership_folder = sget_("MEMBERSHIPFOLDER",DEFAULT_MEMBERSHIPFOLDER);
  
  try {

  
    writeDatabase(formdata); //assert var record is defined
    record.logRecord();
    
    memberFile = writeMemberFile(formdata);

    // Check if the form respondent needs to be notified; if so, construct and
    // send the notification. Be sure to respect the remaining email quota.
    if (sget_('respondentNotify','false') == 'true' &&
        MailApp.getRemainingDailyQuota() > 0) {
      sendRespondentNotification(record);
    }
    
    
  }catch(err) {
    
     SendStatusMsg("append error " + err);
  }

}

function test3_1() {
//  setLogger();
  
 var obj = JSON.parse(ii);
 var name = getData("member_name",obj);
 var d = new Date();
 var r = Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate());

 var inpj = {"name":"submit_date","type":"date","value":r.toString()};
 obj.inputs.push(inpj);
 var formdata = obj;

 var memberFile;
  
  try {

  
    //writeDatabase(formdata); //assert var record is defined
    
    record = new MemberRecord_();
   // record.setRow(formdata);
   // record.logRecord();
    
  //  var nname = getData("member_name",formdata);
    var payed = getfieldData("payd_amount",formdata);
  //  var nnsubmitdate = getfieldData("date_submittal",formdata);
  //  var action = getfieldData("Radio_MemberAction",formdata);
    
    var aaction = getData("Radio_MemberAction",formdata);
    
    var nndate = getfieldData("Date",formdata);
    
    Logger.log('payd_amount='+payed);
    
  }catch(err) {
    
     Logger.log("append error " + err);
  }

}


function test4() {
 var obj = JSON.parse(ii);
 var name = getData("member_name",obj);
 
 var d = new Date();
 var r = Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate());

 var inpj = {"name":"submit_date","type":"date","value":r.toString()};
 obj.inputs.push(inpj);
  
 Logger.log(name);
 var file = getMemberFile(name);
 var doc = DocumentApp.openById(file.getId());
 // Get the body section of the active document.
 var body = doc.getBody();
 // Log the number of elements in the document.
 Logger.log("There are " + body.getNumChildren() +
     " elements in the document body.");
 
  var Paragraphs = body.getParagraphs();
  var Paragraph;getParents()
  var t;
  var l =Paragraphs.length;
  var i;
  for(i=0;i<l;i++) {
    Paragraph = Paragraphs[i];
    if(Paragraph.findText("^Name:") != null) {
      Paragraph.replaceText("X*X","FRed Zickar")
    }
    
    t=Paragraph.getText();
    Logger.log(i+','+t)
    
  }
  
  var tables = body.getTables();
  l= tables.length;
  for(i=0;i<l;i++) {
    var table = tables[i];
    var t = table.getText();
     Logger.log(i+'table,'+t);
  }
  
  fields.forEach (function (e) {
    Logger.log('field:'+e);
  });
  
  
}


function test5() {
  
 setLogger();
 test0()
 
 var obj = JSON.parse(ii);
 var name = getData("member_name",obj);
 
 var d = new Date();
 var r = Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate());
 var t = Date.UTC();
  
 var inpj = {"name":"submit_date","type":"date","value":r.toString()};
 obj.inputs.push(inpj);
  
 Logger.log(name);
  
  //writeDatabase(obj);
  writeMemberFile(obj);
}


function test6() {
  var documentProperties = PropertiesService.getDocumentProperties();
  var scriptProperties = PropertiesService.getScriptProperties();
  var userProperties = PropertiesService.getUserProperties();

  var a,b,c;
  if(documentProperties !=null) {  // only for add-ons 
    a = documentProperties.getProperty('DAYS_TO_FETCH')
    documentProperties.setProperty('DAYS_TO_FETCH', '5');
  }
  if(scriptProperties != null) {
    b = scriptProperties.getProperty('SERVER_URL');
    scriptProperties.setProperty('SERVER_URL', 'http://www.example.com/MyWeatherService/');
    scriptProperties.setProperties({
  'cow': 'moo',
  'sheep': 'baa',
  'chicken': 'cluck'
});
  }
  
  if(userProperties != null) {
    c = userProperties.getProperty('DISPLAY_UNITS');  
    userProperties.setProperty('DISPLAY_UNITS', 'metric');
    
  }
  
}    

function test7() {

   var response = UrlFetchApp.fetch("https://script.google.com/macros/s/AKfycbxvXVMjFyUxL4mJCeFmt6a9ukt4VIjhqwbr5UIg1T0/dev?form=thankyou");
}

function test8() {

  setLogger();
  var record = { "Name" : "Limo OP a","Email":"zfred681@gmail.com" };
  var template_id = "1ojJ-CithnEhDFHaKZkS_rJ87edLbr1Fc5LnXKO0Tl6M";
 
  var file = DriveApp.getFileById(template_id );
  Logger.log("name "+ record.Name);
  sendAdminNotification(record,file);
}

function test9() {
   var d = new  Date();
   var t = typeof d;
   Logger.log('d:'+typeof d +':'+d);
   var timeStamp = Date.now();    
   var myDate= d.toLocaleDateString();
   Logger.log('myDate:'+typeof myDate+':'+myDate);
}

//todo:remove
function o(){
    var template =
        HtmlService.createTemplateFromFile('index');

   template.response_html = "https://script.google.com/macros/s/AKfycbxvXVMjFyUxL4mJCeFmt6a9ukt4VIjhqwbr5UIg1T0/dev?form=thankyou";
   var app = template.evaluate();
   var str = app.getContent();

    return app;
}

function test_gettimestamp() {

 var ts=1498292554880;
 var record = new MemberRecord_();
 Logger.log('get ts:'+ts);
//  record.Name = getData("member_name",theForm);

  var ss = getDriveSpreadsheet(REGISTRATION_SHEET);
  var st = ss.getSheetByName(SHEET_NAME);
  record.dbInit(st);

  record.getRowOnTimestamp(st,ts);
  record.email_confirm = true;
  record.logRecord();
  record.updateRow(st);
  
}

function test_triggers() {
  var ss = getDriveSpreadsheet(REGISTRATION_SHEET);
  var st = ss.getSheetByName(SHEET_NAME);

  Logger.log('Current project has ' + ScriptApp.getProjectTriggers().length + ' triggers.');
  
  var triggers = ScriptApp.getUserTriggers(ss);
 // Log the event type for the first trigger in the array.
  Logger.log(triggers[0].getEventType());
  
  triggers.forEach(function(trigger) {
      Logger.log('trigger:'+trigger.getUniqueId()+' ;source:'+ trigger.getTriggerSource() + '; handler:'+trigger.getHandlerFunction());
      var f = trigger.getHandlerFunction();
      if(trigger.getHandlerFunction()== 'TimeTriggered' ) {
          id = trigger.getUniqueId();
          ScriptApp.deleteTrigger(trigger);
      }
  });
}


function testgds() {

var FOLDER ="/Projects/online-registration";
var SHEETFILE = 'on-line-member-request';
var folder = getBasefolder(FOLDER,false);
var name = folder.getName();

var ss = getDriveSpreadsheet(SHEETFILE,FOLDER);

Logger.log("ss name:"+ss.getName());
}

/**
 * Retrieve Threads in the user's mailbox matching query.
 *
 * @param  {String} userId User's email address. The special value 'me'
 * can be used to indicate the authenticated user.
 * @param  {String} query String used to filter the Threads listed.
 * @param  {Function} callback Function to call when the request is complete.
 */
function listThreads(userId, query, callback) {
  var getPageOfThreads = function(request, result) {
    request.execute(function (resp) {
      result = result.concat(resp.threads);
      var nextPageToken = resp.nextPageToken;
      if (nextPageToken) {
        request = gapi.client.gmail.users.threads.list({
          'userId': userId,
          'q': query,
          'pageToken': nextPageToken
        });
        getPageOfThreads(request, result);
      } else {
        callback(result);
      }
    });
  };
  var request = gapi.client.gmail.users.threads.list({
    'userId': userId,
    'q': query
  });
  getPageOfThreads(request, []);
}

function test_listThreads() {
  var userId='scbw.webmaster@gmail.com';
  var query = 'Re:*';
  listThreads(userId,query,function(result) {
   Logger.log(result);
   });
}