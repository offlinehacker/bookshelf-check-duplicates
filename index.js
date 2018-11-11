'use strict';

var Promise = require('bluebird');
var _ = require('lodash');

function DuplicateError(field) {
    this.name = 'DuplicateError';
    this.message = 'DuplicateError: ' + field;
    this.field = field;
}
DuplicateError.prototype = Object.create(Error.prototype);

module.exports = function (bookshelf) {
  var Model = bookshelf.Model;

  bookshelf.Model = Model.extend({

    constructor: function() {
      Model.apply(this, arguments);

      this.schema = this.schema || {};

      if (this.duplicates) {
        this.on('saving', this.validateDuplicates, this);
      }
    },

    /**
     * Validates for duplicates
     * @throws {DuplicateError}
     */
    validateDuplicates: function() {
      var self = this;

      return Promise.all(_.map(self.duplicates, function(field) {
        var q = bookshelf.knex(self.tableName);
        if (self._transaction) {
          q = q.transacting(self._transaction);
        }

        q =  q.where(field, self.get(field));

        if (!_.isUndefined(self.id)) {
          q = q.andWhereNot('id', self.id);
        }

        return q
          .count('* AS count')
          .limit(1)
          .then(function(result) {
            if (result && result[0].count > 0) {
              throw new DuplicateError(field);
            }
          });
      }));
    }
  });

  bookshelf.Model.DuplicateError = DuplicateError;
};
