var childProcess = require('child_process');
var assert = require('assert');
var chai = require('chai');
chai.use(require('chai-fs'));
var assert = chai.assert;
var fs = require('fs');

describe('pg2neo', function() {
  describe('c360', function() {
    childProcess.execFileSync('pg2neo', ['./examples/c360/c360.pg', './output/c360']);
    it('generates 2 files: .neo.nodes .neo.edges', function() {
      assert.pathExists('./output/c360.neo.nodes');
      assert.pathExists('./output/c360.neo.edges');
    });
    it('generates expected file: .neo.nodes', function() {
      var result = fs.readFileSync("./output/c360.neo.nodes");
      var expect = fs.readFileSync("./examples/c360/c360.neo.nodes");
      assert.deepEqual(result, expect);
    });
    it('generates expected file: .neo.edges', function() {
      childProcess.execSync('sort ./output/c360.neo.edges > /tmp/result');
      childProcess.execSync('sort ./examples/c360/c360.neo.edges > /tmp/expect');
      var result = fs.readFileSync("/tmp/result");
      var expect = fs.readFileSync("/tmp/expect");
      assert.deepEqual(result, expect);
    });
  });
  describe('datatype', function() {
    childProcess.execFileSync('pg2neo', ['./examples/datatype/datatype.pg', './output/datatype']);
    it('generates 2 files: .neo.nodes .neo.edges', function() {
      assert.pathExists('./output/datatype.neo.nodes');
      assert.pathExists('./output/datatype.neo.edges');
    });
  });
});
