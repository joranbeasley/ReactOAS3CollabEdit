# run `python -m acejs_collab_server --help`
import argparse
parser = argparse.ArgumentParser()
parser.add_argument("-p","--port",default=9000,type=int,help="the port to serve on, default=9000")
parser.add_argument("-h","--host",default="localhost",help="the host interface to use, default=localhost")
