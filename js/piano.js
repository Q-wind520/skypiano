// 平台判断
var inBrowser = typeof window !== 'undefined';
var UA = inBrowser && window.navigator.userAgent.toLowerCase();
var isAndroid = UA && UA.indexOf('android') > 0;
var isIOS = UA && /iphone|ipad|ipod|ios/.test(UA);
var isMobile = isAndroid || isIOS;

let pianoKeys = document.querySelectorAll(".piano-wrap > div");
pianoKeys.forEach(key => {
    let keyDown = () => {
        key.classList.add("piano-key-down");
    };
    let keyUp = () => {
        key.classList.remove("piano-key-down");
    }
    if(isMobile){
        key.addEventListener("touchstart", keyDown);
        key.addEventListener("touchend", keyUp);
    }
    // 移除PC端的鼠标事件监听
});

// audio上下文
let audioCtx;

// 兼容safari浏览器
let myDecodeAudioData = function(originBuffer){
    return new Promise((resolve, reject) => {
        try {
            audioCtx.decodeAudioData(originBuffer, audioData => {
                resolve(audioData);
            })
        } catch (error) {
            reject(error);
        }
    })
}

// 1、加载所有音频arraybuffer并保存
Promise.all([
    fetch("sounds/b1.mp3").then(response => { return response.arrayBuffer();}),
    fetch("sounds/b2.mp3").then(response => { return response.arrayBuffer();}),
    fetch("sounds/b3.mp3").then(response => { return response.arrayBuffer();}),
    fetch("sounds/b4.mp3").then(response => { return response.arrayBuffer();}),
    fetch("sounds/b5.mp3").then(response => { return response.arrayBuffer();}),
    fetch("sounds/b6.mp3").then(response => { return response.arrayBuffer();}),
    fetch("sounds/b7.mp3").then(response => { return response.arrayBuffer();}),
    fetch("sounds/c1.mp3").then(response => { return response.arrayBuffer();}),
    fetch("sounds/c2.mp3").then(response => { return response.arrayBuffer();}),
    fetch("sounds/c3.mp3").then(response => { return response.arrayBuffer();}),
    fetch("sounds/c4.mp3").then(response => { return response.arrayBuffer();}),
    fetch("sounds/c5.mp3").then(response => { return response.arrayBuffer();}),
    fetch("sounds/c6.mp3").then(response => { return response.arrayBuffer();}),
    fetch("sounds/c7.mp3").then(response => { return response.arrayBuffer();}),
    fetch("sounds/d1.mp3").then(response => { return response.arrayBuffer();})
])

// 2、创建aduio上下文
.then(soundBuffers => {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return soundBuffers;
})

// 3、把所有arraybuffer数据转换成audioBuffer并保存
.then(soundBuffers => {
    let taskList = [];
    soundBuffers.forEach(buffer => {
        taskList.push(myDecodeAudioData(buffer));
    });
    return Promise.all(taskList);
})

// 4、开始监听发声
.then(audioDatas => {
    soundLoaded();
    let pias = document.querySelectorAll("#PianoPanel > .piano-wrap > div");
    
    // 键盘键位映射
    const keyMap = {
        'y':0, 'u':1, 'i':2, 'o':3, 'p':4,
        'h':5, 'j':6, 'k':7, 'l':8, ';':9,
        'n':10, 'm':11, ',':12, '.':13, '/':14
    };

    // 键盘按下处理
    document.addEventListener('keydown', event => {
        const key = event.key.toLowerCase();
        if (key in keyMap) {
            const index = keyMap[key];
            const pia = pias[index];
            
            // 添加样式
            pia.classList.add("piano-key-down");
            
            // 播放音频
            const audioSource = audioCtx.createBufferSource();
            audioSource.buffer = audioDatas[index];
            audioSource.connect(audioCtx.destination);
            audioSource.start(0);
            
            event.preventDefault();
        }
    });

    // 键盘释放处理
    document.addEventListener('keyup', event => {
        const key = event.key.toLowerCase();
        if (key in keyMap) {
            const index = keyMap[key];
            const pia = pias[index];
            pia.classList.remove("piano-key-down");
            event.preventDefault();
        }
    });

    // 移动端触摸事件保留
    pias.forEach((pia, index) => {
        pia._index = index;
        if(isMobile){
            pia.addEventListener("touchstart", () => {
                let audioSource = audioCtx.createBufferSource();
                audioSource.buffer = audioDatas[index];
                audioSource.connect(audioCtx.destination);
                audioSource.start(0);
            });
        }
    });
});

// 关闭音频加载中状态
function soundLoaded() {
    setTimeout(() => {
        let loadding = document.querySelector("#loadding")
        loadding.setAttribute("style", "display:none;");
    }, 1000);
}

document.addEventListener('visibilitychange', function() {
    if(document.hidden) {
        console.log("被切换到了后台")
    }else {
        console.log("被切换到了前台")
    }
});
