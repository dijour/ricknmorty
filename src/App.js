import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import TrackballControls from 'three-trackballcontrols';
import {Expo, TimelineMax} from "gsap/TweenMax";

function App() {
    var perspectiveCamera, orthographicCamera, controls, scene, renderer, stats;
    var params = {
        orthographicCamera: false
    };
    var frustumSize = 400;

    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();

    const objs = [];
    let sauser;
    let earth;
    let gun;
    let Rick;
    let randomShit;

    init();
    animate();



    function init() {
        var aspect = window.innerWidth / window.innerHeight;
        perspectiveCamera = new THREE.PerspectiveCamera( 60, aspect, 1, 1000 );
        perspectiveCamera.position.z = 500;
        orthographicCamera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 1000 );
        orthographicCamera.position.z = 500;
        // world
        scene = new THREE.Scene();
        // scene.background = new THREE.Color( 0xcccccc );
        // scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );
        var geometry = new THREE.CylinderBufferGeometry( 0, 10, 30, 4, 1 );
        var material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } );
        for ( var i = 0; i < 20; i ++ ) {
            var mesh = new THREE.Mesh( geometry, material );
            mesh.position.x = ( Math.random() - 0.5 ) * 1000;
            mesh.position.y = ( Math.random() - 0.5 ) * 1000;
            mesh.position.z = ( Math.random() - 0.5 ) * 1000;
            mesh.updateMatrix();
            mesh.matrixAutoUpdate = false;
            scene.add( mesh );
        }
        // lights

        // const objs = [];
        // const earthLoader = new GLTFLoader();
        // earthLoader.setDRACOLoader( dracoLoader );

        // earthLoader.load('/earth/scene.gltf', gltf => {
        //     // model is a THREE.Group (THREE.Object3D)                              
        //     const mixer = new THREE.AnimationMixer(gltf.scene);
        //     for (const anim of gltf.animations) {
        //         mixer.clipAction(anim).play();
        //     }
        //     gltf.scene.scale.set(.01, .01, .01);
        //     // gltf.scene.rotation.copy(new THREE.Euler(0, -3 * Math.PI / 4, -3 * Math.PI / 4));
        //     gltf.scene.position.set(0, 0, 0);
        //     // var object = gltf.scene;
        //     earth = gltf.scene;

        //     console.log(earth.isObject3D)
        //     // sauser.addEventListener('mousemove', onMouseMove);

        //     const root = gltf.scene;        

        //     const box = new THREE.Box3().setFromObject(root);
        
        //     const boxSize = box.getSize(new THREE.Vector3()).length();
        //     const boxCenter = box.getCenter(new THREE.Vector3());
        
        //     // set the camera to frame the box
        //     frameArea(boxSize * 1, boxSize, boxCenter, perspectiveCamera);
        
        //     // update the Trackball controls to handle the new size
        //     controls.maxDistance = boxSize * 10;
        //     controls.target.copy(boxCenter);
        //     controls.update();
        //     earth.addEventListener('mousemove', onMouseMove);


        //     scene.add(gltf.scene);
        // },
        //     // called when loading has errors
        // function ( error ) {
        //     console.log( error );
        // }
        // );


        let createEarth	= () => {
            var containerEarth	= new THREE.Object3D()
            containerEarth.rotateZ(-23.4 * Math.PI/180)
            containerEarth.position.z	= 0
            scene.add(containerEarth)
            var geometry = new THREE.SphereGeometry(50, 32, 32)
            console.log("geometry is: ", geometry)
            var material = new THREE.MeshPhongMaterial({
                map         : THREE.ImageUtils.loadTexture('/earth/earthmap1k.jpg'),
                bumpMap	    : THREE.ImageUtils.loadTexture('/earth/earthbump1k.jpg'),
                bumpScale   : 0.05,
                specularMap : THREE.ImageUtils.loadTexture('/earth/earthspec1k.jpg'),
                specular    : new THREE.Color('grey'),
            })
            // var mesh = new THREE.Mesh(geometry, material)
            let earth_mesh = new THREE.Mesh(geometry, material)
            earth_mesh.castShadow = true;
            earth_mesh.receiveShadow = true;
            containerEarth.add(earth_mesh)
        }

        const RickWalkLoader = new FBXLoader();
        RickWalkLoader.load('/drunk_idle/rm.fbx', model => {
            // model is a THREE.Group (THREE.Object3D)                              
            const mixer = new THREE.AnimationMixer(model);
            // animations is a list of THREE.AnimationClip                          
            mixer.clipAction(model.animations[0]).play();
            // model.scale = THREE.Vector3(.1, .1, .1);
            model.scale.set(.01, .01, .01)
            // console.log(model.)

            model.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.material.map = '/drunk_idle/rm_rick.png'
                    child.material.needsUpdate = true;
                }
            })
            
            scene.add(model);

            Rick = model;
            objs.push({model, mixer});
        }, undefined, function ( error ) {

            console.error( error );
        
        });

        function placeObjectOnPlanet(object, lat, lon, radius) {
            console.log("placing object on earth")
            var latRad = lat * (Math.PI / 180);
            var lonRad = -lon * (Math.PI / 180);
            object.position.set(
                Math.cos(latRad) * Math.cos(lonRad) * radius,
                Math.sin(latRad) * radius,
                Math.cos(latRad) * Math.sin(lonRad) * radius
            );
            object.rotation.set(0.0, -lonRad, latRad - Math.PI * 0.5);
        }

        if (earth) {
            placeObjectOnPlanet(earth, 50, 50, 10)
        }        


        // const objs = [];
        const randomShitLoader = new GLTFLoader();

        var dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( '/examples/js/libs/draco' );
        randomShitLoader.setDRACOLoader( dracoLoader );

        randomShitLoader.load('/random_shit/scene.gltf', gltf => {
            // model is a THREE.Group (THREE.Object3D)                              
            const mixer = new THREE.AnimationMixer(gltf.scene);
            for (const anim of gltf.animations) {
                mixer.clipAction(anim).play();
            }
            gltf.scene.scale.set(.3,.3,.3);
            // gltf.scene.rotation.set(new THREE.Vector3( 0, 0, 0))
            gltf.scene.position.set(0, 0, 100);
            // var object = gltf.scene;
            randomShit = gltf.scene;

            // scene.add(gltf.scene);
        },
        	// called when loading has errors
        function ( error ) {

            console.log( error );

        }
        );

        const sauserLoader = new GLTFLoader();
        sauserLoader.setDRACOLoader( dracoLoader );


        sauserLoader.load('/sauser/scene.gltf', gltf => {
            // model is a THREE.Group (THREE.Object3D)                              
            const mixer = new THREE.AnimationMixer(gltf.scene);
            for (const anim of gltf.animations) {
                mixer.clipAction(anim).play();
            }
            sauser = gltf.scene;
            sauser.scale.set(.3,.3,.3);
            // gltf.scene.rotation.set(new THREE.Vector3( 0, 0, 0))
            sauser.rotation.copy(new THREE.Euler(Math.PI, (-Math.PI/2), (Math.PI / 2)));
            // sauser.position.set(0, 0, 100);
            // sauser.position.set(0,0,1000)

            // sauser.addEventListener('mousemove', onMouseMove);
            scene.add(sauser);
        },
        	// called when loading has errors
        function ( error ) {

            console.log( error );

        }
        );

        const gunLoader = new GLTFLoader();
        gunLoader.setDRACOLoader( dracoLoader );


        gunLoader.load('/portal_gun/scene.gltf', gltf => {
            // model is a THREE.Group (THREE.Object3D)                              
            const mixer = new THREE.AnimationMixer(gltf.scene);
            for (const anim of gltf.animations) {
                mixer.clipAction(anim).play();
            }
            gun = gltf.scene;
            gun.scale.set(.3,.3,.3);
            // gltf.scene.rotation.set(new THREE.Vector3( 0, 0, 0))
            // gun.rotation.copy(new THREE.Euler(Math.PI, (-Math.PI/2), (Math.PI / 2)));
            gun.position.set(0, 0, 100);
            // sauser.position.set(0,0,1000)

            // sauser.addEventListener('mousemove', onMouseMove);

            scene.add(gun);
        },
        	// called when loading has errors
        function ( error ) {

            console.log( error );

        }
        );

        var light = new THREE.AmbientLight( 0x888888 )
        scene.add( light )

        //Create a new directional light
        var light = new THREE.DirectionalLight( 0xfdfcf0, 1 )
        light.position.set(20,10,20)
        scene.add( light )

        // renderer
        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );
        stats = new Stats();
        document.body.appendChild( stats.dom );
        //
        var gui = new GUI();
        gui.add( params, 'orthographicCamera' ).name( 'use orthographic' ).onChange( function ( value ) {
            controls.dispose();
            createControls( value ? orthographicCamera : perspectiveCamera );
            render();
        } );
        //

        let starGeo = new THREE.Geometry();
        for (let i=0; i<6000; i++) {
            let star = new THREE.Vector3(
            Math.random() * 600 - 300,
            Math.random() * 600 - 300,
            Math.random() * 600 - 300
          );
          starGeo.vertices.push(star);
        }

        let sprite = new THREE.TextureLoader().load( '/star.png' );
        let starMaterial = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: .5,
            map: sprite
        });

        let stars = new THREE.Points(starGeo,starMaterial);
        scene.add(stars);

        

        window.addEventListener( 'resize', onWindowResize, false );

        createEarth();

        createControls( perspectiveCamera );
        render();
    }

    function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
        const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
        const halfFovY = THREE.Math.degToRad(camera.fov * .5);
        const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
        // compute a unit vector that points in the direction the camera is now
        // in the xz plane from the center of the box
        const direction = (new THREE.Vector3())
            .subVectors(camera.position, boxCenter)
            .multiply(new THREE.Vector3(1, 0, 1))
            .normalize();
    
        // move the camera to a position distance units way from the center
        // in whatever direction the camera was from the center already
        camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
    
        // pick some near and far values for the frustum that
        // will contain the box.
        camera.near = boxSize / 100;
        camera.far = boxSize * 100;
    
        camera.updateProjectionMatrix();
    
        // point the camera to look at the center of the box
        camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
      }

    function createControls( camera ) {
        controls = new TrackballControls( camera, renderer.domElement );
        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;
        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;
        controls.keys = [ 65, 83, 68 ];
        controls.addEventListener( 'change', render );
    }

    function onWindowResize() {
        var aspect = window.innerWidth / window.innerHeight;
        perspectiveCamera.aspect = aspect;
        perspectiveCamera.updateProjectionMatrix();
        orthographicCamera.left = - frustumSize * aspect / 2;
        orthographicCamera.right = frustumSize * aspect / 2;
        orthographicCamera.top = frustumSize / 2;
        orthographicCamera.bottom = - frustumSize / 2;
        orthographicCamera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
        controls.handleResize();
        render();
    }

    var r = 100;
    var theta = 0;
    var dTheta = 2 * Math.PI / 1000;

    const clock = new THREE.Clock();
    function animate() {
        var camera = ( params.orthographicCamera ) ? orthographicCamera : perspectiveCamera;
        objs.forEach(({mixer}) => {mixer.update(clock.getDelta())});
        if (earth) {
            // earth.rotation.x += .001;
            earth.rotation.y += .001;
        }

        if (sauser) {
            theta += dTheta;
            sauser.position.x = r * Math.cos(theta);
            sauser.position.z = r * Math.sin(theta);
            sauser.rotation.y = Math.cos((theta % 90))
        }
        //Increment theta, and update moon x and y
        //position based off new theta value        

        renderer.render(scene, camera);
        requestAnimationFrame( animate );
        controls.update();
        stats.update();
    }

    function render() {
        var camera = ( params.orthographicCamera ) ? orthographicCamera : perspectiveCamera;
        // console.log(sauser)

        renderer.render( scene, camera );
    }

    function onMouseMove(event) {
        event.preventDefault();
  
        console.log('hello')
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  
        raycaster.setFromCamera(mouse, perspectiveCamera);
  
        // var intersects = raycaster.intersectObjects(sauser, true);
        if (sauser) {
            this.tl = new TimelineMax();
            this.tl.to(sauser.position, 1, {x: 100, ease: Expo.easeOut})
        }

        // for (var i = 0; i < intersects.length; i++) {
        //     this.tl = new TimelineMax();
        //     this.tl.to(sauser.position, 1, {x: 100, ease: Expo.easeOut})
            // this.tl.to(intersects[i].object.scale, .5, {x: .5, ease: Expo.easeOut})
            // this.tl.to(intersects[i].object.position, .5, {x: 2, ease: Expo.easeOut})
            // this.tl.to(intersects[i].object.rotation, .5, {y: Math.PI*.5, ease: Expo.easeOut}, "=-1.5")
        // }
    }

    return null

}

export default App;