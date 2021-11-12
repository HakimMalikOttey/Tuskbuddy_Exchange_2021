const fs = require('fs').promises;
module.exports = {
  introScan: async function introScan(){
    try{
      var intro = await fs.readFile(__basedir+  '/public/assets/intro.txt', "utf8");
      return intro;
    }
    catch(e){
      throw new Error(e);
    }
}
}
