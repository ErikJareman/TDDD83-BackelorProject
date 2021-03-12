from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__, static_folder='../client/build', static_url_path='/')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


@app.route('/', methods=['GET'])
def client():
    return app.send_static_file("index.html")

if __name__ == "__main__":
    app.run(debug=True)


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
    

#Skapa en kö-ticket
@app.route('/create_ticket', methods=['POST'])
def create_ticket():
    if request.method == 'POST':
        email = request.get_json(force=True)["email"]
        password = request.get_json(force = True)["password"]
        username = request.get_json(force=True)["username"]
        new_user = User(email=email, username=username, password_hash=password)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify([new_user.serialize()])
