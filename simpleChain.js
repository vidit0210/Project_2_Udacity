/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const Model = require('./levelSandbox');


/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
	constructor(data) {
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

class Blockchain {
	constructor() {
		this.chain = new Model.Model();
		this.addGenesisBlock(new Block("First block in the chain - Genesis block"));
	}

	// AddsGenesisBlock() is used for initializing the Genesis Block
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

	// addBlock(newBlock) is used for adding a new block to the blockchain.
	async addBlock(newBlock) {
		newBlock.time = await new Date().getTime().toString().slice(0, -3); // Give the block a timestamp
		let height = await this.getBlockHeight();
		newBlock.height = height;
		let previousHeight = height - 1;
		try {
			if(height>=1)
			{
			let previousBlock = await this.getBlock(previousHeight);
			newBlock.previousBlockHash = previousBlock.hash;
			newBlock.hash = await SHA256(JSON.stringify(newBlock)).toString();
			let key = await this.chain.addLevelDBData(height, JSON.stringify(newBlock).toString());
            console.log("New block created at height: #" + key);
			}
		} catch (err) {
			console.log("Unable to add block to blockchain " + err);
		}
	}

	// getBlockHeight() is used to get the actual height of the blockchain aka index
	async getBlockHeight() {
		let numberOfBlocks = await this.chain.getLevelDBCount();
		return numberOfBlocks
	}

	// getBlock() is used for getting the actual the block at a particular height
	async getBlock(blockHeight) {
		let block = await this.chain.getLevelDBData(blockHeight);
		return block;
	}

	// validateBlock() is used to validate the hash of a specific block.
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

	// validateChain() is used for validating the entire chain
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


// Test data
const bc = new Blockchain();
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