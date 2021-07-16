const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;
const EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

const ec = new EC('secp256k1');
const key1 = ec.genKeyPair();
const key2 = ec.genKeyPair();
const key3 = ec.genKeyPair();

const address1 = key1.getPublic().encode('hex');
const address2 = key2.getPublic().encode('hex');
const address3 = key3.getPublic().encode('hex');

const balances = {};
balances[address1] = 100;
balances[address2] = 75;
balances[address3] = 50;

const privateKeys = {};
privateKeys[address1] = key1.getPrivate();
privateKeys[address2] = key2.getPrivate();
privateKeys[address3] = key3.getPrivate();

console.log('Available accounts \n ========================');

for (const [key, value] of Object.entries(balances)) {
  console.log(`${key}:  ${value}`);
}

console.log('\nPrivate Keys \n ========================');

for (const [key, value] of Object.entries(privateKeys)) {
  console.log(`${value.toString(16)}`);
}

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/send', (req, res) => {
  const {sender, recipient, amount, message, signature_r, signature_s} = req.body;

  const signature = {
    r: signature_r,
    s: signature_s
  };


  //Verify that the message is signed correctly
  const key = ec.keyFromPublic(sender, 'hex');
  const msgHash = SHA256(message).toString();

  const verified = key.verify(msgHash, signature);
  console.log(verified);

  if(verified){
    balances[sender] -= amount;
    balances[recipient] = (balances[recipient] || 0) + +amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
