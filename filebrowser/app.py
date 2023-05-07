from flask import Flask, render_template, request, flash, send_from_directory, json, Response
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from shutil import rmtree
import tempfile
from zipfile import ZipFile
import shutil

from filebrowser.funcs import get_size, diff, folderCompare

def server(host:str=None, port:int=None, home_path:str=None):
    app = Flask(__name__)
    app.secret_key = os.urandom(32)

    @app.route("/")
    def home():    
        return render_template('index.html')

    @app.route("/load-data", methods=['POST'])
    def loaddata():
        data = request.get_json()
        name = data['name']
        folder = data['folder']
        curr_path = os.path.join(home_path, folder, name)
        folders = []
        folders_date = []
        files = []
        files_size = []
        files_date = []
        if folderCompare(home_path, curr_path):
            dir_list = os.listdir(curr_path)
            for item in dir_list:
                if os.path.isdir(os.path.join(curr_path,item)):
                    folders.append(item)
                    folder_date = diff(os.path.join(curr_path,item))
                    folders_date.append(folder_date)
            for item in dir_list:
                if os.path.isfile(os.path.join(curr_path,item)):
                    files.append(item)
                    file_size = get_size(os.path.join(curr_path,item))
                    files_size.append(file_size)
                    file_date = diff(os.path.join(curr_path,item))
                    files_date.append(file_date)

            folders_data = list(zip(folders, folders_date))
            files_data = list(zip(files, files_size, files_date))

            return render_template('data.html', folders_data=folders_data, files_data=files_data)
        else:
            return '0', 201

    @app.route('/info')
    def info():
        foldername = os.path.basename(home_path)
        lastmd = diff(home_path)
        dir_list = os.listdir(home_path)
        file = 0
        folder = 0
        for item in dir_list:
            if os.path.isdir(item):
                folder+=1
            elif os.path.isfile(item):
                file+=1
        data = {'foldername': foldername, 'lastmd': lastmd, 'file': file, 'folder': folder}
        return custom_response(data, 200)

    def custom_response(res, status_code):
        return Response(mimetype="application/json",response=json.dumps(res),status=status_code)

    @app.route('/folderlist', methods=['POST'])
    def folderlist():
        data = request.get_json()
        foldername = data['foldername']
        folder = data['folder']
        curr_path = os.path.join(home_path, folder, foldername)
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
    def copyItem():
        data = request.get_json()
        source = data['source']
        itemName = data['itemName']
        destination = data['destination']
        fodestination = data['fodestination']
        fullSource = os.path.join(home_path, source, itemName)
        fullDestination = os.path.join(home_path, source, fodestination, destination)
        try:
            shutil.copy2(fullSource, fullDestination)
            return '1'
        except NotADirectoryError:
            shutil.copytree(fullSource, fullDestination)
            return '1'
        else:
            return '0'

    @app.route('/moveItem', methods=['POST'])
    def moveItem():
        data = request.get_json()
        source = data['source']
        destination = data['destination']
        itemName = data['itemName']
        fodestination = data['fodestination']
        fullSource = os.path.join(home_path, source, itemName)
        fullDestination = os.path.join(home_path, source, fodestination, destination)
        try:
            shutil.move(fullSource, fullDestination)
            return '1'
        except NotADirectoryError:
            shutil.copytree(fullSource, fullDestination)
            return '1'
        else:
            return '0'

    @app.route("/new-folder", methods = ['POST'])
    def newfolder():
        data = request.get_json()
        name = data['name']
        folder = data['folder']
        try:
            os.mkdir(os.path.join(home_path, folder, name))
            return "1"
        except IOError as e:
            return str(e)

    @app.route("/new-file", methods = ['POST'])
    def newfile():
        data = request.get_json()
        name = data['name']
        folder = data['folder']
        file = os.path.join(home_path, folder, name)
        try:
            with open(file, 'w') as fp:
                pass
            return "1"
        except IOError as e:
            return str(e)

    @app.route("/upload", methods = ['POST'])
    def upload():
        folder = request.form.get('folder')
        target = os.path.join(home_path, folder)
        f = request.files['file1']
        if f.filename == "":
            return 'No file selected'
        elif f:
            f.save(os.path.join(target, secure_filename(f.filename)))
            return "1"

    @app.route("/delete", methods = ['POST'])
    def delete():
        data = request.get_json()
        name = data['name']
        folder = data['folder']
        target = os.path.join(home_path, folder, name)
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
    def rename():
        data = request.get_json()
        print(data)
        name = data['name']
        folder = data['folder']
        dst = data['dst']
        target = os.path.join(home_path, folder, name)
        fullDestination = os.path.join(home_path, folder, dst)
        try:
            os.rename(target, fullDestination)
            return "1"
        except IOError as e:
            return str(e)

    @app.route("/download/<path:name>")
    def download(name):
        target = os.path.join(home_path, name)
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
            temp_dir = tempfile.gettempdir()
            zipname = os.path.join(temp_dir, foldername)

            try:
                with ZipFile(f"{foldername}.zip", "w") as zip:
                    for file in file_paths:
                        zip.write(file)
                return send_from_directory(directory=os.path.dirname(target), path=f"{foldername}.zip", as_attachment=True)

            finally:
                if os.path.exists(f"{foldername}.zip"):
                    os.remove(f"{foldername}.zip")
        else:
            try:
                return send_from_directory(directory=os.path.dirname(target), path=os.path.basename(target), as_attachment=True)
            except IOError:
                return "can't download"
        
    app.run(host=host, port=port, debug=True)  
