const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin


    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate , {
        username: message.username , 
        message: message.text ,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend' , html)
    autoscroll()
})


socket.on('locationMessage' , (message) => {

    const html = Mustache.render(locationTemplate , {
        username: message.username ,
        url : message.url ,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend' , html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})




$messageForm.addEventListener('submit' , (e) => {
    e.preventDefault()
    //disable

    $messageFormButton.setAttribute('disabled' , 'disabled')
    const msg = e.target.elements.message.value
    
    socket.emit('sendMessage' , msg , (error) => {

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        //enable


        if (error) {
            return console.log(error)
        }

        console.log('Message Deliverd!!')
    })

})



$sendLocationButton.addEventListener('click' , () => {
    
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported change browser')
    }

    $sendLocationButton.setAttribute('disabled' , 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        

        const lat = position.coords.latitude
        const long = position.coords.longitude

        socket.emit('sendLocation' , {
            latitude : lat ,
            longitude: long
        } , () => {
            console.log('Location Shared')
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join' , { username , room } , (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})