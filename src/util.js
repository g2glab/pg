String.prototype.quoteIfNeeded = function() {
  if(this.includes('"') || this.includes('\t')) {
    return `"${this.replace(/\"/g, '""')}"`;
  }
  return this;
}

String.prototype.removeComment = function() {
  return this.replace(/^((("[^"\\]*(\\.[^"\\]*)*")|[^#"])*)(#.*)$/gm, '$1');
}
