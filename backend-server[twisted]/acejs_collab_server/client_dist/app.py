# simple wrapper arround @joranbeasley/oas-shared-editor-client
import os
from functools import partial

import flask
import jinja2
app = flask.Flask(__name__,static_folder=None)
# app.static_folder = os.path.join(app.static_folder,"static")
# app.static_url_path  = "staticx"
def read_static_parent(fname):
    fpath = os.path.join(app.static_folder,"..",fname)
    print("FPATH:",fpath)
    return open(fpath,"rb").read()


def index():
    return read_static_parent("index.html")
# @app.route("/",defaults={'path':'index.html'})
# @app.route("/<path:path>")
# def serve_path(path):
#     return read_static_parent(path)

from flask import request, Response
import requests

def _proxy(proxy_to):
    print("Proxy:",request.host_url,"to",proxy_to)
    resp = requests.request(
        method=request.method,
        url=request.url.replace(request.host_url, proxy_to),
        headers={key: value for (key, value) in request.headers if key != 'Host'},
        data=request.get_data(),
        cookies=request.cookies,
        allow_redirects=False)

    excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
    headers = [(name, value) for (name, value) in resp.raw.headers.items()
               if name.lower() not in excluded_headers]

    response = Response(resp.content, resp.status_code, headers)
    return response
@app.route("/static/<path:path>")
def dev_path2(path):
    print("DEV PATH2:",path)
    return _proxy("http://localhost:3000/static/")

@app.route("/<path:path>")
def dev_path(path):
    print("DEV PATH:",path)
    return _proxy("http://localhost:3000/")


if __name__ == "__main__":
    app.run(debug=True)
