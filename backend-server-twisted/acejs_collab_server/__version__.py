import importlib_metadata
__name__ = "oas3_collab_websocketserver"

import os
try:
    __version__ = importlib_metadata.version(__name__)
except:
    import re
    print("Warning package is running, but not currently installed you should install the pip package")
    cmd = 'cat ../pyproject.toml | grep "^version\s*='
    __version__ = re.sub("[^0-9\.]","",os.popen(cmd).read())


