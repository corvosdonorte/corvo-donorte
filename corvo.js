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

  document.addEventListener("DOMContentLoaded", () => {
    aplicarEstadoAuth();
    carregarRanking();
  });
});

async function loginGoogle() {
  await signInWithPopup(auth, provider);
}

async function logoutGoogle() {
  await signOut(auth);
}

function aplicarEstadoAuth() {
  document.body.classList.toggle("admin", admin);
}

function irPara(view) {
  const home = document.getElementById("home");
  const atividades = document.getElementById("atividades");

  if (home) home.hidden = view !== "home";
  if (atividades) atividades.hidden = view !== "atividades";
}

function mesAtual() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function presencaPadrao() {
  return { mes: mesAtual(), dias: Array(8).fill(null) };
}

function garantirPresenca(m) {
  if (!m.presenca || m.presenca.mes !== mesAtual()) {
    m.presenca = presencaPadrao();
    updateDoc(doc(db, "ranking", m.id), { presenca: m.presenca });
  }
}

async function carregarRanking() {
  if (!authReady) return;

  grupo = [];
  const snap = await getDocs(rankingRef);
  snap.forEach(d => grupo.push({ id: d.id, ...d.data() }));

  grupo.forEach(garantirPresenca);
  grupo.sort((a, b) => (b.pontos ?? 0) - (a.pontos ?? 0));

  mostrarRanking();
  mostrarPresenca();
}

async function adicionarMembro() {
  if (!admin) return;

  const nome = document.getElementById("nome").value.trim();
  const classe = document.getElementById("classe").value;
  const titulo = document.getElementById("titulo").value;

  if (!nome || !classe) return;

  await addDoc(rankingRef, {
    nome,
    classe,
    titulo: titulo || "",
    pontos: 0,
    drakimas: 0,
    presenca: presencaPadrao()
  });

  document.getElementById("nome").value = "";
  carregarRanking();
}

async function vitoria(i) {
  if (!admin) return;
  await updateDoc(doc(db, "ranking", grupo[i].id), { pontos: grupo[i].pontos + 1 });
  carregarRanking();
}

async function derrota(i) {
  if (!admin || grupo[i].pontos === 0) return;
  await updateDoc(doc(db, "ranking", grupo[i].id), { pontos: grupo[i].pontos - 1 });
  carregarRanking();
}

async function remover(i) {
  if (!admin || !confirm("Remover este membro?")) return;
  await deleteDoc(doc(db, "ranking", grupo[i].id));
  carregarRanking();
}

const icons = {
  null: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
  true: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#2ecc71"/></svg>`,
  false: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#e74c3c"/></svg>`,
  justificado: `<svg viewBox="0 0 24 24"><polygon points="12,3 22,20 2,20" fill="#f1c40f"/></svg>`
};

async function togglePresenca(i, d) {
  if (!admin) return;

  const estados = [null, true, false, "justificado"];
  const atual = grupo[i].presenca.dias[d];
  grupo[i].presenca.dias[d] = estados[(estados.indexOf(atual) + 1) % estados.length];

  await updateDoc(doc(db, "ranking", grupo[i].id), { presenca: grupo[i].presenca });
  mostrarPresenca();
}

function mostrarPresenca() {
  const tbody = document.getElementById("tabela-presenca");
  if (!tbody) return;

  tbody.innerHTML = "";

  grupo.forEach((m, i) => {
    const dias = m.presenca.dias.map((v, d) =>
      `<td onclick="${admin ? `togglePresenca(${i},${d})` : ""}">
        ${icons[v]}
      </td>`
    ).join("");

    tbody.innerHTML += `
      <tr>
        <td class="nome-presenca">${m.nome}</td>
        ${dias}
      </tr>
    `;
  });
}

function mostrarRanking() {
  const lista = document.getElementById("ranking");
  if (!lista) return;

  lista.innerHTML = "";

  grupo.forEach((m, i) => {
    lista.innerHTML += `
      <li>
        ${i + 1}º ${m.nome} — ${m.pontos} vitórias
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
window.irPara = irPara;
window.togglePresenca = togglePresenca;
