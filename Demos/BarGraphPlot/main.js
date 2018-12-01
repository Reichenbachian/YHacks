var data = [4, 8, 15, 16, 23, 42];
var t = null;
// these are, as before, to make D3's .append() and .selectAll() work
THREE.Object3D.prototype.appendChild = function (c) {
    this.add(c);
    return c;
};
THREE.Object3D.prototype.querySelectorAll = function () {
    return this.children;
};
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
var camera, scene, renderer, chart3d;

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 400;

    scene = new THREE.Scene();

    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 0, 1);
    scene.add(light);


    // var geometry = new THREE.CubeGeometry( 20, 20, 20 );


    // create container for our 3D chart
    chart3d = new THREE.Object3D();
    chart3d.rotation.x = 0.6;
    scene.add(chart3d);

    // use D3 to set up 3D bars
    var barGraph = d3.select(chart3d)
        .selectAll()
        .data(data);

    barGraph.enter().append(function () {
        var material = new THREE.MeshLambertMaterial({
            color: 0x4682B4, shading: THREE.FlatShading, vertexColors: THREE.VertexColors
        });
        return new THREE.Mesh(
            new THREE.CubeGeometry(0.2, 0.2, 0.2), material);
    })

        .attr("position.x", function (d, i) {
            return 30 * i;
        })
        // .attr("position.y", function(d, i) { return d; })
        .attr("material.color.r", function (d, i) {
            return i / 6.0 + 0.1;
        })
        .attr("material.color.g", function (d, i) {
            return i / 3.0 + 0.1;
        })
        .attr("material.color.b", function (d, i) {
            return i / 2.0 + 0.1;
        })

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {
    for (var i = 0; i < 5; i++) {
        var x = d3.select(chart3d).selectAll()[0][i]
            .material
            .color;
        if (x.goingUp) {
            if (x.r > 1) x.goingUp = 0;
            x.r += .005;
        } else {
            if (x.r < 0) x.goingUp = 1;
            x.r -= .005;
        }
    }
    // d3.select(chart3d).selectAll()
    // 	.attr("material.color.r", function(d, i) {console.log(d); v = d; return d.material.color.r+0.1})
    requestAnimationFrame(animate);
    chart3d.rotation.y += 0.01;
    renderer.render(scene, camera);

}
