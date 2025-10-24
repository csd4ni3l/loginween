from flask import Flask, Response, render_template, redirect, url_for, g, request, json

from flask_login import LoginManager, login_required
from datetime import datetime

from pattern import Pattern

import sqlite3, os, flask_login, dotenv, secrets, html

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
                pattern TEXT NOT NULL
            )
        """)

        db.execute("""
            CREATE TABLE IF NOT EXISTS Posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                comment TEXT NOT NULL,
                pattern TEXT NOT NULL,
                creation_time INTEGER NOT NULL
            )
        """)

        db.commit()

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
    username = flask_login.current_user.id

    cur = get_db().cursor()

    cur.execute("SELECT * FROM Posts LIMIT 15")

    posts = cur.fetchall()

    cur.close()

    for post in posts:
        if not isinstance(post[0], int):
            print("Post ID is not int. Exiting for safety.")
            return "Post ID is not int. Exiting for safety."
        if not isinstance(post[4], int):
            print("Post Timestamp is not int. Exiting for safety.")
            return "Post Timestamp is not int. Exiting for safety."

    new_posts = [[post[0], html.escape(post[1], quote=True), html.escape(post[2], quote=True), [html.escape(f"{pos[0]},{pos[1]}", quote=True) for pos in json.loads(post[3])], datetime.fromtimestamp(post[4]).strftime('%Y-%m-%d %H:%M:%S')] for post in posts]

    return render_template("index.jinja2", username=username, posts=new_posts, grid_size=os.getenv("GRID_SIZE", 15))

@app.route("/countdown")
def countdown():
    return render_template("countdown.jinja2", logged_in=flask_login.current_user.is_authenticated, grid_size=os.getenv("GRID_SIZE", 15))

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        if flask_login.current_user.is_authenticated:
            return redirect(url_for("main"))

        return render_template("login.jinja2", grid_size=os.getenv("GRID_SIZE", 15))
    
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
        
        return render_template("register.jinja2", grid_size=os.getenv("GRID_SIZE", 15))
    
    elif request.method == "POST":
        if request.form["username"] != html.escape(request.form["username"], quote=True):
            return "No XSS please"

        username = html.escape(request.form["username"], quote=True)
        pattern = Pattern.from_str(request.form["pattern"])

        cur = get_db().cursor()

        cur.execute("SELECT pattern from Users WHERE username = ?", (username, ))

        if cur.fetchone():
            cur.close()
            return Response("An account with this username already exists.", 400)

        cur.execute("INSERT INTO Users (username, pattern) VALUES (?, ?)", (username, pattern.to_json_str()))
        get_db().commit()
        cur.close()

        return redirect(url_for("login"))
    
@app.route("/profile")
@login_required
def profile():
    username = flask_login.current_user.id
    return render_template("profile.jinja2", username=username, grid_size=os.getenv("GRID_SIZE", 15), logged_in_account=True)

@app.route("/profile/<username>")
def profile_external(username):
    return render_template("profile.jinja2", username=username, grid_size=os.getenv("GRID_SIZE", 15), logged_in_account=False)

@app.route("/change_username", methods=["POST"])
@login_required
def change_username():
    username = flask_login.current_user.id

    if request.form["new_username"] != html.escape(request.form["new_username"], quote=True):
        return "No XSS please"

    new_username = html.escape(request.form["new_username"], quote=True)

    cur = get_db().cursor()

    cur.execute("UPDATE Users SET username = ? WHERE username = ?", (new_username, username))

    get_db().commit()
    cur.close()

    flask_login.logout_user()
    return redirect(url_for("login"))

@app.route("/change_pattern", methods=["POST"])
@login_required
def change_pattern():
    username = flask_login.current_user.id

    current_pattern, new_pattern = request.form["current_pattern"], request.form["new_pattern"]

    cur = get_db().cursor()

    cur.execute("SELECT pattern FROM Users WHERE username = ?", (username,))
    row = cur.fetchone()

    if not row:
        cur.close()
        return Response("No pattern exists? WTF?", 500)
    
    if not Pattern.from_str(current_pattern) == Pattern.from_json_str(row[0]):
        cur.close()
        return Response("Invalid Pattern", 401)
    
    cur.execute("UPDATE Users SET pattern = ? WHERE username = ?", (Pattern.from_str(new_pattern).to_json_str(), username))
    get_db().commit()
    cur.close()

    flask_login.logout_user() # not logout redirect because that might fail and we would be in a weird state
    return redirect(url_for("login"))

@app.route("/delete_account")
@login_required
def delete_account():
    username = flask_login.current_user.id

    cur = get_db().cursor()

    cur.execute("DELETE FROM Users WHERE username = ?", (username,))

    get_db().commit()
    cur.close()

    flask_login.logout_user() # not logout redirect because that might fail and we would be in a weird state
    return redirect(url_for("login"))

@app.route("/logout")
@login_required
def logout():
    flask_login.logout_user()
    return redirect(url_for("login"))

app.run(host=os.getenv("HOST", "0.0.0.0"), port=int(os.getenv("PORT", 8080)), debug=os.getenv("DEBUG_MODE", False).lower() == "true")