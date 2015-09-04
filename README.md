# Bookshelf check duplicates

Bookshelf plugin that checks for duplicates in a database.

## Installation

    npm install bookshelf-check-duplicates

Then in your bookshelf configuration:

    var bookshelf = require('bookshelf')(knex);
    bookshelf.plugin(require('bookshelf-check-duplicates');

## Usage

Define bookshelf model with additional attributes


    var User = bookshelf.Model.extend({
      tableName: 'users',
      duplicates: ['name']
    });

    User.forge({name: 'admin'}).save().then(function(admin) {
      User.forge({name: 'user'}).save().catch(function(err) {
        assert(err instanceof bookshelf.Model.DuplicateError);
      });
    });

Whenever model is saved `validateDuplicates` will check if there's already a
saved model with same value of speciffied fields, and if there is
`bookshelf.Model.DuplicateError` error will be thrown.

## License

[MIT](https://opensource.org/licenses/MIT)

## Author

[offlinehacker](https://github.com/offlinehacker)
