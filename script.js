/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

const orientation =
  document.getElementById(
    "orientation"
  );


const experience =
  document.getElementById(
    "experience"
  );


const startButton =
  document.getElementById(
    "startExperience"
  );


const musicButton =
  document.getElementById(
    "musicButton"
  );


const momentButton =
  document.getElementById(
    "momentButton"
  );


const canvas =
  document.getElementById(
    "spaceCanvas"
  );


const ctx =
  canvas.getContext(
    "2d"
  );


const flash =
  document.getElementById(
    "cameraFlash"
  );


const saveMessage =
  document.getElementById(
    "saveMessage"
  );


/* =========================================================
   ESTADO
   ========================================================= */

let started =
  false;


let musicPlaying =
  false;


let audioContext =
  null;


let masterGain =
  null;


let musicNodes =
  [];


let particles =
  [];


let stars =
  [];


let W =
  0;


let H =
  0;


/* =========================================================
   CANVAS
   ========================================================= */

function resizeCanvas() {

  const ratio =
    Math.min(
      window.devicePixelRatio || 1,
      2
    );


  W =
    window.innerWidth;


  H =
    window.innerHeight;


  canvas.width =
    W * ratio;


  canvas.height =
    H * ratio;


  canvas.style.width =
    `${W}px`;


  canvas.style.height =
    `${H}px`;


  ctx.setTransform(
    ratio,
    0,
    0,
    ratio,
    0,
    0
  );


  createStars();

  createParticles();
}


window.addEventListener(
  "resize",
  resizeCanvas
);


window.addEventListener(
  "orientationchange",
  () => {

    setTimeout(
      resizeCanvas,
      250
    );

  }
);


/* =========================================================
   ESTRELLAS
   ========================================================= */

function createStars() {

  stars =
    Array.from(
      {
        length:
          Math.floor(
            Math.max(
              80,
              W * H / 9000
            )
          )
      },

      () => ({

        x:
          Math.random() * W,

        y:
          Math.random() * H,

        size:
          Math.random() * 1.6 + .3,

        alpha:
          Math.random() * .7 + .2,

        speed:
          Math.random() * .5 + .1,

        phase:
          Math.random() *
          Math.PI *
          2
      })
    );
}


/* =========================================================
   PARTÍCULAS
   ========================================================= */

function createParticles() {

  particles =
    Array.from(
      {
        length:
          Math.floor(
            Math.max(
              35,
              W / 25
            )
          )
      },

      () => ({

        x:
          Math.random() * W,

        y:
          Math.random() * H,

        vx:
          (Math.random() - .5) * .15,

        vy:
          (Math.random() - .5) * .15,

        radius:
          Math.random() * 2 + .5,

        life:
          Math.random(),

        hue:
          Math.random() * 360
      })
    );
}


/* =========================================================
   DIBUJAR ESTRELLAS
   ========================================================= */

function drawStars(time) {

  for (
    const star of stars
  ) {

    const twinkle =
      Math.sin(
        time * .001 *
        star.speed +
        star.phase
      ) * .25 + .75;


    ctx.beginPath();


    ctx.arc(
      star.x,
      star.y,
      star.size,
      0,
      Math.PI * 2
    );


    ctx.fillStyle =
      `rgba(255,255,255,${
        star.alpha * twinkle
      })`;


    ctx.fill();
  }
}


/* =========================================================
   DIBUJAR PARTÍCULAS
   ========================================================= */

function drawParticles() {

  for (
    const particle of particles
  ) {

    particle.x +=
      particle.vx;


    particle.y +=
      particle.vy;


    if (
      particle.x < 0
    ) {

      particle.x =
        W;
    }


    if (
      particle.x > W
    ) {

      particle.x =
        0;
    }


    if (
      particle.y < 0
    ) {

      particle.y =
        H;
    }


    if (
      particle.y > H
    ) {

      particle.y =
        0;
    }


    ctx.beginPath();


    ctx.arc(
      particle.x,
      particle.y,
      particle.radius,
      0,
      Math.PI * 2
    );


    ctx.fillStyle =
      `hsla(
        ${particle.hue},
        90%,
        75%,
        .22
      )`;


    ctx.fill();
  }
}


/* =========================================================
   ANIMACIÓN
   ========================================================= */

function animate(time) {

  ctx.clearRect(
    0,
    0,
    W,
    H
  );


  /*
    Fondo.
  */

  const gradient =
    ctx.createRadialGradient(
      W * .5,
      H * .45,
      0,
      W * .5,
      H * .45,
      Math.max(W,H)
    );


  gradient.addColorStop(
    0,
    "#10051d"
  );


  gradient.addColorStop(
    .5,
    "#06040d"
  );


  gradient.addColorStop(
    1,
    "#010105"
  );


  ctx.fillStyle =
    gradient;


  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  drawStars(time);

  drawParticles();


  requestAnimationFrame(
    animate
  );
}


/* =========================================================
   INICIAR CANVAS
   ========================================================= */

resizeCanvas();

requestAnimationFrame(
  animate
);


/* =========================================================
   FULLSCREEN
   ========================================================= */

async function enterFullscreen() {

  try {

    if (
      !document.fullscreenElement
    ) {

      await document.documentElement
        .requestFullscreen();

    }

  } catch (error) {

    console.log(
      "Fullscreen no disponible:",
      error
    );
  }
}


/* =========================================================
   BLOQUEAR HORIZONTAL
   ========================================================= */

async function lockLandscape() {

  try {

    if (
      screen.orientation &&
      screen.orientation.lock
    ) {

      await screen.orientation.lock(
        "landscape"
      );

    }

  } catch (error) {

    /*
      iOS/Safari puede rechazarlo.
      La experiencia sigue funcionando.
    */

    console.log(
      "Bloqueo horizontal no disponible:",
      error
    );
  }
}


/* =========================================================
   AUDIO
   ========================================================= */

function createAudio() {

  if (
    audioContext
  ) {

    return;
  }


  audioContext =
    new (
      window.AudioContext ||
      window.webkitAudioContext
    )();


  masterGain =
    audioContext.createGain();


  masterGain.gain.value =
    .0001;


  masterGain.connect(
    audioContext.destination
  );


  /*
    Pad principal.
  */

  createPad(
    130.81,
    0
  );


  createPad(
    196,
    .7
  );


  createPad(
    261.63,
    1.4
  );


  createPad(
    329.63,
    2.1
  );
}


/* =========================================================
   CREAR PAD
   ========================================================= */

function createPad(
  frequency,
  delay
) {

  const oscillator =
    audioContext.createOscillator();


  const gain =
    audioContext.createGain();


  oscillator.type =
    "sine";


  oscillator.frequency.value =
    frequency;


  gain.gain.value =
    .03;


  oscillator.connect(
    gain
  );


  gain.connect(
    masterGain
  );


  oscillator.start();


  musicNodes.push({
    oscillator,
    gain,
    delay
  });
}


/* =========================================================
   MÚSICA
   ========================================================= */

async function toggleMusic() {

  createAudio();


  if (
    audioContext.state ===
    "suspended"
  ) {

    await audioContext.resume();
  }


  const now =
    audioContext.currentTime;


  if (
    musicPlaying
  ) {

    masterGain.gain
      .cancelScheduledValues(
        now
      );


    masterGain.gain
      .linearRampToValueAtTime(
        .0001,
        now + 1
      );


    musicPlaying =
      false;


    musicButton.innerHTML =
      "<span>♪</span> Música";

    return;
  }


  masterGain.gain
    .cancelScheduledValues(
      now
    );


  masterGain.gain
    .linearRampToValueAtTime(
      .07,
      now + 2
    );


  musicPlaying =
    true;


  musicButton.innerHTML =
    "<span>♫</span> Música";
}


/* =========================================================
   COMENZAR EXPERIENCIA
   ========================================================= */

async function startExperience() {

  if (
    started
  ) {

    return;
  }


  started =
    true;


  /*
    IMPORTANTE:

    Estas acciones ocurren directamente
    después del toque del usuario.
    Esto permite que el navegador
    autorice fullscreen y audio.
  */

  await enterFullscreen();

  await lockLandscape();

  createAudio();

  await toggleMusic();


  /*
    Activamos la experiencia.
  */

  experience.classList.add(
    "active"
  );


  experience.setAttribute(
    "aria-hidden",
    "false"
  );


  /*
    Desaparece la pantalla inicial.
  */

  orientation.classList.add(
    "hidden"
  );


  /*
    Efecto inicial.
  */

  createExplosion(
    W * .5,
    H * .45
  );


  setTimeout(
    () => {

      orientation.style.display =
        "none";

    },
    1000
  );
}


startButton.addEventListener(
  "click",
  startExperience
);


/* =========================================================
   EXPLOSIÓN
   ========================================================= */

function createExplosion(
  centerX,
  centerY
) {

  const amount =
    Math.floor(
      Math.max(
        80,
        W / 5
      )
    );


  for (
    let i = 0;
    i < amount;
    i++
  ) {

    const angle =
      Math.random() *
      Math.PI *
      2;


    const velocity =
      Math.random() *
      7 +
      2;


    particles.push({

      x:
        centerX,

      y:
        centerY,

      vx:
        Math.cos(angle) *
        velocity,

      vy:
        Math.sin(angle) *
        velocity,

      radius:
        Math.random() * 3 +
        1,

      life:
        1,

      hue:
        Math.random() * 360,

      explosion:
        true
    });
  }
}


/* =========================================================
   BOTÓN DE MÚSICA
   ========================================================= */

musicButton.addEventListener(
  "click",
  toggleMusic
);


/* =========================================================
   GUARDAR MOMENTO
   ========================================================= */

momentButton.addEventListener(
  "click",
  saveMoment
);


/* =========================================================
   CAPTURAR MOMENTO
   ========================================================= */

async function saveMoment() {

  /*
    Flash.
  */

  flash.classList.remove(
    "flash"
  );


  void flash.offsetWidth;


  flash.classList.add(
    "flash"
  );


  /*
    Creamos una imagen
    completamente independiente
    del DOM.

    Esto evita necesitar html2canvas.
  */

  const imageCanvas =
    document.createElement(
      "canvas"
    );


  const imageWidth =
    2400;


  const imageHeight =
    1350;


  imageCanvas.width =
    imageWidth;


  imageCanvas.height =
    imageHeight;


  const imageCtx =
    imageCanvas.getContext(
      "2d"
    );


  /*
    Fondo.
  */

  const bg =
    imageCtx.createLinearGradient(
      0,
      0,
      imageWidth,
      imageHeight
    );


  bg.addColorStop(
    0,
    "#06030d"
  );


  bg.addColorStop(
    .5,
    "#170724"
  );


  bg.addColorStop(
    1,
    "#020207"
  );


  imageCtx.fillStyle =
    bg;


  imageCtx.fillRect(
    0,
    0,
    imageWidth,
    imageHeight
  );


  /*
    Estrellas.
  */

  imageCtx.fillStyle =
    "rgba(255,255,255,.7)";


  for (
    let i = 0;
    i < 260;
    i++
  ) {

    const x =
      Math.random() *
      imageWidth;


    const y =
      Math.random() *
      imageHeight;


    const radius =
      Math.random() *
      3 +
      .5;


    imageCtx.beginPath();


    imageCtx.arc(
      x,
      y,
      radius,
      0,
      Math.PI * 2
    );


    imageCtx.fill();
  }


  /*
    Título.
  */

  imageCtx.textAlign =
    "left";


  imageCtx.textBaseline =
    "top";


  imageCtx.font =
    "800 150px system-ui";


  imageCtx.fillStyle =
    "white";


  imageCtx.fillText(
    "Feliz",
    180,
    170
  );


  const gradient =
    imageCtx.createLinearGradient(
      180,
      330,
      1300,
      330
    );


  gradient.addColorStop(
    0,
    "#ff63dc"
  );


  gradient.addColorStop(
    .5,
    "#7eeeff"
  );


  gradient.addColorStop(
    1,
    "#ffffff"
  );


  imageCtx.fillStyle =
    gradient;


  imageCtx.font =
    "800 150px system-ui";


  imageCtx.fillText(
    "cumpleaños",
    180,
    330
  );


  /*
    Línea.
  */

  imageCtx.fillStyle =
    "#ff63dc";


  imageCtx.fillRect(
    180,
    540,
    500,
    5
  );


  /*
    Poema a la derecha.
  */

  const poemX =
    imageWidth * .57;


  let poemY =
    250;


  imageCtx.font =
    "italic 42px Georgia";


  imageCtx.fillStyle =
    "rgba(255,255,255,.85)";


  const lines = [

    "Que nunca te falten motivos",
    "para mirar hacia arriba,",
    "",
    "estrellas que aparezcan",
    "justo cuando las necesites,",
    "",
    "personas que hagan más ligero",
    "el camino,",
    "",
    "y momentos que algún día",
    "recuerdes sonriendo."

  ];


  for (
    const line of lines
  ) {

    imageCtx.fillText(
      line,
      poemX,
      poemY
    );


    poemY +=
      60;
  }


  /*
    Frase final.
  */

  imageCtx.font =
    "bold 46px Georgia";


  imageCtx.fillStyle =
    "#ffffff";


  imageCtx.fillText(
    "Que este nuevo capítulo sea extraordinario.",
    180,
    760
  );


  /*
    Firma.
  */

  imageCtx.font =
    "italic 36px Georgia";


  imageCtx.fillStyle =
    "rgba(255,255,255,.55)";


  imageCtx.fillText(
    "— Para ti, con cariño.",
    180,
    880
  );


  /*
    Fecha.
  */

  imageCtx.font =
    "24px system-ui";


  imageCtx.fillStyle =
    "rgba(255,255,255,.35)";


  imageCtx.fillText(
    new Date().toLocaleDateString(
      "es-ES",
      {
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    ),
    180,
    950
  );


  /*
    Convertimos a PNG.
  */

  imageCanvas.toBlob(
    blob => {

      if (!blob) {

        return;
      }


      const url =
        URL.createObjectURL(
          blob
        );


      const link =
        document.createElement(
          "a"
        );


      link.href =
        url;


      link.download =
        "mi-momento-especial.png";


      link.click();


      setTimeout(
        () => {

          URL.revokeObjectURL(
            url
          );

        },
        1000
      );


      /*
        Mensaje.
      */

      saveMessage.classList.add(
        "show"
      );


      setTimeout(
        () => {

          saveMessage.classList.remove(
            "show"
          );

        },
        2200
      );

    },
    "image/png"
  );
}


/* =========================================================
   TOQUE EN LA EXPERIENCIA
   ========================================================= */

experience.addEventListener(
  "pointerdown",
  event => {

    /*
      Solo creamos pequeñas
      partículas donde toca.
    */

    if (
      event.target.closest(
        "button"
      )
    ) {

      return;
    }


    createExplosion(
      event.clientX,
      event.clientY
    );

  }
);


/* =========================================================
   PREVENIR ZOOM ACCIDENTAL
   ========================================================= */

document.addEventListener(
  "gesturestart",
  event => {

    event.preventDefault();

  }
);


/* =========================================================
   ESCAPE DE FULLSCREEN
   ========================================================= */

document.addEventListener(
  "fullscreenchange",
  () => {

    /*
      Si el usuario sale de fullscreen,
      no destruimos la experiencia.
    */

    if (
      document.fullscreenElement ===
      null &&
      started
    ) {

      console.log(
        "El usuario salió de pantalla completa."
      );
    }
  }
);