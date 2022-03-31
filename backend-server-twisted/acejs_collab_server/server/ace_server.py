import datetime
import multiprocessing
import os
import tempfile
import time
from typing import List

import requests
import base64
import json
import traceback
import urllib.parse

import sentry_sdk
from dateutil.parser import parse

from acejs_collab_server.server.exceptions import AuthenticationException
from acejs_collab_server.server.base_server import UserRoom

from acejs_collab_server.server.base_server import EventDrivenProtocol, listen_for
from acejs_collab_server.server.utils import googleLogin
from acejs_collab_server.server.verify_tokens import verify_github_token, verify_google_token
from acejs_collab_server.server.yaml_editor_room import Rooms, EditorRoom


class GoogleAuthenticatedRoomProtocol(EventDrivenProtocol):
    user_info = None
    meta_info = None
    room: EditorRoom = None

    def notifyRoom(self, event, *, exclude_self=False, **payload):
        if self.room:
            skip = []
            if exclude_self:
                skip = [self]
            # print("BROADCAST:",payload)
            self.room.broadcastEvent(event, **payload, skip=skip)

    def doAuthorize(self, request):
        room = None
        user = None
        data1 = None
        try:
            room = request.params.get("room", [None])[0]
            user = request.params.get("user", [None])[0]
            data1 = verify_google_token(user)
            sentry_sdk.set_user({"id": data1['email'], "email": data1['email'], 'username': data1['name']})
            self.user_info = {"room_name": room, **data1}
            sentry_sdk.capture_message(f"LOGIN SUCCESS {room}", "info")
        except Exception as e:
            sentry_sdk.add_breadcrumb(
                category="error",
                message=f"LOGIN ERROR!!! room:{room} user:{user}  data:{data1}",
                level="error"
            )
            sentry_sdk.capture_exception(e)

            raise e

    def doWebsocketHandshake(self, request):
        sentry_sdk.start_transaction()
        sentry_sdk.set_tag("PEER", request.peer)
        sentry_sdk.set_extra("headers", f"{request.headers}")
        sentry_sdk.add_breadcrumb(category="auth:handshake", message=f"LOGIN PARAMS: {request.params}", level="info")
        self.doAuthorize(request)
        Rooms.onConnect(self)
        return self.user_info


class AceEditorCollabProtocol(GoogleAuthenticatedRoomProtocol):
    @property
    def room_name(self):
        if self.user_info:
            return self.user_info.get('room', None)

    @property
    def username(self):
        if self.user_info:
            return self.user_info.get('email', None)

    @listen_for("OPENED")
    def onInitialConnectionComplete(self, payload=None):
        room_data = self.room.to_dict()
        self.user_info['joined_at'] = datetime.datetime.now().isoformat()
        data = {
            "room": room_data,
            "user": self.user_info,
        }
        print("Send Welcome:", self.user_info)
        sentry_sdk.add_breadcrumb(
            category='auth:room:joined',
            message='Authenticated user %s JOINED ROOM %s (%d users)' % (
                f"{self.user_info['name']} <{self.user_info['email']}>",
                room_data['name'],
                len(room_data['users'])
            ),
            level='info',
        )
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
            sentry_sdk.capture_message(f"ERROR {self.user_info} HAS NO ROOM")
            print("User has no room?", self.user_info)
            return

        sentry_sdk.add_breadcrumb(
            category='auth:room:leave',
            message='user %s IS LEAVING %s (%d users left)  ' % (
                f"{self.user_info['name']} <{self.user_info['email']}>",
                self.room.name,
                len(self.room.users) - 1,
            ),
            level='info',
        )

        Rooms.onDisconnect(self)
        room.broadcastEvent("USER_LEFT", user=self.user_info, room=room.to_dict())
        sentry_sdk.capture_event({
            "level": "info",
            "message": f"USER LEFT\n{self.user_info['email']} LEFT after %0.2f seconds" % (
                    time.time() - parse(self.user_info['joined_at']).timestamp()
            )})


def start_server(host='127.0.0.1', port=9000, log=True):
    import sys
    try:
        from autobahn.twisted.websocket import WebSocketServerFactory
        if log:
            from twisted.python import log
            log.startLogging(sys.stdout)

        factory = WebSocketServerFactory()  # f"ws://{host}:{port}")
        factory.protocol = AceEditorCollabProtocol
        # factory.setProtocolOptions(maxConnections=2)
        from twisted.internet import reactor
        reactor.listenTCP(port, factory, interface=host)
        reactor.run()
    except Exception as e:
        sentry_sdk.capture_exception(e)
        raise
    else:
        sentry_sdk.capture_event(
            {
                "message": f"SERVER SHUTDOWN\nSERVER WAS SHUTDOWN GRACEFULLY AT {datetime.datetime.now()}",
                "level": "error"
            })


if __name__ == '__main__':
    start_server()
