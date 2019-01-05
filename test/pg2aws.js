var childProcess = require('child_process');
var assert = require('assert');
var chai = require('chai');
chai.use(require('chai-fs'));
var assert = chai.assert;
var fs = require('fs');

describe('pg2aws', function() {
  describe('c360', function() {
    childProcess.execFileSync('pg2aws', ['./examples/c360/c360.pg', './output/c360']);
    it('generates 2 files: .aws.nodes .aws.edges', function() {
      assert.pathExists('./output/c360.aws.nodes');
      assert.pathExists('./output/c360.aws.edges');
    });
    it('generates expected file: .aws.nodes', function() {
      var result = fs.readFileSync("./output/c360.aws.nodes");
      var expect = fs.readFileSync("./examples/c360/c360.aws.nodes");
      assert.deepEqual(result, expect);
    });
    it('generates expected file: .aws.edges', function() {
      childProcess.execSync('sort ./output/c360.aws.edges > /tmp/result');
      childProcess.execSync('sort ./examples/c360/c360.aws.edges > /tmp/expect');
      var result = fs.readFileSync("/tmp/result");
      var expect = fs.readFileSync("/tmp/expect");
      assert.deepEqual(result, expect);
    });
  });
  describe('datatype', function() {
    childProcess.execFileSync('pg2aws', ['./examples/datatype/datatype.pg', './output/datatype']);
    it('generates 2 files: .aws.nodes .aws.edges', function() {
      assert.pathExists('./output/datatype.aws.nodes');
      assert.pathExists('./output/datatype.aws.edges');
    });
  });
});
