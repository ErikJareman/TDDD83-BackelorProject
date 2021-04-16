#! /usr/bin/env python3.6
from flask import Flask
from flask import jsonify
from flask import abort
from flask.helpers import send_from_directory
from flask_jwt_extended.utils import get_jwt_identity
from flask_sqlalchemy import SQLAlchemy
from flask import request
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
from flask_cors import CORS
from enum import Enum
import os
import stripe
import json
from sqlalchemy.orm.session import Session

app = Flask(__name__, static_folder='../client/build', static_url_path="/")
CORS(app, support_credentials=True)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'kiejfuheirgyuhvbnjmwpejn'
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)


YOUR_DOMAIN = 'http://localhost:8080'
# Set your secret key. Remember to switch to your live secret key in production.
# See your keys here: https://dashboard.stripe.com/account/apikeys
stripe.api_key = 'sk_test_51IZucCC7I9l3XQtcbsm4nCGHg8byGU3YitOj6xxVY80wqxeJHNQHAzPx1w9wH9w2cNeLUk98dAEjYQPsZCkqekrv00lBBCQd9r'



configuration = stripe.billing_portal.Configuration.create(
  business_profile={
    'privacy_policy_url': YOUR_DOMAIN,
    'terms_of_service_url': YOUR_DOMAIN,
  },
  features={
    'invoice_history': {
      'enabled': True,
    },
  },
)

#USER CLASS
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, nullable=False)
    username = db.Column(db.String, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    
    def __repr__(self):
        return '<User {}: {} {} >'.format(self.id, self.email, self.username, self.password_hash)

    def serialize(self):
        d =  dict(id=self.id, email=self.email, username=self.username)
        d["is_premium"] = self.is_premium()
        return d

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf8")
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def is_premium(self):
        # TODO
        #if sats för premium/admin inför användartest
        if (self.email == 'admin@topq.se' or self.email == 'per@per.kalle'):
            return True

        return bool(School_Admin.query.filter_by(admin_email = self.email).first())

#SCHOOL CLASS
class School(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    sub_id = db.Column(db.String, nullable=True)
    max_admin = db.Column(db.Integer, default =0)
    
    def __repr__(self):
        return '<School {}: {} {} >'.format(self.id, self.name, self.email, self.password_hash, self.sub_id, self.max_admin)

    def serialize(self):
        sub_id=self.sub_id if self.sub_id else None
        return dict(id=self.id, name=self.name, email=self.email, sub_id=sub_id, max_admin=self.max_admin)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf8")
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

#SCHOOL/ADMIN RELATIONSHIP CLASS
class School_Admin(db.Model):
    school_id = db.Column(db.Integer, db.ForeignKey(
        'school.id'), nullable=False)
    admin_email = db.Column(db.String, db.ForeignKey(
        'user.email'), primary_key=True, nullable=False)

    def __repr__(self):
        return '<School_Admin{}: {} >'.format(self.school_id, self.admin_email)
    
    def serialize(self):
        return dict(school_id=self.school_id, admin_email=self.admin_email)



class Ticket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    room = db.Column(db.Integer, db.ForeignKey(
        'room.id'), nullable=False)
    creator = db.Column(db.Integer, db.ForeignKey(
        'user.id'), nullable=False)
    ticket_info = db.Column(db.String, nullable=True)
    ticket_zoom = db.Column(db.String, nullable=True)

    def __repr__(self):
        return f'<Ticket {self.id}: {self.room} {self.creator} {self.ticket_info} {self.ticket_zoom}>'

    def serialize(self):
        d = dict(id=self.id, ticket_info=self.ticket_info, ticket_zoom=self.ticket_zoom, room=self.room)
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




@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path>')
def catch_all(path):
    print(path)
    try:
        return app.send_static_file(path)
    except:
        return app.send_static_file("index.html")



@app.route('/customer-portal', methods=['POST'])
@jwt_required()
def customer_portal():
    data = json.loads(request.data)
    school_id = get_jwt_identity()['school']
    school = School.query.get(school_id)
    checkout_session_id = school.sub_id
    checkout_session = stripe.checkout.Session.retrieve(checkout_session_id)
    subscription = stripe.Subscription.retrieve(checkout_session.subscription)    
    session = stripe.billing_portal.Session.create(
        customer=checkout_session.customer,
        return_url=YOUR_DOMAIN + '/customer-page')
    return jsonify({'url': session.url})


@app.route('/update-school', methods=['POST'])
@jwt_required()
def update_school():         
    school_id = get_jwt_identity()['school']
    school = School.query.get(school_id)
    checkout_session_id = school.sub_id
    checkout_session = stripe.checkout.Session.retrieve(checkout_session_id)
    subscription = stripe.Subscription.retrieve(checkout_session.subscription)

    if subscription.plan.id=='price_1IZuh5C7I9l3XQtcrkJwn759':
        setattr(school, 'max_admin', 50)
    elif subscription.plan.id=='price_1IZuj4C7I9l3XQtctx3PtUWs':
        setattr(school, 'max_admin', 200)
    elif subscription.plan.id=='price_1IZujvC7I9l3XQtc72Uq6LU0':
        setattr(school, 'max_admin', 500)
    elif subscription.plan.id=='price_1IZul8C7I9l3XQtcLw7OrDIH':
        setattr(school, 'max_admin', 1000)
    else:
        setattr(school, 'max_admin', 0)
    db.session.commit()

    if (school.max_admin < School_Admin.query.filter_by(school_id = school_id).count() ):
        diff = School_Admin.query.filter_by(school_id = school_id).count() - school.max_admin
        const = 0
        for admin in School_Admin.query.filter_by(school_id = school_id):
            if const < diff:
                db.session.delete(admin)
                db.session.commit()
                const=const+1
            else:
                break
    return jsonify({'School': school.max_admin})

@app.route('/create-checkout-session', methods=['POST'])
@jwt_required()
def create_checkout_session():
    data = json.loads(request.data)
    try:
        checkout_session = stripe.checkout.Session.create(
            success_url=YOUR_DOMAIN + '/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url=YOUR_DOMAIN + '/cancel',
            payment_method_types=["card"],
            mode="subscription",
            line_items=[
                {
                    "price": data['priceId'],
                    "quantity": 1
                }
            ],
        )
        school_id = get_jwt_identity()['school']
        school = School.query.get(school_id)

        if data['priceId']=='price_1IZuh5C7I9l3XQtcrkJwn759':
            setattr(school, 'max_admin', 50)
        elif data['priceId']=='price_1IZuj4C7I9l3XQtctx3PtUWs':
            setattr(school, 'max_admin', 200)
        elif data['priceId']=='price_1IZujvC7I9l3XQtc72Uq6LU0':
            setattr(school, 'max_admin', 500)
        elif data['priceId']=='price_1IZul8C7I9l3XQtcLw7OrDIH':
            setattr(school, 'max_admin', 1000)
        setattr(school, 'sub_id', checkout_session['id'])
        db.session.commit()
        return jsonify({'sessionId': checkout_session['id']})
    except Exception as e:
        return jsonify({'error': {'message': str(e)}}), 400





Roles = Enum('Roles', 'Admin Regular')

#Login for Schools and Students/Tutors
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not 'email' in data or not 'password' in data:
        abort(401)

    email = data['email']
    password = data['password']

    user = User.query.filter_by(email=email).first()
    school = School.query.filter_by(email=email).first()

    if user is None and school is None:
        abort(401)

    if user is not None:
        if not user.check_password(password):
            abort(401)
        token = create_access_token({'user': user.id}, expires_delta=False)
        return jsonify({"token": token, "user": user.serialize()})

    elif school is not None:
        if not school.check_password(password):
            abort(401)
        token = create_access_token({'school': school.id}, expires_delta=False)
        return jsonify({"token": token, "school": school.serialize()})

#Register for Students/Tutors
@app.route('/register', methods=['POST'])
def sign_up():
    if request.method == 'POST':
        email = request.get_json(force=True)["email"]
        password = request.get_json(force = True)["password"]
        confirmedPassword = request.get_json(force = True)["confirmedPassword"]
        username = request.get_json(force=True)["username"]

        if not password == confirmedPassword:
            abort(401)

        new_user = User(email=email, username=username, password_hash=password)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify([new_user.serialize()])

#Register for Schools
@app.route('/registerschool', methods=['POST', 'GET'])
def sign_up_school():
    if request.method == 'POST':
        name = request.get_json(force=True)["name"]
        email = request.get_json(force = True)["email"]
        password = request.get_json(force=True)["password"]
        confirmedPassword = request.get_json(force = True)["confirmedPassword"]

        if not password == confirmedPassword:
            abort(401)
            
        new_school = School(name=name, email=email, password_hash=password)
        new_school.set_password(password)
        db.session.add(new_school)
        db.session.commit()
        print('kommer hit första regen')
        return jsonify([new_school.serialize()])
    elif request.method == 'GET':
        return jsonify([j.serialize() for j in School.query.all()])

#set or delete admin
@app.route('/school_admin', methods =['POST', 'DELETE', 'GET'])
@jwt_required()
def school_admin():
    school_id = get_jwt_identity()['school']
    #school_id = request.get_json(force = True)["school_id"]
    school = School.query.get(school_id)
    if request.method == 'POST':
        admin_email = request.get_json(force = True)["admin_email"]
        if (school.max_admin > School_Admin.query.filter_by(school_id = school_id).count() ):
            new_admin = School_Admin(school_id=school_id, admin_email=admin_email) 
            db.session.add(new_admin)
            db.session.commit()
            return jsonify([new_admin.serialize()])
        else: abort(404)
    elif request.method == 'DELETE': 
        admin_email = request.get_json(force = True)["admin_email"]
        if School_Admin.query.get(admin_email):
            admin = School_Admin.query.get(admin_email)
            db.session.delete(admin)
            db.session.commit()
            resp = jsonify(Sucess=True)
            return resp
        else: abort(404)
    elif request.method == 'GET':
      #  print(School_Admin.query.filter_by(school_id = school_id))
     #   return jsonify([j.serialize() for j in School_Admin.query.all()])
        return jsonify([j.serialize() for j in School_Admin.query.filter_by(school_id = school_id)])


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
    to_create = Ticket(creator=userID, room=data['room'], ticket_info=data['ticket_info'], ticket_zoom=data['ticket_zoom'])
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
        delete_tickets = Ticket.__table__.delete().where(Ticket.room == room_id)
        delete_roommembers = RoomMembers.__table__.delete().where(RoomMembers.room == room_id)
        db.session.execute(delete_tickets)
        db.session.execute(delete_roommembers)
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



@app.route('/promote-member', methods=['POST'])
@jwt_required()
def promoteMember():
    if request.method == 'POST':
        data = request.get_json()
        roomID = data['room']
        memberID = data['member']
        
        roomMemberToPromote = db.session.query(RoomMembers).filter(RoomMembers.user == memberID).filter(RoomMembers.room == roomID).first()
        roomMemberToPromote.role = Roles.Admin.name
        db.session.commit()
        
        return ''
    return ''


@app.route('/demote-member', methods=['POST'])
@jwt_required()
def demoteMember():
    if request.method == 'POST':
        data = request.get_json()
        roomID = data['room']
        memberID = data['member']
        
        roomMemberToDemote = db.session.query(RoomMembers).filter(RoomMembers.user == memberID).filter(RoomMembers.room == roomID).first()
        roomMemberToDemote.role = Roles.Regular.name
        db.session.commit()
        
        return ''
    return ''


@app.route('/delete-ticket', methods=['POST'])
@jwt_required()
def deleteTicket():
    if request.method == 'POST':
        data = request.get_json()
        ticketID = data['ticket']
        roomID = data['room']
        
        #nu ska vi alltså ta bort ticket med ticketID från rummet med id roomID

        #delete_ticket = .delete().where(Ticket.room == room_id)
        #db.session.execute(delete_ticket)
        delete_ticket = db.session.query(Ticket).filter(Ticket.id == ticketID).filter(Ticket.room == roomID).first()
        if delete_ticket is not None:
            db.session.delete(delete_ticket)
            db.session.commit()
        
    return 'test'

@app.route('/edit-ticket', methods=['POST'])
@jwt_required()
def editTicket():
    if request.method == 'POST':
        data = request.get_json()
        ticketID = data['ticket']
        roomID = data['room']
        ticket_info = data['info']
        edit_ticket = db.session.query(Ticket).filter(Ticket.id == ticketID).filter(Ticket.room == roomID).first()
        if edit_ticket is not None:
            setattr(edit_ticket, 'ticket_info', ticket_info)
            db.session.commit()
        
    return 'test'




def user_test_db():
    db.drop_all()
    db.create_all()   
    #fyller databasen inför användartest här
    #Rooms

    rum1 = Room(name='TSEA52 Digitalteknik')
    rum2 = Room(name='TATA69 Flervariabelanalys')
    db.session.add(rum1)
    db.session.add(rum2)
    db.session.commit()
    #Users
    user1 = User(email='per@per.per', username='Per',  password_hash='1')
    user2 = User(email='per@per.kalle', username='Kalle',  password_hash='1')
    user3 = User(email='per@per.ursula', username='Ursula',  password_hash='1')
    user4 = User(email='per@per.ming', username='Ming',  password_hash='1')
    user5 = User(email='per@per.fatima', username='Fatima',  password_hash='1')
    user6 = User(email='per@per.anna', username='Anna',  password_hash='1')
    user7 = User(email='per@per.findus', username='Findus',  password_hash='1')
    password_hash = bcrypt.generate_password_hash('admin').decode("utf8")
    testUserAdmin = User(email='admin@topq.se', username='Admin',  password_hash=password_hash)
    db.session.add(user1)
    db.session.add(user2)
    db.session.add(user3)
    db.session.add(user4)
    db.session.add(user5)
    db.session.add(user6)
    db.session.add(user7)
    db.session.add(testUserAdmin)
    db.session.commit()
    #RoomMembers
    roomMember1 = RoomMembers(user=user1.id, room=rum1.id, role=Roles.Regular.name)
    roomMember2 = RoomMembers(user=user2.id, room=rum1.id, role=Roles.Admin.name)
    roomMember3 = RoomMembers(user=user3.id, room=rum1.id, role=Roles.Regular.name)
    roomMember4 = RoomMembers(user=user4.id, room=rum2.id, role=Roles.Regular.name)
    roomMember5 = RoomMembers(user=user5.id, room=rum2.id, role=Roles.Admin.name)
    roomMember6 = RoomMembers(user=user6.id, room=rum2.id, role=Roles.Regular.name)
    roomMember7 = RoomMembers(user=user7.id, room=rum2.id, role=Roles.Admin.name)
    roomAdmin = RoomMembers(user=testUserAdmin.id, room=rum1.id, role=Roles.Admin.name)
    db.session.add(roomMember1)
    db.session.add(roomMember2)
    db.session.add(roomMember3)
    db.session.add(roomMember4)
    db.session.add(roomMember5)
    db.session.add(roomMember6)
    db.session.add(roomMember7)
    db.session.add(roomAdmin)
    #Tickets
    ticket1 = Ticket(creator=2, room=1, ticket_info='Help me!', ticket_zoom='https://zoom.us/')
    ticket2 = Ticket(creator=4, room=1, ticket_info='Task 3 problem', ticket_zoom='https://zoom.us/')
    ticket4 = Ticket(creator=4, room=2, ticket_info='Major struggle on 4b', ticket_zoom='https://zoom.us/')
    ticket5 = Ticket(creator=7, room=2, ticket_info='Help on #2', ticket_zoom='https://zoom.us/')
    ticket6 = Ticket(creator=7, room=1, ticket_info='Help me now!', ticket_zoom='https://zoom.us/')
    db.session.add(ticket1)
    db.session.add(ticket2)
    db.session.add(ticket4)
    db.session.add(ticket5)
    db.session.add(ticket6)
    #Lägg till adminkonto admin@topq.se

    #Add to sesh
    db.session.commit()
    # TODO
    # fixa admin@topq.se isPremium=TRUE + Lägg till några tickets


if __name__ == "__main__":
    app.run(debug=True)
  