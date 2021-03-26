#! /usr/bin/env python3.6
from flask import Flask
from flask import jsonify
from flask import abort
from flask_jwt_extended.utils import get_jwt_identity
from flask_sqlalchemy import SQLAlchemy
from flask import request
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
from flask_cors import CORS
from enum import Enum
import os
import stripe
from sqlalchemy.orm.session import Session

app = Flask(__name__, static_folder='../client/build', static_url_path='/')
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'kiejfuheirgyuhvbnjmwpejn'
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)


# This is a sample test API key. Sign in to see examples pre-filled with your key.
stripe.api_key = 'sk_test_4eC39HqLyjWDarjtT1zdp7dc'

YOUR_DOMAIN = 'http://localhost:8080'

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price_data': {
                        'currency': 'sek',
                        'unit_amount': 2000,
                        'product_data': {
                            'name': 'Stubborn Attachments',
                            'images': ['https://i.imgur.com/EHyR2nP.png'],
                        },
                    },
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url=YOUR_DOMAIN + '/success',
            cancel_url=YOUR_DOMAIN + '/cancel',
        )
        return jsonify({'id': checkout_session.id})

    except Exception as e:
        return jsonify(error=str(e)), 403




Roles = Enum('Roles', 'Admin Regular')

#USER CLASS
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, nullable=False)
    username = db.Column(db.String, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    is_admin = db.Column(db.Boolean, default = False)
    
    def __repr__(self):
        return '<User {}: {} {} >'.format(self.id, self.email, self.username, self.password_hash, self.is_admin)

    def serialize(self):
        return dict(id=self.id, email=self.email, username=self.username, is_admin=self.is_admin)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf8")
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)


class Ticket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    room = db.Column(db.Integer, db.ForeignKey(
        'room.id'), nullable=False)
    creator = db.Column(db.Integer, db.ForeignKey(
        'user.id'), nullable=False)

    ticket_info = db.Column(db.String, nullable=True)

    def __repr__(self):
        return f'<Ticket {self.id}: {self.room} {self.creator} {self.ticket_info}>'

    def serialize(self):
        d = dict(id=self.id, ticket_info=self.ticket_info, room=self.room)
        d['creator'] = User.query.get(self.creator).serialize()
        return d

class RoomMembers(db.Model):
    user = db.Column(db.Integer, db.ForeignKey(
        'user.id'), primary_key=True, nullable=False)
    room = db.Column(db.Integer, db.ForeignKey(
        'room.id'), primary_key=True, nullable=False)
    role = db.Column(db.String, nullable=False)
    
    def __repr__(self):
        return f'<RoomMembers {self.user} {self.room} {self.role}>'


class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    tickets = db.relationship('Ticket', backref=db.backref(
        "Room"))

    def serialize(self, populate=True):
        d = dict(id=self.id, name=self.name)
        d['tickets'] = [ ticket.serialize() for ticket in Ticket.query.filter_by(room=self.id)]
        d['members'] = [ user.serialize() for user in db.session.query(User).join(RoomMembers).filter(RoomMembers.user == User.id).filter(RoomMembers.room == self.id).filter(RoomMembers.role == Roles.Regular.name).all()]
        d['admins'] = [ user.serialize() for user in db.session.query(User).join(RoomMembers).filter(RoomMembers.user == User.id).filter(RoomMembers.room == self.id).filter(RoomMembers.role == Roles.Admin.name).all()]

        return d
    
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not 'email' in data or not 'password' in data:
        abort(401)

    email = data['email']
    password = data['password']

    user = User.query.filter_by(email=email).first()

    if user is None or not user.check_password(password):
        abort(401)

    # TODO, make token expire
    token = create_access_token({'user': user.id}, expires_delta=False)
    return jsonify({"token": token, "user": user.serialize()})


@app.route('/register', methods=['POST'])
def sign_up():
    if request.method == 'POST':
        email = request.get_json(force=True)["email"]
        password = request.get_json(force = True)["password"]
        username = request.get_json(force=True)["username"]
        new_user = User(email=email, username=username, password_hash=password)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify([new_user.serialize()])


@app.route('/users', methods=['GET'])
#@jwt_required()
def users():
    if request.method == 'GET':
        return jsonify([j.serialize() for j in User.query.all()]) 

        
@app.route('/users/<int:user_id>', methods =['GET', 'PUT', 'DELETE'])
@jwt_required()
def usersid(user_id):
    if User.query.get(user_id):
        user = User.query.get(user_id) 
    else: abort(404)
    if request.method == 'GET':
        return jsonify((user.serialize()))
    elif request.method == 'PUT':
        req_data = request.get_json()
        for key, value in req_data.items():
            if key !="id": 
                setattr(user, key, value)
        db.session.commit()
        return jsonify([user.serialize()])
    elif request.method == 'DELETE':
        db.session.delete(user)
        db.session.commit()
        resp = jsonify(Sucess=True)
        return resp

 
def add_ticket(data: dict, userID: int):
    to_create = Ticket(creator=userID, room=data['room'], ticket_info=data['ticket_info'])
    db.session.add(to_create)
    db.session.commit()
    return jsonify(to_create.serialize())


@app.route('/tickets', methods=['POST'])
@jwt_required()
def create_ticket():
    userID = get_jwt_identity()['user']
    if request.method == 'POST':
       return add_ticket(request.get_json(), userID) 


def join_room(room_id: int, user_id: int, role: Roles):
    new_member = RoomMembers(room=room_id, user=user_id, role=role.name)
    db.session.add(new_member)
    db.session.commit()

def create_room(data: dict, creator: int):
    new_room = Room(name=data['name'])
    db.session.add(new_room)
    db.session.commit()

    join_room(new_room.id, creator, Roles.Admin)
    
    return jsonify(new_room.serialize())


@app.route('/rooms', methods=['GET', 'POST'])
@jwt_required()
def rooms():
    user_id = get_jwt_identity()['user']
    if request.method == 'POST':
        return create_room(request.get_json(), user_id)

    elif request.method == 'GET':

        target_rooms = db.session.query(Room).join(RoomMembers).filter(RoomMembers.user == user_id).filter(Room.id == RoomMembers.room).all()
        return jsonify([room.serialize() for room in target_rooms])


def member_of_room(room: int, user: int):
    return db.session.query(RoomMembers).filter(RoomMembers.user == user).filter(RoomMembers.room == room).first()


@app.route('/rooms/<int:room_id>', methods=['GET', 'DELETE'])
@jwt_required()
def room(room_id: int):
    targetRoom = Room.query.get(room_id)
    user_id = get_jwt_identity()['user']
    if targetRoom is None:
        abort(404)
    
    if request.method == 'GET':
        member = member_of_room(room_id, user_id)
        joined = False
        if member is None:
            join_room(room_id, user_id, Roles.Regular)
            joined = True
        return jsonify({'room': targetRoom.serialize(), 'joined': joined})

    elif request.method == 'DELETE':
        db.session.delete(targetRoom)
        delete_q = Ticket.__table__.delete().where(Ticket.room == room_id)
        db.session.execute(delete_q)
        
        db.session.commit()
        return ''
    


@app.route('/leave-room/<int:room_id>', methods=['POST'])
@jwt_required()
def leave_room(room_id: int):
    user_id = get_jwt_identity()['user']
    if request.method == 'POST':
        member = member_of_room(room_id, user_id)
        if member is not None:
            db.session.delete(member)
            db.session.commit()
            return 'left room'
        return 'not member'


@app.route('/', methods=['GET'])
def client():
    return app.send_static_file("index.html")

if __name__ == "__main__":
    app.run(debug=True)