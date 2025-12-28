import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, updateDoc,
  deleteDoc, doc, query, orderBy, onSnapshot
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

const ADMIN_EMAIL = "corvosdonorte@gmail.com";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const rankingRef = collection(db, "ranking");
let grupo = [];
let isAdmin = false;

window.loginGoogle = () => signInWithPopup(auth, provider);
window.logout = () => signOut(auth);

onAuthStateChanged(auth, user => {
  isAdmin = !!user && user.email === ADMIN_EMAIL;
  mostrar();
});

onSnapshot(query(rankingRef, orderBy("pontos", "desc")), snap => {
  grupo = [];
  snap.forEach(d => grupo.push({ id: d.id, ...d.data() }));
  mostrar();
});

window.adicionarMembro = async () => {
  if (!isAdmin) return alert("Somente o administrador pode editar");
  const nome = document.getElementById("nome").value.trim();
  const classe = document.getElementById("classe").value;
  if (!nome) return;
  await addDoc(rankingRef, { nome, classe, pontos: 0 });
  document.getElementById("nome").value = "";
};

window.vitoria = i => updateDoc(doc(db,"ranking",grupo[i].id),{pontos:grupo[i].pontos+1});
window.derrota = i => grupo[i].pontos>0 &&
  updateDoc(doc(db,"ranking",grupo[i].id),{pontos:grupo[i].pontos-1});
window.removerMembro = i =>
  confirm("Remover membro?") && deleteDoc(doc(db,"ranking",grupo[i].id));

function rank(p){
  return p<=5?"Ferro":p<=10?"Prata":p<=15?"Ouro":p<=20?"Platina":
         p<=25?"Mithril":p<=30?"Oricalco":"Adamante";
}

function mostrar(){
  const lista=document.getElementById("ranking");
  lista.innerHTML="";
  grupo.forEach((m,i)=>{
    lista.innerHTML+=`
      <li class="${i<3?"top"+(i+1):""}">
        <span class="nome">
          ${i+1}º ${m.nome} — ${m.pontos}
          <span class="badge ${rank(m.pontos).toLowerCase()}">${rank(m.pontos)}</span>
          <span class="badge classe ${m.classe.toLowerCase()}">${m.classe}</span>
        </span>
        ${isAdmin?`
        <div class="acoes">
          <button class="btn" onclick="vitoria(${i})">+</button>
          <button class="btn" onclick="derrota(${i})">-</button>
          <div class="lixeira" onclick="removerMembro(${i})">🗑</div>
        </div>`:""}
      </li>`;
  });
}
