function getUserInfo(userId) {
    getUserByID(userId).then(data => {
        localStorage.setItem('userInfo', JSON.stringify(data));
        location.hash = 'channel';
    });
}

// 1. Logs a user into applicaiton
document.getElementById('login').addEventListener('click', () => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const jsonString = JSON.stringify({
        email,
        password,
    });
    const requestOperation = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: jsonString,
    };
    if (!email) {
        alert('The email filed can not be empty');
        return;
    }
    if (!password) {
        alert('The password field can not be empty');
        return;
    }
    fetch('http://localhost:5005/auth/login', requestOperation)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }
            // Login successful and save the userToken and userId
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userPassword', password);
            alert(`Welcome user ${email}`);
            getUserInfo(data.userId);
        });
});

// 2. Register a user in the application
document.getElementById('register').addEventListener('click', () => {
    const email = document.getElementById('registerEmail').value;
    const name = document.getElementById('registerName').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const jsonString = JSON.stringify({
        email,
        name,
        password,
    });
    const requestOperation = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: jsonString,
    };

    if (!email) {
        alert('The email filed can not be empty');
        return;
    }

    if (!name) {
        alert('The name filed can not be empty');
        return;
    }

    if (!password) {
        alert('The password field can not be empty');
        return;
    }

    if (!confirmPassword) {
        alert('The confirm password field can not be empty');
        return;
    }

    if (confirmPassword !== password) {
        alert('The passwords must be the same!');
        return;
    }

    fetch('http://localhost:5005/auth/register', requestOperation)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }
            alert('Register success!');
            switchLoginPage();
        }).catch(error => {
            alert('Failed to fetch server!');
        });
});

// 3. Logs a user out of the application
document.getElementById('logout').addEventListener('click', () => {
    const requestOperation = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
    };
    fetch('http://localhost:5005/auth/logout', requestOperation)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }
            alert('Logs out successfully!');
            clearUserInfo();
            clearChannelInfo();
            location.hash = '#home';
        });
});