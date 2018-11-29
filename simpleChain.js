/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const Data = require('./levelSandbox');//Getting Data defined from the Sandbox Structure


/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
  constructor(){
    this.chain = new Data.Model();
    this.addBlock(new Block("First block in the chain - Genesis block"));
  }

  async addGenesisBlock(newBlock) {
    try {
        let genesisBlock = await this.getBlock(0); // Gets the block
        console.log("Genesis Block already exists");;
    } catch (err) {
        console.log("Genesis Block doesn't exists ");
        newBlock.time = await new Date().getTime().toString().slice(0, -3);
        newBlock.hash = await SHA256(JSON.stringify(newBlock)).toString();
        let genesisHeight = await this.chain.addLevelDBData(0, JSON.stringify(newBlock).toString());
        console.log("Genesis block is now created ");
    }
}
  // Add new block
async addBlock(newBlock){
    newBlock.time = new Date().getTime().toString().slice(0,-3);
    try{
        let height = await this.chain.getLevelDBCount();
        newBlock.height = height;
        let prevousHeight=height-1;
        let previousBlock = await this.getBlock(prevousHeight);
        newBlock.previousHash = previousBlock.hash;
        newBlock.hash = await SHA256(JSON.stringify(newBlock)).toString();
		let key = await this.chain.addLevelDBData(height, JSON.stringify(newBlock).toString());
		console.log("New block created at height: #" + key);

    }catch(err){
        console.log('Error adding the Block',err)
    }
}

  // Get block height
     async getBlockHeight(){
    try{
      let numberOfBlocks = await this.chain.getLevelDBCount();
      return numberOfBlocks;
    }catch(err){
        console.log("Error getting Block Height!".err);
    }
    }

    // get block
   async getBlock(blockHeight){
       try{
        let block = this.chain.getLevelDBData(blockHeight);
        return block;   
       }catch(err){
           console.log("Error Getting The Block Height"+err);

       }   
    }

    async validateBlock(blockHeight) {
		try {
			let block = await this.getBlock(blockHeight);
			let blockHash = block.hash;
			block.hash = '';
			let validBlockHash = SHA256(JSON.stringify(block)).toString();
			if (blockHash === validBlockHash) {
				console.log('Block #' + blockHeight + ' valid hash:\n' + blockHash + ' <> ' + validBlockHash);
				return true;
			} else {
				console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + ' <> ' + validBlockHash);
				return false;
			}
		} catch (err) {
			console.log("Block not found " + err);
		}
	}

   // Validate blockchain
   async validateChain() {
    let blocksOfPromises = [];
    let errorLog = [];
    let height = await this.getBlockHeight()
    for (let i = 0; i < height; i++) {
        try {
            let block = await this.getBlock(i);
            blocksOfPromises.push(block);
        } catch (err) {
            console.log(err);
        }
    }
    try {
        let chain = await Promise.all(blocksOfPromises);
        for (let i = 0; i < height; i++) {
            let validBlock = await this.validateBlock(chain[i].height);
            if (validBlock) {
                console.log("Block at height #" + i + " is valid");
                console.log(chain[i]);
                if (chain[i].height < chain.length - 1) {
                    if (chain[i].hash !== chain[i + 1].previousBlockHash) {
                        errorLog.push(block.height);
                    } else {
                        console.log("Block at height # " + i + " link is valid");
                        console.log('Block height #' + i + ' valid link hash:\n' + chain[i].hash + ' <> ' + chain[i + 1].previousBlockHash);
                        console.log(" ");
                        console.log(" ");
                        console.log(" ");
                    }
                }
            }
        }
        if (errorLog.length > 0) {
            console.log('Block errors = ' + errorLog.length);
            console.log('Blocks: # ' + errorLog);
        } else {
            console.log('No errors detected');
        }
    } catch (err) {
        console.log(err);
    }

}
    
}
const blockchain = new Blockchain();
(function theLoop(i) {
	setTimeout(function () {
		let blockTest = new Block("Test Block - " + (i + 1));
		bc.addBlock(blockTest)
		//.then((result) => {
		//	console.log(result);
		i++;
		//}).catch((err) => {console.log(err);});
		if (i < 10) theLoop(i);
	}, 100);
})(0);