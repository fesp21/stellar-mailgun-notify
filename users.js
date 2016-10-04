var config = require('config');
var dbConfig = {};

// Build connection object based on type
switch(config.get('Database.type')){
	case 'mysql':
			dbConfig = {
				host     : config.get('Database.host'),
		    user     : config.get('Database.user'),
		    password : config.get('Database.password'),
		    database : config.get('Database.dbName')
		  };
		break;
	case 'pg':
			dbConfig = {
				host     : config.get('Database.host'),
		    user     : config.get('Database.user'),
		    password : config.get('Database.password'),
		    database : config.get('Database.dbName')
		  };
		break;
	case 'sqlite3':
			dbConfig = {
				filename : config.get('Database.filename')
		  };
		break;
	default:
}


// Connect to DB
var knex = require('knex')({
											client: config.get('Database.type'),
											connection: dbConfig

										});
var bookshelf = require('bookshelf')(knex);

var User = bookshelf.Model.extend({
  tableName: config.get('Database.tableName')
});

module.exports = User;
