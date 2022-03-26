from sqlalchemy import Column, String, Table, ForeignKey, Integer, Boolean

from acejs_collab_server.server.database.db import BaseModel, engine

from sqlalchemy.orm import relationship,  sessionmaker

from acejs_collab_server.server.verify_tokens import verify_google_token

Session = sessionmaker(bind=engine)

class User(BaseModel):
    __tablename__ = 'user'
    id = Column(String(255), primary_key=True)
    email = Column(String(255))
    active = Column(Boolean,default=True)
    @staticmethod
    def google_login(token):
        info = verify_google_token(token)
        print("GOT INFO?")
        with Session() as s:
            user = s.query(User).filter_by(id=info['id']).first()
    # RelationShips
    room_memberships = relationship("UserToRoomAssociation", back_populates="user")
    def rooms(self):
        return [m.room for m in self.room_memberships]
    def __str__(self):
        return f"<db.User  id={self.id!r} name={self.email!r}) >"
    def __repr__(self):
       return str(self)

class UserToRoomAssociation(BaseModel):
    __tablename__ = 'user_to_room_association'
    user_id = Column(String, ForeignKey('user.id'), primary_key=True)
    room_id = Column(String, ForeignKey('room.name'), primary_key=True)
    is_admin = Column(Boolean)
    user = relationship("User", back_populates="room_memberships")
    room = relationship("Room", back_populates="memberships")
    def __repr__(self):
        return str(self)
    def __str__(self):
        label = 'Admin' if self.is_admin else 'User'
        return f"<Room{label} user={self.user.email}  room={self.room.name}>"

class Room(BaseModel):
    __tablename__ = 'room'
    name = Column(String(255), primary_key=True)
    memberships = relationship("UserToRoomAssociation", back_populates="room")

    @staticmethod
    def create(session,name,owner:User):
        r = Room(name=name)
        session.add(r)
        a = UserToRoomAssociation(room=r,user=owner,is_admin=True)
        session.add(a)
        session.add(owner)
        return r
    def add_user(self,session,user:User,is_admin=False):
        a = UserToRoomAssociation(room=self,user=user,is_admin=is_admin)
        session.add(a)

    def add_admin(self,session,user):
        return self.add_user(session,user,True)
    def users(self):
        users = list(self.room_memberships.query.all())
        return [u.user for u in users]
    def admin(self):
        return next(u.user for u in self.memberships if u.is_admin)
    def __str__(self):
        return f"<Room users={len(self.memberships.count())}  owner={self.admin().email}>"
    def __repr__(self):
        return str(self)

if __name__ == "__main__":
    BaseModel.metadata.create_all(engine)
    u = User(email="joran@metergroup.com",id="asd")
    u2 = User(email="joran@metergroup2.com",id="as2d")
    with Session() as s:
        room = Room.create(s,"test1",u)
        room.add_user(s,u2)
        s.commit()
    with Session() as s:
        r = s.query(Room).first()
        print(r.memberships)
        s.commit()

    # email_address = Column(String, nullable=False)
    # user_id = Column(Integer, ForeignKey('user_account.id'))

    # def __repr__(self):
    #     return f"Address(id={self.id!r}, email_address={self.email_address!r})"
