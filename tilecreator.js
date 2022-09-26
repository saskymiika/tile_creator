const canvas = document.getElementById('canvas');
const c = canvas.getContext('2d');
const graphs = new Graphics()
graphs.init(64)
const framesize = 64 * graphs.pixel

canvas.width = framesize
canvas.height = framesize


canvas.addEventListener('mousedown', e => {
    graphs.mousepos.x = e.offsetX
    graphs.mousepos.y = e.offsetY
    graphs.mouseDown()
    if([0, 3].indexOf(graphs.drawmode)  !== -1) {
        graphs.draw()
    }
    else if(graphs.drawmode === 1) {
        graphs.fill()
    }
    else if(graphs.drawmode === 2) {
        graphs.erase()
    }
})
canvas.addEventListener('mouseenter', e => {
    graphs.ismouseinthearea = true
})
window.addEventListener('mouseup', e => {
    graphs.mouseUp()
    graphs.preview()
    graphs.updateSelectedFrame()
})
canvas.addEventListener('mouseleave', e => {
    graphs.ismouseinthearea = false
})
canvas.addEventListener('mousemove', e => {
    graphs.mousepos.x = e.offsetX
    graphs.mousepos.y = e.offsetY
    if([0, 3].indexOf(graphs.drawmode)  !== -1) {
        graphs.draw()
    }
})

canvas.addEventListener('contextmenu', e => e.preventDefault())

window.addEventListener('keydown', e => {

    if(document.activeElement.nodeName !== 'INPUT') {
        e.preventDefault()
        
        if([49, 97].indexOf(e.keyCode) !== -1) {
            graphs.setDrawMode(0)
        }
        else if([50, 98].indexOf(e.keyCode) !== -1) {
            graphs.setDrawMode(3)
        }
        else if([51, 99].indexOf(e.keyCode) !== -1) {
            graphs.setDrawMode(1)
        }
        else if([52, 100].indexOf(e.keyCode) !== -1) {
            graphs.setDrawMode(2)
        }
        else if([67].indexOf(e.keyCode) !== -1) {
            graphs.clearCanvas()
        }
        else if([71].indexOf(e.keyCode) !== -1) {
            graphs.toggleGridArea()
        }
        else if([13].indexOf(e.keyCode) !== -1) {
            graphs.addFrame()
        }
    }
    
})

window.addEventListener('mousewheel', e => {
    
    let pixel = e.deltaY > 0 ? 1 : -1;
    pixel = Number(document.getElementById('pixel-range').value) + pixel
    if(pixel < Number(document.getElementById('pixel-range').min)) pixel = 1
    else if (pixel > Number(document.getElementById('pixel-range').max)) pixel = 10
    
    document.getElementById('pixel-range').value = pixel
    graphs.setPixelSize(pixel)
})

window.requestAnimationFrame(() => {
    graphs.setColor('#000000')
    graphs.render(c)
})

function addColorToPalette() {
    let color_value = document.getElementById('color-select').value
    let c_btn = document.createElement('button')
    c_btn.setAttribute('class', 'color-btn-small')
    c_btn.style.backgroundColor = color_value
    c_btn.value = color_value
    c_btn.onclick = () => {
        graphs.setColor(color_value)
    }
    document.getElementById('palette').appendChild(c_btn)
}

window.onbeforeunload = function(e) {
    e.preventDefault()
    e.returnValue = 'ghvr gheruig eriugruieg ugyergueig'
}

async function todo() {

    console.log('\nTÄNNE KAIKKI SEURAAVAAT TODOT: kirjoita uudelle riville','\n ')
    let list = [
        'Upload chekkaa kuvan ja laskee 64 kuvapixelin mukaan, tekee automaattisesti animaatio framet editoriin',
        'Seivaa projekti pakatuksi tiedostoksi localStorageen',
    ]

    if(list.length === 0) return;

    for(let task of list) {
        
        console.log(list.indexOf(task)+(1)+'.', task)

    }
}
todo()