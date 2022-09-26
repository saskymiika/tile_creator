class Graphics {
    constructor() {
        this.pixel = 10
        this.size = 1
        this.mousepos = {x:0, y:0}
        this.ismousedown = false
        this.color = ''
        this.areasize = 0 // <-- set to 64
        this.area = []
        this.ismouseinthearea = false
        this.drawmode = 0
        this.showGridArea = true
        this.currentLayer = 1
        this.frameIndex = 0
    }

    getHEXPixelValue(rgb) {
        
        let r = rgb[0].toString(16),
            g = rgb[1].toString(16),
            b = rgb[2].toString(16),
            a = rgb[3].toString(16);
            
        r = r.length === 1 ? '0'+r : r
        g = g.length === 1 ? '0'+g : g
        b = b.length === 1 ? '0'+b : b
        a = a.length === 1 ? '0'+a : a
            
        return '#'+r+g+b+a
    }

    getRGBAPixelValue() {
        
        return null
            
    }

    createSpritesheet() {
        if(!document.getElementById('layers').hasChildNodes()) return;

        let animations = document.getElementsByClassName('frames')

        // refer to each canvas element in frame div.frames element
        // 1. Count the width according to the child nodes amount

        let mostFrames = 0

        for(let frames of animations) {
            mostFrames = frames.childNodes.length >= mostFrames ? frames.childNodes.length : mostFrames
        }
        // 2. create spritesheet canvas
        let spriteSheet = document.createElement('canvas')
        spriteSheet.width  = mostFrames*64
        spriteSheet.height = animations.length*64
        let scx = spriteSheet.getContext('2d')
        
        // 3. draw contents of each canvas onto the spritesheet
        
        let xIndex = 0,
            yIndex = 0;
        for(let frames of animations) {
            for(let fr of frames.childNodes) {
                let frc  = fr.getContext('2d')
                for(let y = 0; y < 64; y++) {
                    for(let x = 0; x < 64; x++) {
                        scx.fillStyle = this.getHEXPixelValue(frc.getImageData(x,y,1,1).data)
                        scx.fillRect(x+xIndex*64,y+yIndex*64, 1,1)
                    }
                }
                xIndex++
            }
            xIndex = 0
            yIndex++
        }

        // create spritesheet viewer and options to download the image

        let spritesheetDisplayer = document.createElement('div')
        spritesheetDisplayer.setAttribute('id', 'spritesheet-displayer')
        document.body.appendChild(spritesheetDisplayer)

        let centerHolder = document.createElement('div')
        centerHolder.setAttribute('class', 'center-holder')
        spritesheetDisplayer.appendChild(centerHolder)

        let optionssBar = document.createElement('div') 
        optionssBar.setAttribute('class', 'options-bar')
        centerHolder.appendChild(optionssBar)

        let dl_name =  document.createElement('input')
        dl_name.value = 'spritesheet_64x64'
        optionssBar.appendChild(dl_name)

        let dl_sh =  document.createElement('button')
        dl_sh.innerText = 'download spritesheet'
        dl_sh.onclick = () => {
            
            async function download() {
                //get base64 value of the canvas
                let base64 = spriteSheet.toDataURL()
                let dl = document.createElement('a')
                dl.setAttribute('download', dl_name.value)
                dl.href = base64
                dl.click()
                return dl
            }

            download().then(dl => {
                dl.remove()
                spritesheetDisplayer.remove
            })

        }
        optionssBar.appendChild(dl_sh)

        let cls =  document.createElement('button')
        cls.innerText = 'close'
        cls.onclick = () => {
            spritesheetDisplayer.remove()
        }
        optionssBar.appendChild(cls)

        centerHolder.appendChild(spriteSheet)

    }

    clearCanvas() {
        if(confirm('Are you sure you want to clear the canvas?'))
            this.init(this.areasize)
    }

    upload64x64() {

        return new Promise((resolve, reject) => {
            try {
                let fl = document.createElement('input')
                fl.setAttribute('type', 'file')
                fl.click()
        
                fl.onchange = () => {
                    let file_reader = new FileReader()
                    file_reader.readAsDataURL(fl.files[0])
                    let file_name = fl.files[0].name

                    file_reader.onload = () => {

                        this.init(64)
                        let temp_canvas = document.createElement('canvas')
                        temp_canvas.width  = this.areasize
                        temp_canvas.height = this.areasize
                        let tc = temp_canvas.getContext('2d')

                        let c_img = new Image()
                        c_img.src = file_reader.result
                        c_img.addEventListener('load', () => {
                            
                            async function drawAndResolve() {
                                tc.drawImage(c_img, 0, 0, 64, 64)
                            }

                            drawAndResolve()
                            .then( () => {

                                for(let y = 0; y < 64; y++) {
                                    for(let x = 0; x < 64; x++) {
                                        let _d = tc.getImageData(x,y, 1,1).data
                                        let r = _d[0].toString(16),
                                            g = _d[1].toString(16),
                                            b = _d[2].toString(16),
                                            a = _d[3].toString(16);
                                        if(_d[0] + _d[1] + _d[2] + _d[3] > 0) {
                                            r = r.length === 1 ? '0'+r : r
                                            g = g.length === 1 ? '0'+g : g
                                            b = b.length === 1 ? '0'+b : b
                                            a = a.length === 1 ? '0'+a : a
                                            this.area[y][x] = '#'+r+g+b+a
                                        }
                                    }
                                }
                                //change correct filename to input
                                document.getElementById('main-frame-name').value = file_name
                                resolve([fl, temp_canvas])

                            })


                        })



                    }
                    file_reader.onerror = error => {
                        console.log(error)
                    }
                }
            }
            catch(error) {
                reject(error)
            }
        })
        .then(elems => {
            for(let element of elems)
                element.remove()                

            return null
        })
        .catch(error => {
            console.error(error)
            return error
        })
        .finally(() => console.log('image uploaded'))


    }

    saveToImage() {

        return new Promise((resolve, reject) => {

            try {

                let temp_canvas = document.createElement('canvas')
                temp_canvas.width  = this.areasize
                temp_canvas.height = this.areasize
                let tc = temp_canvas.getContext('2d')

                // draw pixels on the canvas
                for(let y = 0; y < this.area.length; y++) {
                    for(let x = 0; x < this.area[y].length; x++) {
                        if(this.area[y][x] !== null) {
                            tc.fillStyle = this.area[y][x]
                            tc.fillRect(x,y, 1,1)
                        }
                    }
                }

                //get base64 value of the canvas
                let base64 = temp_canvas.toDataURL()
    
                let dl = document.createElement('a')
                dl.setAttribute('download', `${document.getElementById('main-frame-name').value}`)
        
                dl.href = base64
                dl.click()

                resolve([temp_canvas, dl])
            }
            catch(error) {
                reject(error)
            }
        })
        .then(elems => {
            for(let element of elems)
                element.remove()                

            return null
        })
        .catch(error => {
            console.error(error)
            return error
        })
        .finally(() => console.log('image saved'))
    
    }

    saveProject() {
        if(!document.getElementById('layers').hasChildNodes()) return;

        let animations = document.getElementsByClassName('frames')

        let anims = []
        
        for(let frames of animations) {
            anims = [...anims, []]
        

            for(let frame of frames.childNodes) {


                let fr = []
                
                let cx = frame.getContext('2d')
                for(let y = 0; y < 64; y++) {
                    fr[y] = []
                    for(let x = 0; x < 64; x++) {
                        let _d = cx.getImageData(x,y, 1,1).data
                        fr[y].push([_d[0],_d[1],_d[2],_d[3]])
                    }
                }

                anims[anims.length-1].push(fr)
            }
        }
        
        // save 
        return new Promise((resolve, reject) => {
            try {
                let savedata = JSON.stringify(anims)
                localStorage.setItem('current_project', savedata)
                resolve()
            }
            catch (err) {
                reject(err)
            }
        })
        .then(() => {

            console.log('project saved')

        })
        .catch(error => alert(error))

    }

    loadProject() {
        if(localStorage.getItem('current_project')) {
            let storage_string = localStorage.getItem('current_project')
    
            let project = JSON.parse(storage_string)

            
            this.currentLayer = 1
            this.frameIndex = 0
            
            let animations = document.getElementById('layers')
            while(animations.hasChildNodes())
                animations.childNodes[0].remove()

            this.init(64)

            for(let layer of project) {
                for(let frames of layer) {
                    // // // 
                    for(let y = 0; y < 64; y++) {
                        for(let x = 0; x < 64; x++) {
                            
                            this.area[y][x] = this.getHEXPixelValue(frames[y][x])

                        }
                    }
                    this.frameIndex++
                    if(this.frameIndex >= frames.length-1) this.frameIndex = 0

                    this.addFrame()
                }
                this.currentLayer++
            }
            
        }
    }
    
    addFrame() {
        let frames;
        if(!document.getElementById('layer-'+this.currentLayer)) {

            let parent = document.getElementById('layers')

            let layer = document.createElement('div')
            let meta = document.createElement('div')
            frames = document.createElement('div')

            // setup layer
            layer.setAttribute('id', 'layer-'+this.currentLayer)
            layer.setAttribute('class', 'layer')
            parent.appendChild(layer)

            // setup meta
            meta.setAttribute('class', 'meta')
            meta.innerHTML = `<span>Anim. ${this.currentLayer}</span>`
            layer.appendChild(meta)

            // setup frames
            frames.setAttribute('id', 'frames-'+this.currentLayer)
            frames.setAttribute('class', 'frames')
            layer.appendChild(frames)
        }
        else {
            frames = document.getElementById('frames-'+this.currentLayer)
        }

        let frame  = document.createElement('canvas')
        frame.width  = this.areasize
        frame.height = this.areasize
        frames.appendChild(frame)

        frame.addEventListener('click', (e) => {
            this.drawFrame(e.target)
        })

        let cx = frame.getContext('2d')

        for(let y = 0; y < this.areasize; y++) 
            for(let x = 0; x < this.areasize; x++) 
                if(this.area[y][x] !== null) {
                    cx.fillStyle = this.area[y][x]
                    cx.fillRect(x, y, 1, 1)
                }
        
        let scrollamount = frames.offsetWidth
        for(let fr of frames.childNodes) {
            scrollamount += fr.width
        }
        frames.scrollTo(scrollamount, 0)
        this.frameIndex = frames.childNodes.length-1
        
        this.selectFrame(frame)
    }

    clearAnimations() {
        if(!document.getElementById('layers').hasChildNodes()) return;
        
        if(confirm('Are you sure you want to remove all the animations?')) {

            this.currentLayer = 1
            this.frameIndex = 0
    
            let animations = document.getElementById('layers')
            while(animations.hasChildNodes())
                animations.childNodes[0].remove()
        }
        

    }

    drawFrame(frame) {

        /**
         * how to get the index of this element ????
         */

        for(let i = 0; i < frame.parentNode.childNodes.length; i++)
            if(frame.parentNode.childNodes[i] === frame) {
                this.frameIndex = i
                break
            }

        let tc = frame.getContext('2d')
        this.init(64)
            for(let y = 0; y < 64; y++) {
                for(let x = 0; x < 64; x++) {
                    let _d = tc.getImageData(x,y, 1,1).data
                    let r = _d[0].toString(16),
                        g = _d[1].toString(16),
                        b = _d[2].toString(16),
                        a = _d[3].toString(16);
                    if(_d[0] + _d[1] + _d[2] + _d[3] > 0) {
                        r = r.length === 1 ? '0'+r : r
                        g = g.length === 1 ? '0'+g : g
                        b = b.length === 1 ? '0'+b : b
                        a = a.length === 1 ? '0'+a : a
                        this.area[y][x] = '#'+r+g+b+a
                    }
                }
            }

        this.selectFrame(frame)
    }

    selectFrame(frame) {

        // for 
        for(let frames of document.getElementsByClassName('frames')) {
            for(let fr of frames.childNodes) {
                if(fr.hasAttribute('class'))    
                    fr.removeAttribute('class')
            }
        }

        if(document.getElementById('selected-frame-remove')) {
            document.getElementById('selected-frame-remove').remove()
        }
        let selected_frame = document.createElement('selected-frame-remove')

        selected_frame.setAttribute('id', 'selected-frame-remove')
        document.getElementById('frame-options').appendChild(selected_frame)
        
        let selected_frame_label = document.createElement('span')
        selected_frame_label.innerText = 'Selected frame'
        let selected_frame_remove = document.createElement('button')
        selected_frame_remove.innerText = 'remove'
        selected_frame_remove.onclick = () => {
            frame.remove()
            selected_frame.remove()
        }

        for(let child of [selected_frame_label, selected_frame_remove])
            selected_frame.appendChild(child)

        frame.setAttribute('class', 'selected')
    }

    toggleGridArea() {
        this.showGridArea = this.showGridArea === true ? false : true
    }

    setPixelSize(size) {
        this.size = size
        document.getElementById('psz').innerText = size
    }

    getData(c) {
        
        // img_d (image data) = Uint8ClampedArray[r,g,b,a, ...] 0..3 <-- one rgba color value of the canvas
        // a pixel color img_d[0] img_d[1] img_d[2] img_d[3]
        let a = []

        for(let y = 0; y < this.areasize; y++) {
            for(let x = 0; x < this.areasize; x++) {
                let img_d = c.getImageData(
                            x*this.pixel+(this.pixel*.5), 
                            y*this.pixel+(this.pixel*.5), 
                            1,
                            1
                        )
                let r = img_d[0],
                    g = img_d[1],
                    b = img_d[2],
                    al =img_d[3];
                    
                a = [...a, r,g,b,al]
            }

        }
        return a
    }

    preview() {
        
        let preview_canvas = document.getElementById('preview')
        let c2 = preview_canvas.getContext('2d')
        c2.clearRect(0,0,64,64)
        //take pixel colors from the mapped area and draw onto the previev canvas
        for(let y = 0; y < 64; y++) {
            for(let x = 0; x < 64; x++) {
                    
                if(this.area[y][x] !== null) {
                    c2.fillStyle = this.area[y][x]
                    c2.fillRect(x,y,1,1)
                }
            }
        }
    }

    updateSelectedFrame() {

        if(document.getElementById('frames-'+this.currentLayer)) {
            
            if(document.getElementById('frames-'+this.currentLayer).childNodes[this.frameIndex]) {
                let canvas = document.getElementById('frames-'+this.currentLayer).childNodes[this.frameIndex]
                let cxcx = canvas.getContext('2d')
                cxcx.clearRect(0,0,64,64)

                
                for(let y = 0; y < 64; y++) {
                    for(let x = 0; x < 64; x++) {
                        if(this.area[y][x] !== null) {
                            cxcx.fillStyle = this.area[y][x]
                            cxcx.fillRect(x,y,1,1)
                        }
                    }
                }
                
            }
        }
    }

    init(sqr) {

        while(this.area.length > 0)
            this.area.splice(0, 1)

        this.areasize = sqr
        for(let x = 0; x < this.areasize; x++) {
            this.area[x] = []
            for(let y = 0; y < this.areasize; y++) {
                this.area[x][y] = null
            }
        }
    }

    setDrawMode(mode) {
        let elements
        this.drawmode = mode
        for(let btn of document.getElementsByClassName('btn')) {
            btn.style.borderColor = ''
            btn.style.boxShadow = ''
        }
        if(this.drawmode === 0) {
            elements =  document.getElementsByClassName('draw')
        }
        else if(this.drawmode === 3) {
            elements =  document.getElementsByClassName('erase')
        }
        else if(this.drawmode === 1) {
            elements =  document.getElementsByClassName('fill')
        }
        else if(this.drawmode === 2) {
            elements =  document.getElementsByClassName('erase-all')
        }
        if (elements !== undefined)
            for(let btn of elements) {
                btn.style.borderColor = 'blue'
                btn.style.boxShadow = '0 0 3px blue'
            }
    }

    setColor(color) {
        // console.log(color)
        this.color = color
        document.getElementById('color-label').style.backgroundColor = color
    }

    mouseDown() {
        this.ismousedown = true
    }

    mouseUp() {
        this.ismousedown = false
    }

    draw() {

        if( this.ismousedown ) {
            let PX = Math.floor(this.mousepos.x / this.pixel)-Math.floor(this.size*.5),
                PY = Math.floor(this.mousepos.y / this.pixel)-Math.floor(this.size*.5);

            // drawmode 0 = draw pixel
            // drawmode 3 = erase pixel

            // assign color to pixel coordinate
            // this.area[PY][PX] = this.color
            for(let s1 = 0; s1 < this.size; s1++){
                for(let s2 = 0; s2 < this.size; s2++){
                    if(this.area[PY+s1] && this.area[PY+s1][PX+s2] !== undefined)
                        this.area[PY+s1][PX+s2] = this.drawmode === 0 ? this.color : null
                }
            } 
        }
    }

    fill() {
        let pxc = Math.floor(this.mousepos.x / this.pixel),
            pyc = Math.floor(this.mousepos.y / this.pixel);

        let filltiles = []
        if(this.area[pyc] && this.area[pyc][pxc] !== undefined) {

            if(this.area[pyc][pxc] === this.color) return;

            // set colorvalue on which pixel values are checked against             
            let checkvalue = this.area[pyc][pxc]

            //set color to selected pixel
            this.area[pyc][pxc] = this.color // set color to the pixel

            filltiles = [...filltiles, [pyc, pxc]]
            let i = 0
            
            // 
            while(filltiles[i]) {
                // check tiles around pixel {this.area[pyc][pxc]} if they have the same value as the checkvalue

                let y = filltiles[i][0], // value coordinates inside the areamap
                    x = filltiles[i][1]; // value coordinates inside the areamap

                // above
                if(this.area[y-1] !== undefined && this.area[y-1][x] !== undefined) {
                    if(this.area[y-1][x] === checkvalue) {
                        this.area[y-1][x] = this.color // set new pixel color
                        filltiles = [...filltiles, [y-1, x]]
                    }
                }

                // to right
                if(this.area[y] !== undefined && this.area[y][x+1] !== undefined) {
                    if(this.area[y][x+1] === checkvalue) {
                        this.area[y][x+1] = this.color // set new pixel color
                        filltiles = [...filltiles, [y, x+1]]
                    }
                }
                // below
                if(this.area[y+1] !== undefined && this.area[y+1][x] !== undefined) {
                    if(this.area[y+1][x] === checkvalue) {
                        this.area[y+1][x] = this.color // set new pixel color
                        filltiles = [...filltiles, [y+1, x]]
                    }
                }
                // to left
                if(this.area[y] !== undefined && this.area[y][x] !== undefined) {
                    if(this.area[y][x-1] === checkvalue) {
                        this.area[y][x-1] = this.color // set new pixel color
                        filltiles = [...filltiles, [y, x-1]]
                    }
                }

                i++; // jump an index forward. to next color coordinate values.
                // checking again if pixels around them have the same colorvalue as the checkvalue
                // ...
            }
        }
    }

    erase() {
        let pxc = Math.floor(this.mousepos.x / this.pixel),
            pyc = Math.floor(this.mousepos.y / this.pixel);

        let filltiles = []
        if(this.area[pyc] && this.area[pyc][pxc] !== undefined) {

            if(this.area[pyc][pxc] === null) return;

            // set colorvalue on which pixel values are checked against             
            let checkvalue = this.area[pyc][pxc]

            //set color to selected pixel
            this.area[pyc][pxc] = null // set color to the pixel to null

            filltiles = [...filltiles, [pyc, pxc]]
            let i = 0
            
            // 
            while(filltiles[i]) {
                // check tiles around pixel {this.area[pyc][pxc]} if they have the same value as the checkvalue

                let y = filltiles[i][0], // value coordinates inside the areamap
                    x = filltiles[i][1]; // value coordinates inside the areamap

                // above
                if(this.area[y-1] !== undefined && this.area[y-1][x] !== undefined) {
                    if(this.area[y-1][x] === checkvalue) {
                        this.area[y-1][x] = null // set new pixel color
                        filltiles = [...filltiles, [y-1, x]]
                    }
                }

                // to right
                if(this.area[y] !== undefined && this.area[y][x+1] !== undefined) {
                    if(this.area[y][x+1] === checkvalue) {
                        this.area[y][x+1] = null // set new pixel color
                        filltiles = [...filltiles, [y, x+1]]
                    }
                }
                // below
                if(this.area[y+1] !== undefined && this.area[y+1][x] !== undefined) {
                    if(this.area[y+1][x] === checkvalue) {
                        this.area[y+1][x] = null // set new pixel color
                        filltiles = [...filltiles, [y+1, x]]
                    }
                }
                // to left
                if(this.area[y] !== undefined && this.area[y][x] !== undefined) {
                    if(this.area[y][x-1] === checkvalue) {
                        this.area[y][x-1] = null // set new pixel color
                        filltiles = [...filltiles, [y, x-1]]
                    }
                }

                i++; // jump an index forward. to next color coordinate values.
                // checking again if pixels around them have the same colorvalue as the checkvalue
                // ...
            }
        }
    }

    render(c) {
        c.clearRect(0,0, 64*this.pixel,64*this.pixel)
        // show grid area
        if(this.showGridArea) {
            // draw vertical lines
            c.globalAlpha = 0.3
            c.lineWidth = 1
            c.strokeStyle = "#030303"
            for(let x = 0; x < this.areasize-1; x++) {
                c.beginPath()
                c.moveTo(x*this.pixel+this.pixel, 0)
                c.lineTo(x*this.pixel+this.pixel, this.pixel*this.areasize)
                c.stroke()
            }
            for(let y = 0; y < this.areasize-1; y++) {
                c.beginPath()
                c.moveTo(0, y*this.pixel+this.pixel)
                c.lineTo(this.pixel*this.areasize, y*this.pixel+this.pixel)
                c.stroke()
            }
            c.globalAlpha = 1
        }
        // draw onion skil
        if(document.getElementById('onion-skin-checkbox').checked) {
            
            // this.currentLayer = 1
            // this.frameIndex = 0

            if(document.getElementById('frames-'+this.currentLayer)) {
                let frames = document.getElementById('frames-'+this.currentLayer)

                if(frames.childNodes[this.frameIndex-1]) {
                    let cxcx = frames.childNodes[this.frameIndex-1].getContext('2d')
                    c.globalAlpha = 0.4

                    for(let y = 0; y < this.area.length; y++) {
                        for(let x = 0; x < this.area[y].length; x++) {

                            let _d = cxcx.getImageData(x,y, 1,1).data

                            let r = _d[0].toString(16),
                                g = _d[1].toString(16),
                                b = _d[2].toString(16),
                                a = _d[3].toString(16);

                                r = r.length === 1 ? '0'+r : r
                                g = g.length === 1 ? '0'+g : g
                                b = b.length === 1 ? '0'+b : b
                                a = a.length === 1 ? '0'+a : a
                            
                            c.fillStyle = '#'+r+g+b+a
                            c.fillRect(x*this.pixel, y*this.pixel, this.pixel, this.pixel)
                        }

                    }
                    c.globalAlpha = 1
                }

            }
        }

        // draw pixel colors
        for(let y = 0; y < this.area.length; y++) {
            for(let x = 0; x < this.area[y].length; x++)
                if(this.area[y][x]) {
                    c.fillStyle = this.area[y][x]
                    c.fillRect(x*this.pixel, y*this.pixel, this.pixel, this.pixel)
                } 
            }


        // draw pixel pointer rectangle
        if(this.ismouseinthearea) {
            c.strokeStyle = 'blue'
            c.lineWidth = 1
            c.beginPath()
            c.shadowColor  = "white"
            c.shadowBlur = 2
            
            if([0, 3].indexOf(this.drawmode) !== -1) {
                let PX = (Math.floor(this.mousepos.x / this.pixel)-Math.floor(this.size*.5)) * this.pixel,
                    PY = (Math.floor(this.mousepos.y / this.pixel)-Math.floor(this.size*.5)) * this.pixel;
        
                c.rect(PX, PY, this.pixel*this.size, this.pixel*this.size)
                c.stroke()
            }
            else {
                let PX = Math.floor(this.mousepos.x / this.pixel) * this.pixel,
                    PY = Math.floor(this.mousepos.y / this.pixel) * this.pixel;

                    c.rect(PX, PY, this.pixel, this.pixel)
                    c.stroke()
            }
            c.shadowBlur = 0
        }

        window.requestAnimationFrame(() => this.render(c))
    }
}