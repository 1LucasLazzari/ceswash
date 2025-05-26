const USUARIO_CORRETO = "admin";
const SENHA_CORRETA = "40302010";

function logar() {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
  const erro = document.getElementById("mensagemErro");

  if (usuario === USUARIO_CORRETO && senha === SENHA_CORRETA) {
    window.location.href = "index.html";
  } else {
    erro.textContent = "Usuário ou senha inválidos.";
  }
}
if (!document.referrer.includes("login.html")) {
alert("Acesso negado. Faça login primeiro.");
window.location.href = "login.html";
}
