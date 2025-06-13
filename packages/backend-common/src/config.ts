// (async function() {
//     await import("dotenv/config")
  
//     console.log(process.env.USER_SECRET)
//   })()

import 'dotenv/config.js';
export const USER_SECRET = process.env.USER_SECRET || 'usersecretnotfetched23<';
export const JWT_SECRET = process.env.JWT_SECRET || 'secretKeyNotFetched%^78';
console.log("JWT_SECRET = ",JWT_SECRET);
console.log('USER_SECRET = ', USER_SECRET);