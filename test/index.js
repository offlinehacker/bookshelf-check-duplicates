'use strict';

var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
var expect = require('chai').expect;

var bookshelf = require('bookshelf');
var knex = require('knex');

chai.use(chaiAsPromised);

describe('bookshelf transaction manager', function() {
  before(function() {
    this.knex = require('knex')({
      client: 'sqlite3', connection: { filename: ':memory:'}
    });
    this.bookshelf = require('bookshelf')(this.knex);
    this.bookshelf.plugin(require('../'));
  });

  before(function() {
    return this.knex.schema
      .createTable('users', function(table) {
        table.increments('id').primary();
        table.string('name').unique();
        table.string('email').unique();
      });
  });

  before(function() {
    var Model = this.bookshelf.Model;

    this.User = Model.extend({
      tableName: 'users',
      duplicates: ['name', 'email']
    });
  });

  before(function() {
    return this.User.forge({name: 'admin', email: 'admin@test.com'}).save();
  });

  it('should work normal on non duplicates', function() {
    expect(this.User.forge({name:'user'}).save()).to.be.eventually.fulfilled;
  });

  it('should throw error on duplicate', function() {
    expect(this.User.forge({name:'admin'}).save())
      .to.eventually.throw(
        this.bookshelf.Model.DuplicateError,
        'DuplicateError: name'
      );
  });
});
