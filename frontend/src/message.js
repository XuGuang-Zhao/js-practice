// 1. Get message channel by id
function getMessageByChannelId(channelId, startIndex = 0) {
    const requestOperation = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
            'channelId': channelId,
            'start': startIndex
        },
    };
    return fetch(`http://localhost:5005/message/${channelId}?start=${startIndex}`, requestOperation)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }
            const {
                messages
            } = data;
            return messages;
        });
}

// 2. Send a new message
function sendMessage() {
    const channelId = Number(checkSelectChannel().id);
    const message = document.getElementById('messageInputArea').value;
    const jsonString = JSON.stringify({
        message: message,
        image: ''
    });
    const requestOperation = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
            'channelId': channelId,
        },
        body: jsonString
    };

    if (!message) {
        alert('Can not send blank message');
        return;
    }
    fetch(`http://localhost:5005/message/${channelId}`, requestOperation)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }
            const messageList = document.getElementById('messageList');
            while (messageList.firstChild) {
                messageList.removeChild(messageList.firstChild);
            }
            getMessageByChannelId(checkSelectChannel().id, 0).then(messages => {
                displayMessageOnPage(messages);
            });
            clearMessageInput();
        });
}


// Create a edit Model method
const editMessageModal = document.getElementById('editMessageModal');
const editMsgModal = new bootstrap.Modal(editMessageModal, {
    keyboard: false
});

// Create a delete Model method
const deleteMessageModal = document.getElementById('deleteMessageModal');
const deleteMsgModal = new bootstrap.Modal(deleteMessageModal, {
    keyboard: false
});

// Get the Eidt Message Modal
function getEditMessageModal() {
    const message = document.getElementById(`message_${window.CUR_EDIT_ID}`).innerText;
    const editMessageInput = document.getElementById('editMessageInput');
    editMessageInput.value = message;
    editMsgModal.show();
}

// 3. Put Message function
function editMessage() {
    const messageInput = document.getElementById('editMessageInput').value;
    const selectChannelId = checkSelectChannel().id;
    const jsonString = JSON.stringify({
        message: messageInput,
        image: ''
    });
    const requestOperation = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
            'channelId': selectChannelId,
            'messageId': window.CUR_EDIT_ID
        },
        body: jsonString
    };
    fetch(`http://localhost:5005/message/${selectChannelId}/${window.CUR_EDIT_ID}`, requestOperation)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('You can not edit this message');
                resetEditChannelModal();
                return;
            }
            alert('Successfully edit message!');
            document.getElementById(`message_${window.CUR_EDIT_ID}`).innerText = messageInput;

        });
    editMsgModal.hide();
}

// Display message on page
function displayMessageOnPage(messagePackage) {
    const messageList = document.getElementById('messageList');
    const currentUser = localStorage.getItem('userId');
    // When change the channel the message need update
    while (messageList.firstChild) {
        messageList.removeChild(messageList.firstChild);
    }
    messagePackage.forEach((message) => {
        const userMessage = window.USER_LIST.find(user => user.id == message.sender);
        const messageContainer = document.createElement('div');
        const userPhotoContainer = document.createElement('div');
        const contentContainer = document.createElement('div');
        const messageContent = document.createElement('p');
        // edit, delete, pin button
        const editIcon = document.createElement('i');
        const deleteIcon = document.createElement('i');
        const pinIcon = document.createElement('i');
        messageContainer.className = 'message';
        if (message.sender == currentUser) {
            messageContainer.classList.add('my-message');
        }
        userPhotoContainer.className = 'message-user-photo';
        userPhotoContainer.innerText = userMessage.email[0].toUpperCase();
        contentContainer.className = 'message-content';
        messageContent.id = `message_${message.id}`;
        messageContent.innerText = message.message;
        editIcon.className = 'bi bi-pencil-square';
        editIcon.onclick = function () {
            window.CUR_EDIT_ID = message.id;
            getEditMessageModal();
        }
        deleteIcon.className = 'bi bi-trash';
        deleteIcon.onclick = function () {
            window.CUR_DELETE_ID = message.id;
            deleteMsgModal.show();
        }
        pinIcon.className = 'bi bi-pin-fill';
        if (message.pinned) {
            pinIcon.style.color = 'red';
            editIcon.style.display = 'none';
            deleteIcon.style.display = 'none';
        } else {
            pinIcon.style.color = 'black';
            editIcon.style.display = 'block';
            deleteIcon.style.display = 'block';
        }
        pinIcon.onclick = function () {
            window.CUR_PIN_ID = message.id;
            if (message.pinned) {
                unpinMessage();
            } else {
                pinMessage();
            }
        }
        contentContainer.appendChild(messageContent);
        contentContainer.appendChild(editIcon);
        contentContainer.appendChild(deleteIcon);
        contentContainer.appendChild(pinIcon);
        messageContainer.appendChild(userPhotoContainer);
        messageContainer.appendChild(contentContainer);
        // Add Display information
        userPhotoContainer.onclick = function () {
            console.log('1');
            if (message.sender == currentUser) {
                displayMineProfile();
            } else {
                displayUserProfile(message.sender);
            }
        }
        // Because the message list is reverse, so we need to reverse append
        messageList.insertBefore(messageContainer, messageList.childNodes[0]);
        messageList.scrollTop = messageList.scrollHeight;
    });
}

// Method 2: update Message in Page By add a element
// Shortage: Too much code and logic
// Advantage: Execution efficiency
// function updateMessageInPage(message) {
//     const currentUser = localStorage.getItem('userId');
//     const userList = window.USER_LIST.find(user => user.id == currentUser);
//     const messageList = document.getElementById('messageList');
//     const messageContainer = document.createElement('div');
//     const userPhotoContainer = document.createElement('div');
//     const contentContainer = document.createElement('div');
//     const messageContent = document.createElement('p');
//     const editIcon = document.createElement('i');
//     const pinIcon = document.createElement('i');
//     messageContainer.className = 'message';
//     messageContainer.classList.add('my-message');
//     userPhotoContainer.className = 'message-user-photo';
//     userPhotoContainer.innerText = userList.email[0].toUpperCase();
//     contentContainer.className = 'message-content';
//     messageContent.innerText = message;
//     editIcon.className = 'bi bi-pencil-square';
//     pinIcon.className = 'bi bi-pin-angle-fill';
//     pinIcon.style.display = message.pinned ? 'block' : 'none';
//     contentContainer.appendChild(editIcon);
//     contentContainer.appendChild(messageContent);
//     messageContainer.appendChild(userPhotoContainer);
//     messageContainer.appendChild(contentContainer);
//     messageList.appendChild(messageContainer);
// }

// reset Message Input Area
function clearMessageInput() {
    document.getElementById('messageInputArea').value = '';
}

// 4. Delete Message
function deleteMessage() {
    const selectChannelId = checkSelectChannel().id;
    const requestOperation = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
            'channelId': selectChannelId,
            'messageId': window.CUR_DELETE_ID
        },
    };
    fetch(`http://localhost:5005/message/${selectChannelId}/${window.CUR_DELETE_ID }`, requestOperation)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('You can not delete this message');
                resetEditChannelModal();
                return;
            }
            alert('Successfully delete message!');
            const messageList = document.getElementById('messageList');
            while (messageList.firstChild) {
                messageList.removeChild(messageList.firstChild);
            }
            getMessageByChannelId(checkSelectChannel().id, 0).then(messages => {
                displayMessageOnPage(messages);
            });
        });
    deleteMsgModal.hide();
}


// 5. Pin Message
function pinMessage() {
    const selectChannelId = checkSelectChannel().id;
    const requestOperation = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
            'channelId': selectChannelId,
            'messageId': window.CUR_PIN_ID
        },
    };
    fetch(`http://localhost:5005/message/pin/${selectChannelId}/${window.CUR_PIN_ID }`, requestOperation)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('You can not pin this message');
                resetEditChannelModal();
                return;
            }
            alert('Successfully pin message!');
            const messageList = document.getElementById('messageList');
            while (messageList.firstChild) {
                messageList.removeChild(messageList.firstChild);
            }
            getMessageByChannelId(checkSelectChannel().id, 0).then(messages => {
                displayMessageOnPage(messages);
            });
        });
}

// 6. unPin Message
function unpinMessage() {
    const selectChannelId = checkSelectChannel().id;
    const requestOperation = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
            'channelId': selectChannelId,
            'messageId': window.CUR_PIN_ID
        },
    };
    fetch(`http://localhost:5005/message/unpin/${selectChannelId}/${window.CUR_PIN_ID }`, requestOperation)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('You can not unpin this message');
                resetEditChannelModal();
                return;
            }
            alert('Successfully unpin message!');
            const messageList = document.getElementById('messageList');
            while (messageList.firstChild) {
                messageList.removeChild(messageList.firstChild);
            }
            getMessageByChannelId(checkSelectChannel().id, 0).then(messages => {
                displayMessageOnPage(messages);
            });
        });
}