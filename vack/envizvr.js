class EnvizVR {
    /**
     *
     * @param container HTMLElement
     * @param body HTMLElement, usually document.body
     */
    constructor(container, body) {
        const scene = this.scene = new THREE.Scene();
        scene.background = new THREE.Color(0x222222);

        const camera = this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 50);


        // var geometry = new THREE.BoxBufferGeometry(0.5, 0.8, 0.5);
        // var material = new THREE.MeshStandardMaterial({
        //     color: 0x444444,
        //     roughness: 1.0,
        //     metalness: 0.0
        // });
        // var table = new THREE.Mesh(geometry, material);
        // table.position.y = 0.35;
        // table.position.z = 0.85;
        // table.castShadow = true;
        // table.receiveShadow = true;
        // // scene.add( table );

        /*
        var table = new THREE.Mesh( geometry, material );
        table.position.y = 0.35;
        table.position.z = -0.85;
        table.castShadow = true;
        table.receiveShadow = true;
        scene.add( table );
        */

        // var geometry = new THREE.PlaneBufferGeometry(4, 4);
        // var material = new THREE.MeshStandardMaterial({
        //     color: 0x222222,
        //     roughness: 1.0,
        //     metalness: 0.0
        // });
        // var floor = new THREE.Mesh(geometry, material);
        // floor.rotation.x = -Math.PI / 2;
        // floor.receiveShadow = true;
        // // scene.add( floor );
        // //
        // // var floor = new THREE.Mesh( geometry, material );
        // // // floor.rotation.x = - Math.PI / 2;
        // // floor.receiveShadow = true;
        // // scene.add( floor );
        // //
        // // var floor = new THREE.Mesh( geometry, material );
        // // floor.rotation.y = - Math.PI / 2;
        // // floor.receiveShadow = true;
        // // scene.add( floor );

        // const plotArea = this._generatePlotArea();
        // scene.add(plotArea);


        scene.add(new THREE.HemisphereLight(0x888877, 0x777788));

        var light = new THREE.DirectionalLight(0xffffff);
        light.position.set(0, 6, 0);
        light.castShadow = true;
        light.shadow.camera.top = 2;
        light.shadow.camera.bottom = -2;
        light.shadow.camera.right = 2;
        light.shadow.camera.left = -2;
        light.shadow.mapSize.set(4096, 4096);
        scene.add(light);

        const renderer = this.renderer = new THREE.WebGLRenderer({antialias: true});

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.gammaInput = true;
        renderer.gammaOutput = true;
        renderer.shadowMap.enabled = true;
        renderer.vr.enabled = true;
        container.appendChild(renderer.domElement);


        this.controllers = new EnvizControllers(renderer, scene);

        body.appendChild(WEBVR.createButton(renderer));

        this._initGeometry();


        window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }

    _generatePlotArea() {
        const plotArea = new THREE.Group();

        let gridHelperX = new THREE.GridHelper(20, 40, 0x111111, 0x111111);
        let gridHelperY = new THREE.GridHelper(20, 40, 0x111111, 0x111111);
        let gridHelperZ = new THREE.GridHelper(20, 40, 0x111111, 0x111111);
        gridHelperZ.rotation.x = Math.PI / 2;
        gridHelperY.rotation.z = Math.PI / 2;
        plotArea.add(gridHelperX);
        plotArea.add(gridHelperY);
        plotArea.add(gridHelperZ);

        const xAxisMaterial = new THREE.MeshStandardMaterial({color: 0xff0000});
        const yAxisMaterial = new THREE.MeshStandardMaterial({color: 0x00ff00});
        const zAxisMaterial = new THREE.MeshStandardMaterial({color: 0x0000ff});

        const axisGeom = new THREE.CylinderGeometry(0.01, 0.01, 4, 4, 1, true);

        const xAxis = new THREE.Mesh(axisGeom, xAxisMaterial);
        xAxis.rotation.z = Math.PI / 2;
        const yAxis = new THREE.Mesh(axisGeom, yAxisMaterial);
        const zAxis = new THREE.Mesh(axisGeom, zAxisMaterial);
        zAxis.rotation.x = Math.PI / 2;

        plotArea.add(xAxis);
        plotArea.add(yAxis);
        plotArea.add(zAxis);

        return plotArea;
    }

    _initGeometry() {
        var geometry = new THREE.BufferGeometry();

        var positions = new THREE.BufferAttribute(new Float32Array(1000000 * 3), 3);
        positions.dynamic = true;
        geometry.addAttribute('position', positions);

        var normals = new THREE.BufferAttribute(new Float32Array(1000000 * 3), 3);
        normals.dynamic = true;
        geometry.addAttribute('normal', normals);

        var colors = new THREE.BufferAttribute(new Float32Array(1000000 * 3), 3);
        colors.dynamic = true;
        geometry.addAttribute('color', colors);

        geometry.drawRange.count = 0;

        //

        /*
        var path = "textures/cube/SwedishRoyalCastle/";
        var format = '.jpg';
        var urls = [
            path + 'px' + format, path + 'nx' + format,
            path + 'py' + format, path + 'ny' + format,
            path + 'pz' + format, path + 'nz' + format
        ];

        var reflectionCube = new THREE.CubeTextureLoader().load( urls );
        */

        var material = new THREE.MeshStandardMaterial({
            roughness: 0.9,
            metalness: 0.0,
            // envMap: reflectionCube,
            vertexColors: THREE.VertexColors,
            side: THREE.DoubleSide
        });

        const line = this.line = new THREE.Mesh(geometry, material);
        line.frustumCulled = false;
        line.castShadow = true;
        line.receiveShadow = true;
        this.scene.add(line);
    }

    animate() {
        this.renderer.setAnimationLoop(() => this.render());
    }


    render() {

        var count = this.line.geometry.drawRange.count;

        this.controllers.render(this.line);

        // camera.fov = Math.sin(Date.now() / 500) * 20 + 40;

        this.updateGeometry(count, this.line.geometry.drawRange.count);

        // for (var i = 0; i < 5; i++) {
        //     var x = d3.select(chart3d).selectAll()[0][i]
        //         .material
        //         .color;
        //     if (x.goingUp) {
        //         if (x.r > 1) x.goingUp = 0;
        //         x.r += .005;
        //     } else {
        //         if (x.r < 0) x.goingUp = 1;
        //         x.r -= .005;
        //     }
        // }
        // d3.select(chart3d).selectAll()
        //     .attr("scale.x", function(d, i) {
        //         console.log(d);
        //         // return d.scale.x += 0.01;
        //         return d;
        //     });
        // requestAnimationFrame( animate );
        // chart3d.rotation.y += 0.01;

        this.renderer.render(this.scene, this.camera);

    }

    onWindowResize() {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);

    }


    updateGeometry(start, end) {

        if (start === end) return;

        var offset = start * 3;
        var count = (end - start) * 3;

        var geometry = this.line.geometry;
        var attributes = geometry.attributes;

        attributes.position.updateRange.offset = offset;
        attributes.position.updateRange.count = count;
        attributes.position.needsUpdate = true;

        attributes.normal.updateRange.offset = offset;
        attributes.normal.updateRange.count = count;
        attributes.normal.needsUpdate = true;

        attributes.color.updateRange.offset = offset;
        attributes.color.updateRange.count = count;
        attributes.color.needsUpdate = true;

    }


    /**
     *
     * @param points [number, number, number][]
     */
    drawScatterSphere(points) {
        const plot = this._generatePlotArea();

        const ptShape = new THREE.SphereGeometry(0.02);
        const ptMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});

        for (let [x, y, z] of points) {
            if (x == null || y == null || z == null) {
                continue;
            }

            let mesh = new THREE.Mesh(ptShape, ptMaterial);
            mesh.position.x = x;
            mesh.position.y = y;
            mesh.position.z = z;
            plot.add(mesh);
            // ptShape.vertices.push(new THREE.Vector3(x, y, z));

            console.log(mesh);
        }

        this.scene.add(plot);
    }
}

EnvizVR.vector1 = new THREE.Vector3();
EnvizVR.vector2 = new THREE.Vector3();
EnvizVR.vector3 = new THREE.Vector3();
EnvizVR.vector4 = new THREE.Vector3();

EnvizVR.up = new THREE.Vector3(0, 1, 0);


class EnvizControllers {
    /**
     *
     * @param renderer
     */
    constructor(renderer, scene) {
        this.renderer = renderer;
        this.scene = scene;

        // controllers

        function onSelectStart() {

            this.userData.isSelecting = true;

        }

        function onSelectEnd() {

            this.userData.isSelecting = false;

        }

        const controller1 = this.controller1 = this.renderer.vr.getController(0);
        controller1.addEventListener('selectstart', onSelectStart);
        controller1.addEventListener('selectend', onSelectEnd);
        controller1.userData.points = [new THREE.Vector3(), new THREE.Vector3()];
        controller1.userData.matrices = [new THREE.Matrix4(), new THREE.Matrix4()];
        this.scene.add(controller1);

        const controller2 = this.controller2 = this.renderer.vr.getController(1);
        controller2.addEventListener('selectstart', onSelectStart);
        controller2.addEventListener('selectend', onSelectEnd);
        controller2.userData.points = [new THREE.Vector3(), new THREE.Vector3()];
        controller2.userData.matrices = [new THREE.Matrix4(), new THREE.Matrix4()];
        this.scene.add(controller2);

        var loader = new THREE.OBJLoader();
        loader.setPath('models/oculus_cv1_controller_left/');
        loader.load('oculus_cv1_controller_left.obj', function (object) {

            var loader = new THREE.TextureLoader();
            loader.setPath('models/oculus_cv1_controller_left/');

            var controller = object.children[0];
            controller.material.map = loader.load('external_controller01_col.png');
            controller.material.specularMap = loader.load('external_controller01_spec.png');
            controller.castShadow = true;
            controller.receiveShadow = true;

            // var pivot = new THREE.Group();
            // var pivot = new THREE.Mesh( new THREE.BoxBufferGeometry( 0.01, 0.01, 0.01 ) );
            var pivot = new THREE.Mesh(new THREE.IcosahedronBufferGeometry(0.01, 2));
            pivot.name = 'pivot';
            // pivot.position.y = -0.016;
            // pivot.position.z = -0.043;
            // pivot.rotation.x = Math.PI / 5.5;
            controller.add(pivot);

            controller1.add(controller.clone());

            // pivot.material = pivot.material.clone();
            // controller2.add(controller.clone());

        });


        var loader = new THREE.OBJLoader();
        loader.setPath('models/oculus_cv1_controller_right/');
        loader.load('oculus_cv1_controller_right.obj', function (object) {

            var loader = new THREE.TextureLoader();
            loader.setPath('models/oculus_cv1_controller_right/');

            var controller = object.children[0];
            controller.material.map = loader.load('external_controller01_col.png');
            controller.material.specularMap = loader.load('external_controller01_spec.png');
            controller.castShadow = true;
            controller.receiveShadow = true;

            // var pivot = new THREE.Group();
            // var pivot = new THREE.Mesh( new THREE.BoxBufferGeometry( 0.01, 0.01, 0.01 ) );
            var pivot = new THREE.Mesh(new THREE.IcosahedronBufferGeometry(0.01, 2));
            pivot.name = 'pivot';
            // pivot.position.y = -0.016;
            // pivot.position.z = -0.043;
            // pivot.rotation.x = Math.PI / 5.5;
            controller.add(pivot);

            // controller1.add(controller.clone());

            pivot.material = pivot.material.clone();
            controller2.add(controller.clone());

        });


        // Shapes
        this.shapes = {};
        this.shapes['tube'] = this._getTubeShapes(1.0);
    }

    render(line) {
        this.line = line;

        this.handleController(this.controller1);
        this.handleController(this.controller2);
    }

    handleController(controller) {

        var pivot = controller.getObjectByName('pivot');

        if (pivot) {

            var matrix = pivot.matrixWorld;

            var point1 = controller.userData.points[0];
            var point2 = controller.userData.points[1];

            var matrix1 = controller.userData.matrices[0];
            var matrix2 = controller.userData.matrices[1];

            point1.setFromMatrixPosition(matrix);
            matrix1.lookAt(point2, point1, EnvizVR.up);

            // console.log(controller.userData);
            if (controller.userData.isSelecting === true) {

                this.stroke(controller, point1, point2, matrix1, matrix2);

            }

            point2.copy(point1);
            matrix2.copy(matrix1);

        }

    }

    stroke(controller, point1, point2, matrix1, matrix2) {
        // console.log(controller, point1, point2, matrix1, matrix2);
        let vector1 = EnvizVR.vector1;
        let vector2 = EnvizVR.vector2;
        let vector3 = EnvizVR.vector3;
        let vector4 = EnvizVR.vector4;

        var color = new THREE.Color(0xFFDC00);
        var size = 1;

        var shapes = this._getTubeShapes(size);

        var geometry = this.line.geometry;
        var attributes = geometry.attributes;
        var count = geometry.drawRange.count;

        var positions = attributes.position.array;
        var normals = attributes.normal.array;
        var colors = attributes.color.array;

        for (var j = 0, jl = shapes.length; j < jl; j++) {

            var vertex1 = shapes[j];
            var vertex2 = shapes[(j + 1) % jl];

            // positions

            vector1.copy(vertex1);
            vector1.applyMatrix4(matrix2);
            vector1.add(point2);

            vector2.copy(vertex2);
            vector2.applyMatrix4(matrix2);
            vector2.add(point2);

            vector3.copy(vertex2);
            vector3.applyMatrix4(matrix1);
            vector3.add(point1);

            vector4.copy(vertex1);
            vector4.applyMatrix4(matrix1);
            vector4.add(point1);

            vector1.toArray(positions, (count + 0) * 3);
            vector2.toArray(positions, (count + 1) * 3);
            vector4.toArray(positions, (count + 2) * 3);

            vector2.toArray(positions, (count + 3) * 3);
            vector3.toArray(positions, (count + 4) * 3);
            vector4.toArray(positions, (count + 5) * 3);

            // normals

            vector1.copy(vertex1);
            vector1.applyMatrix4(matrix2);
            vector1.normalize();

            vector2.copy(vertex2);
            vector2.applyMatrix4(matrix2);
            vector2.normalize();

            vector3.copy(vertex2);
            vector3.applyMatrix4(matrix1);
            vector3.normalize();

            vector4.copy(vertex1);
            vector4.applyMatrix4(matrix1);
            vector4.normalize();

            vector1.toArray(normals, (count + 0) * 3);
            vector2.toArray(normals, (count + 1) * 3);
            vector4.toArray(normals, (count + 2) * 3);

            vector2.toArray(normals, (count + 3) * 3);
            vector3.toArray(normals, (count + 4) * 3);
            vector4.toArray(normals, (count + 5) * 3);

            // colors

            color.toArray(colors, (count + 0) * 3);
            color.toArray(colors, (count + 1) * 3);
            color.toArray(colors, (count + 2) * 3);

            color.toArray(colors, (count + 3) * 3);
            color.toArray(colors, (count + 4) * 3);
            color.toArray(colors, (count + 5) * 3);

            count += 6;

        }

        geometry.drawRange.count = count;

    }

    _getTubeShapes(size) {

        var PI2 = Math.PI * 2;

        var sides = 10;
        var array = [];
        var radius = 0.01 * size;

        for (var i = 0; i < sides; i++) {

            var angle = (i / sides) * PI2;
            array.push(new THREE.Vector3(Math.sin(angle) * radius, Math.cos(angle) * radius, 0));

        }

        return array;

    }

    /**
     * Gets controller's coords
     * @param controllerID 1 or 2, corresponding to left and right controolers
     * @param vec fills this Vector3 with the world position
     */
    getControllerPosition(controllerID, vec) {
        const con = controllerID === 1 ? this.controller1 : this.controller2;

        con.getObjectByName('pivot').getWorldPosition(vec);
    }
}


