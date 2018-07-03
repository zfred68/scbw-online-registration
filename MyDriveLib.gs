//
// getBasefolder( "/Folder A/Folder B/ Folder C" , doCreate)
//
// returns the last folder in the path 
// if  doCreate == true, and folder does not exist, create it
//
// or throws exception
//      sheet.appendRow(["a man", "a plan", "panama"]);

function getBasefolder(path,doCreate) {
 // Remove extra slashes and trim the path
  var fullpath = path.replace(/^\/*|\/*$/g, '').replace(/^\s*|\s*$/g, '').split("/");
   // Always start with the main Drive folder
  var folder;
  var rootname ;
  var nfullpathFolders = fullpath.length-1;
  var n;
  var subfolder;
  try {
      folder = DriveApp.getRootFolder();
      var rootname = folder.getName();
  }catch(err) {
     Logger.log("failed getRootFolder");
     throw(err);
  }
  
  for (subfolder in fullpath) {
    var name = fullpath[subfolder];
    var folders = folder.getFoldersByName(name);
 
    // If folder does not exist, exit
    while(folders.hasNext()) {
      folder= folders.next();
      n = folder.getName();
      var i = Number(subfolder);
      if(n==name) {             
        if(Number(subfolder) == nfullpathFolders)
          return folder;
        break;
      }
    }
  }
  if(doCreate ==true) {
     // last folder
     var newfolder =folder.createFolder(fullpath[subfolder]);
     return newfolder;
  }
  throw "bad path";
}


//
//
//

function getDriveSpreadsheet(sheetname,foldername) {
 
  var folder;
  var files;
  var found=0;
  var file;
  if(foldername) {
  
     folder = getBasefolder(foldername,false);
     files = folder.getFilesByName(sheetname);
     
     while (files.hasNext()) {
       file = files.next();
       Logger.log('name:'+file.getName()+' id:'+file.getId()+' type:'+file.getMimeType()+' url:'+file.getUrl());
       if(file.getName() == sheetname) {
          found=1;
          break;
       }
     }

  }  else {
  
     files = DriveApp.getFilesByName(sheetname);
     
  
     while (files.hasNext()) {
       file = files.next();
       Logger.log('name:'+file.getName()+' id:'+file.getId()+' type:'+file.getMimeType()+' url:'+file.getUrl());
       var folders = file.getParents();
       var folder;
       do {
       while (folders.hasNext()) {
         folder = folders.next();
         Logger.log('folder:'+folder.getName()+' url:'+folder.getUrl());  
         if(folder.getName()=="My Drive") {
            Logger.log('name matched "My Drive"');
            found=1;
            break;
         }
       }   
       }while (found==0 &&(folders=folder.getParents())!=null);
    }
  }
  if(found==1) {
    var ss = SpreadsheetApp.open(file);
    return ss;
  }
  
  throw "no Spreadsheet";
}



