import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getFirestore, collection, getDocs,
  addDoc, updateDoc, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import {
  getAuth, GoogleAuthProvider,
  signInWithPopup, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBIW5VVHxqchFRoaCoesLLAUXvYW7bvDr4",
  authDomain: "corvosdonorte-48440.firebaseapp.com",
  projectId: "corvosdonorte-48440",
  storageBucket: "corvosdonorte-48440.firebasestorage.app",
  messagingSenderId: "306517537620",
  appId: "1:306517537620:web:2942dceb67154cd6054ec1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const rankingRef = collection(db, "ranking");

let grupo = [];
let admin = false;
let authReady = false;

onAuthStateChanged(auth, user => {
  admin = user?.email === "corvosdonorte@gmail.com";
  authReady = true;
  carregarRanking();
});

async function loginGoogle() {
  await signInWithPopup(auth, provider);
}

async function logoutGoogle() {
  await signOut(auth);
}

function rank(pontos, drakimas) {
  if (pontos >= 49 && drakimas >= 100) return "Adamantita";
  if (pontos >= 49 && drakimas >= 85) return "Oricalco";
  if (pontos >= 35 && drakimas >= 70) return "Mithril";
  if (pontos >= 25 && drakimas >= 55) return "Platina";
  if (pontos >= 15 && drakimas >= 35) return "Ouro";
  if (pontos >= 10 && drakimas >= 20) return "Prata";
  if (pontos >= 5 && drakimas >= 10) return "Bronze";
  return "Ferro";
}

function cls(t) {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function coroa() {
  return `<span class="coroa">👑</span>`;
}

function drakimaIcon() {
  return `
    <svg viewBox="0 0 24 24">
      <path d="M12 2l4 8h-8l4-8zm0 20l-4-8h8l-4 8z"/>
    </svg>
  `;
}

async function carregarRanking() {
  if (!authReady) return;

  grupo = [];
  const snap = await getDocs(rankingRef);
  snap.forEach(d => grupo.push({ id: d.id, ...d.data() }));

  grupo.sort((a, b) => (b.pontos ?? 0) - (a.pontos ?? 0));
  mostrar();
}

async function adicionarMembro() {
  if (!admin || !authReady) return;

  const nome = document.getElementById("nome").value.trim();
  const classe = document.getElementById("classe").value;
  const titulo = document.getElementById("titulo").value;

  if (!nome || !classe) return;

  await addDoc(rankingRef, {
    nome,
    classe,
    titulo: titulo || "",
    pontos: 0,
    drakimas: 0
  });

  document.getElementById("nome").value = "";
  carregarRanking();
}

async function vitoria(i) {
  if (!admin) return;

  await updateDoc(doc(db, "ranking", grupo[i].id), {
    pontos: (grupo[i].pontos ?? 0) + 1
  });

  carregarRanking();
}

async function derrota(i) {
  if (!admin || (grupo[i].pontos ?? 0) === 0) return;

  await updateDoc(doc(db, "ranking", grupo[i].id), {
    pontos: grupo[i].pontos - 1
  });

  carregarRanking();
}

async function editarMembro(i) {
  if (!admin) return;

  const atual = grupo[i];

  const novoTitulo = prompt("Título:", atual.titulo || "");
  if (novoTitulo === null) return;

  const novaClasse = prompt("Classe:", atual.classe);
  if (novaClasse === null) return;

  const novasDrakimas = prompt("Drakimas:", atual.drakimas ?? 0);
  if (novasDrakimas === null) return;

  const drakimasNum = parseInt(novasDrakimas, 10);
  if (isNaN(drakimasNum)) return alert("Drakimas inválidas");

  await updateDoc(doc(db, "ranking", atual.id), {
    titulo: novoTitulo.trim(),
    classe: novaClasse.trim(),
    drakimas: drakimasNum
  });

  carregarRanking();
}

async function remover(i) {
  if (!admin || !confirm("Remover este membro?")) return;
  await deleteDoc(doc(db, "ranking", grupo[i].id));
  carregarRanking();
}

function mostrar() {
  const lista = document.getElementById("ranking");
  lista.innerHTML = "";

  grupo.forEach((m, i) => {
    const pontos = m.pontos ?? 0;
    const drakimas = m.drakimas ?? 0;
    const r = rank(pontos, drakimas);

    const top =
      i === 0 ? "top1" :
      i === 1 ? "top2" :
      i === 2 ? "top3" : "";

    lista.innerHTML += `
      <li class="${top}">
        <span class="nome">
          ${i < 3 ? coroa() : ""}
          ${i + 1}º ${m.nome}
          — ${pontos} vitórias

          <span class="badge drakma">
            ${drakimaIcon()} ${drakimas}
          </span>

          ${m.titulo
            ? `<span class="badge titulo ${cls(m.titulo)}">${m.titulo}</span>`
            : ""}

          <span class="badge classe ${cls(m.classe)}">${m.classe}</span>
          <span class="badge ${cls(r)}">${r}</span>
        </span>

        ${admin ? `
        <div class="acoes">
          <button class="btn" onclick="vitoria(${i})">+</button>
          <button class="btn" onclick="derrota(${i})">-</button>
          <button class="btn editar" onclick="editarMembro(${i})">🖌️</button>
          <button class="btn" onclick="remover(${i})">🗑</button>
        </div>` : ""}
      </li>
    `;
  });
}

window.loginGoogle = loginGoogle;
window.logoutGoogle = logoutGoogle;
window.adicionarMembro = adicionarMembro;
window.vitoria = vitoria;
window.derrota = derrota;
window.editarMembro = editarMembro;
window.remover = remover;
