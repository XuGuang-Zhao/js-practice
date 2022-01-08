// go to home page
function switchHomePage() {
    document.getElementById('navBar').style.display = 'block';
    document.getElementById('homePage').style.display = 'block';
    document.getElementById('channelPage').style.display = 'none';
    document.getElementById('authPage').style.display = 'none';
}

// go to login page
function switchLoginPage() {
    location.hash = 'login';
    document.getElementById('navBar').style.display = 'block';
    document.getElementById('homePage').style.display = 'none';
    document.getElementById('channelPage').style.display = 'none';
    document.getElementById('authPage').style.display = 'flex';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

// go to register page
function switchRegisterPage() {
    location.hash = 'register';
    document.getElementById('navBar').style.display = 'block';
    document.getElementById('homePage').style.display = 'none';
    document.getElementById('channelPage').style.display = 'none';
    document.getElementById('authPage').style.display = 'flex';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

// go to channel page
function switchChannelPage() {
    const user = getUserInfoFromStorage();
    getUserList();
    document.getElementById('navBar').style.display = 'none';
    document.getElementById('homePage').style.display = 'none';
    document.getElementById('authPage').style.display = 'none';
    document.getElementById('channelPage').style.display = 'block';
    document.getElementById('channelUser').innerText = user.name;
    setTimeout(() => {
        getChannels();
    }, 100);
}


// Add listener to button
document.getElementById('pageToggleIndex').addEventListener('click', switchHomePage);
document.getElementById('pageToggleLogin').addEventListener('click', switchLoginPage);
document.getElementById('loginToggleRegister').addEventListener('click', switchRegisterPage);
document.getElementById('registerToggleLogin').addEventListener('click', switchLoginPage);


// Change to current URL page
function switchCurrentPage() {
    const hash = location.hash;
    switch (hash) {
        case '#login': {
            switchLoginPage();
            break;
        }
        case '#register': {
            switchRegisterPage();
            break;
        }
        case '#channel': {
            switchChannelPage();
            break;
        }
        default: {
            switchHomePage();
            break;
        }
    }
}

// Listen whether url channel
window.onhashchange = function (event) {
    // If the user is a tourist, he needs to login firstly
    const touristPage = ['#login', '#register', '#home', ''];
    if (!(touristPage.includes(location.hash)) && !localStorage.getItem('userToken')) {
        alert("You need login firstly");
        location.hash = 'login';
        switchCurrentPage();
        return;
    }
    // If the user leave channel, the token should be clear!
    if (touristPage.includes(location.hash) && localStorage.getItem('userToken')) {
    /*   If the person go to register from channel,   
        we do not need to remind him the token expired */
        if (location.hash !== '#register') {
            alert("Your token have expired, please login again");
        }
        clearUserInfo();
        clearChannelInfo();
        location.hash = '#login';
        switchCurrentPage();
        return;
    }
    if (event.newURL !== event.oldURL) {
        switchCurrentPage();
    }
}

// Initial window URL
window.onload = function () {
    // The href need to be initial
    if (location.href.indexOf('?') === -1) {
        location.href = `${location.href}?`;
    }
    switchCurrentPage();
}