/**
* Using a google spreadsheet as a database
*
* Class that represents an individual membership record
* Each TimeSheet_ is made up of one or more TimeRecord_
* Each MemberRecord_ is a row in spreadsheet
*
* A TimeRecord_ is data represented by a Time Entered
* by a user for a pariticular category (Billing Hours)
* for a particular month
*
* The first row is a header row - so no values
*
*/
function MemberRecord_() {
  this.timeStamp = undefined;    
  this.Date= undefined;
  this.Name= undefined;    
  this.MemberAction = undefined;
  this.Address = undefined;
  this.Suburb=undefined;
  this.PostCode=undefined;
  this.Phone=undefined;
  this.Mobile=undefined;
  this.Email=undefined;
  this.EmergencyContact=undefined;
  this.EmergencyContactPhone=undefined;
  this.FirstAid=undefined;
  this.MemberCategory=undefined;
  this.ClubBadge=undefined;
  this.Agree_1=undefined;
  this.Agree_2=undefined;
  this.Agree_3=undefined;
  this.assoc_clubname=undefined;
  this.date_submittal=undefined;
  this.payd_amount=undefined;
  this.confirm_payed=false;
  this.confirm_payed_date="";
  this.BankTransReference=undefined;
  this.run_status=false;
  this.email_confirm=false;
  this.PayMethod=undefined;

  this.dbInit = function (sheet) {
    var rowdata = [];
    if(sheet.getLastRow()==0) { // create the header row
      for(var key in this) {
        if(typeof this[key] == 'function')
           break;
        if(key=='rowindex')
           break;
        if(this.hasOwnProperty(key) && typeof this[key] !== 'function') {
            rowdata.push(key);
        }
      }

      Logger.log('header rowdata:'+rowdata);
      sheet.appendRow(rowdata);
      // Freezes the firsgetfieldData(fieldName,theForm)t row
      sheet.setFrozenRows(1);
      var cols = sheet.getMaxColumns();
      var range = sheet.getRange(1,1,1,cols);
      range.setFontWeight("bold");

      Logger.log(sheet.getLastRow());
    }
  };

  this.setRow = function(formData) { 
     var d = new  Date();
     this.timeStamp = Date.now();    
     this.Date= d.toLocaleDateString();
     this.date_submittal = d.toLocaleDateString();

     for(var key in this) {
        if(typeof this[key] == 'function')
           break;
        if(key=='rowindex')
           break;
           
        if(this.hasOwnProperty(key) && typeof this[key] !== 'function' ) {
          try {
            var value = getfieldData(key,formData);
            this[key] = value;
          }catch(err) {
           Logger.log('no field key '+key);
          }
        }
      }
   this.rowindex=-1;
  };

  this.appendRow = function(sheet) {
      var rowdata = [];
      for(var key in this) {
        if(typeof this[key] == 'function')
           break;
        if(key=='rowindex')
           break;
        if(this.hasOwnProperty(key) && typeof this[key] !== 'function') {
            rowdata.push(this[key]);
        }
      }    
      Logger.log('rowdata:'+rowdata);
      sheet.appendRow(rowdata);
      var range = sheet.getRange("A2:Z2");
      var nrows = sheet.getLastRow();
      var ncols = sheet.getMaxColumns();
      var cell = sheet.getRange("A"+nrows);
      cell.setNumberFormat("0");
      range.copyFormatToRange(sheet,1,ncols,nrows,nrows);
      this.rowindex=nrows;
      Logger.log( sheet.getLastRow());

  };

  this.existsRow = function(sheet) {
     var nrows = sheet.getLastRow();
     var range = sheet.getRange(1, 3, nrows, 1);
     var values = range.getValues();
     var name = this.Name.toLowerCase();
     for (var row in values) {
        if(values[row][0].toLowerCase() === name);
           return true;
     }
    return false;
  };
  
  this.getRowOnTimestamp = function(sheet,timestamp) {
      var nrows = sheet.getLastRow();
      var cols = sheet.getMaxColumns();
      var n=1;
      for(n=2;n<=nrows;n++) {
        var col="A"+n;
        var range = sheet.getRange(col);
        var row = range.getRow();
        var tsCol=range.getValue();
        Logger.log(col+' row#:'+row+' '+tsCol);
        if(tsCol==timestamp) {
           //Logger.log('got it');
           range=sheet.getRange(row,1,1,cols);
           var formats = range.getNumberFormats();
           var values = range.getValues();
           var j=0;
           //this.Address = 'A';
           //this['Address'] = 'AAA';
           for(var key in this) {
              if(typeof this[key] == 'function')
                break;
              if(key=='rowindex')
                break;
                
              if(this.hasOwnProperty(key) && typeof this[key] !== 'function') {
                 var v=values[0][j];
                 var f=formats[0][j];
                 this[key] = values[0][j];  
              }
              j++;
           }
           this.rowindex=row;
           return;
        }
     }
     throw('no ts record');
  }
  
  this.updateRow = function(sheet) {
    var ncols = sheet.getMaxColumns();
    var range = sheet.getRange(this.rowindex,1,1,ncols);
    var rowdata = [];
    
    var vts = range.getCell(1, 1).getValue();
    //Logger.log('this.timestamp='+this.timeStamp);
    //Logger.log(Number(vts) + ' == ? ' + Number(t1497890525706his.timeStamp));
    if(Number(vts) != Number(this.timeStamp)) {
      throw('timestamp mismatch');
    }
      
    this.timeStamp = Date.now();
    for(var key in this) {
        if(typeof this[key] == 'function')
           break;
        if(key=='rowindex')
           break;
   
        if(this.hasOwnProperty(key) && typeof this[key] !== 'function') {
            rowdata.push(this[key]);
        }
    }        
    var nrowdata = [];
    nrowdata[0]=rowdata;
    //logrowdata(rowdata);
    var l = rowdata.length;
    for(var i=0;i<l;i++){
       Logger.log(i+' '+nrowdata[0][i]);
    }
    //Logger.log('width:'+range.getWidth()+' height:'+range.getHeight()+' lastrow:'+range.getLastRow()); 
    var r=range.getValues();
    range.setValues(nrowdata);
  }
  
  this.logRecord = function() {
     var s="";
     for(var key in this) {
        if(this.hasOwnProperty(key) && typeof this[key] !== 'function') {
           s=s+" "+key+":"+this[key]+",";  
        }
     }
     Logger.log('record:'+s);
  };
  this.rowindex=-1;
 };

 function logrowdata(arow) {
   var l = arow.length;
   for(var i=0;i<l;i++)   {
     Logger.log(i+' '+arow[i]);
   }
 }