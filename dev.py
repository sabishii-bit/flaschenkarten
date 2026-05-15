#!/usr/bin/env python3
"""
Dev launcher — starts PostgreSQL (Docker), server, and client.
Invoked by `pnpm dev` from the project root.
"""

import os
import shutil
import signal
import subprocess
import sys
import threading
import time
from urllib.parse import urlparse

ROOT = os.path.dirname(os.path.abspath(__file__))
PNPM = shutil.which('pnpm') or 'pnpm'

# ── ANSI colours ────────────────────────────────────────────────────────────

RESET  = '\033[0m'
BOLD   = '\033[1m'

def _c(code: str, text: str) -> str:
    return f'{code}{text}{RESET}'

def tag(name: str) -> str:
    colours = {'db': '\033[95m', 'server': '\033[96m', 'client': '\033[92m'}
    return _c(BOLD + colours.get(name, ''), f'[{name}]')

def info(msg: str)  -> None: print(_c('\033[93m', msg), flush=True)
def error(msg: str) -> None: print(_c('\033[91m', msg), flush=True)

# ── Env file parser ─────────────────────────────────────────────────────────

def load_env(path: str) -> dict:
    env: dict = {}
    try:
        with open(path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    env[k.strip()] = v.strip()
    except FileNotFoundError:
        pass
    return env

# ── Parse DATABASE_URL from .env.development ────────────────────────────────

dev_env  = load_env(os.path.join(ROOT, 'packages', 'server', '.env.development'))
db_url   = dev_env.get('DATABASE_URL', '')
parsed   = urlparse(db_url)

DB_USER = parsed.username or 'flaschenkarten'
DB_PASS = parsed.password or 'devpassword'
DB_NAME = (parsed.path or '/flaschenkarten_dev').lstrip('/')

# ── Process registry ─────────────────────────────────────────────────────────

_procs: list[subprocess.Popen] = []

def stream(proc: subprocess.Popen, name: str) -> None:
    for line in iter(proc.stdout.readline, ''):
        sys.stdout.write(f'{tag(name)} {line}')
        sys.stdout.flush()

def shutdown(*_) -> None:
    info('\n[dev] Shutting down…')
    for p in _procs:
        try:
            p.terminate()
        except Exception:
            pass
    subprocess.run(
        ['docker', 'compose', 'stop', 'postgres'],
        cwd=ROOT, capture_output=True,
    )
    print(f'{tag("db")} PostgreSQL stopped.')
    sys.exit(0)

signal.signal(signal.SIGINT, shutdown)
if hasattr(signal, 'SIGTERM'):
    signal.signal(signal.SIGTERM, shutdown)

# ── 1. Start PostgreSQL ──────────────────────────────────────────────────────

print(f'{tag("db")} Starting PostgreSQL ({DB_NAME})…')

subprocess.run(
    ['docker', 'compose', 'up', '-d', 'postgres'],
    cwd=ROOT,
    env={
        **os.environ,
        'POSTGRES_USER':     DB_USER,
        'POSTGRES_PASSWORD': DB_PASS,
        'POSTGRES_DB':       DB_NAME,
    },
    check=True,
)

# ── 2. Wait until healthy ────────────────────────────────────────────────────

print(f'{tag("db")} Waiting for PostgreSQL to be ready…')

for attempt in range(30):
    ok = subprocess.run(
        # -T disables TTY allocation — required when running in a subprocess
        ['docker', 'compose', 'exec', '-T', 'postgres', 'pg_isready', '-U', DB_USER],
        cwd=ROOT, capture_output=True, text=True,
        env={**os.environ, 'POSTGRES_USER': DB_USER, 'POSTGRES_PASSWORD': DB_PASS, 'POSTGRES_DB': DB_NAME},
    )
    if ok.returncode == 0:
        print(f'{tag("db")} Ready.')
        break
    if attempt == 0:
        time.sleep(2)   # give the container a moment on first try
    else:
        msg = (ok.stdout or ok.stderr or 'no output').strip()
        print(f'{tag("db")} Not ready yet ({msg}), retrying…')
        time.sleep(1)
else:
    error('[dev] PostgreSQL did not become ready in time. Aborting.')
    sys.exit(1)

# ── 3. Start server and client ───────────────────────────────────────────────

server = subprocess.Popen(
    [PNPM, '--filter', '@flaschenkarten/server', 'dev'],
    stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
    text=True, cwd=ROOT,
)
client = subprocess.Popen(
    [PNPM, '--filter', '@flaschenkarten/client', 'dev'],
    stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
    text=True, cwd=ROOT,
)

_procs.extend([server, client])

threading.Thread(target=stream, args=(server, 'server'), daemon=True).start()
threading.Thread(target=stream, args=(client, 'client'), daemon=True).start()

info('[dev] All services running. Press Ctrl+C to stop.')

# ── 4. Monitor ───────────────────────────────────────────────────────────────

while True:
    for p in _procs:
        if p.poll() is not None:
            error('[dev] A process exited unexpectedly.')
            shutdown()
    time.sleep(0.5)
