// Clear add channel modal
function resetAddChannelModal() {
    const channelNameDom = document.getElementById('channelName');
    const channelDescriptioDom = document.getElementById('channelDescription');
    const channelPrivateDom = document.getElementById('channelPrivate');
    channelNameDom.value = '';
    channelDescriptioDom.value = '';
    channelPrivateDom.checked = false;
}

// Clear edit channel model
function resetEditChannelModal() {
    document.getElementById('newChannelName').value = '';
    document.getElementById('newChannelDescription').value = '';
}

// Clear invite Modal
function resetaddMemberModal() {
    const memberSelect = document.getElementById('memberSelect');
    while (memberSelect.firstChild) {
        memberSelect.removeChild(memberSelect.firstChild);
    }
}

// Display invite Modal
function displayInviteModal() {
    // Eidt select bar
    const selectChannel = checkSelectChannel().id;
    const channelList = getChannelsFromStorage();
    const channelUsers = channelList.find(channel => channel.id == selectChannel).members;
    const memberContainer = document.getElementById('memberSelect');
    // Filter the Meber exist in the channel
    window.USER_LIST.filter(user => !(channelUsers.includes(user.id))).forEach(user => {
        const option = document.createElement('option');
        option.setAttribute('value', user.id);
        getUserByID(Number(user.id))
            .then((result) => {
                option.innerText = result.name;
                memberContainer.appendChild(option);
            });
    });
    //Show modal
    const addMemberModal = document.getElementById('addMemberModal');
    const addMemberModaldisplay = new bootstrap.Modal(addMemberModal, {
        keyboard: false
    });
    addMemberModaldisplay.show();
}

// Add Member on the Page
function displayMembersOnPage() {
    const selectChannel = checkSelectChannel().id;
    const channelList = getChannelsFromStorage();
    const channelUsers = channelList.find(channel => channel.id == selectChannel).members || [];
    const memberList = document.getElementById('memberList');
    while (memberList.firstChild) {
        memberList.removeChild(memberList.firstChild);
    }
    channelUsers.forEach((id) => {
        getUserByID(Number(id))
            .then((user) => {
                const userContainer = document.createElement('div');
                userContainer.className = 'member';
                userContainer.id = id;
                if (id == localStorage.getItem('userId')) {
                    userContainer.innerText = `${user.name} (You)`;
                    userContainer.style.color = '#fff';
                    memberList.insertBefore(userContainer, memberList.childNodes[0]);
                } else {
                    userContainer.innerText = user.name;
                    memberList.appendChild(userContainer);
                }
                userContainer.onclick = function () {
                    if (id == localStorage.getItem('userId')) {
                        displayMineProfile();
                    } else {
                        displayUserProfile(id);
                    }
                }
            });
    });
}

// Create display User Profile Modal
const displayUserProfileModal = document.getElementById('displayUserProfileModal');
const displayUserModal = new bootstrap.Modal(displayUserProfileModal, {
    keyboard: false
});

// Display User profile
function displayUserProfile(id) {
    getUserByID(id).then(data => {
        document.getElementById('displayUserName').innerText = data.name;
        document.getElementById('displayUserEmail').innerText = data.email;
        document.getElementById('displayUserBio').innerText = data.bio;
        displayUserModal.show();
    });
}

// Check select channel
function checkSelectChannel() {
    return document.querySelector('.channel.select');
}

// Change select channel
function changeSelectChannel(e) {
    if (checkSelectChannel().id == e.target.id) return;
    checkSelectChannel().classList.remove('select');
    e.target.classList.add('select');
    // Update select channel headers
    document.getElementById('channelHeading').innerText = checkSelectChannel().innerText;
    // Update Member List
    displayMembersOnPage();
    getMessageByChannelId(checkSelectChannel().id, 0).then(messages => {
        displayMessageOnPage(messages);
    });
}

// Add channels on the page
function displayChannelsOnPage(channels) {
    const publicChannelList = document.getElementById('publicChanneList');
    const privateChannelList = document.getElementById('privateChanneList');
    channels.forEach((channel) => {
        const channelList = document.createElement('div');
        channelList.className = 'channel';
        channelList.id = channel.id;
        channelList.innerText = channel.name;
        if (channel.name === 'public channel') {
            channelList.classList.add('select');
        }
        channelList.addEventListener('click', changeSelectChannel);
        if (channel.private === false) {
            publicChannelList.appendChild(channelList);
        } else if (channel.creator == localStorage.getItem('userId')) {
            privateChannelList.appendChild(channelList);
        }
        // set select channel headers
        if (checkSelectChannel()) {
            document.getElementById('channelHeading').innerText = checkSelectChannel().innerText;
        }
    });
    // Display the specific member in this channel
    displayMembersOnPage();
    getMessageByChannelId(checkSelectChannel().id, 0).then((messages) => {
        displayMessageOnPage(messages);
    });
}

// 1. Get a list of all channels
function getChannels() {
    const requestOperation = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
    };
    fetch('http://localhost:5005/channel', requestOperation)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }
            const {
                channels
            } = data;
            localStorage.setItem('userChannels', JSON.stringify(channels));
            displayChannelsOnPage(channels);
        });
}

// 2. Create a new channel
function createChannel() {
    const channelName = document.getElementById('channelName').value;
    const channelDescription = document.getElementById('channelDescription').value;
    const channelPrivate = document.getElementById('channelPrivate').checked;
    if (channelName === 'public channel') {
        alert('Channel name can not be public channel');
        return;
    }
    if (!channelName) {
        alert('Channel name can not be empty');
        return;
    }
    const jsonString = JSON.stringify({
        name: channelName,
        description: channelDescription || '',
        private: channelPrivate,
    });
    const requestOperation = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: jsonString,
    };
    fetch('http://localhost:5005/channel', requestOperation)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }
            alert('Successfully created');
            document.getElementById('closeAddChannelButton').click();
            // Refresh the channel list
            clearChannelInfo();
            getChannels();
        })
}

// Clear the display channel modal info when close it
function resetDisplayChannelModal() {
    const displayChannelNameDom = document.getElementById('displayChannelName');
    const displayChannelDescriptionDom = document.getElementById('displayChannelDescription');
    const displayChannelPrivateDom = document.getElementById('displayChannelPrivate');
    const displayChannelTimestampDom = document.getElementById('displayChannelTimestamp');
    const displayChannelCreatorDom = document.getElementById('displayChannelCreator');
    displayChannelNameDom.innerText = '';
    displayChannelDescriptionDom.innerText = '';
    displayChannelPrivateDom.innerText = '';
    displayChannelTimestampDom.innerText = '';
    displayChannelCreatorDom.innerText = '';
}

// 3. Get details of the specific channel
function displayChannelInfo() {
    const channelId = parseInt(checkSelectChannel().id);
    const requestOperation = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
            'channelId': channelId,
        },
    };
    fetch(`http://localhost:5005/channel/${channelId}`, requestOperation)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Error 403: You have no authority checking the channel');
                document.getElementById('editChannelButton').style.display = 'none';
                resetDisplayChannelModal();
                return;
            }
            document.getElementById('displayChannelName').innerText = data.name;
            document.getElementById('displayChannelDescription').innerText = data.description;
            document.getElementById('displayChannelPrivate').innerText = data.private;
            document.getElementById('displayChannelTimestamp').innerText = data.createdAt;
            getUserByID(data.creator)
                .then(user => {
                    document.getElementById('displayChannelCreator').innerText = user.name;
                    document.getElementById('editChannelButton').style.display = 'block';
                });
        });
}

// 4. Update details of the specific channel
function editChannelInfo() {
    const newChannelName = document.getElementById('newChannelName').value;
    const oldChannelName = document.getElementById('channelHeading').innerText;
    if (oldChannelName === 'public channel') {
        alert('Public channel can not be changed');
        return;
    }
    const newChannelDescription = document.getElementById('newChannelDescription').value;
    const channelId = Number(checkSelectChannel().id);
    const jsonString = JSON.stringify({
        name: newChannelName,
        description: newChannelDescription || '',
    });
    const requestOperation = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
            'channelId': channelId,
        },
        body: jsonString,
    };
    fetch(`http://localhost:5005/channel/${channelId}`, requestOperation)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('You can not edit the channel');
                resetEditChannelModal();
                return;
            }
            alert('Successfully Updated');
            document.getElementById('closeEditChannelButton').click();
            // Refresh the channel list
            clearChannelInfo();
            getChannels();
        });
}


// Update Member on Page
function updateMemberOnPage() {
    const requestOperation = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
    };
    fetch('http://localhost:5005/channel', requestOperation)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }
            const {
                channels
            } = data;
            localStorage.setItem('userChannels', JSON.stringify(channels));
            displayMembersOnPage();
        });
}

// 5. Join a channel
function joinTheChannel() {
    const whetherJoin = confirm('Do you want to join this channel ?');
    if (!whetherJoin) {
        return;
    }
    const channelId = Number(checkSelectChannel().id);
    const requestOperation = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
            'channelId': channelId,
        },
    };
    fetch(`http://localhost:5005/channel/${channelId}/join`, requestOperation)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('You can not join this channel');
                resetEditChannelModal();
                return;
            }
            // update the member list
            updateMemberOnPage();
            // update the message list
            getMessageByChannelId(checkSelectChannel().id, 0).then(messages => {
                displayMessageOnPage(messages);
            });
            alert('Successfully Join');
        });

}

// 6. Leave a channel
function leaveTheChannel() {
    const whetherLeave = confirm('Do you want to leave this channel ?');
    if (!whetherLeave) {
        return;
    }
    const channelId = Number(checkSelectChannel().id);
    const requestOperation = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
            'channelId': channelId,
        },
    };
    fetch(`http://localhost:5005/channel/${channelId}/leave`, requestOperation)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('You can not leave this channel');
                resetEditChannelModal();
                return;
            }
            // update Member list
            updateMemberOnPage();
            // remove message list
            const messageList = document.getElementById('messageList');
            while (messageList.firstChild) {
                messageList.removeChild(messageList.firstChild);
            }
            alert('Successfully Leave');
        });
}


// 7. Invite the user
function inviteUser() {
    const channelId = Number(checkSelectChannel().id);
    const userId = Number(document.getElementById('memberSelect').value);
    const jsonString = JSON.stringify({
        userId: userId,
    });
    const requestOperation = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
            'channelId': channelId,
        },
        body: jsonString,
    };
    fetch(`http://localhost:5005/channel/${channelId}/invite`, requestOperation)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('You can not invite this user');
                resetAddChannelModal();
                return;
            }
            // Refresh the channel list
            updateMemberOnPage();
            alert('Successfully Invited');
            document.getElementById('closeAddMemberButton').click();
        });
}