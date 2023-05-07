import argparse
from pathlib import Path
from filebrowser.app import server

package_name = "filebrowser"

example_uses = '''example:
   filebrowser 
   filebrowser --host {custom_address} --port {custom_port} --dir {folder_path}
   filebrowser --host {custom_address} -p {custom_port} -d {folder_path}'''

def run_server(address, port, path):
    server(address, port, path)

def main(argv = None):
    parser = argparse.ArgumentParser(prog=package_name, description="Simple web file browser.", epilog=example_uses, formatter_class=argparse.RawDescriptionHelpFormatter)

    parser.add_argument("--host", dest="host", metavar="host", type=str, default="127.0.0.1", help="address to listen (default: 127.0.0.1)")

    parser.add_argument('-p',"--port", dest="port", metavar="port", type=int, default=8080, help="port to listen (default: 8080)")

    parser.add_argument('-d',"--dir", dest="dir", metavar="path", type=str, default=Path.cwd(), help="serving directory (default: current directory)")

    parser.add_argument('-v',"--version", action="store_true", dest="version", help="check version of filebrowser")

    args = parser.parse_args(argv)

    if bool(args.host) or bool(args.port) or bool(args.dir):
        return run_server(args.host, args.port, args.dir)
    elif args.version:
        return __version__
    else:
        return run_server("127.0.0.1", 8080, Path.cwd())

if __name__ == "__main__":
    raise SystemExit(main())