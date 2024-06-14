// /**
//  * This function changes the active link in the navbar when a link
//  * is clicked so that the user knows which page they are on.
//  */
document.addEventListener("DOMContentLoaded", function() {
    const navbarLinks = document.querySelectorAll(".navbar a");
    const contactLink = document.querySelector(".contact");

    // Function to activate a link
    function activateLink(link, highlight) {
        if (highlight) {
            navbarLinks.forEach(navLink => navLink.classList.remove("active"));
            link.classList.add("active");
            localStorage.setItem("activeLink", link.getAttribute("href"));
        } else {
            navbarLinks.forEach(navLink => navLink.classList.remove("active"));
            localStorage.removeItem("activeLink");
        }
    }

    // Check localStorage for the active link and set it
    const activeLink = localStorage.getItem("activeLink");
    if (activeLink) {
        navbarLinks.forEach(navLink => {
            if (navLink.getAttribute("href") === activeLink) {
                navLink.classList.add("active");
            } else {
                navLink.classList.remove("active");
            }
        });
    }

    navbarLinks.forEach(link => {
        link.addEventListener("click", function(event) {
            const href = link.getAttribute("href");
            if (href.startsWith("#")) {
                event.preventDefault();
                document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
            } else if (href.includes("#")) {
                localStorage.setItem("scrollTarget", href.split("#")[1]);
            }
            activateLink(this, true);
        });
    });

    contactLink.addEventListener("click", function(event) {
        const href = contactLink.getAttribute("href");
        if (href.includes("#")) {
            localStorage.setItem("scrollTarget", href.split("#")[1]);
        }
        activateLink(this, false);
    });
});

