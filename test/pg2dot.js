var childProcess = require('child_process');
var assert = require('assert');
var chai = require('chai');
chai.use(require('chai-fs'));
var assert = chai.assert;
var fs = require('fs');

describe('pg2dot', function() {
  describe('c360', function() {
    childProcess.execFileSync('pg2dot', ['./examples/c360/c360.pg', './output/c360']);
    it('generates 1 file: .dot', function() {
      assert.pathExists('./output/c360.dot');
    });
    it('generates expected file: .dot', function() {
      childProcess.execSync('sort ./output/c360.dot > /tmp/result');
      childProcess.execSync('sort ./examples/c360/c360.dot > /tmp/expect');
      var result = fs.readFileSync("/tmp/result");
      var expect = fs.readFileSync("/tmp/expect");
      assert.deepEqual(result, expect);
    });
  });
  describe('datatype', function() {
    childProcess.execFileSync('pg2dot', ['./examples/datatype/datatype.pg', './output/datatype']);
    it('generates 1 file: .dot', function() {
      assert.pathExists('./output/datatype.dot');
    });
  });
});
