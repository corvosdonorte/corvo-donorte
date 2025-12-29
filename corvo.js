import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBIW5VVHxqchFRoaCoesLLAUXvYW7bvDr4",
  authDomain: "corvosdonorte-48440.firebaseapp.com",
  projectId: "corvosdonorte-48440",
  storageBucket: "corvosdonorte-48440.firebasestorage.app",
  messagingSenderId: "306517537620",
  appId: "1:306517537620:web:2942dceb67154cd6054ec1"
};

const ADMIN_EMAIL = "corvosdonorte@gmail.com";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const rankingRef = collection(db, "ranking");

let grupo = [];
let modoAdmin = false;

const btnGoogle = document.getElementById("btnGoogle");
const btnLogout = document.getElementById("btnLogout");
const btnAdicionar = document.getElementById("btnAdicionar");

btnGoogle.addEventListener("click", async () => {
  await signInWithPopup(auth, provider);
});

btnLogout.addEventListener("click", async () => {
  await signOut(auth);
});

onAuthStateChanged(auth, (user) => {
  if (user && user.email === ADMIN_EMAIL) {
    modoAdmin = true;
    btnGoogle.style.display = "none";
    btnLogout.style.display = "inline-block";
    btnAdicionar.disabled = false;
  } else {
    modoAdmin = false;
    btnGoogle.style.display = "inline-block";
    btnLogout.style.display = "none";
    btnAdicionar.disabled = true;
  }
});

async function carregarRanking() {
  grupo = [];
  const snapshot = await getDocs(rankingRef);
  snapshot.forEach(d => grupo.push({ id: d.id, ...d.data() }));
  atualizarRanking();
}

async function adicionarMembro() {
  if (!modoAdmin) return;
  const nome = document.getElementById("nome").value.trim();
  const classe = document.getElementById("classe").value;
  if (!nome) return;
  await addDoc(rankingRef, { nome, classe, pontos: 0 });
  document.getElementById("nome").value = "";
  carregarRanking();
}

async function vitoria(i) {
  if (!modoAdmin) return;
  await updateDoc(doc(db, "ranking", grupo[i].id), {
    pontos: grupo[i].pontos + 1
  });
  carregarRanking();
}

async function derrota(i) {
  if (!modoAdmin) return;
  if (grupo[i].pontos === 0) return;
  await updateDoc(doc(db, "ranking", grupo[i].id), {
    pontos: grupo[i].pontos - 1
  });
  carregarRanking();
}

async function removerMembro(i) {
  if (!modoAdmin) return;
  if (!confirm("Remover este membro?")) return;
  await deleteDoc(doc(db, "ranking", grupo[i].id));
  carregarRanking();
}

function calcularRank(p) {
  if (p <= 5) return "Ferro";
  if (p <= 10) return "Prata";
  if (p <= 15) return "Ouro";
  if (p <= 20) return "Platina";
  if (p <= 25) return "Mithril";
  if (p <= 30) return "Oricalco";
  return "Adamante";
}

function atualizarRanking() {
  grupo.sort((a, b) => b.pontos - a.pontos);
  mostrar();
}

function mostrar() {
  const lista = document.getElementById("ranking");
  lista.innerHTML = "";
  grupo.forEach((m, i) => {
    const rank = calcularRank(m.pontos);
    lista.innerHTML += `
      <li>
        <span>${i + 1}º ${m.nome} — ${m.pontos} vitórias (${rank}) • ${m.classe}</span>
        ${modoAdmin ? `
        <div class="acoes">
          <button onclick="vitoria(${i})">+</button>
          <button onclick="derrota(${i})">-</button>
          <button onclick="removerMembro(${i})">🗑</button>
        </div>` : ""}
      </li>
    `;
  });
}

window.adicionarMembro = adicionarMembro;
window.vitoria = vitoria;
window.derrota = derrota;
window.removerMembro = removerMembro;

carregarRanking();
