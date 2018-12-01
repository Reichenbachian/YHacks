// Setup THREE to be treated as a DOM object
THREE.Object3D.prototype.appendChild = function (c) { this.add(c); return c; };
THREE.Object3D.prototype.querySelectorAll = function () {return this.children; };
THREE.Object3D.prototype.insertBefore = function (newNode, referenceNode) {
    t = newNode;
    if (referenceNode == null) {
        console.log(newNode, referenceNode);
        this.add(newNode);
    } else {
        console.log(newNode, referenceNode);
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }
};
// this one is to use D3's .attr() on THREE's objects
THREE.Object3D.prototype.setAttribute = function (name, value) {
    var chain = name.split('.');
    var object = this;
    for (var i = 0; i < chain.length - 1; i++) {
        object = object[chain[i]];
    }
    object[chain[chain.length - 1]] = value;
}
