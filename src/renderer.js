const { ipcRenderer } = require('electron')
const titulo = document.getElementById('nomeArquivo')
const conteudo = document.getElementById('txtArea')

console.log(titulo)
console.log(conteudo)

ipcRenderer.on('new-file', (event, file) => {
    console.log(file)
    titulo.innerHTML = `${file.name} - Mini Editor`
    conteudo.value = file.content
})

function update() {
    ipcRenderer.send('update-content', txtArea.value)
}

atualizarLinhas()
document.getElementById('txtArea').addEventListener('input', () => {
    atualizarLinhas()
})

document.getElementById('txtArea').addEventListener('scroll', () => {
    document.getElementById('linhas').scrollTop = conteudo.scrollTop
})

function atualizarLinhas() {
    let lineNumbers = document.getElementById('linhas')
    let lines = conteudo.value.split('\n')
    let lineNumbersHTML = ''
    for (let i = 0; i < lines.length; i++) {
        lineNumbersHTML += i + 1 + '<br>'
    }
    lineNumbers.innerHTML = lineNumbersHTML
}

const textarea = document.querySelector('textarea');
textarea.addEventListener('keydown', function (event) {
    if (event.key === 'Tab') {
        event.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + "\t" + textarea.value.substring(end);

        textarea.selectionStart = start + 1;
        textarea.selectionEnd = start + 1;
    }
});