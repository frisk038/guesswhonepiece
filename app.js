const FICHIERS = {
  normal: 'data/one_piece_40_personnages.json',
  difficile: 'data/one_piece_40_personnages_difficile.json',
};

const el = {
  compteur: document.getElementById('compteur'),
  indice: document.getElementById('indice'),
  reponse: document.getElementById('reponse'),
  precedent: document.getElementById('precedent'),
  suivant: document.getElementById('suivant'),
  reveler: document.getElementById('reveler'),
  nouveau: document.getElementById('nouveau'),
  niveaux: document.querySelectorAll('.niveau'),
};

let personnages = [];
let perso = null;
let position = 0;
let revele = false;

async function charger(niveau) {
  const reponse = await fetch(FICHIERS[niveau]);
  if (!reponse.ok) throw new Error(`${FICHIERS[niveau]} : ${reponse.status}`);
  personnages = await reponse.json();
}

function tirerPersonnage() {
  let tire;
  do {
    tire = personnages[Math.floor(Math.random() * personnages.length)];
  } while (personnages.length > 1 && tire === perso);

  perso = tire;
  position = 0;
  revele = false;
  afficher();
}

function afficher() {
  el.compteur.textContent = `Indice ${position + 1} / ${perso.indices.length}`;
  el.indice.textContent = perso.indices[position];
  el.reponse.textContent = revele ? perso.personnage : '';
  el.reponse.hidden = !revele;
  el.precedent.disabled = position === 0;
  el.suivant.disabled = position === perso.indices.length - 1;
  el.reveler.disabled = revele;
}

function deplacer(pas) {
  if (!perso) return;
  const cible = position + pas;
  if (cible < 0 || cible >= perso.indices.length) return;
  position = cible;
  afficher();
}

el.precedent.addEventListener('click', () => deplacer(-1));
el.suivant.addEventListener('click', () => deplacer(1));
el.nouveau.addEventListener('click', tirerPersonnage);

el.reveler.addEventListener('click', () => {
  revele = true;
  afficher();
});

el.niveaux.forEach((bouton) => {
  bouton.addEventListener('click', async () => {
    if (bouton.classList.contains('actif')) return;
    el.niveaux.forEach((b) => b.classList.toggle('actif', b === bouton));
    await charger(bouton.dataset.niveau);
    perso = null;
    tirerPersonnage();
  });
});

document.addEventListener('keydown', (evenement) => {
  if (evenement.key === 'ArrowLeft') deplacer(-1);
  if (evenement.key === 'ArrowRight') deplacer(1);
});

charger('normal')
  .then(tirerPersonnage)
  .catch((erreur) => {
    el.compteur.textContent = '';
    el.indice.textContent = `Impossible de charger les indices (${erreur.message}).`;
    el.indice.classList.add('erreur');
    [el.precedent, el.suivant, el.reveler, el.nouveau].forEach((b) => {
      b.disabled = true;
    });
  });
