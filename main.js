(function () {
  let scene,
    renderer,
    camera,
    model,
    mixer,
    dancing,
    clock = new THREE.Clock(),
    loaderAnim = document.getElementById("js-loader");

  const MODEL_PATH = "./assets/model/retsuko-dancing.glb";

  init();

  function init() {
    console.log(`js loaded`);
    const canvas = document.querySelector("#c");

    // Init the scene
    scene = new THREE.Scene();
    const bgImage = new THREE.TextureLoader().load(
      "./assets/model/dame.png"
    );
    scene.background = bgImage;

    // Init the renderer
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
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
    camera.position.z = 39;
    camera.position.x = -2;
    camera.position.y = 1;

    const listener = new THREE.AudioListener();
    const audio = new THREE.Audio(listener);
    audio.autoplay = true;
    const file = "./assets/epicsaxguy.mp3";

    const audioloader = new THREE.AudioLoader();
    audioloader.load(file, function (buffer) {
      audio.setLoop(true);
      audio.setBuffer(buffer);
      audio.play();
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

    const texture = new THREE.TextureLoader().load("./assets/floor1.png");
    // Floor
    let floorGeometry = new THREE.PlaneGeometry(60, 28, 1, 1);
    let floorMaterial = new THREE.MeshPhongMaterial({
      color: 0xeeeeee,
      shininess: 0,
      map: texture,
    });

    // the mesh is a 3d object in our scene
    let floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -0.5 * Math.PI; // This is 90 degrees by the way
    floor.receiveShadow = true;
    floor.position.y = -11;
    scene.add(floor);

    let retsuko_txt = new THREE.TextureLoader().load(
      "./assets/model/Aggretsukko_Color.png"
    );

    retsuko_txt.flipY = false; // we flip the texture so that its the right way up

    const retsuko_mtl = new THREE.MeshPhongMaterial({
      map: retsuko_txt,
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

        model.traverse((o) => {
          if (o.isMesh) {
            // enables the ability to cast and receive shadows
            o.castShadow = true;
            o.receiveShadow = true;

            o.material = retsuko_mtl;
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
