'use strict';

// ## Module Dependencies
var _ = require('lodash');
var sw = require('swagger-node-express');
var utils = require('../../utils');

// ## Models
var Skill = require('../../models/skills');

var param = sw.params;
var swe = sw.errors;

// ## Helpers
var _prepareParams = function (req) {
  var params = req.body;

  params.id = (req.params && req.params.id) || (req.body && req.body.id);

  // // Create normalized name
  // if (params.name) {
  //   params.normalized = utils.urlSafeString(params.name);
  // }

  // // Create ID if it doesn't exist
  // if (!params.id) {
  //   params.id = utils.createId(params);
  // }

  return params;
};

// callback helper function
// 
// This is meant to be bound to a new function within the endpoint request callback
// using _partial(). The first two parameters should be provided by the request callback 
// for the endpoint this is being used in.
//
// Example:
//
// action: function(req, res) {
//   var errLabel = 'Route: POST /skills';
//   var callback = _.partial(_callback, res, errLabel);
// }
var _callback = function (res, errLabel, err, results, queries) {
  var start = new Date();

  if (err || !results) {
    if (err) console.error(errLabel + ' ', err);
    swe.invalid('input', res);
    return;
  }

  utils.writeResponse(res, results, queries, start);
};

// ## API Specs

// Route: GET '/skills'
exports.list = {

  spec: {
    description : 'List all skills',
    path : '/skills',
    method: 'GET',
    summary : 'Find all skills',
    notes : 'Returns all skills',
    type: 'object',
    items: {
      $ref: 'Skill'
    },
    produces: ['application/json'],
    parameters : [],
    responseMessages: [swe.notFound('skills')],
    nickname : 'getSkills'
  },

  action: function (req, res) {
    var options = {};
    var errLabel = 'Route: GET /skills';
    var callback = _.partial(_callback, res, errLabel);
    
    options.neo4j = utils.existsInQuery(req, 'neo4j');

    Skill.getAll(null, options, callback);
  }
};


// Route: POST '/skills'
exports.addSkill = {
  
  spec: {
    path : '/skills',
    notes : 'adds a skill to the graph',
    summary : 'Add a new skill to the graph',
    method: 'POST',
    type : 'object',
    items : {
      $ref: 'User'
    },
    parameters : [
      param.form('name', 'Skill name. A normalized id will be created from this.', 'string', true),
    ],
    responseMessages : [swe.invalid('input')],
    nickname : 'addSkill'
  },

  action: function(req, res) {
    var options = {};
    var params = {};
    var errLabel = 'Route: POST /skills';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    Skill.create(params, options).done(function (results) {
      callback(null, results.results, results.queries);
    });
  }
};


// Route: POST '/skills/batch'
exports.addSkills = {
  
  spec: {
    path : '/skills/batch',
    notes : 'add skills to the graph',
    summary : 'Add multiple skills to the graph',
    method: 'POST',
    type : 'object',
    parameters : [
      param.form('list', 'Array of skill object JSON strings', 'array', true),
    ],
    responseMessages : [swe.invalid('list')],
    nickname : 'addSkills'
  },

  action: function(req, res) {
    var options = {};
    var params = req.body;
    var errLabel = 'Route: POST /skills/batch';
    var callback = _.partial(_callback, res, errLabel);
    var list = JSON.parse(params.list);

    if (!list.length) throw swe.invalid('list');

    // @TODO 
    // should probably check to see if all skill objects contain the minimum
    // required properties and stop if not.
    list = _.map(list, function (skill) {
      return _prepareParams({body: skill});
    });

    options.neo4j = utils.existsInQuery(req, 'neo4j');

    Skill.createMany({list:list}, options).done(function (results) {
      callback(null, results);
    });

    // Skill.createMany({list:list}, options, callback);
  }
};


// Route: DELETE '/skills'
exports.deleteAllSkills = {
  spec: {
    path: '/skills',
    notes: 'Deletes all skills and their relationships',
    summary: 'Delete all skills',
    method: 'DELETE',
    type: 'object',
    nickname : 'deleteAllSkills'
  },

  action: function (req, res) {
    var options = {};
    var errLabel = 'Route: DELETE /skills';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');

    Skill.deleteAllSkills(null, options, callback);
  }
};


// Route: GET '/skills/:id'
exports.findById = {
  
  spec: {
    description : 'find a skill',
    path : '/skills/{id}',
    notes : 'Returns a skill based on id',
    summary : 'Find skill by id',
    method: 'GET',
    parameters : [
      param.path('id', 'ID of skill that needs to be fetched', 'string'),
    ],
    type : 'Skill',
    responseMessages : [swe.invalid('id'), swe.notFound('skill')],
    nickname : 'getSkillById'
  },

  action: function (req, res) {
    var id = req.params.id;
    var options = {};
    var params = {};

    if (!id) throw swe.invalid('id');

    var errLabel = 'Route: GET /skills/{id}';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    Skill.getById(params, options, callback);
  }
};

// Route: POST '/skills/:id'
exports.updateById = {

  spec: {
    path: '/skills/{id}',
    notes: 'Updates an existing skill',
    summary: 'Update a skill',
    method: 'POST',
    type: 'object',
    items: {
      $ref: 'Skill'
    },
    parameters : [
      param.path('id', 'ID of skill that needs to be fetched', 'string'),
      param.form('name', 'Skill name. A normalized id will be created from this.', 'string', true),
    ],
    responseMessages : [swe.invalid('input')],
    nickname : 'updateSkill'
  },

  action: function (req, res) {
    var id = req.params.id;
    var options = {};
    var params = {};

    if (!id) throw swe.invalid('id');

    var errLabel = 'Route: POST /skills/{id}';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    Skill.update(params, options, callback);
  }
};

// Route: DELETE '/skills/:id'
exports.deleteSkill = {

  spec: {
    path: '/skills/{id}',
    notes: 'Deletes an existing skill and its relationships',
    summary: 'Delete a skill',
    method: 'DELETE',
    type: 'object',
    parameters: [
      param.path('id', 'ID of skill to be deleted', 'string'),
    ],
    responseMessages: [swe.invalid('input')],
    nickname : 'deleteSkill'
  },

  action: function (req, res) {
    var id = req.params.id;
    var options = {};
    var params = {};

    if (!id) throw swe.invalid('id');

    var errLabel = 'Route: DELETE /skills/{id}';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    Skill.deleteSkill(params, options, callback);
  }
};
