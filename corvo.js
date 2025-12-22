/* =======================
   🔥 FIREBASE
======================= */
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

/* =======================
   ⚙️ CONFIG / ESTADO
======================= */
let grupo = [];

const SENHA_ADMIN = "corvosvoamjuntos";
let modoAdmin = sessionStorage.getItem("admin") === "true";

/* =======================
   🔐 ADMIN
======================= */
function loginAdmin() {
  const senha = prompt("Senha de administrador:");
  if (senha === SENHA_ADMIN) {
    modoAdmin = true;
    sessionStorage.setItem("admin", "true");
    alert("Modo administrador ativado");
    atualizarRanking();
  } else {
    alert("Senha incorreta");
  }
}

function logoutAdmin() {
  modoAdmin = false;
  sessionStorage.removeItem("admin");
  atualizarRanking();
}

/* =======================
   🗄️ FIRESTORE CRUD
======================= */
async function carregarFirebase() {
  grupo = [];
  const snap = await getDocs(collection(db, "ranking"));

  snap.forEach(d => {
    grupo.push({ id: d.id, ...d.data() });
  });

  atualizarRanking();
}

async function adicionarFirebase(membro) {
  const ref = await addDoc(collection(db, "ranking"), membro);
  membro.id = ref.id;
}

async function atualizarFirebase(membro) {
  await updateDoc(doc(db, "ranking", membro.id), {
    pontos: membro.pontos
  });
}

async function removerFirebase(id) {
  await deleteDoc(doc(db, "ranking", id));
}

/* =======================
   🏆 RANK
======================= */
function calcularRank(p) {
  if (p <= 9) return "Ferro";
  if (p <= 24) return "Prata";
  if (p <= 44) return "Ouro";
  if (p <= 64) return "Platina";
  if (p <= 79) return "Mithril";
  if (p <= 94) return "Oricalco";
  return "Adamante";
}

function classeRank(r) {
  return r.toLowerCase();
}

function classeClasse(c) {
  return c.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/* =======================
   ➕ CRUD
======================= */
async function adicionarMembro() {
  if (!modoAdmin) return alert("Apenas administradores");

  const nome = document.getElementById("nome").value.trim();
  const classe = document.getElementById("classe").value;
  if (!nome) return alert("Digite um nome");

  const membro = { nome, classe, pontos: 0 };
  await adicionarFirebase(membro);

  grupo.push(membro);
  document.getElementById("nome").value = "";
  atualizarRanking();
}

async function removerMembro(i) {
  if (!modoAdmin) return;
  if (confirm("Remover este membro?")) {
    await removerFirebase(grupo[i].id);
    grupo.splice(i, 1);
    atualizarRanking();
  }
}

async function vitoria(i) {
  if (!modoAdmin) return;
  grupo[i].pontos++;
  await atualizarFirebase(grupo[i]);
  atualizarRanking();
}

async function derrota(i) {
  if (!modoAdmin) return;
  if (grupo[i].pontos > 0) {
    grupo[i].pontos--;
    await atualizarFirebase(grupo[i]);
    atualizarRanking();
  }
}

/* =======================
   🖥️ RENDER
======================= */
function atualizarRanking() {
  grupo.sort((a, b) => b.pontos - a.pontos);
  mostrar();
}

function coroaSVG(tipo) {
  const cores = {
    ouro: ["#ffd700", "#ffae00"],
    prata: ["#e0e0e0", "#b0b0b0"],
    bronze: ["#cd7f32", "#a05a1a"]
  };

  return `
  <span class="coroa ${tipo}">
    <svg viewBox="0 0 64 48">
      <path d="M4 36 L12 10 L28 28 L32 6 L36 28 L52 10 L60 36 Z"
        fill="${cores[tipo][0]}" stroke="#000"/>
    </svg>
  </span>`;
}

function mostrar() {
  const lista = document.getElementById("ranking");
  lista.innerHTML = "";

  grupo.forEach((m, i) => {
    const rank = calcularRank(m.pontos);

    let coroa = "";
    let classeTop = "";
    if (i === 0) { coroa = coroaSVG("ouro"); classeTop = "top1"; }
    if (i === 1) { coroa = coroaSVG("prata"); classeTop = "top2"; }
    if (i === 2) { coroa = coroaSVG("bronze"); classeTop = "top3"; }

    const acoes = modoAdmin ? `
      <div class="acoes">
        <button class="btn" onclick="vitoria(${i})">+</button>
        <button class="btn" onclick="derrota(${i})">-</button>
        <div class="lixeira" onclick="removerMembro(${i})">🗑</div>
      </div>` : "";

    lista.innerHTML += `
      <li class="${classeTop}">
        <span class="nome">
          ${coroa}
          ${i + 1}º ${m.nome} — ${m.pontos} vitórias
          <span class="badge ${classeRank(rank)}">${rank}</span>
          <span class="badge classe ${classeClasse(m.classe)}">${m.classe}</span>
        </span>
        ${acoes}
      </li>`;
  });
}

/* =======================
   🚀 INIT
======================= */
window.onload = carregarFirebase;

/* =======================
   🔓 EXPOR FUNÇÕES
======================= */
window.loginAdmin = loginAdmin;
window.logoutAdmin = logoutAdmin;
window.adicionarMembro = adicionarMembro;
window.vitoria = vitoria;
window.derrota = derrota;
window.removerMembro = removerMembro;
