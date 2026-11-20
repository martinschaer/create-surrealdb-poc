import { Surreal } from "surrealdb";

const env = process.env;
const db = new Surreal();
await db.connect(env.SURREAL_ENDPOINT!);
await db.use({ namespace: env.SURREAL_NAMESPACE!, database: env.SURREAL_DATABASE! });
await db.signin({ username: env.SURREAL_USER!, password: env.SURREAL_PASS! });

console.log(await db.query("RETURN 'hello from SurrealDB'"));
await db.close();
