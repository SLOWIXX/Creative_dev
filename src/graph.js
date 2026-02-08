const canvas = document.getElementById("graphique");
const ctx = canvas.getContext("2d");
const size = 650;
canvas.width = size;
canvas.height = size;

// CONFIGURATION

const catapulte = 200;
const vitesseLancement = -15;
const gravite = 0.9;
const vitesseRemontee = 0.05;
const niveau = size - 30;
const nombrePoints = 8;
const points = [];
const pointDepart = { x: 100, y: 550 };
const pointArrivee = { x: 600, y: 150 };
let etat = "start";
let chrono = 0;
let curseurDessin = 0;
const vitesseTrace = 0.15;

for (let i = 0; i < nombrePoints; i++) {
  const ratio = i / (nombrePoints - 1);
  const xInitial = pointDepart.x + (pointArrivee.x - pointDepart.x) * ratio;
  const yInitial = pointDepart.y + (pointArrivee.y - pointDepart.y) * ratio;

  // RANDOM HAUTEUR BY GEMINI
  const maxDrop = pointDepart.y - yInitial;
  const amplitude = Math.min(200, maxDrop) * Math.sin(ratio * Math.PI);
  let yAleatoire = yInitial + Math.random() * amplitude;

  const isFixed = i === 0 || i === nombrePoints - 1;
  if (isFixed) {
    yAleatoire = yInitial;
  }

  const nouveauPoint = {
    x: xInitial,
    y: yInitial,

    initX: xInitial,
    initY: yInitial,

    cibleX: xInitial,
    cibleY: yAleatoire,

    vy: 0,
    isGrounded: false,
    isFixed: isFixed,
  };

  points.push(nouveauPoint);
}

function miseAJour() {
  chrono++;

  switch (etat) {
    // Attendre 1sec avant de commencer A MODIF
    case "start":
      if (chrono > 60) {
        etat = "bend";
        chrono = 0;
      }
      break;

    // Catapulte
    case "bend":
      const progression = chrono / 80;
      points.forEach((p, i) => {
        if (!p.isFixed) {
          // Calcul by gemini pour arrondir bien
          const bendFactor = Math.sin((i / (nombrePoints - 1)) * Math.PI);
          p.y = p.initY + bendFactor * catapulte * progression;
        }
      });
      if (chrono > 80) {
        etat = "launch";
      }
      break;

    // Lancement
    case "launch":
      points.forEach((p) => {
        if (!p.isFixed) {
          // Aléatoire pour envoyer les points a des hauteurs différentes
          p.vy = vitesseLancement + Math.random() * -10;
        }
      });
      etat = "fall";
      break;

    // Chute des points
    case "fall":
      let allOnGround = true;
      points.forEach((p) => {
        if (!p.isFixed && !p.isGrounded) {
          p.vy = p.vy + gravite;
          p.y = p.y + p.vy;
          // Simuler le sol
          if (p.y >= niveau) {
            p.y = niveau;
            p.vy = 0;
            p.isGrounded = true;
          } else {
            allOnGround = false;
          }
        }
      });
      // Quand tout les points sont au sol, on peut passer a l'étape suivante
      if (allOnGround) {
        etat = "attente";
        chrono = 0;
      }
      break;

    case "attente":
      if (chrono > 30) {
        etat = "rise";
      }
      break;

    // Remontée
    case "rise":
      let allArrived = true;
      points.forEach((p) => {
        if (!p.isFixed) {
          // Logique by gemini pour ajouter de la fluidité, ca ralentis a l'approche de la hauteur cible
          p.x = p.x + (p.cibleX - p.x) * vitesseRemontee;
          p.y = p.y + (p.cibleY - p.y) * vitesseRemontee;
          if (Math.abs(p.y - p.cibleY) > 1) {
            allArrived = false;
          }
        }
      });
      // Une fois que tout le monde est en place, on lance le tracé
      if (allArrived) {
        etat = "ligne";
      }
      break;

    case "ligne":
      curseurDessin = curseurDessin + vitesseTrace;

      if (curseurDessin >= nombrePoints - 1) {
        curseurDessin = nombrePoints - 1;
        etat = "final";
      }
      break;

    case "final":
      // logique plus tard pour faire clignoter le point final
      break;
  }
}

function dessiner() {
  ctx.clearRect(0, 0, size, size);

  // Barre transparente au milieu
  ctx.save();
  ctx.strokeStyle = "rgba(51, 255, 0, 0.15)";
  ctx.lineWidth = 4;
  ctx.setLineDash([5, 5]); // mets les pointillés
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  ctx.lineTo(points[nombrePoints - 1].x, points[nombrePoints - 1].y);
  ctx.stroke();
  ctx.restore();

  ctx.strokeStyle = "#ffffffff";
  ctx.lineWidth = 4;
  ctx.fillStyle = "rgb(216, 122, 50)";

  // LIGNE
  if (etat === "start" || etat === "bend") {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < nombrePoints; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  } else if (etat === "ligne" || etat === "final") {
    // --- LOGIQUE DU TRACÉ PROGRESSIF ---
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    // logique by gemini pour tracer la ligne petit a petit
    const indexMax = Math.floor(curseurDessin);
    for (let i = 1; i <= indexMax; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    const reste = curseurDessin - indexMax;
    if (reste > 0 && indexMax < nombrePoints - 1) {
      const pActuel = points[indexMax];
      const pSuivant = points[indexMax + 1];

      const xPartiel = pActuel.x + (pSuivant.x - pActuel.x) * reste;
      const yPartiel = pActuel.y + (pSuivant.y - pActuel.y) * reste;

      ctx.lineTo(xPartiel, yPartiel);
    }
    ctx.stroke();
  }

  points.forEach((p, index) => {
    let doitDessiner = true;

    if (doitDessiner) {
      ctx.beginPath();

      // Onde a la fin de l'animation
      if (etat === "final" && index === nombrePoints - 1) {
        ctx.fillStyle = "rgb(233, 107, 10)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fill();

        const duree = 1000;
        const progression = (Date.now() % duree) / duree;

        const rayonMax = 30;
        const rayonActuel = 6 + rayonMax * progression;
        const opacite = 1 - progression;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 0, ${opacite})`;
        ctx.lineWidth = 2;
        ctx.arc(p.x, p.y, rayonActuel, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        const rayon = p.isFixed ? 6 : 4;
        ctx.arc(p.x, p.y, rayon, 0, Math.PI * 2);

        if (
          p.isFixed ||
          etat === "final" ||
          (etat === "ligne" && index <= curseurDessin)
        ) {
          ctx.fill();
        } else {
          ctx.stroke();
        }
      }
    }
  });
}

function loop() {
  miseAJour();
  dessiner();
  requestAnimationFrame(loop);
}

loop();

const resetBtn = document.getElementById("reset");

function reset() {
  etat = "start";
  chrono = 0;
  curseurDessin = 0;
  points.length = 0;

  for (let i = 0; i < nombrePoints; i++) {
    const ratio = i / (nombrePoints - 1);
    const xInitial = pointDepart.x + (pointArrivee.x - pointDepart.x) * ratio;
    const yInitial = pointDepart.y + (pointArrivee.y - pointDepart.y) * ratio;

    const maxDrop = pointDepart.y - yInitial;
    const amplitude = Math.min(200, maxDrop) * Math.sin(ratio * Math.PI);
    let yAleatoire = yInitial + Math.random() * amplitude;

    const isFixed = i === 0 || i === nombrePoints - 1;
    if (isFixed) {
      yAleatoire = yInitial;
    }

    const nouveauPoint = {
      x: xInitial,
      y: yInitial,
      initX: xInitial,
      initY: yInitial,
      cibleX: xInitial,
      cibleY: yAleatoire,
      vy: 0,
      isGrounded: false,
      isFixed: isFixed,
    };

    points.push(nouveauPoint);
  }
}

if (resetBtn) {
  resetBtn.addEventListener("click", reset);
}
