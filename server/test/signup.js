const path = require('path');
const assert = require('assert');
const request = require('supertest');

const app = require('../app');
const User = require('../db/user');

const testName1 = 'test1';
const testName2 = 'test2';

describe('signup', function () {
  describe('POST /signup', function () {
    const agent = request.agent(app); // persist cookie when redirect
    beforeEach(function (done) {
      // 创建一个用户
      User.add({
        name: testName1,
        password: '123456',
        avatar: '假装有头像.jpg',
        gender: 'x',
        bio: '测试用户'
      }, done)
    });

    afterEach(function (done) {
      // 删除测试用户
      User.remove({ name: { $in: [testName1, testName2] } }, done)
    });

    after(function (done) {
      process.exit()
    });

    // 用户名错误的情况
    it('wrong name', function (done) {
      agent
        .post('/signup')
        .type('form')
        .field({ name: '' })
        .attach('file', path.join(__dirname, 'avatar.jpeg'))
        .redirects()
        .end(function (err, res) {
          if (err) return done(err);
          assert(/name(.)+ is not allowed to be empty/g.test(res.text), true);
          done()
        })
    });

    // 性别错误的情况
    it('wrong gender', function (done) {
      agent
        .post('/signup')
        .type('form')
        .field({ name: testName2, gender: 'a', bio: '123' })
        .attach('file', path.join(__dirname, 'avatar.jpeg'))
        .redirects()
        .end(function (err, res) {
          if (err) return done(err);
          assert(/gender&quot; must be one of/g.test(res.text), true);
          done()
        })
    });

    // 用户名被占用的情况
    it('duplicate name', function (done) {
      agent
        .post('/signup')
        .type('form')
        .field({ name: testName1, gender: 'm', bio: 'noder', password: '123456', repassword: '123456' })
        .attach('file', path.join(__dirname, 'avatar.jpeg'))
        .redirects()
        .end(function (err, res) {
          if (err) return done(err);
          assert(/用户名重复/g.test(res.text), true);
          done()
        })
    });

    // 注册成功的情况
    it('success', function (done) {
      agent
        .post('/signup')
        .type('form')
        .field({ name: testName2, gender: 'm', bio: 'noder', password: '123456', repassword: '123456' })
        .attach('file', path.join(__dirname, 'avatar.jpeg'))
        .redirects()
        .end(function (err, res) {
          if (err) return done(err);
          assert(/注册成功/g.test(res.text), true);
          done()
        })
    })
  })
});
