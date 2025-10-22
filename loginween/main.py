from flask import Flask, render_template, redirect, url_for, g

from flask_login import LoginManager, login_required

import sqlite3, os, flask_login, dotenv, secrets

if os.path.exists(".env"):
    dotenv.load_dotenv(".env")
else:
    print(".env file not found. Continuing with default values.")

login_manager = LoginManager()
app = Flask(__name__)
app.secret_key = os.getenv("APP_KEY", secrets.token_urlsafe(64))

login_manager.init_app(app)

def get_db():
    db = getattr(g, '_database', None)

    if db is None:
        db = g._database = sqlite3.connect(os.environ.get("DB_FILE", "data.db"))
        db.execute("""
            CREATE TABLE IF NOT EXISTS Users (
                username TEXT PRIMARY KEY,
                pumpkin_carving TEXT PRIMARY KEY
            )
        """)

    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

class User(flask_login.UserMixin):
    pass

@login_manager.user_loader
def user_loader(user_id):
    user = User()
    user.id = user_id
    return user

@login_manager.unauthorized_handler
def unathorized_handler():
    return redirect(url_for("login"))

@app.route("/")
@login_required
def main():
    return render_template("index.jinja2")

@app.route("/login")
def login():
    return render_template("login.jinja2")

@app.route("/register")
def register():
    return render_template("register.jinja2")

app.run(host=os.getenv("HOST", "0.0.0.0"), port=os.getenv("PORT", 8080), debug=os.getenv("DEBUG_MODE", False))