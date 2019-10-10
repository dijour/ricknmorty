import React from 'react';
import './App.css';
import {Expo, TimelineMax} from "gsap/TweenMax";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function App() {

  var scene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000)
  camera.position.z = 5;
  
  var renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setClearColor("#e5e5e5");
  renderer.setSize(window.innerWidth,window.innerHeight);

  document.body.appendChild(renderer.domElement);

  window.addEventListener('resize', () => {
      renderer.setSize(window.innerWidth,window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;

      camera.updateProjectionMatrix();
  })

  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();

  var geometry = new THREE.SphereGeometry(1, 30, 30);
  var material = new THREE.MeshPhongMaterial({color: 0xFE18EA});
  //var mesh = new THREE.Mesh(geometry, material);

  //scene.add(mesh);

  let meshX = -10;
  // for(var i = 0; i<15;i++) {
  //     var mesh = new THREE.Mesh(geometry, material);
  //     mesh.position.x = (Math.random() - 0.5) * 10;
  //     mesh.position.y = (Math.random() - 0.5) * 10;
  //     mesh.position.z = (Math.random() - 0.5) * 10;
  //     scene.add(mesh);
  //     meshX+=1;
  // }

    var earth = new THREE.Mesh(geometry, material);
    earth.position.x = (Math.random() - 0.5) * 10;
    earth.position.y = (Math.random() - 0.5) * 10;
    earth.position.z = (Math.random() - 0.5) * 10;
    earth.name = "Earth"
    scene.add(earth);


  var light = new THREE.PointLight(0xFFFFFF, 1, 1000)
  light.position.set(0,0,0);
  scene.add(light);

  var light = new THREE.PointLight(0xFFFFFF, 2, 1000)
  light.position.set(0,0,25);
  scene.add(light);

  const loader = new GLTFLoader();
    loader.load( './drunk_walk.bfx', gltf => {

    scene.add( gltf.scene );

  } );

  var render = function() {
      requestAnimationFrame(render);

      // earth.scale.y += .01;

      // for (let child in scene.children) {
      //   console.log(scene.children[child].scale.y -= 1);
      //   console.log(scene.children[child].scale.x -= 1);
      //   console.log(scene.children[child].scale.z -= 1);

      // }

      renderer.render(scene, camera);
  }

  function onMouseMove(event) {
      event.preventDefault();

      mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      var intersects = raycaster.intersectObjects(scene.children, true);
      for (var i = 0; i < intersects.length; i++) {
          this.tl = new TimelineMax();
          this.tl.to(intersects[i].object.scale, 1, {x: 2, ease: Expo.easeOut})
          this.tl.to(intersects[i].object.scale, .5, {x: .5, ease: Expo.easeOut})
          this.tl.to(intersects[i].object.position, .5, {x: 2, ease: Expo.easeOut})
          this.tl.to(intersects[i].object.rotation, .5, {y: Math.PI*.5, ease: Expo.easeOut}, "=-1.5")
      }
  }

  

  window.addEventListener('mousemove', onMouseMove);
  render();

  // return (
    // <h1>Hello!</h1>
  // );
  return null;
}

export default App;
