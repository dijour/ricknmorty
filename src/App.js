import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import {createEarth, createEarthCloud, loadSun, loadButt, loadRick, loadMorty, loadTinyPlanet, loadCromulon, loadGun, loadSauser, loadPickleRick, loadPlumbus, loadTV, loadMicrophone, loadDiscoBall, placeObjectOnPlanet} from './Loaders'
import TrackballControls from 'three-trackballcontrols';
import TweenMax, {TimelineMax, Power4} from "gsap/TweenMax";
import Tone from 'tone';
import React, {useEffect, useState} from 'react';
import THREEx from './threex.domevents.js';
import YouTube from 'react-youtube';
import worlds from './info.json';
import './App.scss'

let dimensionData;
let sauser;
let gun;
let sun;
let rick;
let cromulon;
let morty;
let pickleRick;
let tinyPlanet;
let spotLight;
let portalLight;
let sceneLight;
let TV;
let butt;
let microphone;
let discoBall;
let earth;
let earthCloud;

function App() {
    var perspectiveCamera, clock, orthographicCamera, controls, scene, renderer, stats
    
    let init, animate; 
    const [dimension, setDimension] = useState();
    const [permissionGranted, setPermissionGranted] = useState(false)

    let initialized = undefined;

    var portalParticles = [], smokeParticles = [];
    var objs = [];
    var params = {
        orthographicCamera: false
    };
    var frustumSize = 400;

    var deleteParticles;

    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();

	const manager = new THREE.LoadingManager( () => {
        const loadingScreen = document.getElementById( 'loading-screen' );
        if (!loadingScreen) {
            return
        }
		loadingScreen.classList.add( 'fade-out' );
		
		// optional: remove loader from DOM via event listener
		loadingScreen.addEventListener( 'transitionend', onTransitionEnd );
    } );

    // for playing youtube videos
    const opts = {
        playerVars: {
          autoplay: 1
        }
      };
    const [playing, setPlaying] = useState(false)
    const [video, setVideo] = useState("plumbus")
    let videos = {
        'plumbus': "eMJk4y9NGvE",
        'sauser': 'EBYsx1QWF9A',
        'microphone': 'I1188GO4p1E',
        'discoBall': '9szNGXja85M',
        'tinyPlanet': 'Rvvsw21PgIk',
        'butt': 'NxcZoDzXegc',
        'pickleRick': '8RxDVdP2TZ8',
        'TV': 'V6SfEIoEHY0',
        'gun': '7yXyZPEN21k',
        'morty': 'WTWdP5DMdsM',
        'rick': 'gyPaJSGDqS0'
    }

    // window.addEventListener( 'mousemove', onMouseMove, true );

    let containerEarthModel = new THREE.Object3D()
    containerEarthModel.rotateZ(-23.4 * Math.PI/180)
    containerEarthModel.position.z	= 0

    // tones
    // const [frequency, setFrequency] = useState(200)
    // const [osc, setOsc] = useState(new Tone.OmniOscillator(200).toMaster())
    // const [positions, setPositions] = useState([])
    // const [timestamps, setTimestamps] = useState([])

    // 3D objs
    let plumbus;
    let containerEarth = containerEarthModel;
    const [earthRadius, setEarthRadius] = useState(50);

    const [showInfo, setShowInfo] = useState(false)
    const [loaded, setLoaded] = useState(false)

    var context = new AudioContext();

    var domEvents

    useEffect(() => {
        if (initialized !== undefined) {
            return
        }
        if (permissionGranted) {
            context.resume()
            console.log("initializing init!")
            init();
            animate();
        }
    }, [permissionGranted, init, animate, context])



    useEffect(() => {
        if (permissionGranted) {
            console.log(permissionGranted)
            var portalSound = new Tone.Player("sounds/portal.mp3", function() {
                portalSound.start()
            }).toMaster();
     
            earth = createEarth(containerEarth, earth, earthRadius)
            earthCloud = createEarthCloud(containerEarth, earthCloud, earthRadius)
            containerEarth.add(earth);
            containerEarth.add(earthCloud);
            scene.add(containerEarth)
            setTimeout(function(){      
                deleteParticles(scene);
            }, 3000);
        }
    }, [loaded, deleteParticles, permissionGranted])


    useEffect(() => {
        if (!playing) {
            document.getElementById('player').style.display = 'none';
            document.getElementById('title').style.display = 'block';
            document.getElementById('player-container').style.zIndex = '-1';
        }
        else {
            document.getElementById('player').style.display = 'flex';
            document.getElementById('title').style.display = 'none';
            document.getElementById('player-container').style.zIndex = '3';
        }
    }, [playing, setPlaying])

    init = () => {
        if (renderer || scene || portalLight) {
            return
        }
        let dimensionNum = Object.keys(worlds)[Math.floor(Math.random()*Object.keys(worlds).length)];
        let dimensionX = worlds[dimensionNum]
        dimensionData = dimensionX;
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

        createControls( perspectiveCamera );

        domEvents = new THREEx.DomEvents(perspectiveCamera, renderer.domElement)

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

        particleSetup();

        window.addEventListener( 'resize', onWindowResize, true );
        // window.addEventListener( 'mousemove', onMouseMove, true)

        render();
    }

    function particleSetup() {
        sceneLight = new THREE.DirectionalLight(0xffffff,0.5);
        sceneLight.position.set(0,0,1);
        scene.add(sceneLight);
        portalLight = new THREE.PointLight(0x8DBE50, 30, 600, 4.7);
        portalLight.position.set(0,0,90);
        scene.add(portalLight)

        let loader = new THREE.TextureLoader(manager);
        loader.load("smoke.png", function (texture){
            let portalGeo = new THREE.PlaneBufferGeometry(50,50);
            let portalMaterial = new THREE.MeshStandardMaterial({
                map:texture,
                transparent: true
            });
            let smokeGeo = new THREE.PlaneBufferGeometry(200,200);
            let smokeMaterial = new THREE.MeshStandardMaterial({
                map:texture,
                transparent: true
            });
            for(let p=880;p>250;p--) {
                let particle = new THREE.Mesh(portalGeo,portalMaterial);
                particle.position.set(
                    0.1 * p * Math.cos((4 * p * Math.PI) / 180),
                    0.1 * p * Math.sin((4 * p * Math.PI) / 180),
                    0.1 * p
                );
                particle.rotation.z = Math.random() *360;
                portalParticles.push(particle);
                scene.add(particle);
            }
            for(let p=0;p<40;p++) {
                let particle = new THREE.Mesh(smokeGeo,smokeMaterial);
                particle.position.set(
                    Math.random() * 200-100,
                    Math.random() * 100-50,
                    -100
                );
                particle.rotation.z = Math.random() *360;
                smokeParticles.push(particle);
                scene.add(particle);
            }
            animate();
            
        }, () => setLoaded(true));
    }


    deleteParticles = (scene) => {
        let particlePromises = []
        let smokePromises = []

        for (let p in portalParticles) {
            let tl = new TimelineMax();
            particlePromises.push(new Promise(function(resolve, reject) {
                resolve(
                    tl.to(portalParticles[p].material, 10, {opacity: 0, ease: Power4.easeOut, onComplete: scene.remove(portalParticles[p])})
                    
                );
              })
            )
        }
        
        for (let s in smokeParticles) {
            let tl = new TimelineMax();
            smokePromises.push(new Promise(function(resolve, reject) {
                resolve(
                    tl.to(smokeParticles[s].material, 10, {opacity: 0, ease: Power4.easeOut, onComplete: scene.remove(smokeParticles[s])})
                    
                );
              })
            )        
        }

        Promise.all([...particlePromises, ...smokePromises]).then(function(values) {
            
            var light = new THREE.AmbientLight( 0xffffff )
            scene.add( light )

            // Create a new directional light
            var light = new THREE.DirectionalLight( 0xffffff, 1 )
            light.position.set(20,10,20)
            scene.add( light )

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

            scene.remove(portalLight)
            scene.remove(sceneLight)


            loadModels()

          });

        
    }

    let loadModels = () => {
        if (dimensionData.models) {
            let models = dimensionData.models
            console.log(models)
    
            loadRick(objs, scene, manager, rick, playing, setPlaying, setVideo, domEvents);

            setTimeout(function() {
                let sound = dimensionData.sound;
                var rickSound = new Tone.Player(sound, function() {
                    rickSound.start()
                }).toMaster();
            }, 2000)

            console.log(models)
            console.log(typeof models)
    
            if (models.includes("morty")) {
                morty = loadMorty(scene, morty, manager, playing, setPlaying, setVideo, domEvents)
            }

            if (models.includes("pickleRick")) {
                pickleRick = loadPickleRick(scene, pickleRick, manager, playing, setPlaying, setVideo, domEvents)
            }
            
            if (models.includes("sauser")) {
                sauser = loadSauser(containerEarth, sauser, manager, playing, setPlaying, setVideo, domEvents)
            }

            if (models.includes("gun")) {
                gun = loadGun(scene, gun, manager, playing, setPlaying, setVideo, domEvents, containerEarth)
            }

            if (models.includes("plumbus")) {
                plumbus = loadPlumbus(scene, plumbus, manager, playing, setPlaying, setVideo, domEvents, containerEarth)
            }

            if (models.includes("cromulon")) {
                cromulon = loadCromulon(scene, cromulon, manager, playing, setPlaying, setVideo, domEvents, containerEarth)
            }

            if (models.includes("discoBall")) {
                discoBall = loadDiscoBall(scene, discoBall, manager, playing, setPlaying, setVideo, domEvents, containerEarth)
            }

            if (models.includes("tinyPlanet")) {
                tinyPlanet = loadTinyPlanet(scene, tinyPlanet, manager, playing, setPlaying, setVideo, domEvents, containerEarth)
            }

            if (models.includes("microphone")) {
                microphone = loadMicrophone(scene, microphone, manager, playing, setPlaying, setVideo, domEvents, containerEarth)
            }

            if (models.includes("butt")) {
                butt = loadButt(scene, butt, manager, playing, setPlaying, setVideo, domEvents, containerEarth)
            }

            if (models.includes("TV")) {
                TV = loadTV(scene, TV, manager, playing, setPlaying, setVideo, domEvents, containerEarth)
            }

            if (models.includes("sun")) {
                sun = loadSun(scene, sun, manager, playing, setPlaying, setVideo, domEvents, containerEarth)
            }

        }
        animate()
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
        renderer.setSize( window.innerWidth, window.innerHeight );
        controls.handleResize();
        render();
    }

    let r = 100;
    let theta = 0;
    let dTheta = 2 * Math.PI / 1000;
    clock = new THREE.Clock();
    
    animate = () => {
        if (!renderer) {
            return
        }

        let delta = clock.getDelta();

        var camera = perspectiveCamera;
        objs.forEach(({mixer}) => {mixer.update(delta)});
        if (earth) {
            containerEarth.rotation.y += 0.001;
            earth.rotation.y += 0.001;
            earthCloud.rotation.y -= 0.0003;
            if (gun) {
                console.log("we got a gun man")
                placeObjectOnPlanet(gun, 100, 100, 50)
            }   
        }


        portalParticles.forEach(p => {
            p.rotation.z -= delta *1.5;
        });

        smokeParticles.forEach(p => {
            p.rotation.z -= delta *0.2;
        });

        if (Math.random() > 0.9) {
            portalLight.power = 350 + Math.random()*500;
        }

        theta+=dTheta;

        if (sauser !== undefined) {
            console.log("we got a foooking sauser!")
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

        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
        var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
        vector.unproject( perspectiveCamera );
        var dir = vector.sub( perspectiveCamera.position ).normalize();
        var distance = - perspectiveCamera.position.z / dir.z;
        var pos = perspectiveCamera.position.clone().add( dir.multiplyScalar( distance ) );

        console.log(gun)

        if (gun) {
            gun.position.copy(pos);
        }

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
                let intersect = intersects[i]
                let tl = new TimelineMax();
                let originalScale = intersect.object.scale.x
                // tl.fromTo(intersects[i].object.scale, .7, {x: (originalScale)*1.2, y: (originalScale)*1.2, z: (originalScale)*1.2, ease: Power4.easeIn},{x: (originalScale), y: (originalScale), z: (originalScale), ease: Power4.easeIn})
                spotLight.target = intersect.object
                // spotLight.target.y = mouse.y
                spotLight.updateMatrix();
            }
        }

    }

    function onTransitionEnd( event ) {
        const element = event.target;
        element.remove();
    }

    let warp = () => {
        window.location.reload()
    }

    return (
        <div>
            {!permissionGranted && 
                <section className="access">
                    <h1>This experience may contain strong language and violent content. Do you wish to proceed?</h1>
                    <button onClick={e => setPermissionGranted(true)}>Take me In</button>
                    <button onClick={e => window.location.href = "https://www.urbandictionary.com/define.php?term=Pussy"}>I'm too Scared</button>
                </section>
            }
            <section id="loading-screen">
                <div id="loader"></div>
            </section>
            <button className="warp" onClick={e => warp()}>WARP</button>
            <h1 id="title">Ricktastic Planetarium</h1>
            <section id="player-container">
                <div id="player" className="centered">
                    {playing && 
                        <YouTube
                        videoId={videos[video]}
                        onReady={onReady}
                        opts={opts}
                        />
                    }
                    <button className="close" onClick={(e) => setPlaying(false)}>X</button>
                </div>
            </section>
            <button className="info-button" onClick={() => setShowInfo(!showInfo)}>info</button>
            {showInfo && 
                <div className="info-pane">
                    <button onClick={() => setShowInfo(false)} className="close">X</button>
                    <h2>Dimension: {dimensionData.name}</h2>
                    <h2>Info: {dimensionData.info}</h2>
                    <h2>Instructions: {dimensionData.instructions}</h2>
                </div>
            }

        </div>
    )
}

export default App;