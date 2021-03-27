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