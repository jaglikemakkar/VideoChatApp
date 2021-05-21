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

function scrollToBottom() {
    let messages = document.querySelector('.messages').lastElementChild;
    messages.scrollIntoView();
}