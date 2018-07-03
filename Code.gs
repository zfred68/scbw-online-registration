/* this is a google app script
 * execute it on a google site as a Google Apps Script web app
 * function doGet(e) is executed as the url parameter
 * the associated html index.html is opened in the browser
 * results are entered to spreadsheet on-line-member-request
 * response emails are sent to the admin
 */
/**
 * A global constant 'notice' text to include with each email
 * notification.
 */
var adminNOTICE = "SCBW on-line registration Form Notifications  \
The number of notifications this add-on produces are limited by the \
owner's available email quota; it will not send email notifications if the \
owner's daily email quota has been exceeded. Collaborators using this add-on on \
the same form will be able to adjust the notification settings, but will not be \
able to disable the notification triggers set by other collaborators.";

var NOTICE = "SCBW on-line registration Form Notifications";

var VERSION = '0.1';
var NAME = 'MembershipForm'; //used as menu and settings sheet name

var DEFAULT_MEMBERSHIPFOLDER ="/Projects/online-registration/Membership";
var DEFAULT_REGISTRATIONFOLDER = "/Projects/online-registration";
var current_year ="2017";
var REGISTRATION_SHEET = 'on-line-member-request';
var SHEET_NAME = 'member-requests';
var DOCUMENT_TEMPLATE_ID = 'DOCUMENT_TEMPLATE_ID';
var DEFAULT_DOCUMENT_TEMPLATE_ID = "1ojJ-CithnEhDFHaKZkS_rJ87edLbr1Fc5LnXKO0Tl6M";
var DEFAULT_CONFIRM_REPLY_EMAIL = "scbw.webmaster@gmail.com";
var DEFAULT_ADMIN_EMAIL         = "scbw.webmaster@gmail.com";
var DEFAULT_COPY_EMAIL          = "zfred681@gmail.com";

var p = {app:{w:760, h:960},  //app: width, height
         tb :{w:440, fs:12}}; //textBox: width, font size

    p.ta ={w:p.app.w-110, h:p.app.h-246}; //textArea: width, height ("dynamic" i.e. depending on the app size)

var ddf = 'd/M/yyyy H:mm:ss'; //default date format

var tz;
var idreference;
var Logger;
var record;
var registration_currentyear_folder;
var membership_folder;

function initial() {
  var d = new Date();
  var default_current_year = d.getFullYear().toString();

  current_year = sget_('current_year',default_current_year);

  tz = "au";
}

/**
 * A special function that inserts a custom menu when the spreadsheet opens.
 *
 * actually this code is not bound to a spreadsheet, so should never occur......
 */
function onOpen() {
  var menu = [{name: 'Update member payments', functionName: 'findMembersUnconfirmedPayed_'}
  ,{name: 'about', functionName: 'showAbout'}];
  SpreadsheetApp.getActive().addMenu('Unconfirmed Payed', menu);

}
/**
 * Opens a purely-informational dialog in the form explaining details about
 * this add-on.
 */
function showAbout() {
  var ui = HtmlService.createHtmlOutputFromFile('about')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setWidth(420)
      .setHeight(270);
  FormApp.getUi().showModalDialog(ui, 'About Form Notifications');
}


function findMembersUnconfirmedPayed_() {
}
/**
 * as a web function doGet(e) app returns the custom HTML form
 *
 * @param {object} e is the url arguments default none
 *
 *
 */

function doGet(e) {
  initial();
  // Logger = BetterLog.setLevel(ScriptProperties.getProperty('BetterLogLevel')) //defaults to 'INFO' level
  //.useSpreadsheet(); // Defaults to the active spreadsheet if available.
                     //automatically rolls over at 50,000 rows
  setLogger();

  var param="AAA";


  if(e!=undefined) {
     param = e.parameters["form"];

     if(param && param=="thankyou") {
     var app = HtmlService.createHtmlOutputFromFile('thankyou.html')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
     return app.getContent();
     }
  }


  var template =
        HtmlService.createTemplateFromFile('index');

  template.response_html = "https://script.google.com/macros/s/AKfycbxvXVMjFyUxL4mJCeFmt6a9ukt4VIjhqwbr5UIg1T0/dev" + "?form=thankyou";

  var app = template.evaluate();
  app.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

  return app;
}

function registration_response() {

     var app = HtmlService.createHtmlOutputFromFile('thankyou.html')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
     return app.getContent();

}


function setLogger() {
  var ss = getDriveSpreadsheet(REGISTRATION_SHEET,DEFAULT_REGISTRATIONFOLDER);
  var id = ss.getId();
  tz = ss.getSpreadsheetTimeZone();
  Logger = MyLogger.useSpreadsheet(id,'Log');
}

function testCaptcha(response){
  var url  = 'https://www.google.com/recaptcha/api/siteverify';

  var captcha_payload = {
    'secret': '6LcrfRUUAAAAAOVmDDMZggWyqjVD8H48SEbGXyIF',
    'response': response
  };
  var params = {
    'method' : 'POST',
    'payload' : captcha_payload
  }
  var results = UrlFetchApp.fetch(url, params);

  //isSuccess = JSON.parse(results.getContentText()).success
  //isSuccess = true if user check passed
  //            false is user check failed
  var r = results.getContentText();
  Logger.log(r);
  return r;
}

function processreCaptcha(response) {
  var r = testCaptcha(response);
  isSuccess = JSON.parse(r).success;
  return isSuccess;
}

/**=================================================
 * processForm
 * this function is called from the client html
 *
 *
 * @param {Object} theForm  form member data 'input' fields array as JSON
 *      submission;
 *
 *  @param {Object}  attachedfile
 */

function processForm(theForm,attachedfile) {

  var memberFile;
  var name;
  var formdata;

  initial();
  setLogger();

  try {

  Logger.log('processForm:'+theForm);
  Logger.log('current_year:'+current_year);



  formdata = JSON.parse(theForm);
  name = getData("member_name",formdata);
  Logger.log("member_name:"+name);

  var d = new Date();
  var r = Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate());

  var inpj = {"name":"submit_date","type":"date","value":r.toString()};
  formdata.inputs.push(inpj);


    membership_folder = sget_("MEMBERSHIPFOLDER",DEFAULT_MEMBERSHIPFOLDER);
    registration_currentyear_folder = getBasefolder(membership_folder+'/'+current_year,true);

    writeDatabase(formdata);

    memberFile = writeMemberFile(formdata);


    if(attachedfile!=undefined) {
        var filename = getData("attachedfile_name",formdata);
        var contentType = attachedfile.substring(5,attachedfile.indexOf(';')),
        bytes = Utilities.base64Decode(attachedfile.substr(attachedfile.indexOf('base64,')+7)),
        blob = Utilities.newBlob(bytes, contentType, filename);


        var FolderID = registration_currentyear_folder.getId();
        var fldrSssn = DriveApp.getFolderById(FolderID);
        var file2 =  fldrSssn.createFile(blob);

        file2.setName(name + ' ' +filename);

    }


    // Check if the form respohandleAttachments(formdata);ndent needs to be notified; if so, construct and
    // send the notification. Be sure to respect the remaining email quota.
    if (sget_('respondentNotify') == 'true' &&
        MailApp.getRemainingDailyQuota() > 0) {
      sendRespondentNotification(record);
    }

    sendAdminNotification(record,memberFile);

  }catch(err) {


    if(err=='duplicate record') {

        var msg = err + ' name: '+ name + ' has already submitted a membership request';
        SendStatusMsg(msg);
        throw(msg);
    }

    SendStatusMsg("append error " + err);

  }

//  var app = HtmlService.createHtmlOutputFromFile('thankyou.html')
//      .setSandboxMode(HtmlService.SandboxMode.IFRAME);

  return "Ok";
}

function processFail(theForm) {

  initial();
  setLogger();

  Logger.log('processFail ' );
}


function submitLog(message) {
  initial();
  setLogger();

  Logger.log(message);
}



function SendStatusMsg(sd) {
 var emaildest = sget_("status_email_to");
 Logger.log(NAME +" app script status: "+sd);
 MailApp.sendEmail(emaildest,NAME +" app script status", sd);
}

function showMsg_(msg,buttons) {
  return Browser.msgBox(NAME, msg_(msg), Browser.Buttons[buttons || 'OK']);
}
function showInput_(msg,buttons) {
  return Browser.inputBox(NAME, msg_(msg), Browser.Buttons[buttons || 'OK_CANCEL']);
}
function msg_(msg) {
  return msg.toString ? msg.toString().replace(/ /g,' ').replace(/\n/g,'\\n') : msg;
}

function sget_(prop,def)   { return get_(ScriptProperties, prop ) || def; }
function sset_(prop,value) { set_(ScriptProperties, prop, value); }
function set_(o,p,v) { try { o.setProperty(p,v); } catch(e) {} }
function get_(o,p) { try { return o.getProperty(p); } catch(e) { return ''; } }


/**=================================================
 * writeDatabase
 * writes member data to a spreadsheet as a database
 *
 *
 * @param {Object} theForm  form member data 'input' fields
 *      submission;
 *
 */

var index_fields = ["Year(Date)","Name"];

var e_memberAction = {
  "MemberRenewal":"Renewing member",
  "MemberNew":"new Member"
};
var e_memberCategory = {
  "Paym-full":"Full paying member",
  "Paym-assoc":" redgAssociated club member",
  "Paym-student":"student member"
};
var e_firstaids = {
"FAid-none": "none",
"FAid-cpr":"CPR",
"FAid-SFA":"Senior First Aid",
"FAid-RAFA":"Remote Area First Aid",
"FAid-xpire":"Expired Certificate"
};
var e_paymethods = {
"PAY_dd":"Direct Bank Deposit",
"PAY_cheque":"Cheque",
"PAY_cash":"Cash"
};

// fields
// 0           1                                   2                      3              4                5                       6
// field-name, type [string,enum,bool,date,check], field long name/desc,  field doc tag, form data name,  replacement expression, enum list
//
var fields = [
  ["MemberAction","enum","New or Renewing Member","^Membership:","Radio_MemberAction","X*X",e_memberAction],
  ["Date",     "date","Registration applied date","^Registration Applied Date:","","X*X"],
  ["Name",     "string","Name","^Name:","member_name","X*X"],
  ["Address",  "string","Street Address","^Address:","member_address","X*X"],
  ["Suburb",   "string","Suburb","^Suburb:","member_suburb","X*X"],
  ["PostCode", "string","Post Code","^Post Code:","member_postcode","X*X"],
  ["Phone",    "string","Home Ph","^Telephone:","member_phone","X*X"],
  ["Mobile",   "string","Mob.Ph","^Mobile:","member_mobile","X*X"],
  ["Email",    "string","Email","^Email:","member_email","X*X"],
  ["Email2",   "string","Alt.Email","^Alt Email:","member_alt_email","X*X"],
  ["EmergencyContact",     "string","Emergency Contact Name","^Emergency Contact Name:","member_emergency_contact","X*X"],
  ["EmergencyContactPhone","string","Emergency Contact Ph","^Emergency Contact Phone:","member_emergency_contact_phone","X*X"],
  ["EmergencyContactRelationship","string","^Emergency Contact Rel.:","member_emergency_contact_rel","X*X"],
  ["FirstAid", "enum","First Aid Qualifications","^First Aid Qualifications:","Radio_FAid","X*X",e_firstaids],
  ["MemberCategory","enum","Member Category","Radio_member_category","Radio_member_category","X*X",e_memberCategory],
  ["ClubBadge","check","Purchase Club Badge","Chk_clubBadge","Club Badge",""],
  ["BankTransReference","string","Bank Transfer Reference","NONE","member_bankref","X*X"],
  ["PayMethod","enum","Payment Method","Payment Method:","Radio_PayMethod","X*X",e_paymethods],
  ["Agree_1","check","1st Agreement","1CHK","Chk_agree_1","1CHK"],
  ["Agree_2","check","2nd Agreement","2CHK","Chk_agree_2","2CHK"],
  ["Agree_3","check","3rd Agreement","3CHK","Chk_agree_3","3CHK"],
  ["assoc_clubname","string","Associate club name","Affiliated Club where you have full membership:","member_assoc_club_name","X*X"],
  ["payd_amount","number","Total Payed","Total","member_total","NNN"],
  ["date_submittal","date","submit date","XSUBMITDATEX",undefined,"XSUBMITDATEX"  ],
  ["confirm_payed","bool","Payed"],
  ["confirm_payed_date","date","Payed"],
  ["run_status","bool","runstat"]
];

// key is the field-name
function getfieldData(key, formData) {
  var i=0;
  var l=fields.length;
  for(i=0;i<l;i++) {
    if( fields[i][0] == key ) {
       var value;
       var fieldName=fields[i][0];
       var fieldTag =fields[i][3];
       var resultName=fields[i][4];
       var membername=fields[i][4]; // form's member name
       if(membername==""||membername==undefined) {
          value = record[fieldName];
       }else {
          value = getData(membername,formData);
       }
       return value;

    }
  }
  Logger.log('field[0] undefined '+key )
  throw "undefined";
}

 /**=======================e==========================
 * getData( tag key,  formData
 *
 *
 *
 *
 * @param {Object} tag   tag name of the form's field
 * @param {Object} formData - array of 'input' objects
 *      submission;
 *
 */

function getData(tag,formData) {

  var aa = formData.inputs;
  try {

  var l = aa.length;
  var i=0;
  for(;i<l;i++) {
    if(aa[i].name === tag) {
      if(aa[i].type == "checkbox") {
        if(aa[i].checked == true )
          return "Yes";
        else
          return "No"
      }
      return aa[i].value;
    }
  }
  }catch(err) {
  Logger.log('no form input for: '+tag);
  }
  return undefined;
}

function getFieldType(key) {
  var i=0;
  var l=fields.length;
  for(i=0;i<l;i++) {
    if( fields[i][0] == key ) {
       var value;
       var fieldName=fields[i][0];
       var fieldType =fields[i][1];
       return fieldTypee;

    }
  }
  Logger.log('field[0] undefined '+key )
  throw "undefined";

}


/**=================================================
 * writeDatabase  return record;
 * writes member data to a spreadsheet as a database
 *
 *
 * @param {Object} theForm  form member data 'input' fields
 *      submission/**=================================================
 * writeDatabase redg
 * writes member data to a spreadsheet as a database
 *
 *
 * @param {Object} theForm  form member data 'input' fields
 *      submission;
 *
 */

function writeDatabase(theForm) {
  record = new MemberRecord_();

//  record.Name = getData("member_name",theForm);

  var ss = getDriveSpreadsheet(REGISTRATION_SHEET);
  var st = ss.getSheetByName(SHEET_NAME);
  record.dbInit(st);

  record.setRow(theForm);
  record.appendRow(st);
  Logger.log(  record.existsRow(st) );
  //Logger.log(record.toString());
  //return record;
}

/**=================================================
 * writememberFile( form object data )
 * using a template Google Doc, copy it and write member
 * data
 *
 *
 * @param {Object} theForm  form member data 'input' fields
 *      submission;
 *
 */

function writeMemberFile(theForm) {
  var name = getData("member_name",theForm);
  Logger.log("member_name:"+name);
  var memberFile = getMemberFile(name);
  var doc = DocumentApp.openById(memberFile.getId());
  // Get the body section of the active document.
  var body = doc.getBody();

  var Paragraphs = body.getParagraphs();
  var Paragraph;
  var t;
  var l =Paragraphs.length;
  var i;
  var k;
  var foundTag;
  for(i=0;i<l;i++) {
    Paragraph = Paragraphs[i];
    var t = Paragraph.getText();
    Logger.log('Paragraph:'+t);

    for(k=0;k<fields.length;k++) {
       var fieldName=fields[k][0];
       var fieldTag =fields[k][3];
       var resultName=fields[k][4];
       foundTag=0;

       if(fieldTag==undefined)
          continue;

       if(Paragraph.findText(fieldTag) != null) {
          var replaceExpr=fields[k][5];
         if(replaceExpr==="") {
            replaceExpr = "X*X";
         }
         if(fields[k][1] == "enum" ) {
           var en = getfieldData(fieldName,theForm);
           if( en == undefined)
              break;

           var enumList = fields[k][6];
           var replacementText = enumList[en];
           if(replacementText != undefined) {

             Paragraph.replaceText(replaceExpr,replacementText);
             foundTag=1;
             break;
           }
         }
         else {
            var replacementText =  getfieldData(fieldName,theForm);
            if(replacementText != "") {
              Paragraph.replaceText( replaceExpr,replacementText);
              foundTag=1;
            }
            break;
         }
       }
    }
    if(foundTag==1) {
    var t=Paragraph.getText();
    Logger.log(i+','+t);
    }

  }

  var tables = body.getTables();
  var table;
  var memberCategory = getData( "Radio_member_category", theForm);

  var clubBadge = getData("Chk_clubBadge", theForm);
  var total     = getData("member_total", theForm);
  l=tables.length;

  table = tables[0];
  for(k=0;k<table.getNumRows();k++) {

    var row = table.getRow(k);
    var t = row.getText();

    if("Paym-full" == memberCategory) {

      if(row.findText("Associated Member")){
        row.clear();
      }
      if(row.findText("Student Member" )){
        row.clear();
      }
    }

    if("Paym-assoc" == memberCategory){
      if(row.findText("Student Member" )){
        row.clear();
      }
      if(row.findText("SFull and Prospective" )){
        row.clear();
      }

    }

    if("Paym-student" == memberCategory){
      if(row.findText("SFull and Prospective" )){
        row.clear();
      }
      if(row.findText("Associated Member")){
        row.clear();
      }

    }

    if(clubBadge=="No")  {
      if(row.findText("Club Badge")) {
        row.clear();
      }
    }

    if(row.findText("Total:")) {
      row.replaceText("NNN",total);
    }
  }

  return memberFile;
}



function fieldReplace(fieldinfo,obj) {
  var v;
  v = getfieldData(fieldinfo[4],obj);
  if(fieldinfo[1]=="check") {

  }
  return v;
}

/**=================================================
 * getMemberFile( form object data )
 * using a template Google Doc, copy it and write member
 * data
 *
 *
 * @param {Object} membername  member name forms part of file name
 *      submission;
 *
 */

function getMemberFile(membername) {
  // document template to copy

  var template_id = sget_( DOCUMENT_TEMPLATE_ID,DEFAULT_DOCUMENT_TEMPLATE_ID);


  var folder = getBasefolder(membership_folder,true);
  var yrfolders = folder.getFoldersByName(current_year);
  var yrfolder;
  if(yrfolders.hasNext()) {
    yrfolder=yrfolders.next();
  } else {
    yrfoldr=folder.createFolder(current_year);
  }
  //var folder = DriveApp.getFolderById(id)
  var file = DriveApp.getFileById( template_id );
  Logger.log(file.getName());

  var memberfile= file.makeCopy(membername,yrfolder);
  return memberfile;
}



/**=======================e==========================
 * handleAttachments( tag key,  formData
 *
 * https://script.google.com/macros/s/AKfycbyk1JmINpkRc5fuo5nZ6XFXwXCa1p5FPb7vu1u3aNFjTgRfxz9q/exec
 *
 *
 * @param {Object} theForm   array of form input objects
 *
 */

function handleAttachments(theForm) {
  var name = theForm["member_name"];
  Logger.log('handleAttachments:'+name);
  var fileinput = theForm["member_fileinput"];
  var value = fileinput.value;
  Logger.log('fileinput value:'+value);
  Logger.log('fileinput name:'+ fileinput.getName());

  if(fileinput != null) {
     var FolderID = registration_currentyear_folder.getId();
     var fldrSssn = DriveApp.getFolderById(FolderID);
     var file2 =  fldrSssn.createFile(fileinput);
     file2.setName(name + ' ' +fileinput.getName());

  }
}
/**
 * Sends out respondent notificiation emails.
 *
 * @param {FormResponse} response FormResponse object of the event
 *      that triggered this notification
 */
function sendRespondentNotification(record) {
  var reply_to = sget_('confirm_reply_email',DEFAULT_CONFIRM_REPLY_EMAIL);
  var respondentEmail = record.Email;
  var subject = "Email Confirmation";
  var emailto_url = reply_to+"?subject="+escape("Email Confirmation id:"+record.timeStamp+"&body=Confirmation Reply from member, Thankyou");

  if (respondentEmail) {
    var template =
        HtmlService.createTemplateFromFile('respondentNotification');

    template.paragraphs = [""];
    var ps = sget_('responseText',"");
    if(ps !=null) {
       //ps.split("\n");
       template.paragraphs = [ps];
    }

    template.notice =  sget_('NOTICE',NOTICE);
    template.random_number = record.timeStamp;
    template.reply_email = reply_to;
    template.reply_email_url = emailto_url;

    subject = subject + ' id:'+ record.timeStamp;

    var message = template.evaluate();

//    Logger.log('message:'+message.getContent());
    var msgtext = message.getContent();

    MailApp.sendEmail(respondentEmail,
                      subject,
                      msgtext,
                      {
                        replyTo: reply_to,
                        htmlBody: msgtext
                      });
  }

   // Creates a trigger that will run 10 minutes later
 ScriptApp.newTrigger("TimeTriggered")
   .timeBased()
   .after(1 * 60 * 1000)
   .create();

}
/*
 * Sends out notificiation to the administrator (secretary) emails.
 *
 * @param {FormResponse} response FormResponse object of the event
 *      that triggered this notification
 */

function sendAdminNotification(record,memberFile) {
  var admin = sget_("admin_email_to",DEFAULT_ADMIN_EMAIL);
  var subject = "on-line membership application";
  var reply_to = record.Email;
  var cc = sget_('copy_email_to',DEFAULT_COPY_EMAIL);

  var template = HtmlService.createTemplateFromFile('adminNotification');

  template.document_url = memberFile.getUrl();
  template.member_name = record.Name;
  template.payment_info = "$"+record.payd_amount + "  by " + record.PayMethod;
  if(record.PayMethod === "PAY_dd") {
   template.payment_info += "\nreference:" + record.BankTransReference;
  }
  template.paragraphs = ["------"];

  var message = template.evaluate();

  var s = message.getContent();

  Logger.log(s);

  MailApp.sendEmail(
                      {
                        to : admin,
                        replyTo : reply_to,
                        cc: cc,
                        subject : subject,
                        htmlBody: s
                      });
}


function sendEmailConfirmedNotification(record) {
  var admin = sget_("admin_email_to",DEFAULT_ADMIN_EMAIL);
  var subject = "on-line membership application from "+record.Name;
  var reply_to = '';
  var cc = sget_('copy_email_to',DEFAULT_COPY_EMAIL);

  var template = HtmlService.createTemplateFromFile('confirmEmailNotification');

  template.member_name = record.Name;
  template.email_address = record.Email;


  var message = template.evaluate();

  var s = message.getContent();

  MailApp.sendEmail(
                      {
                        to : record.Email,
                        replyTo : reply_to,
                        cc: admin,
                        bcc:cc,
                        subject : subject,
                        htmlBody: s
                      });

}