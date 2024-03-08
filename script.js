
let previous = document.querySelector('#previous')
let play = document.querySelector('#play')
let next = document.querySelector('#next')
let songInfo = document.querySelector('.songInfo')
let songTime = document.querySelector('.songTime')
let circle = document.querySelector('.circle')
let seekbar = document.querySelector('.seekbar')
let volumeInput = document.querySelector('#volumeInput')
let volumeImg = document.querySelector('#volumeImg')
let mainCards = document.querySelector('.mainCard')

let songs;
let previousSong;
let currentSong = new Audio()
let nextSong;
let currFolder;

function secondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return '00:00'
    }

    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.floor(seconds % 60);

    var minutesString = (minutes < 10 ? "0" : "") + minutes;
    var secondsString = (remainingSeconds < 10 ? "0" : "") + remainingSeconds;

    return minutesString + ":" + secondsString;
}

async function getSongs(folder) {

    currFolder = folder

    let a = await fetch(`http://localhost:5500/songs/${folder}/`)
    let res = await a.text()

    let div = document.createElement('div')
    div.innerHTML = res

    let as = div.getElementsByTagName('a')

    songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];

        if (element.href.endsWith('.mp3')) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    let songUl = document.querySelector('.songList').getElementsByTagName('ul')[0]
    songUl.innerHTML = ''

    for (const song of songs) {
        songUl.innerHTML += `<li> <img class="invert" src="assets/images/music.svg" alt="">
                                  <div class="songName">${song.replaceAll('%20', ' ')}</div>
                                  <div class="playNow">
                                    <span>Play&nbsp;now</span>
                                    <img class="invert" src="assets/images/playSong.svg" alt="">
                                  </div>
                            </li>`
    }

    Array.from(document.querySelector('.songList').getElementsByTagName('li')).forEach(e => {
        e.addEventListener('click', () => {
            playMusic(e.querySelector('.songName').innerHTML)
        })
    })

    return songs
}

async function playMusic(track, pause = false) {

    if (!pause) {
        currentSong.play()
        play.src = 'assets/images/pause.svg'
    }
    currentSong.src = `/songs/${currFolder}/` + track
    currentSong.play()
    songInfo.innerHTML = decodeURI(track)
    songTime.innerHTML = '00:00 / 00:00'
}

async function displayAlbum() {
    let a = await fetch(`http://localhost:5500/songs/`)
    let res = await a.text()

    let div = document.createElement('div')
    div.innerHTML = res

    let anchors = div.getElementsByTagName('a')

    let array = Array.from(anchors)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes('/songs/')) {

            let folder = e.href.split('/').slice(-1)[0]

            let a = await fetch(`http://localhost:5500/songs/${folder}/info.json`)
            let res = await a.json()

            mainCards.innerHTML += `<div data-folder="${folder}" class="card flex items-centre">
                <img src='/songs/${folder}/cover.jpg' alt="">
        
                <div class="videoIcon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill='#000' data-encore-id="icon" role="img"
                        aria-hidden="true" viewBox="0 0 24 24" class="Svg-sc-ytk21e-0 bneLcE"
                        style="width: 60%; height: 60%;">
                        <path
                            d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z">
                        </path>
                    </svg>
                </div>

                <div class="cardText flex">

                    <h3>${res.title}</h3>
                    <p>${res.description}</p>

                </div>
            </div>`
        }

    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}

async function main() {

    await getSongs('copyRight')
    playMusic(songs[0], true)

    await displayAlbum()

    play.addEventListener('click', () => {
        if (currentSong.paused) {
            play.src = 'assets/images/pause.svg'
            currentSong.play()
        } else {
            play.src = 'assets/images/playSong.svg'
            currentSong.pause()
        }
    })

    currentSong.addEventListener('timeupdate', () => {
        songTime.innerHTML = `${secondsToMinutes(currentSong.currentTime)} / ${secondsToMinutes(currentSong.duration)}`
        circle.style.left = (currentSong.currentTime / currentSong.duration) * 100 + '%';
    })

    seekbar.addEventListener('click', (e) => {

        let percent = (e.offsetX / e.target.getBoundingClientRect()
            .width) * 100;

        circle.style.left = percent + '%';
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    previous.addEventListener('click', () => {
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    next.addEventListener('click', () => {
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    volumeInput.addEventListener('change', (e) => {
        console.log('Setting Volume to', e.target.value, '/ 100')
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume == 0) {
            volumeImg.src = 'assets/images/mute.svg'
        } else {
            volumeImg.src = 'assets/images/volume.svg'
        }
    })

    volumeImg.addEventListener('click', (e) => {
        if (e.target.src.includes('assets/images/volume.svg')) {
            e.target.src = e.target.src.replace('assets/images/volume.svg', 'assets/images/mute.svg',)
            currentSong.volume = 0;
            volumeInput.value = 0;
        } else {
            e.target.src = e.target.src.replace('assets/images/mute.svg', 'assets/images/volume.svg')
            currentSong.volume = .10
            volumeInput.value = 10;
        }
    })
}

main()