#!/usr/bin/env node

let pg = require('./pg.js');

let graph = new pg.Graph();

let node, edge;

node = new pg.Node('1');
node.addLabel('Person');
node.addProperty('name', 'Alice');
graph.addNode('1', node);

node = new pg.Node('2');
node.addLabel('Person');
node.addProperty('name', 'Bob');
graph.addNode('2', node);

edge = new pg.Edge('1', '2', false);
edge.addLabel('likes');
edge.addProperty('id', '101');
edge.addProperty('since', '2017');
graph.addEdge(edge);

graph.exportJSON();
