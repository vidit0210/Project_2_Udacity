//Level DB Data Base to Interact with the Block Chain to Store The Data.
//Author : Vidit Shah
const path_to_db ='./chaindata';

const level = require('level');

class DataBase {
  constructor(){
    //Create the Database when Initialized
    this.db=level(path_to_db);
  }
  //addLevelDBData :Adds Data to the Database -> error if not added in the DataBase
  addLevelDBData(key,value){
    let self = this;
    return new Promise((resolve,reject)=>{
      self.db.put(key,value,(err)=>{
        if(err) reject("Error inserting into Database");
        resolve(key);
      });
    });
  }
//getLevelDBData -> Get Height of the Block from the Database
getLevelDBData(key){
  let self = this;
  return new Promise((resolve,reject)=>{
    self.db.get(key,(err,value)=>{
      
      if(err) {
        reject("Error getting ",key);
      }
      else{
      resolve(value);
      }
    })
  });
}
//addDataToLevelDB - Adds a block by specific Value
addDataToLevelDB(value){
  let i=0;
  let self = this;
  return new Promise((resolve,reject)=>{
    self.db.createReadStream()
      .on('data',(data)=>{i++})
      .on('error',(error)=>{reject(error)})
      .on('close', function () {
        console.log('Block #' + i);
        self.addLevelDBData(i, value).then((key) => {
          console.log('Block #' + key);
        }).catch((err) => {
          console.log(err);
        });
        resolve(value);
      });
  });
}

//getLEvel DB COunt gets The Number of Entries in The DataBase Which is available
getLevelDBCount()
{
  let self = this;
  return new Promise((resolve,reject)=>{
    let count  =0;
    self.db.createReadStream()
        .on('data',data=>count++)
        .on('error',error=>reject(error))
        .on('close',()=>resolve(count));
  });
}

  
}

module.exports.Model=DataBase;