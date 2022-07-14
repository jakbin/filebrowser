import os
import time
import datetime
import platform

def get_size(path):
    size = os.path.getsize(path)
    if size < 1024:
        return f"{size} B"
    elif size < 1024*1024:
        return f"{round(size/1024, 2)} KB"
    elif size < 1024*1024*1024:
        return f"{round(size/(1024*1024), 2)} MB"
    elif size < 1024*1024*1024*1024:
        return f"{round(size/(1024*1024*1024), 2)} GB"

def diff(file):
    today = datetime.datetime.today()

    file_mtime = time.ctime(os.path.getmtime(file))
    t_ob = time.strptime(file_mtime)
    t = time.strftime("%Y-%m-%d %H-%M-%S", t_ob)
    file_d = datetime.datetime.strptime(t, "%Y-%m-%d %H-%M-%S")

    minutes = divmod((today-file_d).total_seconds(), 60)

    if (today - file_d).days > 30:
        return f"{round(((today - file_d).days)/30)} months"
    elif (today - file_d).days != 0:
        return f"{(today - file_d).days} days"
    elif minutes[0] > 59:
        return f"{round(minutes[0]/60)} huors"
    elif minutes[0] != 0:
        return f"{round(minutes[0])} minutes"
    else:
        return f"{round(minutes[1])} seconds"

pl = platform.system()

def folderCompare(base_path, path):
    if pl == 'Windows':
        base_path = str(base_path).split('\\')
        path = str(path).split('\\')
    else:
        base_path = str(base_path).split('/')
        path = str(path).split('/')
    result = True
    for i in base_path:
        if i in path:
            result = True
        else:
            result = False
            break
    return result
    