const jwt = require('jsonwebtoken');
const fs = require('fs');

const privateKey = fs.readFileSync('../../../../Documents/IMPORTANT/OneSecondInfo/MusicKitPrivateKey/AuthKey_7ZTFBZ4U45.p8').toString();
const teamId = '33V857N744';
const keyId = '7ZTFBZ4U45';
const now = Math.floor(Date.now() / 1000);

const jwtToken = jwt.sign({}, privateKey, {
    algorithm: "ES256",
    expiresIn: "180d",
    issuer: teamId,
    header: {
        alg: "ES256",
        kid: keyId
    }
});

// const jwtToken = jwt.sign({
//     iss: teamId,
//     exp: now + 15777000,
//     aud: 'music',
// }, privateKey, {
//     algorithm: 'ES256',
//     header: {
//         alg: 'ES256',
//         kid: keyId,
//     },
// });

console.log(jwtToken);
