// Get User Info from storage
function getUserInfoFromStorage() {
    const userStr = localStorage.getItem('userInfo');
    const user = JSON.parse(userStr);
    return user;
}

// Get channel list from storage
function getChannelsFromStorage() {
    const userChannelsStr = localStorage.getItem('userChannels');
    const userChannels = JSON.parse(userChannelsStr);
    return userChannels;
}

// Clear User info in storage
function clearUserInfo() {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userChannels');
    localStorage.removeItem('userPassword');
}

// Clear User Channel
function clearChannelInfo() {
    const publicChannel = document.getElementById('publicChanneList');
    const privateChanne = document.getElementById('privateChanneList');
    while (publicChannel.firstChild) {
        publicChannel.removeChild(publicChannel.firstChild);
    }
    while (privateChanne.firstChild) {
        privateChanne.removeChild(privateChanne.firstChild);
    }
}

// 1. Get a list of all the users
function getUserList() {
    const requestOperation = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
        },
    };
    fetch('http://localhost:5005/user', requestOperation)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }
            const {
                users
            } = data;
            window.USER_LIST = users;
        });
}

// 3. Get details of the specific user
function getUserByID(userId) {
    const requestOperation = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
            'userId': `${userId}`
        },
    };
    return fetch(`http://localhost:5005/user/${userId}`, requestOperation)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }
            return data;
        });
}


// Create a display Mine Profile Modal method
const displayMineProfileModal = document.getElementById('displayMineProfileModal');
const displayMineModal = new bootstrap.Modal(displayMineProfileModal, {
    keyboard: false
});

// function display mine profile
function displayMineProfile() {
    getUserByID(`${localStorage.getItem('userId')}`).then(data => {
        document.getElementById('displayMineName').innerText = data.name;
        document.getElementById('displayMineEmail').innerText = data.email;
        document.getElementById('displayMineBio').innerText = data.bio;
        displayMineModal.show();
    });
}

// Create a Edit Mine Profile Modal method
const editMineProfileModal = document.getElementById('editMineProfileModal');
const editMineModal = new bootstrap.Modal(editMineProfileModal, {
    keyboard: false
});

// 2. Put User Profile
function sumbitUserProfile() {
    const updateEmail = document.getElementById('newMineEmail').value;
    const updateName = document.getElementById('newMineName').value;
    const updatePassword = document.getElementById('newMinePassWord').value;
    const updatebio = document.getElementById('newMineBio').value;
    const updateimage = '';
    const jsonString = JSON.stringify({
        email: updateEmail,
        password: updatePassword,
        name: updateName,
        bio: updatebio,
        image: updateimage
    });
    const requestOperation = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
        },
        body: jsonString
    };

    fetch('http://localhost:5005/user', requestOperation)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }
            // update the userPassword
            if (updatePassword !== localStorage.getItem('userPassword')) {
                localStorage.setItem('userPassword', updatePassword);
            }
            updateMemberOnPage();
            document.getElementById('channelUser').innerText = updateName;
            alert('Successfully update!');
        });
    editMineModal.hide();
}

function editUserProfile() {
    updateMineModal();
    displayMineModal.hide();
    editMineModal.show();
}

function hideShowPassword() {
    var eye = document.getElementById("eye");
    var password = document.getElementById("newMinePassWord");
    if (password.type == "password") {
        password.type = "text";
        eye.className = 'bi bi-eye';
    } else {
        password.type = "password";
        eye.className = 'bi bi-eye-slash';
    }
}

function updateMineModal() {
    var oldName = document.getElementById('displayMineName').innerText;
    var oldEmail = document.getElementById('displayMineEmail').innerText;
    var oldBio = document.getElementById('displayMineBio').innerText;
    document.getElementById('newMineName').value = oldName;
    document.getElementById('newMineEmail').value = oldEmail;
    document.getElementById('newMineBio').value = oldBio;
    document.getElementById("newMinePassWord").type = "password";
    eye.className = 'bi bi-eye-slash';
    document.getElementById("newMinePassWord").value = localStorage.getItem('userPassword');
}