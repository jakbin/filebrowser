import os
import shutil
import tempfile
from functools import wraps
from pathlib import Path
from zipfile import ZipFile
from shutil import rmtree

from flask import Flask, render_template, request, send_from_directory, json, Response, session
from werkzeug.utils import secure_filename

from filebrowser.funcs import get_size, diff, folderCompare
from filebrowser import auth


# ---------- Helpers ----------
def custom_response(res, status_code):
    return Response(mimetype="application/json", response=json.dumps(res), status=status_code)


def create_app(home_path: str, auth_enabled: bool) -> Flask:
    app = Flask(__name__)
    app.secret_key = os.urandom(32)

    # Ensure a password exists if auth is enabled
    if auth_enabled and not auth.is_password_set():
        import secrets as _secrets
        pwd = ''.join(_secrets.choice('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') for _ in range(8))
        auth.set_password(pwd)
        print("Authentication enabled. Username: admin")
        print(f"Generated password: {pwd}")

    def login_required(fn):
        @wraps(fn)
        def _wrapper(*args, **kwargs):
            if auth_enabled and not session.get('logged_in', False):
                return custom_response({'error': 'Unauthorized'}, 401)
            return fn(*args, **kwargs)
        return _wrapper

    def build_path(*parts):
        return os.path.join(home_path, *parts)

    def list_dir_data(curr_path: str):
        folders, folders_date, files, files_size, files_date = [], [], [], [], []
        dir_list = os.listdir(curr_path)
        for item in dir_list:
            full = os.path.join(curr_path, item)
            if os.path.isdir(full):
                folders.append(item)
                folders_date.append(diff(full))
        for item in dir_list:
            full = os.path.join(curr_path, item)
            if os.path.isfile(full):
                files.append(item)
                files_size.append(get_size(full))
                files_date.append(diff(full))
        return list(zip(folders, folders_date)), list(zip(files, files_size, files_date))

    # ---------- Auth Routes ----------
    @app.route('/auth/status')
    def auth_status():
        return custom_response({
            'authEnabled': bool(auth_enabled),
            'loggedIn': bool(session.get('logged_in', False)),
            'user': 'admin' if session.get('logged_in') else None
        }, 200)

    @app.route('/auth/login', methods=['POST'])
    def auth_login():
        if not auth_enabled:
            return custom_response({'ok': True, 'authEnabled': False}, 200)
        data = request.get_json() or {}
        username = data.get('username', '')
        password = data.get('password', '')
        if username != 'admin' or not auth.verify_password(password):
            return custom_response({'ok': False, 'error': 'Invalid credentials'}, 401)
        session['logged_in'] = True
        session['user'] = 'admin'
        return custom_response({'ok': True}, 200)

    @app.route('/auth/logout', methods=['POST'])
    def auth_logout():
        session.clear()
        return custom_response({'ok': True}, 200)

    # ---------- UI Route ----------
    @app.route("/")
    def home():
        return render_template('index.html')

    # ---------- File/Folder Routes ----------
    @app.route("/load-data", methods=['POST'])
    @login_required
    def loaddata():
        data = request.get_json()
        name = data['name']
        folder = data['folder']
        curr_path = build_path(folder, name)
        if folderCompare(home_path, curr_path):
            folders_data, files_data = list_dir_data(curr_path)
            return render_template('data.html', folders_data=folders_data, files_data=files_data)
        else:
            return '0', 201

    @app.route('/info')
    @login_required
    def info():
        foldername = os.path.basename(home_path)
        lastmd = diff(home_path)
        dir_list = os.listdir(home_path)
        file = sum(1 for item in dir_list if os.path.isfile(item))
        folder = sum(1 for item in dir_list if os.path.isdir(item))
        data = {'foldername': foldername, 'lastmd': lastmd, 'file': file, 'folder': folder}
        return custom_response(data, 200)

    @app.route('/folderlist', methods=['POST'])
    @login_required
    def folderlist():
        data = request.get_json()
        foldername = data['foldername']
        folder = data['folder']
        curr_path = build_path(folder, foldername)
        if folderCompare(home_path, curr_path) and str(curr_path) != (str(os.path.join(home_path,'..'))):
            dir_list = os.listdir(curr_path)
            folders = []
            for item in dir_list:
                if os.path.isdir(os.path.join(curr_path,item)):
                    folders.append({"path":item })
            return {"item":folders}
        else:
            return {"item":"no more folder", "status":False}

    @app.route('/copyItem', methods=['POST'])
    @login_required
    def copyItem():
        data = request.get_json()
        source = data['source']
        itemName = data['itemName']
        destination = data['destination']
        fodestination = data['fodestination']
        fullSource = build_path(source, itemName)
        fullDestination = build_path(source, fodestination, destination)
        try:
            shutil.copy2(fullSource, fullDestination)
            return '1'
        except NotADirectoryError:
            shutil.copytree(fullSource, fullDestination)
            return '1'
        else:
            return '0'

    @app.route('/moveItem', methods=['POST'])
    @login_required
    def moveItem():
        data = request.get_json()
        source = data['source']
        destination = data['destination']
        itemName = data['itemName']
        fodestination = data['fodestination']
        fullSource = build_path(source, itemName)
        fullDestination = build_path(source, fodestination, destination)
        try:
            shutil.move(fullSource, fullDestination)
            return '1'
        except NotADirectoryError:
            shutil.copytree(fullSource, fullDestination)
            return '1'
        else:
            return '0'

    @app.route("/new-folder", methods = ['POST'])
    @login_required
    def newfolder():
        data = request.get_json()
        name = data['name']
        folder = data['folder']
        try:
            os.mkdir(build_path(folder, name))
            return "1"
        except IOError as e:
            return str(e)

    @app.route("/new-file", methods = ['POST'])
    @login_required
    def newfile():
        data = request.get_json()
        name = data['name']
        folder = data['folder']
        file_path = build_path(folder, name)
        try:
            with open(file_path, 'w') as fp:
                pass
            return "1"
        except IOError as e:
            return str(e)

    @app.route("/upload", methods = ['POST'])
    @login_required
    def upload():
        folder = request.form.get('folder')
        target = build_path(folder)
        f = request.files['file1']
        if f.filename == "":
            return 'No file selected'
        elif f:
            f.save(os.path.join(target, secure_filename(f.filename)))
            return "1"

    @app.route("/delete", methods = ['POST'])
    @login_required
    def delete():
        data = request.get_json()
        name = data['name']
        folder = data['folder']
        target = build_path(folder, name)
        if os.path.isdir(target):
            folders = os.listdir(target)
            if folders == []:
                try:
                    os.rmdir(target)
                    return "1"
                except IOError as e:
                    return str(e)
            else:
                try:
                    rmtree(target)
                    return "1"
                except IOError as e:
                    return str(e)
        else:
            os.path.isfile(target)
            try:
                os.remove(target)
                return "1"
            except IOError as e:
                return str(e)

    @app.route("/rename", methods = ['POST'])
    @login_required
    def rename():
        data = request.get_json()
        name = data['name']
        folder = data['folder']
        dst = data['dst']
        target = build_path(folder, name)
        fullDestination = build_path(folder, dst)
        try:
            os.rename(target, fullDestination)
            return "1"
        except IOError as e:
            return str(e)

    @app.route("/download/<path:name>")
    @login_required
    def download(name):
        target = build_path(name)

        def get_all_dir(directory):
            file_paths = list()
            for root, directories, files in os.walk(directory):
                for filename in files:
                    filepath = os.path.join(root, filename)
                    file_paths.append(filepath)
            return file_paths

        if os.path.isdir(target):
            os.chdir(os.path.dirname(target))
            foldername = os.path.basename(target)
            file_paths = get_all_dir(foldername)
            # temp_dir = tempfile.gettempdir()  # kept for future use
            try:
                with ZipFile(f"{foldername}.zip", "w") as zipf:
                    for file in file_paths:
                        zipf.write(file)
                return send_from_directory(directory=os.path.dirname(target), path=f"{foldername}.zip", as_attachment=True)
            finally:
                if os.path.exists(f"{foldername}.zip"):
                    os.remove(f"{foldername}.zip")
        else:
            try:
                return send_from_directory(directory=os.path.dirname(target), path=os.path.basename(target), as_attachment=True)
            except IOError:
                return "can't download"

    return app


def server(host: str = "127.0.0.1", port: int = 8080, home_path: str = Path.cwd(), auth_enabled: bool = False, debug: bool = True):
    app = create_app(home_path=str(home_path), auth_enabled=auth_enabled)
    app.run(host=host, port=port, debug=debug)
