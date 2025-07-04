const admin = require('firebase-admin');
const serviceAccount = require('../../firebaseServiceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://<proje-id>.firebaseio.com",
  storageBucket: "ayakkabi-satis-07.firebasestorage.app"
});

const db = admin.firestore();
const storage = admin.storage();

module.exports = { admin, db, storage };