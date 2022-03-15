import multiprocessing
import os
import tempfile
from typing import List

import requests
import base64
import json
import traceback
import urllib.parse



from acejs_collab_server.server.exceptions import AuthenticationException
from acejs_collab_server.server.base_server import UserRoom







from acejs_collab_server.server.base_server import EventDrivenProtocol, listen_for
from acejs_collab_server.server.utils import googleLogin
from acejs_collab_server.server.yaml_editor_room import Rooms,EditorRoom

class GoogleAuthenticatedRoomProtocol(EventDrivenProtocol):
    user_info = None
    room: EditorRoom = None
    def notifyRoom(self, event, *, exclude_self=False, **payload):
        if self.room:
            skip = []
            if exclude_self:
                skip = [self]
            # print("BROADCAST:",payload)
            self.room.broadcastEvent(event, **payload, skip=skip)
    def doAuthorize(self, request):
        room = request.params.get("room", [None])[0]
        user = request.params.get("user", [None])[0]
        # token = request.params.get("tok", [None])[0]
        # try:
        #     room, tokenID = base64.b64decode(token).decode().split(":")
        # except Exception as e:
        #     print("Got Error Decoding and splitting tok:",str(e))
        #     raise AuthenticationException(f"Invalid Token {token}")
        # try:
        #     self.user_info = googleLogin(tokenID)
        #     self.user_info['room'] = room
        # except Exception as e:
        #     print("Google Error!",e)
        #     traceback.print_exc()
        #     raise AuthenticationException(f"google connection error: {e}")
        self.user_info = {'email':user,"room_name":room}

        print("Connection Complete")
    def doWebsocketHandshake(self, request):
        print("Run Handshake?")
        self.doAuthorize(request)
        Rooms.onConnect(self)
        return self.user_info


class AceEditorCollabProtocol(GoogleAuthenticatedRoomProtocol):
    @property
    def room_name(self):
        if self.user_info:
            return self.user_info.get('room',None)

    @property
    def username(self):
        if self.user_info:
            return self.user_info.get('email',None)

    @listen_for("OPENED")
    def onInitialConnectionComplete(self, payload=None):
        room_data = self.room.to_dict()
        data = {
            "room": room_data,
            "user": self.user_info,
        }
        print("Send Welcome:",self.user_info)
        self.sendEvent("WELCOME", data)
        self.room.broadcastEvent("USER_JOINED", user=self.user_info, room=room_data, skip=[self])


    @listen_for("EDITOR_CHANGE")
    def onEditorChange(self, payload):
        self.notifyRoom("CHANGE_EVENT", yaml=self.room.content, change=payload['evt'], exclude_self=True)
        self.room.applyChange(payload['evt'])

    @listen_for("REQUEST_YAML")
    def onRequestYaml(self, payload=None):
        print("RequestYaml Event")
        self.sendEvent("UPDATE_YAML", dict(yaml=self.room.content))

    @listen_for("UPDATE_CURSOR")
    def onUpdateCursorEvent(self, payload):
        print("UpdateCursor Event:", payload)
        self.notifyRoom("CURSOR_UPDATE", cursor=payload['cursor'], user=self.user_info, exclude_self=True)

    @listen_for("CLOSED")
    def onClosed(self, payload):
        print(f"WebSocket connection closed22: {payload!r}")
        room = self.room
        if room is None:
            print("User has no room?",self.user_info)
            return
        Rooms.onDisconnect(self)
        room.broadcastEvent("USER_LEFT", user=self.user_info, room=room.to_dict())



def start_server(host='127.0.0.1',port=9000,log=True):
    import sys
    from autobahn.twisted.websocket import WebSocketServerFactory
    if log:
        from twisted.python import log
        log.startLogging(sys.stdout)

    factory = WebSocketServerFactory() #f"ws://{host}:{port}")
    factory.protocol = AceEditorCollabProtocol
    # factory.setProtocolOptions(maxConnections=2)
    from twisted.internet import reactor
    reactor.listenTCP(9000, factory,interface=host)
    reactor.run()


if __name__ == '__main__':
    start_server()

