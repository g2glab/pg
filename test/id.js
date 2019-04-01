var childProcess = require('child_process');
var assert = require('assert');
var chai = require('chai');
chai.use(require('chai-fs'));
var assert = chai.assert;
var fs = require('fs');

describe('id', function() {
  describe('pgx', function() {
    childProcess.execFileSync('pg2pgx', ['./examples/id/id.pg', '-o', './output']);
    it('generates 3 files: .pgx.nodes .pgx.edges .pgx.json', function() {
      assert.pathExists('./output/id.pgx.nodes');
      assert.pathExists('./output/id.pgx.edges');
      assert.pathExists('./output/id.pgx.json');
    });
    it('generates expected file: .pgx.nodes', function() {
      var result = fs.readFileSync("./output/id.pgx.nodes");
      var expect = fs.readFileSync("./examples/id/id.pgx.nodes");
      assert.deepEqual(result, expect);
    });
    it('generates expected file: .pgx.edges', function() {
      var result = fs.readFileSync("./output/id.pgx.edges");
      var expect = fs.readFileSync("./examples/id/id.pgx.edges");
      assert.deepEqual(result, expect);
    });
    it('generates expected file: .pgx.json', function() {
      var result = fs.readFileSync("./output/id.pgx.json");
      var expect = fs.readFileSync("./examples/id/id.pgx.json");
      assert.deepEqual(result, expect);
    });
  });
  describe('neo', function() {
    childProcess.execFileSync('pg2neo', ['./examples/id/id.pg', '-o', './output']);
    it('generates 2 files: .neo.nodes .neo.edges', function() {
      assert.pathExists('./output/id.neo.nodes');
      assert.pathExists('./output/id.neo.edges');
    });
    it('generates expected file: .neo.nodes', function() {
      var result = fs.readFileSync("./output/id.neo.nodes");
      var expect = fs.readFileSync("./examples/id/id.neo.nodes");
      assert.deepEqual(result, expect);
    });
    it('generates expected file: .neo.edges', function() {
      childProcess.execSync('sort ./output/id.neo.edges > /tmp/result');
      childProcess.execSync('sort ./examples/id/id.neo.edges > /tmp/expect');
      var result = fs.readFileSync("/tmp/result");
      var expect = fs.readFileSync("/tmp/expect");
      assert.deepEqual(result, expect);
    });
  });
  describe('aws', function() {
    childProcess.execFileSync('pg2aws', ['./examples/id/id.pg', '-o', './output']);
    it('generates 2 files: .aws.nodes .aws.edges', function() {
      assert.pathExists('./output/id.aws.nodes');
      assert.pathExists('./output/id.aws.edges');
    });
    it('generates expected file: .aws.nodes', function() {
      var result = fs.readFileSync("./output/id.aws.nodes");
      var expect = fs.readFileSync("./examples/id/id.aws.nodes");
      assert.deepEqual(result, expect);
    });
    it('generates expected file: .aws.edges', function() {
      childProcess.execSync('sort ./output/id.aws.edges > /tmp/result');
      childProcess.execSync('sort ./examples/id/id.aws.edges > /tmp/expect');
      var result = fs.readFileSync("/tmp/result");
      var expect = fs.readFileSync("/tmp/expect");
      assert.deepEqual(result, expect);
    });
  });
  describe('dot', function() {
    childProcess.execFileSync('pg2dot', ['./examples/id/id.pg', '-o', './output']);
    it('generates 1 file: .dot', function() {
      assert.pathExists('./output/id.dot');
    });
    it('generates expected file: .dot', function() {
      childProcess.execSync('sort ./output/id.dot > /tmp/result');
      childProcess.execSync('sort ./examples/id/id.dot > /tmp/expect');
      var result = fs.readFileSync("/tmp/result");
      var expect = fs.readFileSync("/tmp/expect");
      assert.deepEqual(result, expect);
    });
  });
});

