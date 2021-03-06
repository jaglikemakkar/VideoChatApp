const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

// var peer = new Peer(undefined, {
//     path: '/peerjs',
//     host: '/',
//     port: '3000'
// })
var peer = new Peer(undefined);

let myVideoStream

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        })
    })

    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream);
    })
})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
})

const connectToNewUser = (userId, stream) => {
    var call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    })
}

const addVideoStream = (video, stream) =>{
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', ()=>{
        video.play();
    })
    videoGrid.append(video);

}

let msg = document.querySelector('input')
msg.addEventListener('keyup', (e)=>{
    if (e.key === "Enter" && msg.value.length !== 0){
        socket.emit('message', msg.value);
        msg.value = ""
    }
})

socket.on('create-message', (message) => {
    var li = document.createElement('li');
    var msgHtml = `<b>User</b><br />${message}`;
    li.innerHTML = msgHtml;
    var ul = document.getElementsByClassName('messages')[0];
    ul.appendChild(li);
    scrollToBottom();
})

const scrollToBottom = () => {
    let messages = document.querySelector('.messages').lastElementChild;
    messages.scrollIntoView();
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled){
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    }
    else{
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `<i class="fas fa-microphone"></i>
                <span>Mute</span>
    `
    document.querySelector('.mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `<i class="unmute fas fa-microphone-slash"></i>
                <span>Unmute</span>
    `
    document.querySelector('.mute_button').innerHTML = html;
}

const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled){
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    }
    else{
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setStopVideo = () => {
    const html = `<i class = "fas fa-video"></i>
                <span>Stop Video</span>
    `
    document.querySelector('.video_button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `<i class = "fas fa-video-slash"></i>
                <span>Play Video</span>
    `
    document.querySelector('.video_button').innerHTML = html;
}
