module.exports = function(session){
  var Store = session.Store;
  var Error = require('errno-codes');


  function ParseStore(options) {
    options = options || {};
    Store.call(this, options);

    if (options.client) {
      this.client = options.client

    } else if (options.parseAppId && options.parseJavascriptKey) {
      this.client = require('parse').Parse;
      this.client.initialize(options.parseAppId, options.parseJavascriptKey);

    } else {
      throw new Error('Missing Parse client');
    }

    this.ttl =  options.ttl;

    this.parseClassName = options.parseClassName || 'Session';
  }


  ParseStore.prototype.__proto__ = Store.prototype;


  ParseStore.prototype.get_ = function(id, callback) {
    var self = this;
    var Session = this.client.Object.extend(this.parseClassName);
    var query = new this.client.Query(Session);

    query.equalTo('identity', id);
    query.first().then(function(foundSession) {
      if (!foundSession) {
        callback(Error.get(Error.ENOENT));

      } else if (foundSession.get('destroyAt') < new Date()) {
        self.destroy(foundSession)
        callback(Error.get(Error.ENOENT));

      } else {
        callback(null, foundSession);
      }

    }, callback);
  };


  ParseStore.prototype.get = function(id, callback) {
    this.get_(id, function(error, foundSession) {
      callback(error, foundSession ? foundSession.get('data') : null);
    });
  };


  ParseStore.prototype.set = function(id, session, callback) {
    var self = this;

    this.get_(id, function(error, foundSession) {
      if (error) {
        var Session = self.client.Object.extend(self.parseClassName);
        var newSession = new Session();
        var destroyAt = new Date();

        if (!self.ttl) {
          if (typeof session.cookie.maxAge === 'number') {
            self.ttl = session.cookie.maxAge / 1000 | 0;

          } else {
            self.ttl = 86400;
          }
        }

        destroyAt.setSeconds(destroyAt.getSeconds() + self.ttl);

        newSession.set('identity', id);
        newSession.set('data', session);
        newSession.set('destroyAt', destroyAt);

        newSession.save().then(function(newSession) {
          callback(null, newSession.get('data'));

        }, callback);

      } else {
        callback(null, foundSession.get('data'));
      }
    });
  };


  ParseStore.prototype.destroy_ = function(session, opt_callback) {
    opt_callback = opt_callback || function() {};

    session.destroy().then(function() {
      console.log(arguments);
      opt_callback(null);

    }, opt_callback);
  };


  ParseStore.prototype.destroy = function(session, callback) {
    if (typeof session === 'object') {
      this.destroy_(session, callback);

    } else {
      this.get_(session, function (error, foundSession) {
        if (error) {
          callback(error);
          return;
        }

        foundSession.destroy().then(function () {
          callback(null);

        }, callback);
      });
    }
  };


  return ParseStore;
};
