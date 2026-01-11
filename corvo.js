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


async function carregarRanking() {
  if (!authReady) return;

  grupo = [];
  const snap = await getDocs(rankingRef);
  snap.forEach(d => grupo.push({ id: d.id, ...d.data() }));
  grupo.sort((a, b) => b.pontos - a.pontos);
  mostrar();
}

function rank(p) {
  if (p <= 1) return "Ferro";
  if (p <= 3) return "Bronze";
  if (p <= 6) return "Prata";
  if (p <= 10) return "Ouro";
  if (p <= 15) return "Platina";
  if (p <= 21) return "Mithril";
  if (p <= 28) return "Oricalco";
  return "Adamantita";
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
    pontos: 0
  });

  document.getElementById("nome").value = "";
  carregarRanking();
}

async function vitoria(i) {
  if (!admin) return;
  await updateDoc(doc(db, "ranking", grupo[i].id), {
    pontos: grupo[i].pontos + 1
  });
  carregarRanking();
}

async function derrota(i) {
  if (!admin || grupo[i].pontos === 0) return;
  await updateDoc(doc(db, "ranking", grupo[i].id), {
    pontos: grupo[i].pontos - 1
  });
  carregarRanking();
}

async function editarMembro(i) {
  if (!admin) return;

  const atual = grupo[i];

  const novoTitulo = prompt(
    "Título (Líder, Conselheiro, Capitão, Membro ou vazio):",
    atual.titulo || ""
  );
  if (novoTitulo === null) return;

  const novaClasse = prompt(
    "Classe (Escudeiro, Cavaleiro, Espadachim, Lanceiro, Ladino):",
    atual.classe
  );
  if (novaClasse === null) return;

  await updateDoc(doc(db, "ranking", atual.id), {
    titulo: novoTitulo.trim(),
    classe: novaClasse.trim()
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
    const r = rank(m.pontos);
    const top = i === 0 ? "top1" : i === 1 ? "top2" : i === 2 ? "top3" : "";

    lista.innerHTML += `
      <li class="${top}">
        <span class="nome">
          ${i < 3 ? coroa() : ""}
          ${i + 1}º ${m.nome} — ${m.pontos} vitórias

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
