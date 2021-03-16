from flask import Flask
from flask import jsonify
from flask import abort
from flask_jwt_extended.utils import get_jwt_identity
from flask_sqlalchemy import SQLAlchemy
from flask import request
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
from flask_cors import CORS

app = Flask(__name__, static_folder='../client/build', static_url_path='/')
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'kiejfuheirgyuhvbnjmwpejn'
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)


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


class Ticket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    tag_1 = db.Column(db.String, nullable=True)
    tag_2 = db.Column(db.String, nullable=True)
    tag_3 = db.Column(db.String, nullable=True)
    tag_4 = db.Column(db.String, nullable=True)
    ticket_info = db.Column(db.String, nullable=True)

    def __repr__(self):
        return '<Ticket {}: {} {} {} {} {} {}>'.format(self.id, self.name, self.tag_1, self.tag_2, self.tag_3, self.tag_4, self.ticket_info)

    def serialize(self):
        return dict(ticket_number=self.id, name=self.name, tag_1=self.tag_1, tag_2=self.tag_2, tag_3=self.tag_3, tag_4=self.tag_4, ticket_info=self.ticket_info)


class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)

    def serialize(self, populate=True):
        d = dict(id=self.id, name=self.name)

        return d
    
@app.route('/login', methods=['POST'])
def login():
    if request.method == 'POST':
        email = request.get_json(force=True)["email"]
        password = request.get_json(force = True)["password"]
        for user in User.query.all(): 
            if user.email==email:
                if bcrypt.check_password_hash(user.password_hash, password):
                     token = create_access_token({'user': user.id})
                     return dict(token = token, user = user.serialize())
        else: abort(401)


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



@app.route('/', methods=['GET'])
def client():
    return app.send_static_file("index.html")
    

#Skapa en kö-ticket
@app.route('/create_ticket', methods=['POST'])
def create_ticket():
    if request.method == 'POST':
        name = request.get_json(force=False)['name']
        tag_1 = request.get_json(force=True)['tag_1']
        tag_2 = request.get_json(force=True)['tag_2']
        tag_3 = request.get_json(force=True)['tag_3']
        tag_4 = request.get_json(force=True)['tag_4']
        ticket_info = request.get_json(force=True)['ticket_info']
        new_ticket = Ticket(name=name, tag_1=tag_1, tag_2=tag_2, tag_3=tag_3, tag_4=tag_4, ticket_info=ticket_info)
        db.session.add(new_ticket)
        db.session.commit()
        return jsonify([new_ticket.serialize()])


def create_room(data: dict):
    to_create = Room(name=data['name'])
    db.session.add(to_create)
    db.session.commit()
    return jsonify(to_create.serialize())

@app.route('/rooms', methods=['GET', 'POST'])
def rooms():
    user_id = get_jwt_identity()['user']
    # TODO add filter for user_id
    if request.method == 'POST':
        return create_room(request.get_json())

    elif request.method == 'GET':
        return jsonify([room.serialize() for room in Room.query.all()])

@app.route('/rooms/<int:room_id>', methods=['GET'])
def room(room_id: int):
    targetRoom = Room.query.get(room_id)
    if targetRoom is None:
        abort(404)
    
    return jsonify(targetRoom.serialize())



if __name__ == "__main__":
    app.run(debug=True)