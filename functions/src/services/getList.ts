import { User } from "../model/model";
import admin = require("firebase-admin");

export const userRef = admin.firestore().collection('users');

export const GetUserByUserId = function(userId : string) : Promise<User> {
    return new Promise((res,rej) => {
        userRef.doc(userId).get().then(p => {
            res(p.data() as User);
        }).catch(e => {
            rej(e);
        })
    })
}

export const getTime = function(): number{
    const time: Date = new Date();
    return time.getTime();
  }
