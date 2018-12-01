function Enviz() {
	var renderer;
	var scene;

	// player object: only manipulate this position & orientation, don't modify camera directly
	var player, head;
	var initialPos = { x: 0, y: 0, z: 30 };

	var vrHMD
;	var vrPlayerController;

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
	    
	    // use D3 to set up 3D bars
	    var barGraph = d3.select( chart3d )
	        .selectAll()
	        .data(data);

	    barGraph.enter().append(function() {
	    		var material = new THREE.MeshLambertMaterial( {
	        		color: 0x4682B4, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );
	    		return new THREE.Mesh( geometry, material );
	    	}).attr("position.x", function(d, i) { return 30 * i; })
	         .attr("position.y", function(d, i) { return d; })
	         .attr("material.color.r", function(d, i) { return i/6.0+0.1; })
	         .attr("material.color.g", function(d, i) { return i/3.0+0.1; })
	         .attr("material.color.b", function(d, i) { return i/2.0+0.1; })
	        
	    window.addEventListener( 'resize', onWindowResize, false );

	}
	function loadData(file, func) {
		d3.json("../../../Datasets/test.json", func);
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
		// player.position = ...

		// updates player head position and orientation based on HMD
		vrPlayerController.update( dt );
	}

	function render( dt ) {
		vrPlayerController.render( scene );
	}
	Enviz.prototype.initializeVR = initializeVR;
	Enviz.prototype.loadData = loadData;
	Enviz.prototype.update = update;
}

var enviz = new Enviz();