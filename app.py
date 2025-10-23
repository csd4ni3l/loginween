from flask import Flask, Response, render_template, redirect, url_for, g, request

from flask_login import LoginManager, login_required

from pattern import Pattern

import sqlite3, os, flask_login, dotenv, secrets

if os.path.exists(".env"):
    dotenv.load_dotenv(".env")
else:
    print(".env file not found. Continuing with Docker environment or default values.")

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
                pattern TEXT UNIQUE
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

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        if flask_login.current_user.is_authenticated:
            return redirect(url_for("main"))

        return render_template("login.jinja2", grid_size=os.getenv("GRID_SIZE", 25))
    
    elif request.method == "POST":
        username = request.form["username"]
        pattern = Pattern.from_str(request.form["pattern"])

        cur = get_db().cursor()

        cur.execute("SELECT pattern from Users WHERE username = ?", (username, ))

        required_pattern = cur.fetchone()
        if not required_pattern:
            cur.close()
            return Response("An account with this username doesn't exist.", 400)

        if pattern == Pattern.from_json_str(required_pattern[0]):
            cur.close()

            user = User()
            user.id = username
            flask_login.login_user(user, remember=True)

            return redirect(url_for("main"))

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "GET":
        if flask_login.current_user.is_authenticated:
            return redirect(url_for("main"))
        
        return render_template("register.jinja2", grid_size=os.getenv("GRID_SIZE", 25))
    
    elif request.method == "POST":
        username = request.form["username"]
        pattern = Pattern.from_str(request.form["pattern"])

        cur = get_db().cursor()

        cur.execute("SELECT username from Users WHERE username = ?", (username, ))

        if cur.fetchone():
            cur.close()
            return Response("An account with this username already exists.", 400)

        cur.execute("INSERT INTO Users (username, pattern) VALUES (?, ?)", (username, pattern.to_json_str()))
        get_db().commit()
        cur.close()

        return redirect(url_for("login"))

app.run(host=os.getenv("HOST", "0.0.0.0"), port=os.getenv("PORT", 8080), debug=os.getenv("DEBUG_MODE", False))