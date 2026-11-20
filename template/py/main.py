import os

from surrealdb import Surreal

env = os.environ
with Surreal(env["SURREAL_ENDPOINT"]) as db:
    db.signin({"username": env["SURREAL_USER"], "password": env["SURREAL_PASS"]})
    db.use(env["SURREAL_NAMESPACE"], env["SURREAL_DATABASE"])
    print(db.query("RETURN 'hello from SurrealDB'").execute())
