const mongoose = require('mongoose');
const util = require('util');
const MUUID = require('uuid-mongodb');

function getter(binary) {

  if (binary == null) return undefined;
  if (!(binary instanceof mongoose.Types.Buffer.Binary)) return binary;

  return MUUID.from(binary).toString();

}

function SchemaUUID(path, options) {

  mongoose.SchemaTypes.Buffer.call(this, path, options);

  this.getters.push(getter);

}

util.inherits(SchemaUUID, mongoose.SchemaTypes.Buffer);

SchemaUUID.schemaName = 'UUID';

SchemaUUID.prototype.checkRequired = function checkRequired(value) {

  return value instanceof mongoose.Types.Buffer.Binary;

};

SchemaUUID.prototype.cast = function cast(value, doc, init) {

  if (value instanceof mongoose.Types.Buffer.Binary) {

    if (init && doc instanceof mongoose.Types.Embedded) {

      return getter(value);
    
    }
    return value;
  
  }

  if (typeof value === 'string') {

    return MUUID.from(value);

  }

  throw new Error(`Could not cast ${value} to UUID.`);

};

SchemaUUID.prototype.castForQuery = function castForQuery($conditional, val) {

  let handler;

  if (arguments.length === 2) {

    handler = this.$conditionalHandlers[$conditional];

    if (!handler) {

      throw new Error(`Can't use ${$conditional} with UUID.`);
    
    }

    return handler.call(this, val);
  
  }

  return this.cast($conditional);

};

module.exports = function MongoosesUUID(mongooseInstance) {

  mongoose.Types.UUID = SchemaUUID;
  mongooseInstance.SchemaTypes.UUID = SchemaUUID;

};

module.exports.UUID = SchemaUUID;