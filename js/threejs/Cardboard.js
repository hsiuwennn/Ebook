// cardboard
var isCardboard = false;

function cardboardInit(obj) {

    if (isCardboard) {
        $('#example').css('display', 'none');
        $('#ToolBar').css('display', 'block');
        isCardboard = false;
        return;
    } else {
        $('#example').css('display', 'block');
        $('#ToolBar').css('display', 'none');
        isCardboard = true;
    }

    var path = 'Resource/',
        imgList = [
          path + obj.ImageList.Images[5].XFileName, //right
          path + obj.ImageList.Images[4].XFileName, //left
          path + obj.ImageList.Images[0].XFileName, //top
          path + obj.ImageList.Images[1].XFileName, //bottom
          path + obj.ImageList.Images[2].XFileName, //front
          path + obj.ImageList.Images[3].XFileName //back
        ];

    var camera, scene, renderer;
    var effect, controls;
    var element, container;

    var clock = new THREE.Clock();

    init();
    animate();

    function init() {
      renderer = new THREE.WebGLRenderer();
      element = renderer.domElement;
      container = document.getElementById('example');
      container.appendChild(element);

      effect = new THREE.StereoEffect(renderer);

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(90, 1, 0.001, 700);
      camera.position.set(0, 10, 0);
      scene.add(camera);

      controls = new THREE.OrbitControls(camera, element);
      controls.rotateUp(Math.PI / 4);
      controls.target.set(
        camera.position.x + 0.1,
        camera.position.y,
        camera.position.z
      );
      controls.noZoom = true;
      controls.noPan = true;

      function setOrientationControls(e) {
        if (!e.alpha) {
          return;
        }

        controls = new THREE.DeviceOrientationControls(camera, true);
        controls.connect();
        controls.update();

        element.addEventListener('click', fullscreen, false);

        window.removeEventListener('deviceorientation', setOrientationControls, true);
      }
      window.addEventListener('deviceorientation', setOrientationControls, true);


      var light = new THREE.HemisphereLight(0x777777, 0x000000, 0.6);
      scene.add(light);

      var texture = THREE.ImageUtils.loadTextureCube(
        imgList
      );


        //====着色器===

        var shader = THREE.ShaderLib["cube"];

        shader.uniforms["tCube"].value = texture;

        var material = new THREE.ShaderMaterial({
                fragmentShader: shader.fragmentShader,
                vertexShader: shader.vertexShader,
                uniforms: shader.uniforms,
                depthWrite: false,
                side: THREE.BackSide
            }),

        mesh = new THREE.Mesh(new THREE.CubeGeometry(100, 100, 100), material);      //创建方盒子，并添加进方盒场景

        scene.add(mesh);


      window.addEventListener('resize', resize, false);
      setTimeout(resize, 1);
    }

    function resize() {
      var width = window.innerWidth;
      var height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      effect.setSize(width, height);
    }

    function update(dt) {
      resize();

      camera.updateProjectionMatrix();

      controls.update(dt);
    }

    function render(dt) {
      effect.render(scene, camera);
    }

    function animate(t) {
      requestAnimationFrame(animate);

      update(clock.getDelta());
      render(clock.getDelta());
    }

    function fullscreen() {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      }
    }
}