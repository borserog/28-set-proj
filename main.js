(function () {
  // Set our main variables
  let scene,
    renderer,
    camera,
    model, // Our character
    mixer, // THREE.js animations mixer
    dancing,
    clock = new THREE.Clock(), // Used for anims, which run to a clock instead of frame rate
    loaderAnim = document.getElementById("js-loader");

  const MODEL_PATH = "./retsuko-dancing.glb";

  init();

  function init() {
    console.log(`js loaded`);
    const canvas = document.querySelector("#c");
    const backgroundColor = 0xf1f1f1;

    // Init the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    scene.fog = new THREE.Fog(backgroundColor, 60, 100);

    // Init the renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // Init camera
    camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;
    camera.position.x = -2;
    camera.position.y = -3;

    // create an AudioListener and add it to the camera
    const listener = new THREE.AudioListener();
    camera.add(listener);

    // create a global audio source
    const sound = new THREE.Audio(listener);

    // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load("assets/epicsaxguy.mp3", function (buffer) {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.5);
      sound.play();
    });

    // Add hemisphere light
    let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
    hemiLight.position.set(0, 50, 0);

    // Add hemisphere light to scene
    scene.add(hemiLight);

    // Add directional light
    let d = 8.25;
    let dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
    dirLight.position.set(-8, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 1500;
    dirLight.shadow.camera.left = d * -1;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = d * -1;

    // Add directional light to scene
    scene.add(dirLight);

    // Floor
    let floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
    let floorMaterial = new THREE.MeshPhongMaterial({
      color: 0xeeeeee,
      shininess: 0,
    });

    // the mesh is a 3d object in our scene
    let floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -0.5 * Math.PI; // This is 90 degrees by the way
    floor.receiveShadow = true;
    floor.position.y = -11;
    scene.add(floor);

    let stacy_txt = new THREE.TextureLoader().load("Aggretsukko_Color.png");

    stacy_txt.flipY = false; // we flip the texture so that its the right way up

    const stacy_mtl = new THREE.MeshPhongMaterial({
      map: stacy_txt,
      color: 0xffffff,
      // critical to animated models
      skinning: true,
    });

    // setup model loader
    let loader = new THREE.GLTFLoader();
    loader.load(
      MODEL_PATH,
      function (gltf) {
        model = gltf.scene;
        let fileAnimations = gltf.animations;
        console.log(fileAnimations);

        model.traverse((o) => {
          if (o.isMesh) {
            // enables the ability to cast and receive shadows
            // o.castShadow = true;
            o.receiveShadow = true;

            o.material = stacy_mtl;
          }
        });
        // Set the models initial scale
        model.scale.set(7, 7, 7);
        model.position.y = -11;

        scene.add(model);
        loaderAnim.remove();

        mixer = new THREE.AnimationMixer(model);
        let dancingAnim = THREE.AnimationClip.findByName(
          fileAnimations,
          "Retsuko|mixamo.com|Layer0"
        );
        dancing = mixer.clipAction(dancingAnim);
        dancing.play();
      },
      undefined,
      function (error) {
        console.log(error);
      }
    );
  }

  function update() {
    if (mixer) {
      mixer.update(clock.getDelta());
    }

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(update);
  }

  update();

  function resizeRendererToDisplaySize(rendererParam) {
    const canvas = renderer.domElement;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let canvasPixelWidth = canvas.width / window.devicePixelRatio;
    let canvasPixelHeight = canvas.height / window.devicePixelRatio;

    const needResize =
      canvasPixelWidth !== width || canvasPixelHeight !== height;

    if (needResize) {
      renderer.setSize(width, height, false);
    }

    return needResize;
  }
})();
