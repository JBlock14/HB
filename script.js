const space =
  document.getElementById("space");

const fx =
  document.getElementById("fx");

const s =
  space.getContext("2d");

const f =
  fx.getContext("2d");


let W = innerWidth;
let H = innerHeight;

let D =
  Math.min(
    devicePixelRatio || 1,
    2
  );


let stars = [];
let sparks = [];
let rockets = [];

let mouse = {
  x: W / 2,
  y: H / 2
};

let time = 0;
let sparkCount = 0;


/* =========================================================
   UTILIDADES
   ========================================================= */

function random(min, max) {

  return Math.random() *
    (max - min) +
    min;
}


/* =========================================================
   RESIZE
   ========================================================= */

function resize() {

  W = innerWidth;
  H = innerHeight;

  D =
    Math.min(
      devicePixelRatio || 1,
      2
    );

  for (const canvas of [space, fx]) {

    canvas.width = W * D;
    canvas.height = H * D;

    canvas.style.width =
      W + "px";

    canvas.style.height =
      H + "px";
  }

  s.setTransform(
    D, 0, 0, D, 0, 0
  );

  f.setTransform(
    D, 0, 0, D, 0, 0
  );


  stars =
    Array.from(
      {
        length:
          Math.min(
            700,
            Math.max(
              180,
              Math.floor(
                W * H / 1800
              )
            )
          )
      },
      createStar
    );


  updateOrientation();
}


function createStar() {

  return {

    x: random(0, W),

    y: random(0, H),

    z: random(.15, 1),

    radius:
      random(.3, 1.8),

    angle:
      random(0, Math.PI * 2),

    speed:
      random(.002, .014),

    hue:
      Math.random() < .15
        ? 190
        : Math.random() < .12
          ? 320
          : 0
  };
}


addEventListener(
  "resize",
  resize
);


addEventListener(
  "orientationchange",
  () => {

    setTimeout(
      resize,
      200
    );

  }
);


/* =========================================================
   ORIENTACIÓN
   ========================================================= */

const orientation =
  document.getElementById(
    "orientation"
  );


let experienceStarted =
  false;


function updateOrientation() {

  if (experienceStarted)
    return;


  const portrait =
    window.matchMedia(
      "(orientation: portrait)"
    ).matches;


  orientation.style.display =
    "grid";


  const title =
    orientation.querySelector("h1");

  const text =
    orientation.querySelector("p");

  const gate =
    document.getElementById(
      "startGate"
    );


  if (portrait) {

    title.textContent =
      "Gira el teléfono";

    text.textContent =
      "Esta experiencia fue creada para verse en horizontal.";

    gate.style.display =
      "none";

  }

  else {

    title.textContent =
      "Todo listo";

    text.textContent =
      "Ahora puedes entrar al pequeño universo.";

    gate.style.display =
      "flex";
  }
}


/* =========================================================
   UNIVERSO
   ========================================================= */

function drawStars() {

  s.clearRect(
    0,
    0,
    W,
    H
  );


  const background =
    s.createRadialGradient(
      W * .5,
      H * .46,
      0,
      W * .5,
      H * .46,
      Math.max(W, H) * .72
    );


  background.addColorStop(
    0,
    "#16052c"
  );

  background.addColorStop(
    .5,
    "#08051a"
  );

  background.addColorStop(
    1,
    "#010106"
  );


  s.fillStyle =
    background;

  s.fillRect(
    0,
    0,
    W,
    H
  );


  for (const star of stars) {

    star.angle +=
      star.speed;


    const alpha =
      .2 +
      .6 *
      (
        .5 +
        .5 *
        Math.sin(
          star.angle
        )
      );


    const x =
      star.x +
      (
        mouse.x - W / 2
      ) *
      star.z *
      .015;


    const y =
      star.y +
      (
        mouse.y - H / 2
      ) *
      star.z *
      .015;


    s.beginPath();

    s.arc(
      x,
      y,
      star.radius *
        (.7 + star.z),
      0,
      Math.PI * 2
    );


    s.fillStyle =
      star.hue

        ? `hsla(
            ${star.hue},
            100%,
            82%,
            ${alpha}
          )`

        : `rgba(
            255,
            255,
            255,
            ${alpha}
          )`;


    s.fill();
  }


  /*
    NEBULOSAS
  */

  for (
    let layer = 0;
    layer < 2;
    layer++
  ) {

    s.beginPath();


    for (
      let x = -100;
      x < W + 100;
      x += 18
    ) {

      const y =
        H * .52 +

        Math.sin(
          x * .004 +
          layer * 2 +
          time * .00012
        ) * 85 +

        layer * 55 +

        Math.sin(
          x * .012 +
          time * .0003
        ) * 16;


      if (x === -100)
        s.moveTo(x, y);

      else
        s.lineTo(x, y);
    }


    s.strokeStyle =
      layer

        ? "rgba(70,220,255,.035)"

        : "rgba(255,50,210,.035)";


    s.lineWidth = 70;

    s.stroke();
  }
}


/* =========================================================
   EXPLOSIONES
   ========================================================= */

function burst(
  x,
  y,
  power = 1
) {

  const amount =
    Math.floor(
      70 * power
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


    const speed =
      random(
        1.5,
        7
      ) *
      power;


    sparks.push({

      x,
      y,

      vx:
        Math.cos(angle) *
        speed,

      vy:
        Math.sin(angle) *
        speed,

      life: 1,

      decay:
        random(
          .012,
          .028
        ),

      size:
        random(
          1,
          3.5
        ),

      hue:
        random(
          0,
          360
        )
    });
  }


  sparkCount +=
    amount;


  if (
    navigator.vibrate
  ) {

    navigator.vibrate(
      Math.min(
        30,
        Math.floor(
          power * 12
        )
      )
    );
  }
}


/* =========================================================
   FUEGOS ARTIFICIALES
   ========================================================= */

function createRocket() {

  rockets.push({

    x:
      random(
        W * .15,
        W * .85
      ),

    y:
      H + 20,

    vx:
      random(
        -.6,
        .6
      ),

    vy:
      random(
        -12,
        -9
      ),

    target:
      random(
        H * .15,
        H * .55
      ),

    trail: []
  });
}


function drawEffects() {

  f.clearRect(
    0,
    0,
    W,
    H
  );


  if (
    Math.random() <
    .022
  ) {

    createRocket();
  }


  /*
    COHETES
  */

  for (
    let i = rockets.length - 1;
    i >= 0;
    i--
  ) {

    const rocket =
      rockets[i];


    rocket.trail.push([
      rocket.x,
      rocket.y
    ]);


    if (
      rocket.trail.length >
      10
    ) {

      rocket.trail.shift();
    }


    rocket.x +=
      rocket.vx;

    rocket.y +=
      rocket.vy;

    rocket.vy +=
      .18;


    if (
      rocket.y <
        rocket.target ||
      rocket.vy > 0
    ) {

      burst(
        rocket.x,
        rocket.y,
        random(
          .7,
          1.25
        )
      );


      rockets.splice(
        i,
        1
      );
    }
  }


  /*
    TRAILS
  */

  for (
    const rocket of rockets
  ) {

    f.beginPath();


    rocket.trail
      .forEach(
        (point, index) => {

          if (index)
            f.lineTo(
              point[0],
              point[1]
            );

          else
            f.moveTo(
              point[0],
              point[1]
            );
        }
      );


    f.strokeStyle =
      "rgba(255,255,255,.5)";

    f.lineWidth = 2;

    f.stroke();
  }


  /*
    PARTICULAS
  */

  for (
    let i = sparks.length - 1;
    i >= 0;
    i--
  ) {

    const p =
      sparks[i];


    p.x += p.vx;
    p.y += p.vy;

    p.vy += .045;

    p.vx *= .987;
    p.vy *= .987;

    p.life -=
      p.decay;


    if (
      p.life <= 0
    ) {

      sparks.splice(
        i,
        1
      );

      continue;
    }


    f.beginPath();

    f.arc(
      p.x,
      p.y,
      p.size *
        p.life,
      0,
      Math.PI * 2
    );


    f.fillStyle =
      `hsla(
        ${p.hue},
        100%,
        70%,
        ${p.life}
      )`;


    f.shadowBlur = 12;

    f.shadowColor =
      `hsl(
        ${p.hue},
        100%,
        70%
      )`;


    f.fill();

    f.shadowBlur = 0;
  }
}


/* =========================================================
   ANIMACIÓN
   ========================================================= */

function animate(
  timestamp
) {

  time =
    timestamp;


  drawStars();

  drawEffects();


  requestAnimationFrame(
    animate
  );
}


resize();

requestAnimationFrame(
  animate
);


/* =========================================================
   PARALLAX
   ========================================================= */

const card =
  document.getElementById(
    "card"
  );


addEventListener(
  "pointermove",
  event => {

    mouse.x =
      event.clientX;

    mouse.y =
      event.clientY;


    if (
      innerWidth <= 700
    )
      return;


    const rect =
      card.getBoundingClientRect();


    const rotateX =
      (
        event.clientY -
        (
          rect.top +
          rect.height / 2
        )
      ) /
      rect.height *
      -7;


    const rotateY =
      (
        event.clientX -
        (
          rect.left +
          rect.width / 2
        )
      ) /
      rect.width *
      9;


    card.style.transform =
      `
      perspective(1100px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      `;
  }
);


addEventListener(
  "pointerleave",
  () => {

    card.style.transform =
      "perspective(1100px) rotateX(0) rotateY(0)";
  }
);


/* =========================================================
   TOQUES
   ========================================================= */

addEventListener(
  "pointerdown",
  event => {

    if (
      event.target.closest(
        "button,.panel"
      )
    )
      return;


    burst(
      event.clientX,
      event.clientY,
      .8
    );
  }
);


/* =========================================================
   MÚSICA
   ========================================================= */

let audioContext = null;
let masterGain = null;
let musicTimer = null;


function toggleMusic() {

  if (audioContext) {

    audioContext.close();

    audioContext =
      null;

    clearInterval(
      musicTimer
    );

    document.getElementById(
      "musicButton"
    ).textContent = "♫";

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
    .035;


  masterGain.connect(
    audioContext.destination
  );


  const notes = [

    261.63,
    329.63,
    392,
    523.25,
    392,
    329.63,
    293.66,
    349.23

  ];


  let index = 0;


  function playNote() {

    if (!audioContext)
      return;


    const oscillator =
      audioContext.createOscillator();


    const gain =
      audioContext.createGain();


    oscillator.type =
      "sine";


    oscillator.frequency.value =
      notes[
        index++ %
        notes.length
      ];


    gain.gain.setValueAtTime(
      0,
      audioContext.currentTime
    );


    gain.gain.linearRampToValueAtTime(
      .7,
      audioContext.currentTime + .05
    );


    gain.gain.exponentialRampToValueAtTime(
      .001,
      audioContext.currentTime + 1.8
    );


    oscillator
      .connect(gain)
      .connect(masterGain);


    oscillator.start();


    oscillator.stop(
      audioContext.currentTime + 1.9
    );
  }


  playNote();


  musicTimer =
    setInterval(
      playNote,
      700
    );


  document.getElementById(
    "musicButton"
  ).textContent = "🔇";
}


/* =========================================================
   PANTALLA COMPLETA
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
      "Fullscreen no disponible",
      error
    );
  }
}


/* =========================================================
   INICIAR EXPERIENCIA
   ========================================================= */

document.getElementById(
  "startExperience"
).addEventListener(
  "click",
  async () => {

    experienceStarted =
      true;


    await enterFullscreen();


    orientation.classList.add(
      "hidden"
    );


    /*
      La música comienza aquí,
      porque el usuario acaba de
      realizar una interacción.
    */

    if (!audioContext)
      toggleMusic();


    burst(
      W * .5,
      H * .42,
      1.8
    );
  }
);


/* =========================================================
   BOTONES DE CONTROL
   ========================================================= */

document.getElementById(
  "musicButton"
).onclick =
  toggleMusic;


document.getElementById(
  "fullscreenButton"
).onclick =
  enterFullscreen;


/* =========================================================
   SORPRESA
   ========================================================= */

document.getElementById(
  "surpriseButton"
).onclick =
  () => {

    for (
      let i = 0;
      i < 10;
      i++
    ) {

      setTimeout(
        () => {

          burst(
            random(
              W * .12,
              W * .88
            ),
            random(
              H * .15,
              H * .7
            ),
            1.15
          );

        },
        i * 130
      );
    }


    setTimeout(
      () => {

        document
          .getElementById(
            "finalModal"
          )
          .classList.add(
            "show"
          );

      },
      900
    );


    if (!audioContext)
      toggleMusic();
  };


/* =========================================================
   POEMA
   ========================================================= */

const poemText =

`Que el tiempo te encuentre soñando,
y la vida, sorprendiéndote.

Que tengas noches llenas de estrellas,
días que comiencen con ganas,
y personas que conviertan
los pequeños instantes
en recuerdos enormes.

Que este nuevo capítulo
no sea solamente otro año,
sino otra oportunidad
para descubrir todo lo que aún puedes ser.`;


const poemModal =
  document.getElementById(
    "poemModal"
  );


const typedText =
  document.getElementById(
    "typedText"
  );


let typingTimer;


document.getElementById(
  "poemButton"
).onclick =
  () => {

    poemModal.classList.add(
      "show"
    );


    typedText.textContent =
      "";


    clearInterval(
      typingTimer
    );


    let index = 0;


    typingTimer =
      setInterval(
        () => {

          typedText.textContent +=
            poemText[index++];

          if (
            index >=
            poemText.length
          ) {

            clearInterval(
              typingTimer
            );
          }

        },
        28
      );
  };


/* =========================================================
   CÁMARA
   ========================================================= */

const cameraModal =
  document.getElementById(
    "cameraModal"
  );


const cameraVideo =
  document.getElementById(
    "cameraVideo"
  );


const cameraMessage =
  document.getElementById(
    "cameraMessage"
  );


let cameraStream =
  null;


async function openCamera() {

  cameraModal.classList.add(
    "show"
  );


  try {

    cameraStream =
      await navigator
        .mediaDevices
        .getUserMedia({

          video: {

            facingMode:
              "user",

            width: {
              ideal: 1280
            },

            height: {
              ideal: 720
            }
          },

          audio: false
        });


    cameraVideo.srcObject =
      cameraStream;


    cameraVideo.style.display =
      "block";


  } catch (error) {

    cameraMessage.innerHTML =

      `
      <strong>
        No pudimos acceder a la cámara.
      </strong>

      <br><br>

      Puedes cerrar esta ventana
      y conservar el poema.

      <br><br>

      <small>
        Si quieres usar la cámara,
        revisa los permisos del navegador.
      </small>
      `;

    document.getElementById(
      "takePhotoButton"
    ).style.display =
      "none";
  }
}


function closeCamera() {

  cameraModal.classList.remove(
    "show"
  );


  if (cameraStream) {

    cameraStream
      .getTracks()
      .forEach(
        track =>
          track.stop()
      );
  }


  cameraStream =
    null;


  cameraVideo.srcObject =
    null;


  cameraVideo.style.display =
    "none";
}


/* =========================================================
   GUARDAR MOMENTO
   ========================================================= */

document.getElementById(
  "saveMomentButton"
).onclick =
  openCamera;


document.getElementById(
  "closeCameraButton"
).onclick =
  closeCamera;


/* =========================================================
   TOMAR FOTO
   ========================================================= */

document.getElementById(
  "takePhotoButton"
).onclick =
  () => {

    if (
      !cameraVideo.videoWidth
    )
      return;


    const snapshot =
      document.createElement(
        "canvas"
      );


    snapshot.width =
      cameraVideo.videoWidth;


    snapshot.height =
      cameraVideo.videoHeight;


    const context =
      snapshot.getContext(
        "2d"
      );


    /*
      La cámara frontal suele
      verse espejada. Lo corregimos.
    */

    context.translate(
      snapshot.width,
      0
    );


    context.scale(
      -1,
      1
    );


    context.drawImage(
      cameraVideo,
      0,
      0
    );


    const image =
      new Image();


    image.onload =
      () => {

        const memory =
          createMemoryImage(
            image
          );


        downloadMemory(
          memory
        );


        closeCamera();

        poemModal.classList.remove(
          "show"
        );
      };


    image.src =
      snapshot.toDataURL(
        "image/jpeg",
        .92
      );
  };


/* =========================================================
   CREAR POSTAL / RECUERDO
   ========================================================= */

function createMemoryImage(
  image
) {

  /*
    Formato horizontal
    tipo postal.
  */

  const canvas =
    document.createElement(
      "canvas"
    );


  const width = 1600;
  const height = 900;


  canvas.width =
    width;

  canvas.height =
    height;


  const context =
    canvas.getContext(
      "2d"
    );


  /*
    FONDO
  */

  const background =
    context.createLinearGradient(
      0,
      0,
      width,
      height
    );


  background.addColorStop(
    0,
    "#07020e"
  );


  background.addColorStop(
    .55,
    "#12051f"
  );


  background.addColorStop(
    1,
    "#03131a"
  );


  context.fillStyle =
    background;


  context.fillRect(
    0,
    0,
    width,
    height
  );


  /*
    BRILLO ROSA
  */

  const pinkGlow =
    context.createRadialGradient(
      350,
      430,
      20,
      350,
      430,
      650
    );


  pinkGlow.addColorStop(
    0,
    "rgba(255,60,215,.25)"
  );


  pinkGlow.addColorStop(
    1,
    "rgba(255,60,215,0)"
  );


  context.fillStyle =
    pinkGlow;


  context.fillRect(
    0,
    0,
    width,
    height
  );


  /*
    BRILLO AZUL
  */

  const blueGlow =
    context.createRadialGradient(
      1350,
      450,
      20,
      1350,
      450,
      600
    );


  blueGlow.addColorStop(
    0,
    "rgba(60,220,255,.18)"
  );


  blueGlow.addColorStop(
    1,
    "rgba(60,220,255,0)"
  );


  context.fillStyle =
    blueGlow;


  context.fillRect(
    0,
    0,
    width,
    height
  );


  /*
    BORDE
  */

  context.strokeStyle =
    "rgba(255,255,255,.25)";


  context.lineWidth = 3;


  context.strokeRect(
    34,
    34,
    width - 68,
    height - 68
  );


  /*
    FOTO
  */

  const photoX = 75;
  const photoY = 105;

  const photoWidth = 720;
  const photoHeight = 690;


  context.save();


  context.beginPath();


  context.roundRect(
    photoX,
    photoY,
    photoWidth,
    photoHeight,
    28
  );


  context.clip();


  const scale =
    Math.max(
      photoWidth /
        image.width,

      photoHeight /
        image.height
    );


  const imageWidth =
    image.width *
    scale;


  const imageHeight =
    image.height *
    scale;


  context.drawImage(

    image,

    photoX +
      (
        photoWidth -
        imageWidth
      ) / 2,

    photoY +
      (
        photoHeight -
        imageHeight
      ) / 2,

    imageWidth,
    imageHeight
  );


  context.restore();


  /*
    MARCO DE FOTO
  */

  context.strokeStyle =
    "rgba(255,255,255,.3)";


  context.lineWidth = 2;


  context.strokeRect(
    photoX,
    photoY,
    photoWidth,
    photoHeight
  );


  /*
    TEXTO
  */

  context.fillStyle =
    "#ffffff";


  context.font =
    "700 62px system-ui";


  context.fillText(
    "Para tu",
    900,
    160
  );


  context.fillText(
    "nuevo año",
    900,
    230
  );


  /*
    POEMA
  */

  context.font =
    "italic 28px Georgia";


  context.fillStyle =
    "#eadff0";


  const lines = [

    "Que el tiempo te encuentre soñando,",

    "y la vida, sorprendiéndote.",

    "",

    "Que tengas noches llenas de estrellas,",

    "días que comiencen con ganas,",

    "y personas que conviertan",

    "los pequeños instantes",

    "en recuerdos enormes."
  ];


  let y = 315;


  for (
    const line of lines
  ) {

    context.fillText(
      line,
      900,
      y
    );


    y += 48;
  }


  /*
    FIRMA
  */

  context.font =
    "700 22px system-ui";


  context.fillStyle =
    "#79efff";


  context.fillText(
    "✨ FELIZ CUMPLE ✨",
    900,
    735
  );


  context.font =
    "20px system-ui";


  context.fillStyle =
    "rgba(255,255,255,.45)";


  context.fillText(
    "Un recuerdo creado en este momento",
    900,
    780
  );


  return canvas.toDataURL(
    "image/jpeg",
    .94
  );
}


/* =========================================================
   DESCARGAR POSTAL
   ========================================================= */

function downloadMemory(
  data
) {

  const link =
    document.createElement(
      "a"
    );


  link.href =
    data;


  link.download =
    "recuerdo-feliz-cumple.jpg";


  document.body.appendChild(
    link
  );


  link.click();


  link.remove();
}


/* =========================================================
   FINAL
   ========================================================= */

document.getElementById(
  "closeFinalButton"
).onclick =
  () => {

    document
      .getElementById(
        "finalModal"
      )
      .classList.remove(
        "show"
      );
  };


/* =========================================================
   ESC
   ========================================================= */

addEventListener(
  "keydown",
  event => {

    if (
      event.key !==
      "Escape"
    )
      return;


    document
      .querySelectorAll(
        ".modal"
      )
      .forEach(
        modal =>
          modal.classList.remove(
            "show"
          )
      );
  }
);


/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

updateOrientation();


/*
  Explosiones iniciales.
*/

setTimeout(
  () => {

    burst(
      W * .5,
      H * .35,
      1.4
    );

  },
  900
);