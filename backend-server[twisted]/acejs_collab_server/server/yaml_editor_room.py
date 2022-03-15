import multiprocessing
import os
import traceback
from itertools import cycle
from typing import List

from acejs_collab_server.server.base_server import UserRoom

spec0 = open(os.path.join(os.path.dirname(__file__), "..", "initial_yaml", "bacon.yaml")).read()
write_lock = multiprocessing.Lock()
tmpdir = os.path.expanduser("./.yaml_store/")
dirname = os.environ.get('YAML_SAVE_PATH', tmpdir)
if not os.path.exists(dirname):
    os.makedirs(dirname)

class Document:
    """

    >>> d = Document("asd")
    >>> action0 = {"action":"insert","start":{"row":0,"column":0},"end":{"row":0,"column":1},"lines":["Hello"]}
    >>> d.applyChange(action0)
    >>> d.getContent()
    'Helloasd'
    >>> action2 = {**action0}
    >>> action2['action'] = 'remove'
    >>> action2['lines'] = ['H']
    >>> d.applyChange(action2)
    >>> d.getContent()
    """
    def __init__(self,content=''):
        self._content = content
        self._lines = self._content.splitlines()
    def setContent(self,content):
        self._content = content
        self._lines = self._content.splitlines
    def getContent(self):
        return self._content
    def ACTION_remove(self,change):
        """
        >>> d = Document("Hello\\nworld this is just an example\\nRock ON!")
        >>> action0 = {"action":"remove","start":{"row":0,"column":3},"end":{"row":0,"column":4},"lines":["l"]}
        >>> d.applyChange(action0)
        >>> d.getContent()
        'Helo\\nworld this is just an example\\nRock ON!'
        >>> action0['end']['row'] = 1
        >>> action0['lines'] = ['lo','wor']
        >>> d.applyChange(action0)
        >>> d.getContent()
        'Held this is just an example\\nRock ON!'

        :param change:
        :return:
        """
        # print("REMOVE Change:",change)
        line_start = change['start']['row']
        tmp_line_before = self._lines[line_start][:change['start']['column']]
        tmp_line_after = self._lines[line_start][change['start']['column']:]
        line_end = change['end']['row']
        tmp_line2_before = self._lines[line_end][:change['end']['column']]
        tmp_line2_after = self._lines[line_end][change['end']['column']:]
        if len(change['lines']) == 1:
            change['lines'] = [tmp_line_before + tmp_line2_after]
        else:
            change['lines'] = [tmp_line_before + tmp_line2_after]
        self._replaceLines(line_start,line_end,change['lines'])

    def ACTION_insert(self,change):
        """
        >>> d = Document("Hello\\nworld this is just an example\\nRock ON!")
        >>> action0 = {"action":"insert","start":{"row":0,"column":3},"end":{"row":0,"column":4},"lines":["l"]}
        >>> d.applyChange(action0)
        >>> d.getContent()
        'Helllo\\nworld this is just an example\\nRock ON!'
        >>> action0['end']['row'] = 1
        >>> action0['lines'] = ['lo','wor']
        >>> d.applyChange(action0)
        >>> d.getContent()
        'Hello\\nworllo\\nworld this is just an example\\nRock ON!'

        :param change:
        :return:
        """
        # print("INSERT Change:",change)
        line_start = change['start']['row']
        tmp_line_before = self._lines[line_start][:change['start']['column']]
        tmp_line_after = self._lines[line_start][change['start']['column']:]
        if len(change['lines']) == 1:
            change['lines'] = [tmp_line_before + change['lines'][0] +tmp_line_after]
        else:
            change['lines'][0] = tmp_line_before + change['lines'][0]
            change['lines'][-1] = change['lines'][-1] + tmp_line_after
        self._replaceLines(line_start,line_start,change['lines'])
        # tmp_line_end = change['end']['row']
    def _replaceLines(self,line_start,line_end,new_lines):
        self._lines[line_start:line_start + 1] = new_lines
        self._content = "\n".join(self._lines)

    def applyChange(self,change):
        try:
            getattr(self,f"ACTION_{change['action']}")(change)
        except:
            traceback.print_exc()
            print("ERROR APPLY CHANGE:",change)
class EditorRoom(UserRoom):
    name = ''
    users = []

    def __contains__(self, item):
        if isinstance(item, str):
            return
        return item in self._users

    def __init__(self, name):
        print("START CREATE:",name)
        self._users = []
        self._content = None
        self.name = name
        self._fpath = os.path.join(dirname, f'{name}.yml')
        self._save_counter = 0
        print("OK?? ROOM CREATE?")
    def applyChange(self,c):
        self._content.applyChange(c)

    @property
    def content(self):
        if self._content is None:
            try:
                with open(self._fpath, 'r') as f:
                    self._content = Document(f.read())
            except Exception as e:
                print(f"WARNING: {e}\n * Using BaconAPI Fallback")
                self._content = Document(spec0)
        return self._content.getContent()

    @content.setter
    def content(self, value):
        self._content.setContent(value)
        if self._save_counter > 5:
            self._save_counter = 0
            write_lock.acquire()
            try:
                print(f"SAVE FILE: {self._fpath}\n" * 10)
                with open(self._fpath, "w") as f:
                    f.write(self._content)
            finally:
                write_lock.release()
        self._save_counter += 1

    @property
    def users(self):
        return self._users
    def addUser(self,user):
        user.room = self
        user.user_info['color'] = colors[len(self)%len(colors)]
        self._users.append(user)

    def get_userinfos(self):
        return [u.user_info for u in self._users]

    def to_dict(self):
        return {"name": self.name, "users": self.get_userinfos(), 'content': self.content}

    def __len__(self):
        return len(self._users)

    def isEmpty(self):
        return len(self) == 0

    def __str__(self):
        return f"<Room [{len(self)} users] {self.name} />"
    def removeUser(self,user):
        self._users = [u for u in self._users if (user != u and user != u.username)]

    def broadcastEvent(self, event,*, skip=None, **data):
        skip = set(skip or [])
        for user in self._users:
            if user in skip or user.username in skip:
                continue
            # print("SEND:",user.user_info['email'],data)
            user.sendEvent(event, data)

colors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a']
class Rooms:
    # helper container to manage rooms
    _rooms: List[EditorRoom] = {}

    @staticmethod
    def onConnect(user):
        try:
            room = user.user_info['room_name']
        except Exception as e:
            print("ERROR:",e)
            traceback.print_exc()
            raise Exception(f'Error accessing room info: {e}')
        if not Rooms._rooms.get(room):
            print("Create Room:",room)
            Rooms._rooms[room] = EditorRoom(room)
        print("ADD USER:",room)
        Rooms._rooms[room].addUser(user)

    @staticmethod
    def onDisconnect(user):
        print("DISCONNECT USER!@#")
        try:
            room = user.room
        except Exception as e:
            print("Error getting user.room durring disconnect: ",str(e))
            traceback.print_exc()
            room = None
        if room is None:
            print("No Room!!")
            return None
        room.removeUser(user)
        user.user_info['room'] = None
        user.user_info['room_name'] = 'none'
        print(f"Removed User From Room '{room}': ", user.user_info)
        if room.isEmpty():
            Rooms._rooms.pop(room.name)
            print("Room Is Empty Removing", room)

