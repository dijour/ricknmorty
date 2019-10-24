import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import TrackballControls from 'three-trackballcontrols';
import {Expo, TimelineMax} from "gsap/TweenMax";
import Tone from 'tone';
import React, {useEffect, useState} from 'react';
import THREEx from './threex.domevents.js';
import YouTube from 'react-youtube';
import './App.scss'


function App() {
    var perspectiveCamera, orthographicCamera, controls, scene, renderer, stats;
    var objs = [];
    var params = {
        orthographicCamera: false
    };
    var frustumSize = 400;

    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();

	const manager = new THREE.LoadingManager( () => {
	
		const loadingScreen = document.getElementById( 'loading-screen' );
		loadingScreen.classList.add( 'fade-out' );
		
		// optional: remove loader from DOM via event listener
		loadingScreen.addEventListener( 'transitionend', onTransitionEnd );
		
    } );

    // for playing youtube videos
    const opts = {
        playerVars: { // https://developers.google.com/youtube/player_parameters
          autoplay: 1
        }
      };
    const [playing, setPlaying] = useState(false)
    const [video, setVideo] = useState("plumbus")
    let videos = {
        'plumbus': "eMJk4y9NGvE",
        'sauser': 'EBYsx1QWF9A'
    }

    window.addEventListener( 'mousemove', onMouseMove, true );

    let containerEarthModel = new THREE.Object3D()
    containerEarthModel.rotateZ(-23.4 * Math.PI/180)
    containerEarthModel.position.z	= 0

    // tones
    const [frequency, setFrequency] = useState(100)
    const [osc, setOsc] = useState(new Tone.OmniOscillator(100).toMaster())
    const [positions, setPositions] = useState([])
    const [timestamps, setTimestamps] = useState([])

    // 3D objs
    let sauser;
    let gun;
    let rick;
    let morty;
    let pickleRick;
    var spotLight;
    // const [sauser, setSauser] = useState();
    let earth;
    let earthCloud;
    let plumbusDirection = 1;
    let plumbus;
    let containerEarth = containerEarthModel;
    // const [gun, setGun] = useState();
    // const [rick, setRick] = useState();
    const [randomShit, setRandomShit] = useState();
    const [earthRadius, setEarthRadius] = useState(50);

    useEffect(() => {
        init();
        animate();
        // render();
        window.addEventListener("mousemove", e => changeSound(e))
        osc.start()
    }, [])

    useEffect(() => {
        console.log(playing)
        if (!playing) {
            document.getElementById('player').style.display = 'none';
            document.getElementById('title').style.display = 'block';
        }
        else {
            document.getElementById('player').style.display = 'flex';
            document.getElementById('title').style.display = 'none';
        }
    }, [playing, setPlaying])

    let changeSound = (e) => {
        console.log("change sound 1")
        console.log(e.clientX)
        let newOsc = osc;
        newOsc.frequency.value = e.clientX;
        let posArr = positions;
        posArr.push(e.clientX);
        let timeArr = timestamps;
        timeArr.push(Math.floor(Date.now() / 1000))
        setOsc(newOsc)
        setPositions(posArr)
        setTimestamps(timeArr)
      }

    let placeObjectOnPlanet = (object, lat, lon, radius) => {
        var latRad = lat * (Math.PI / 180);
        var lonRad = -lon * (Math.PI / 180);
        object.position.set(
            Math.cos(latRad) * Math.cos(lonRad) * radius,
            Math.sin(latRad) * radius,
            Math.cos(latRad) * Math.sin(lonRad) * radius
        );
        object.rotation.set(0.0, -lonRad, latRad - Math.PI * 0.5);
    } 


    function init() {
        var aspect = window.innerWidth / window.innerHeight;
        perspectiveCamera = new THREE.PerspectiveCamera( 60, aspect, 1, 1000 );
        perspectiveCamera.position.z = 500;
        orthographicCamera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 1000 );
        orthographicCamera.position.z = 500;
        // world
        scene = new THREE.Scene();
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

        // renderer
        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );
        stats = new Stats();
        document.body.appendChild( stats.dom );

        var domEvents = new THREEx.DomEvents(perspectiveCamera, renderer.domElement)

        //
        // var gui = new GUI();
        // gui.add( params, 'orthographicCamera' ).name( 'use orthographic' ).onChange( function ( value ) {
        //     controls.dispose();
        //     createControls( value ? orthographicCamera : perspectiveCamera );
        //     render();
        // } );

        createControls( perspectiveCamera );

        scene.add(containerEarth)

        let createEarth	= () => {
            var geometry = new THREE.SphereGeometry(earthRadius, 32, 32)
            var material = new THREE.MeshPhongMaterial({
                map         : THREE.ImageUtils.loadTexture('/earth/earthmap1k.jpg'),
                bumpMap	    : THREE.ImageUtils.loadTexture('/earth/earthbump1k.jpg'),
                bumpScale   : 0.05,
                specularMap : THREE.ImageUtils.loadTexture('/earth/earthspec1k.jpg'),
                specular    : new THREE.Color('grey'),
            })
            // var mesh = new THREE.Mesh(geometry, material)
            let newEarth = new THREE.Mesh(geometry, material)
            newEarth.castShadow = true;
            newEarth.receiveShadow = true;
            newEarth.name = "earth"
            earth = newEarth;
            containerEarth.add(earth)
        }

        let createEarthCloud = () => {
            // create destination canvas
            var canvasResult	= document.createElement('canvas')
            canvasResult.width	= 1024
            canvasResult.height	= 512
            var contextResult	= canvasResult.getContext('2d')		
        
            // load earthcloudmap
            var imageMap = new Image();
            imageMap.addEventListener("load", function() {
                
                // create dataMap ImageData for earthcloudmap
                var canvasMap	= document.createElement('canvas')
                canvasMap.width	= imageMap.width
                canvasMap.height= imageMap.height
                var contextMap	= canvasMap.getContext('2d')
                contextMap.drawImage(imageMap, 0, 0)
                var dataMap	= contextMap.getImageData(0, 0, canvasMap.width, canvasMap.height)
        
                // load earthcloudmaptrans
                var imageTrans	= new Image();
                imageTrans.addEventListener("load", function(){
                    // create dataTrans ImageData for earthcloudmaptrans
                    var canvasTrans		= document.createElement('canvas')
                    canvasTrans.width	= imageTrans.width
                    canvasTrans.height	= imageTrans.height
                    var contextTrans	= canvasTrans.getContext('2d')
                    contextTrans.drawImage(imageTrans, 0, 0)
                    var dataTrans		= contextTrans.getImageData(0, 0, canvasTrans.width, canvasTrans.height)
                    // merge dataMap + dataTrans into dataResult
                    var dataResult		= contextMap.createImageData(canvasMap.width, canvasMap.height)
                    for(var y = 0, offset = 0; y < imageMap.height; y++){
                        for(var x = 0; x < imageMap.width; x++, offset += 4){
                            dataResult.data[offset+0]	= dataMap.data[offset+0]
                            dataResult.data[offset+1]	= dataMap.data[offset+1]
                            dataResult.data[offset+2]	= dataMap.data[offset+2]
                            dataResult.data[offset+3]	= 255 - dataTrans.data[offset+0]
                        }
                    }
                    // update texture with result
                    contextResult.putImageData(dataResult,0,0)	
                    material.map.needsUpdate = true;
                })
                imageTrans.src	= 'earth/earthcloudmaptrans.jpg';
            }, false);
            imageMap.src	= 'earth/earthcloudmap.jpg';
        
            var geometry	= new THREE.SphereGeometry(earthRadius, 32, 32)
            var material	= new THREE.MeshPhongMaterial({
                map		: new THREE.Texture(canvasResult),
                side		: THREE.DoubleSide,
                transparent	: true,
                opacity		: 0.8,
            })
            let newEarthCloud = new THREE.Mesh(geometry, material)
            newEarthCloud.receiveShadow	= true
            newEarthCloud.castShadow	= true
            console.log("Setting dat earth cloud sheeit")
            earthCloud = newEarthCloud;
            containerEarth.add(earthCloud)
        }
    

        var dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( '/examples/js/libs/draco' );

        const loadRick = (objs, scene) => {
            const RickWalkLoader = new FBXLoader(manager);
            RickWalkLoader.load('/drunk_idle/Floating.fbx', model => {
                // model is a THREE.Group (THREE.Object3D)                              
                const mixer = new THREE.AnimationMixer(model);
                mixer.clipAction(model.animations[0]).play();
                model.scale.set(.01, .01, .01)
                model.position.set(-90, 0, 0)
    
                model.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        child.material.map = '/drunk_idle/rm_rick.png'
                        child.material.needsUpdate = true;
                    }
                })
    
                rick = model;
                rick.name = "rick"
                scene.add(rick);
                objs.push({rick, mixer});
            }, undefined, function ( error ) {
    
                console.error( error );
            
            });
        }

        loadRick(objs, scene);

        const loadMorty = (scene) => {
            const mortyLoader = new GLTFLoader(manager);
            mortyLoader.setDRACOLoader(dracoLoader);
            mortyLoader.load('/morty/scene.gltf', gltf => {
                const mixer = new THREE.AnimationMixer(gltf.scene);
                for (const anim of gltf.animations) {
                    mixer.clipAction(anim).play();
                }
                gltf.scene.scale.set(10,10,10);
                gltf.scene.position.set(-120, 0, 100);
                morty = gltf.scene;
                morty.name = "morty"
                scene.add(morty)
            },
                // called when loading has errors
                function ( error ) {
                    console.log( error );
                }
            );
        }

        loadMorty(scene)
        
        const pickleRickLoader = new GLTFLoader(manager);
        pickleRickLoader.setDRACOLoader(dracoLoader);
        pickleRickLoader.load('/pickleRick/scene.gltf', gltf => {
            const mixer = new THREE.AnimationMixer(gltf.scene);
            for (const anim of gltf.animations) {
                mixer.clipAction(anim).play();
            }
            gltf.scene.scale.set(1,1,1);
            gltf.scene.position.set(50, 0, 100);
            pickleRick = gltf.scene;
            pickleRick.name = "pickleRick"
            scene.add(pickleRick)
        },
        	// called when loading has errors
            function ( error ) {
                console.log( error );
            }
        );

        const sauserLoader = new GLTFLoader(manager);
        sauserLoader.setDRACOLoader( dracoLoader );
        sauserLoader.load('/sauser/scene.gltf', gltf => {
            // model is a THREE.Group (THREE.Object3D)                              
            const mixer = new THREE.AnimationMixer(gltf.scene);
            for (const anim of gltf.animations) {
                mixer.clipAction(anim).play();
            }
            gltf.scene.scale.set(.3,.3,.3);
            // gltf.scene.rotation.set(new THREE.Vector3( 0, 0, 0))
            gltf.scene.rotation.copy(new THREE.Euler(Math.PI, (-Math.PI/2), (Math.PI / 2)));
            gltf.scene.position.set(0, 0, 100);
            gltf.scene.position.set(0,0,1000)
            sauser = gltf.scene;
            scene.add(sauser)

            domEvents.addEventListener(sauser, 'click', function(event){
                console.log('you clicked on the mesh')
                if (playing) {
                    setPlaying(false)
                }
                else {
                    setPlaying(true);
                }
                setVideo('sauser')
                this.tl = new TimelineMax();
                this.tl.to(sauser.scale, 3, {x: 1.5, y: 1.5, z: 1.5, ease: Expo.easeOut})}
            , false)

            domEvents.addEventListener(sauser, 'touchstart', function(event){
                setPlaying(!playing);
                setVideo('sauser')
                console.log('you clicked on the mesh')
                this.tl = new TimelineMax();
                this.tl.to(sauser.scale, 3, {x: 1.5, y: 1.5, z: 1.5, ease: Expo.easeOut})}
            , false)

        },
        	// called when loading has errors
            function ( error ) {
                console.log( error );
            }
        );

        const gunLoader = new GLTFLoader(manager);
        gunLoader.setDRACOLoader(dracoLoader);
        gunLoader.load('/portal_gun/scene.gltf', gltf => {
            const mixer = new THREE.AnimationMixer(gltf.scene);
            for (const anim of gltf.animations) {
                mixer.clipAction(anim).play();
            }
            gltf.scene.scale.set(.3,.3,.3);
            gltf.scene.position.set(0, 0, 100);
            gun = gltf.scene;
            gun.name = "gun"
            containerEarth.add(gun)
        },
        	// called when loading has errors
            function ( error ) {
                console.log( error );
            }
        );

        const plumbusLoader = new GLTFLoader(manager);
        plumbusLoader.setDRACOLoader(dracoLoader);
        plumbusLoader.load('/plumbus/scene.gltf', gltf => {
            const mixer = new THREE.AnimationMixer(gltf.scene);
            for (const anim of gltf.animations) {
                mixer.clipAction(anim).play();
            }
            gltf.scene.scale.set(5,5,5);
            gltf.scene.position.set(90, 20, 0);
            gltf.scene.rotation.set(0, 0, Math.PI/2)
            plumbus = gltf.scene;
            plumbus.userData = { name: "plumbus" }
            plumbus.name = "plumbus"
            // console.log(plumbus)
            scene.add(plumbus)

            domEvents.addEventListener(plumbus, 'click', function(event){
                console.log('you clicked on the mesh')
                setPlaying(!playing);
                setVideo('plumbus')
                this.tl = new TimelineMax();
                this.tl.to(plumbus.scale, .2, {x: 6, y: 7, z: 6, ease: Expo.easeIn})
                this.tl.to(plumbus.scale, .4, {x: 5, y: 5, z: 5, ease: Expo.easeOut})}
            , false)

            domEvents.addEventListener(plumbus, 'touchstart', function(event){
                setPlaying(!playing);
                setVideo('plumbus')
                console.log('you clicked on the mesh')
                this.tl = new TimelineMax();
                this.tl.to(plumbus.scale, .2, {x: 6, y: 7, z: 6, ease: Expo.easeIn})
                this.tl.to(plumbus.scale, .4, {x: 5, y: 5, z: 5, ease: Expo.easeOut})}
            , false)

            domEvents.addEventListener(scene, 'touchend', function(event){
                console.log('you stopped clicking on the mesh')
                this.tl = new TimelineMax();
                this.tl.to(plumbus.scale, 1, {x: 5, y: 5, z: 5, ease: Expo.easeOut})}
            , false)
            },
        	// called when loading has errors
            function ( error ) {
                console.log( error );
            }
        );

        var light = new THREE.AmbientLight( 0xffffff )
        scene.add( light )

        //Create a new directional light
        // var light = new THREE.DirectionalLight( 0xffffff, 1 )
        // light.position.set(20,10,20)
        // scene.add( light )

        spotLight = new THREE.SpotLight( 0xffffff );
        spotLight.position.set( 100, 1000, 100 );

        spotLight.castShadow = true;

        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;

        spotLight.shadow.camera.near = 500;
        spotLight.shadow.camera.far = 4000;
        spotLight.shadow.camera.fov = 30;

        scene.add( spotLight );
        scene.add( spotLight.target );

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

        window.addEventListener( 'resize', onWindowResize, true );

        createEarth();
        createEarthCloud();   

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
        // console.log(sauser)
        var camera = ( params.orthographicCamera ) ? orthographicCamera : perspectiveCamera;
        objs.forEach(({mixer}) => {mixer.update(clock.getDelta())});
        if (earth) {
            // console.log(scene.children)
            containerEarth.rotation.y += 0.001;
            // earth.rotation.y += 0.001;
            // earthCloud.rotation.y -= 0.0003;
        }

        theta+=dTheta;

        if (sauser) {
            sauser.position.x = r * Math.cos(theta);
            sauser.position.z = r * Math.sin(theta);
            sauser.rotation.y = 5 * Math.sin((theta % 90))
        }

        if (plumbus) {
            plumbus.position.y = 10 * Math.sin((theta*2))
            plumbus.rotation.x = .2 * Math.sin((theta ))
        } 

        if (rick) {
            rick.position.y = -10 * Math.sin((theta*3))
            rick.rotation.x = .2 * Math.sin((theta ))
        } 

        if (pickleRick) {
            pickleRick.position.y = -10 * Math.sin((theta*3))
            pickleRick.rotation.x = .2 * Math.sin((theta ))
        } 

        if (morty) {
            morty.position.y = -10 * Math.sin((theta*3))
            morty.rotation.y += .02;
            morty.rotation.x += .01;
        } 

        if (containerEarth && gun) {
            placeObjectOnPlanet(gun, 100, 100, earthRadius)
        }    

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

    let onReady = (event) => {
        // access to player in all event handlers via event.target
        event.target.playVideo();
      }
    
    function onMouseMove( event ) {

        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        if (!scene) {
            return
        }
   
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera( mouse, perspectiveCamera );

        // calculate objects intersecting the picking ray
        var intersects = raycaster.intersectObjects( scene.children, true );

        for ( var i = 0; i < intersects.length; i++ ) {
            if (intersects[i]) {
                if (!intersects[i].matrixWorld ) {
                    // return
                }
                // console.log(intersects[i].userData)
                let tl = new TimelineMax();
                // tl.fromTo(intersects[i].object.scale, 1, {x: (intersects[i].object.scale.x)*1.2, y: (intersects[i].object.scale.y)*1.2, z: (intersects[i].object.scale.z)*1.2, ease: Expo.easeIn},{x: (intersects[i].object.scale.x)*.6, y: (intersects[i].object.scale.y)*.6, z: (intersects[i].object.scale.z)*.6, ease: Expo.easeIn})
                spotLight.target.x = mouse.x
                spotLight.target.y = mouse.y
                console.log(intersects[i].object)
                // intersects[ i ].object.scale.set((intersects[ i ].object.scale.x)*2, (intersects[ i ].object.scale.y)*2, (intersects[ i ].object.scale.z)*2);
                // intersects[i].object.scale.set(new THREE.Vector3(100,15,15))
            }
        }

    }

    function onTransitionEnd( event ) {

        const element = event.target;
        element.remove();
        
    }

    return (
        <div>
            <section id="loading-screen">
                <div id="loader"></div>
            </section>
            <h1 id="title">Ricktastic Planetarium</h1>
            <div id="player" className="centered">
                {playing && 
                    <YouTube
                    videoId={videos[video]}
                    onReady={onReady}
                    opts={opts}
                    />
                }
                <button onClick={(e) => setPlaying(false)}>Close</button>
            </div>
        </div>
    )
}

export default App;