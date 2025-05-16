const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const User = require('../models/User');

chai.should();
chai.use(chaiHttp);

describe('Auth API', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /v1/auth/signup', () => {
    it('should register a new user', (done) => {
      const user = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };
      
      chai.request(server)
        .post('/v1/auth/signup')
        .send(user)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('status').eql(true);
          res.body.content.data.should.have.property('email').eql(user.email);
          done();
        });
    });

    it('should not register a user with invalid email', (done) => {
      const user = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      };
      
      chai.request(server)
        .post('/v1/auth/signup')
        .send(user)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property('status').eql(false);
          done();
        });
    });
  });

  describe('POST /v1/auth/signin', () => {
    it('should login an existing user', (done) => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      
      user.save().then(() => {
        chai.request(server)
          .post('/v1/auth/signin')
          .send({ email: 'test@example.com', password: 'password123' })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.property('status').eql(true);
            res.body.content.meta.should.have.property('access_token');
            done();
          });
      });
    });

    it('should not login with wrong password', (done) => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      
      user.save().then(() => {
        chai.request(server)
          .post('/v1/auth/signin')
          .send({ email: 'test@example.com', password: 'wrongpassword' })
          .end((err, res) => {
            res.should.have.status(400);
            res.body.should.have.property('status').eql(false);
            done();
          });
      });
    });
  });
}); 