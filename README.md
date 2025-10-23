LoginWeen is an app where you login/register with a halloween pumpkin carving as a password.

Live Demo (coming soon!): https://loginween.csd4ni3l.hu

# Install

## Download source & use uv
- Download source and change to it's directory
- copy `.env.example` to `.env` and update the settings as you like.
- `uv run app.py`

## Download source & use pip
- Download source and change to it's directory
- Copy `.env.example` to `.env` and update the settings as you like.
- **Optionally**, make and activate a virtual environment: `python3 -m venv .venv` and `source .venv/bin/activate`
- `pip3 install -r requirements.txt`
- `python3 app.py`

## Docker CLI
- Run `docker run --name loginween -p 8080:8080 -e HOST=0.0.0.0 -e PORT=8080 -e DB_FILE=data.db -e APP_KEY=changeme -e DEBUG_MODE=true -v ./data.db:/app/data.db --restart unless-stopped csd4ni3lofficial/loginween:latest` and change the parameters

## Docker Compose
- Download the `docker-compose.yml` file from this repo and run `docker compose up -d` next to it.