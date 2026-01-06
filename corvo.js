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

onAuthStateChanged(auth, user => {
  admin = user?.email === "corvosdonorte@gmail.com";
  mostrar();
});

async function loginGoogle() {
  await signInWithPopup(auth, provider);
}

async function logoutGoogle() {
  await signOut(auth);
}

async function carregarRanking() {
  grupo = [];
  const snap = await getDocs(rankingRef);
  snap.forEach(d => grupo.push({ id: d.id, ...d.data() }));
  grupo.sort((a, b) => b.pontos - a.pontos);
  mostrar();
}

function rank(p) {
  if (p <= 9) return "Ferro";
  if (p <= 19) return "Bronze";
  if (p <= 34) return "Prata";
  if (p <= 54) return "Ouro";
  if (p <= 69) return "Platina";
  if (p <= 84) return "Mithril";
  if (p <= 99) return "Oricalco";
  return "Adamantita";
}

function cls(t) {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function coroa() {
  return `<span class="coroa">👑</span>`;
}

async function adicionarMembro() {
  if (!admin) return;

  const nome = document.getElementById("nome").value.trim();
  const classe = document.getElementById("classe").value;
  const titulo = document.getElementById("titulo").value.trim();

  if (!nome) return;

  await addDoc(rankingRef, {
    nome,
    classe,
    titulo: titulo || "",
    pontos: 0
  });

  carregarRanking();
}

async function vitoria(i) {
  if (admin)
    updateDoc(doc(db, "ranking", grupo[i].id), {
      pontos: grupo[i].pontos + 1
    }).then(carregarRanking);
}

async function derrota(i) {
  if (admin && grupo[i].pontos > 0)
    updateDoc(doc(db, "ranking", grupo[i].id), {
      pontos: grupo[i].pontos - 1
    }).then(carregarRanking);
}

async function remover(i) {
  if (admin && confirm("Remover?"))
    deleteDoc(doc(db, "ranking", grupo[i].id)).then(carregarRanking);
}

function mostrar() {
  const lista = document.getElementById("ranking");
  lista.innerHTML = "";

  grupo.forEach((m, i) => {
    const r = rank(m.pontos);
    const top = i === 0 ? "top1" : i === 1 ? "top2" : i === 2 ? "top3" : "";

    lista.innerHTML += `
      <li class="${top}">
        <span class="nome">
          ${i < 3 ? coroa() : ""}
          ${i + 1}º ${m.nome} — ${m.pontos} vitórias

          ${m.titulo ? `<span class="badge titulo">${m.titulo}</span>` : ""}
          <span class="badge classe ${cls(m.classe)}">${m.classe}</span>
          <span class="badge ${cls(r)}">${r}</span>
        </span>

        ${admin ? `
        <div class="acoes">
          <button class="btn" onclick="vitoria(${i})">+</button>
          <button class="btn" onclick="derrota(${i})">-</button>
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
window.remover = remover;

carregarRanking();
