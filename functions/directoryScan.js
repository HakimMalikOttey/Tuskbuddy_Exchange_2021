const fs = require('fs').promises;
module.exports = {
  directoryScan: async function directoryScan(){
    try{
      var files = await fs.readdir(__basedir+ '/public/submissions');
      return files;
    }
    catch(e){
      throw new Error(e);
    }
}
}
