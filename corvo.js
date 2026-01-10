import{initializeApp as A}from"https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import{getFirestore as B,collection as C,getDocs as D,addDoc as E,updateDoc as F,deleteDoc as G,doc as H}from"https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import{getAuth as I,GoogleAuthProvider as J,signInWithPopup as K,signOut as L,onAuthStateChanged as M}from"https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

const X=(s,k)=>atob(s).split("").map(c=>String.fromCharCode(c.charCodeAt(0)^k)).join("");
const Z=[
"KioqKyw9Pz8=",
"IyY1LzM=",
"KC4oLzY=",
"KC4wKS8=",
"KC4uLg==",
"IyM9PT0/PT8/PT8=",
"JCM9Pz0qPz4=",
"JCM9Pz0qPz4tPz4=",
"IzwzJSI1LzM=",
"JzM1Nz0/Pz0/NT8vNT8="
];
const S=i=>X(Z[i],9);

const CFG={
apiKey:S(8)+S(9),
authDomain:`${S(5)}.firebaseapp.com`,
projectId:S(5),
storageBucket:`${S(5)}.firebasestorage.app`,
messagingSenderId:"306517537620",
appId:"1:306517537620:web:2942dceb67154cd6054ec1"
};

const APP=A(CFG);
const DB=B(APP);
const AU=I(APP);
const PR=new J();
const REF=C(DB,S(0));

let G0=[],ADM=false,OK=false;

const $=id=>document.getElementById(id);

M(AU,u=>{
ADM=!!(u && (S(7)+S(6))===u.email);
OK=true;
LOAD();
});

async function loginGoogle(){await K(AU,PR)}
async function logoutGoogle(){await L(AU)}

const R=p=>p<=9?"Ferro":p<=19?"Bronze":p<=34?"Prata":p<=54?"Ouro":p<=69?"Platina":p<=84?"Mithril":p<=99?"Oricalco":"Adamantita";
const CLS=s=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const CROWN=()=>`<span class="coroa">👑</span>`;

async function adicionarMembro(){
if(!ADM||!OK)return;
const n=$("nome").value.trim();
const c=$("classe").value;
const t=$("titulo").value;
if(!n||!c)return;
await E(REF,{[S(4)]:n,[S(2)]:c,[S(3)]:t||"",[S(1)]:0});
$("nome").value="";
LOAD();
}

async function vitoria(i){
if(!ADM)return;
await F(H(DB,S(0),G0[i].id),{[S(1)]:G0[i].pontos+1});
LOAD();
}

async function derrota(i){
if(!ADM||G0[i].pontos===0)return;
await F(H(DB,S(0),G0[i].id),{[S(1)]:G0[i].pontos-1});
LOAD();
}

async function editarMembro(i){
if(!ADM)return;
const m=G0[i];
const nt=prompt("Título:",m.titulo||"");
if(nt===null)return;
const nc=prompt("Classe:",m.classe);
if(nc===null)return;
await F(H(DB,S(0),m.id),{titulo:nt.trim(),classe:nc.trim()});
LOAD();
}

async function remover(i){
if(!ADM||!confirm("Remover este membro?"))return;
await G(H(DB,S(0),G0[i].id));
LOAD();
}

async function LOAD(){
if(!OK)return;
G0=[];
const s=await D(REF);
s.forEach(d=>G0.push({id:d.id,...d.data()}));
G0.sort((a,b)=>b.pontos-a.pontos);
RENDER();
}

function RENDER(){
$("ranking").innerHTML="";
G0.forEach((m,i)=>{
const r=R(m.pontos);
const t=i===0?"top1":i===1?"top2":i===2?"top3":"";
$("ranking").innerHTML+=`
<li class="${t}">
<span class="nome">
${i<3?CROWN():""} ${i+1}º ${m.nome} — ${m.pontos} vitórias
${m.titulo?`<span class="badge titulo ${CLS(m.titulo)}">${m.titulo}</span>`:""}
<span class="badge classe ${CLS(m.classe)}">${m.classe}</span>
<span class="badge ${CLS(r)}">${r}</span>
</span>
${ADM?`
<div class="acoes">
<button class="btn" onclick="vitoria(${i})">+</button>
<button class="btn" onclick="derrota(${i})">-</button>
<button class="btn editar" onclick="editarMembro(${i})">🖌️</button>
<button class="btn" onclick="remover(${i})">🗑</button>
</div>`:""}
</li>`;
});
}

Object.assign(window,{loginGoogle,logoutGoogle,adicionarMembro,vitoria,derrota,editarMembro,remover});

setTimeout(()=>{
try{
["log","dir","table","warn","error"].forEach(k=>{
try{console[k]=()=>{}}catch{}
});
}catch{}
},3000);
