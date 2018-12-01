function Enviz() {
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

	// Define global vars
	var renderer, scene;
	// player object: only manipulate this position & orientation, don't modify camera directly
	var player, head;
	var initialPos = { x: 0, y: 0, z: 30 };

	var vrHMD, vrPlayerController;
	var options = {
		scale: 1, // eye separation (IPD) scale
		posScale: 10 // positional tracking scale
	};


	function onWindowResize() {
	    camera.aspect = window.innerWidth / window.innerHeight;
	    camera.updateProjectionMatrix();
	    renderer.setSize( window.innerWidth, window.innerHeight );
	}

	function initializeVR() {
	    renderer = new THREE.WebGLRenderer();
	    renderer.setSize( window.innerWidth, window.innerHeight );
	    document.body.appendChild( renderer.domElement );
	    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
	    camera.position.z = 400;
	    
	    scene = new THREE.Scene();
	    
	    var light = new THREE.DirectionalLight( 0xffffff );
	    light.position.set( 0, 0, 1 );
	    scene.add( light );
	    var geometry = new THREE.CubeGeometry( 20, 20, 20 );
	    
	    
	    // create container for our 3D chart
	    chart3d = new THREE.Object3D();
		chart3d.rotation.x = 0.6;
		scene.add( chart3d );
	        
	    window.addEventListener( 'resize', onWindowResize, false );

	}
	function loadData(file, func) {
		d3.json(file, func);
	}

	function scatterPlot(columnX, columnY, columnZ, legend=true) {

	}

	function load( error ) {
		if ( error ) {
			console.log( error );
		}

		init();
		animate();
	}

	function animate( t ){
		requestAnimationFrame( animate );

		var dt = clock.getDelta();

		update( dt );
		render( dt );
	}

	function update() {
		// updates player head position and orientation based on HMD
		vrPlayerController.update( dt );
	}

	function render( dt ) {
		vrPlayerController.render( scene );
	}
	Enviz.prototype.initializeVR = initializeVR;
	Enviz.prototype.loadData = loadData;
	Enviz.prototype.update = update;
	Enviz.prototype.scatterPlot = scatterPlot;
}

var enviz = new Enviz();