
exports.Graph = function() {

  //this.nodes = new Map();
  this.nodes = {};
  this.edges = new Array();

  this.addNode = function(id, node) {
    //this.nodes.set(id, node);
    this.nodes[id] = node;
  }

  this.addEdge = function(edge) {
    this.edges.push(edge);
  }

  this.setNodeLabel = function(id, label) {
    if (node = this.getNode(id)) {
      node.addLabel(label);
    } else {
      console.log('The node does not exist. ID: ' + id);
    }
  }

  this.setEdgeLabel = function(id, label) {
    if (edge = this.getEdge(id)) {
      edge.addLabel(label);
    } else {
      console.log('The edge does not exist. ID: ' + id);
    }
  }

  this.setNodeProperty = function(id, key, value) {
    if (node = this.getNode(id)) {
      node.addProperty(label);
    } else {
      console.log('The node does not exist. ID: ' + id);
    }
  }

  this.setEdgeProperty = function(id, key, value) {
    if (edge = this.getEdge(id)) {
      edge.addProperty(label);
    } else {
      console.log('The edge does not exist. ID: ' + id);
    }
  }

  this.exportJSON = function() {
    console.log(JSON.stringify(this, null, 2));
  }

}

exports.Node = function(id) {

  this.id = id;
  //this.labels = new Set();
  //this.properties = new Map();
  this.labels = [];
  this.properties = {};

  this.addLabel = function(label) {
    //this.labels.add(label);
    this.labels[this.labels.length] = label;
  }

  this.addProperty = function(key, value) {
    //this.properties.set(key, value);
    this.properties[key] = value;
  }
}

exports.Edge = function(id1, id2, undirected) {

  this.id1 = id1;
  this.id2 = id2;
  this.undirected = undirected;
  //this.labels = new Set();
  //this.properties = new Map();
  this.labels = [];
  this.properties = {};

  this.addLabel = function(label) {
    //this.labels.add(label);
    this.labels[this.labels.length] = label;
  }

  this.addProperty = function(key, value) {
    //this.properties.set(key, value);
    this.properties[key] = value;
  }
}

