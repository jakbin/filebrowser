import argparse
from pathlib import Path
from filebrowser import __version__
from filebrowser.app import server
from filebrowser import auth
import secrets

package_name = "filebrowser"

example_uses = '''example:
   filebrowser 
   filebrowser --host {custom_address} --port {custom_port} --dir {folder_path}
   filebrowser --host {custom_address} -p {custom_port} -d {folder_path}'''

def main(argv = None):
    parser = argparse.ArgumentParser(prog=package_name, description="Simple web file browser.", epilog=example_uses, formatter_class=argparse.RawDescriptionHelpFormatter)

    parser.add_argument("--host", dest="host", metavar="host", type=str, help="address to listen (default: 127.0.0.1)")

    parser.add_argument('-p',"--port", dest="port", metavar="port", type=int, help="port to listen (default: 8080)")

    parser.add_argument('-d',"--dir", dest="dir", metavar="path", type=str, help="serving directory (default: current directory)")

    parser.add_argument('--auth', dest='auth', action='store_true', help='enable authentication; if provided without --password, a random 8-digit password is generated for user "admin"')

    parser.add_argument('--password', dest='password', metavar="password", default=None, type=str, help='password to set when using --auth')

    parser.add_argument('--debug', dest='debug', action='store_true', help='enable debug mode (not recommended for production)')

    parser.add_argument('-v',"--version", action="store_true", dest="version", help="check version of filebrowser")

    args = parser.parse_args(argv)

    # Handle authentication setup
    auth_enabled = False
    if args.auth:
        auth_enabled = True
        if args.password:
            auth.set_password(args.password)
        else:
            # Generate 8-digit numeric password
            pwd = ''.join(secrets.choice('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') for _ in range(8))
            auth.set_password(pwd)
            print("Authentication enabled. Username: admin")
            print(f"Generated password: {pwd}")

    debug = False
    if args.debug:
        debug = True

    if bool(args.host) or bool(args.port) or bool(args.dir) or auth_enabled:
        # print(args.host, args.port, args.dir, auth_enabled)
        if auth_enabled:
            return server(args.host if args.host else "127.0.0.1", args.port if args.port else 8080, args.dir if args.dir else Path.cwd(), auth_enabled, debug)
        else:
            return server("127.0.0.1", 8080, Path.cwd(), False, debug)
    elif args.version:
        return __version__
    else:
        return server("127.0.0.1", 8080, Path.cwd(), False, debug)

if __name__ == "__main__":
    raise SystemExit(main())