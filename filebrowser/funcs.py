import os
import time
import datetime

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
        return f"{round(minutes[0]/60)} hours"
    elif minutes[0] != 0:
        return f"{round(minutes[0])} minutes"
    else:
        return f"{round(minutes[1])} seconds"

def folderCompare(base_path, path):
    """
    Securely determine whether `path` is inside `base_path`.

    This function prevents directory traversal by:
    - Normalizing and resolving paths (resolves symlinks where possible)
    - Comparing canonical paths using safe common-path checks
    - Handling Windows and POSIX semantics appropriately

    Returns True if `path` is within `base_path`, else False.
    """
    from pathlib import Path

    try:
        # Base directory should exist; resolve strictly to its canonical path
        base = Path(base_path).resolve(strict=True)
    except FileNotFoundError:
        # Invalid base path cannot contain anything
        return False

    # Resolve target path without strict to allow checking paths that may not yet exist
    target = Path(path).resolve(strict=False)

    # On Windows, perform a case-insensitive comparison using commonpath.
    if os.name == 'nt':
        base_str = os.path.normcase(str(base))
        target_str = os.path.normcase(str(target))
        try:
            return os.path.commonpath([base_str, target_str]) == base_str
        except ValueError:
            # Different drives or invalid path relationships
            return False

    # On POSIX, we can rely on is_relative_to for clarity
    try:
        return target.is_relative_to(base)
    except AttributeError:
        # Fallback for very old Python versions: use commonpath
        try:
            return os.path.commonpath([str(base), str(target)]) == str(base)
        except ValueError:
            return False
    