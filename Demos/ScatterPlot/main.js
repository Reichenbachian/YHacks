// var scene = new THREE.Scene()

// var width = window.innerWidth
// var height = window.innerHeight

// var charts, timer

// var camera = new THREE.PerspectiveCamera(40, width / height, 1, 10000)
// camera.position.z = 3000

// var renderer = new THREE.WebGLRenderer();
// renderer.setSize(width, height)
// renderer.domElement.style.position = 'absolute'
// document.getElementById('container').appendChild(renderer.domElement)

// var controls = new THREE.TrackballControls( camera );
// controls.addEventListener('change', render)

d3.json("../../../Datasets/test.json",
    function(data) {
      for (var i = 0; i < data.length; i++)
        console.log(data[i].name);
})