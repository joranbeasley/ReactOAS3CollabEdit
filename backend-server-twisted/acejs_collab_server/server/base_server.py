import json
import traceback
from typing import List
import sentry_sdk
from autobahn.twisted import WebSocketServerProtocol

from acejs_collab_server.server.exceptions import AuthenticationException


class EventEmitter:
    @classmethod
    def listen(cls, event):
        def __inner(fn):
            fn.listen = event
            return fn

        return __inner

    def __init__(self):
        self._listeners = {}

    def once(self, event, callback):
        callback.temporary = True
        self._listeners.setdefault(event, []).append(callback)

    def on(self, event, callback):
        self._listeners.setdefault(event, []).append(callback)

    def emit(self, event, payload):
        listeners = []
        if not self._listeners.get(event):
            return False
        with sentry_sdk.start_transaction(op="event", name=event):
            for cb in self._listeners.get(event, []):
                try:
                    cb(payload)
                except Exception as e:
                    sentry_sdk.capture_exception(e)
                if not getattr(cb, 'temporary', False):
                    listeners.append(cb)
                else:
                    del cb.temporary
        self._listeners[event] = listeners
        return True


listen_for = EventEmitter.listen


class EventDrivenProtocol(WebSocketServerProtocol):
    events: EventEmitter = None
    AUTH_ERROR = None
    def __init__(self):
        self.events = EventEmitter()
        WebSocketServerProtocol.__init__(self)
        self.__findListeners()

    def __findListeners(self):
        for item in dir(self):
            ob = getattr(self, item)
            if callable(ob):
                evt = getattr(ob, 'listen', None)
                if evt:
                    self.events.on(evt, ob)

    def sendUTF8(self, msg):
        self.sendMessage(msg)

    def sendJSON(self, payload):
        return self.sendUTF8(json.dumps(payload).encode())

    def sendEvent(self, event, payload):
        # with sentry_sdk.configure_scope() as scope:
        #     scope.transaction.name = "CLI_EVENT:" + event
        return self.sendJSON({'event': event, 'payload': payload})

    def doWebsocketHandshake(self, request):
        there_is_an_error = False
        if there_is_an_error:
            raise AuthenticationException()
        else:
            print("all good ... you can do whatever as long as you dont raise an error")

    def onConnect(self, request):
        print("CONNECT!")
        sentry_sdk.capture_event({"type":"CONNECTION_REQUESTED"},{"peer":request.peer})
        try:
            self.doWebsocketHandshake(request)
        except Exception as e:
            self.AUTH_ERROR = {"error":e,"tb":traceback.format_exc()}
            return
        self.events.emit("CONNECTED", self)

    def onOpen(self):
        with sentry_sdk.start_transaction(op="socket",name="onOpen"):
            if self.AUTH_ERROR:
                print("SEND ERROR!")
                payload = {"error":str(self.AUTH_ERROR['error']),"traceback":self.AUTH_ERROR["tb"]}
                self.sendClose(self.CLOSE_STATUS_CODE_NORMAL,json.dumps(payload))
                print("SENT CLOSE?")
                sentry_sdk.capture_exception(self.AUTH_ERROR['error'])
                return
            self.events.emit("OPENED", self)
    def onClose(self, wasClean, code, reason):
        if not self.events:
            print("WEIRD! NO EVENTS!",self)
            return
        self.events.emit("CLOSED",{'wasClean':wasClean,'code':code,'reason':reason})
    def onMessage(self, payload, isBinary):
        if isBinary:
            print("I dont know how to handle a binary payload yet...")
            return
        try:
            self.onJSON(json.loads(payload))
        except:
            self.events.emit("NOT_JSON",payload)

    def onJSON(self, payload):
        event = payload.get("event", payload.get("type", None))
        if not event:
            self.events.emit("IS_NOT_EVENT", payload)
            return
        self.onEventRecieved(event, payload.get("payload", payload.get("data", {})))

    def onEventRecieved(self, event, payload):
        if not self.events.emit(event, payload):
            print(f"[WARN]No Listeners for Event: {event}  - {payload!r}")


class UserRoom:
    users:List[EventDrivenProtocol] = []
    def addSocket(self,socket:EventDrivenProtocol):
        socket.room = self
        self.users.append(socket)
    def removeSocket(self,socket:EventDrivenProtocol):
        self.users.remove(socket)
        socket.room = None
    def broadcastEvent(self, event, *, skip=None, **data):
        skip = set(skip or [])
        for user in self._users:
            if user in skip or user.username in skip:
                continue
            user.sendEvent(event, data)



