//main.js
// Secure Sharing of Financial Status Blockchain

const { Blockchain, Transaction } = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('be0f40eeb22d4117274825172c2fa6ed5c1bf02daa02ea069ff0ff833708065d');
const myTargetInstitution = myKey.getPublic('hex');

let financialStatus = new Blockchain();

const tx1 = new Transaction(myTargetInstitution, 'public key goes here', 10);
tx1.signTransaction(myKey);
financialStatus.addTransaction(tx1);

console.log('\n Starting the miner...');
financialStatus.minePendingTransactions(myTargetInstitution);

console.log('\nBalance of institution 1 is', financialStatus.getBalanceOfInstitution(myTargetInstitution));

//uncomment to tamper the block 
//financialStatus.chain[1].transactions[0].amount = 1;

console.log('Is chain valid?', financialStatus.isChainValid());

//==================================================================================================================================

//blockchain.js
// Secure Sharing of Financial Status Blockchain

const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
    constructor(fromInstitution, toInstitution, amount) {
        this.fromInstitution = fromInstitution;
        this.toInstitution = toInstitution;
        this.amount = amount;
    }

    calculateHash() {
        return SHA256(this.fromInstitution + this.toInstitution + this.amount).toString();
    }

    signTransaction(signingKey) {
        if (signingKey.getPublic('hex') !== this.fromInstitution) {
            throw new Error('You cannot sign transactions for other institutions!');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');

        this.signature = sig.toDER('hex');
    }

    isValid() {
        if (this.fromInstitution === null) return true;

        if (!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromInstitution, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("BLOCK MINED: " + this.hash);
    }

    hasValidTransactions() {
        for (const tx of this.transactions) {
            if (!tx.isValid()) {
                return false;
            }
        }

        return true;
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock() {
        return new Block(Date.parse('2021-01-01'), [], '0');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress) {
        const rewardTX = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTX);

        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block);

        this.pendingTransactions = [];
    }

    addTransaction(transaction) {

        if (!transaction.fromInstitution || !transaction.toInstitution) {
            throw new Error('Transaction must include from and to institution');
        }

        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to chain');
        }

        this.pendingTransactions.push(transaction);
        console.log('Transaction added: ', transaction);
    }

    getBalanceOfInstitution(institution) {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromInstitution === institution) {
                    balance -= trans.amount;
                }

                if (trans.toInstitution === institution) {
                    balance += trans.amount;
                }
            }
        }

        console.log('Get balance of ' + institution + ': ', balance);
        return balance;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (!currentBlock.hasValidTransactions()) {
                return false;
            }

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

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;

//==================================================================================================================================

//keygenerator.js
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

console.log();
console.log('Private key:', privateKey);

console.log();
console.log('Public key:', publicKey);

//==================================================================================================================================

//keys
//Private key: be0f40eeb22d4117274825172c2fa6ed5c1bf02daa02ea069ff0ff833708065d

//Public key: 04 c2202ea2f1f196f51d704df9d72efb4bf366a0893662c1990be79c4bb706eebe2a4269208ea750e166beb31d40cda669c6a41844146e0036d589f6a466f5a173