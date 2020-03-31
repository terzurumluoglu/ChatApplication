import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();
// const _db = admin.firestore();
// const accountRef = _db.collection('accounts');
// const userRef = _db.collection('users');


// export const addAccount = functions.firestore.document('users/{userRefKey}').onCreate(async (snapshot,context) => {
//     console.log(snapshot);
//     console.log(context);
//     console.log(context.params);
// });