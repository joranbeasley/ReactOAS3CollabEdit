import argparse
import os
import sys
import logging
logging.basicConfig(level=logging.DEBUG)
log = logging.getLogger("ws-server")

WS_SOCKET_SERVICEFILE_SOCKET='''[Unit]
Description=websocket socket %i

[Socket]
RuntimeDirectory=websocket
ListenStream=/run/websocket/websocket%i.sock
SocketUser=www-data
SocketMode=0600

[Install]
WantedBy=sockets.target'''

WS_SOCKET_SERVICEFILE_SERVER='''[Unit]
Description=websocket daemon %i
PartOf=websocket_server@.socket
After=network.target

[Service]
DynamicUser=yes
ExecStart=$PY -m acejs_collab_server runserver {host}:{port} 
ExecReload=/bin/kill -HUP $MAINPID

[Install]
WantedBy=multi-user.target
'''
SERVICE_NAME="websocket_server@"
def find_symlinks_in_folder(folder=".", maxDepth=1):
    cmd = f"""find "{folder}" -maxdepth {maxDepth} -type l -exec readlink -nf {{}} ';' -exec echo " -> {{}}" ';'"""
    result = os.popen(cmd).read()
    return (row.split(" -> ") for row in result.splitlines())

def filter_symlinks_in_folder(target,folder=".",maxDepth=1):
    for realfile,symlink in find_symlinks_in_folder(folder,maxDepth):
        if target in realfile:
            yield {"symlink":symlink,"realfile":realfile}


def install_app(name,host,port):
    print(f"Install websocket server as {name}")
    base_path = "/etc/ws_service_files"
    socket_path = os.path.join(base_path, "websocket_server@.socket")
    server_path = os.path.join(base_path, "websocket_server@.service")
    if not os.path.exists(base_path):
        try:
            os.makedirs(base_path,exist_ok=True)
        except:
            log.error("You can only install if you are sudo!")
            exit(1)
    else:
        log.warning("WARNING: It appears you may already have installed this")
    with open(socket_path, "w") as f:
        f.write(WS_SOCKET_SERVICEFILE_SOCKET)
    with open(server_path, "w") as f:
        f.write(WS_SOCKET_SERVICEFILE_SERVER.format(host=host,port=port))
    log.debug("UPDATED SERVICE FILES, CHECK FOR EXISTING SERVICE INSTALLS")
    os.popen(f"systemctl link {base_path}/*")
    os.popen(f"ststemctl enable {SERVICE_NAME}{{0}}")


def uninstall_app():
    print("GOT UNINSTALL ARGS:", args)
    existing = list(filter_symlinks_in_folder("ws_service_files", folder="/etc/systemd/system", maxDepth=1))
    for entry in existing:
        print("Uninstall : ",entry['symlink'] )
        os.popen(f"systemctl disable {os.path.basename(entry['symlink'])}")
        print("Remove:",entry['symlink'])
        os.unlink(entry['symlink'])

def runserver(host_and_port):
    host,port = None,None
    try:
        host,port = host_and_port.split(":",1)
    except:
        print(f"Invalid host and port specification '{host_and_port}' expected something like 127.0.0.1:9000")
        exit(1)
    try:
        port = int(port)
    except:
        print(f"Invalid PORT: {port}, expected an integer")
        exit(1)
    print(f"Serving Websocket Server on {host_and_port}")
    from acejs_collab_server.server.ace_server import start_server
    start_server(host,port)

def stop_cmd(**args):
    print("STOP SERVER:",args)

def start_cmd(**args):
    os.popen('systemctl start ')

def print_version_cmd(*a,**args):
    from __version__ import __version__,__name__
    print(__name__," : ver ",__version__)
    exit(0)


class _CBAction(argparse.Action):
    def __init__(self,cb,**kwargs):
        self.cb = cb
        super(_CBAction,self).__init__(**kwargs)
    def __call__(self, parser,ns,args,tok):
        print("CALL:",parser)
        print("NS:",ns)
        print("a:",args)
        print("tok:",tok)
        return self.cb(*args)

def main(args=None):
    parser = argparse.ArgumentParser(prog="acejs_collab_server")
    parser.register('action', 'callback_action',_CBAction)
    parser.add_argument("-v","--version",
                        help="print the version of oas3_collab_websocketserver and exit",
                        cb=print_version_cmd,
                        nargs=0,
                        action='callback_action'
                        )
    parsers = parser.add_subparsers(
        title="available commands",
        description="the following subcommands are available",
        help="are the only supported commands"
    )
    install_cmd = parsers.add_parser("install", help="installs the service, enables the service, and starts the service")
    install_cmd.set_defaults(func=install_app)
    install_cmd.add_argument("-n","--name",help="service unit name to register",default="websocket_server")
    install_cmd.add_argument("--host", default="127.0.0.1",help="the interface to serve on")
    install_cmd.add_argument("--port", default="9090",help="the port to serve on",type=int)

    run_cmd = parsers.add_parser("runserver", help="run the websocket server")
    run_cmd.add_argument("host_and_port",default="127.0.0.1:9090")
    run_cmd.set_defaults(func=runserver)
    stop_cmd = parsers.add_parser("stop", help="stops the service")
    stop_cmd.set_defaults(func=stop_cmd)
    start_cmd = parsers.add_parser("start", help="starts the service, if stopped")
    start_cmd.set_defaults(func=start_cmd)
    uninstall_cmd = parsers.add_parser("uninstall", help="uninstalls the service")
    uninstall_cmd.set_defaults(func=uninstall_cmd)

    result = parser.parse_args(args or sys.argv)
    payload = {k:v for k,v in result.__dict__.items() if k != 'func'}
    result.func(**payload)


if __name__ == "__main__":
    args = sys.argv
    if len(args) and "__main__" in args[0]:
        args = args[1:]
    main(['-v'])#args)
