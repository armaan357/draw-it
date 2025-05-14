// (async function() {
//     await import("dotenv/config")
  
//     console.log(process.env.USER_SECRET)
//   })()

import 'dotenv/config.js';
export const JWT_SECRET = process.env.USER_SECRET || 'secretKeyNotFetched';
console.log(JWT_SECRET);