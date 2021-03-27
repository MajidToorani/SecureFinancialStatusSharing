const SHA256 = require('crypto-js/sha256');

class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data)).toString();
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
    }

    createGenesisBlock() {
        return new Block(0, "01/01/2021", "Genesis block", "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }
}

let financialStatus = new Blockchain();

financialStatus.addBlock(new Block(1, "01/02/2021", { totalDebt: 10000 }));
financialStatus.addBlock(new Block(2, "01/03/2021", { totalDebt: 15000 }));
financialStatus.addBlock(new Block(3, "01/04/2021", { totalDebt: 20000 }));

console.log('Is blockchain valid? ' + financialStatus.isChainValid());

financialStatus.chain[1].data = { totalDebt: 100000 };
financialStatus.chain[1].hash = financialStatus.chain[1].calculateHash();

console.log('Is blockchain valid? ' + financialStatus.isChainValid());

console.log(JSON.stringify(financialStatus, null, 4));