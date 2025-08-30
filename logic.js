// /**
//  * This function changes the active link in the navbar when a link
//  * is clicked so that the user knows which page they are on.
//  */
document.addEventListener("DOMContentLoaded", function() {
    const navbarLinks = document.querySelectorAll(".navbar a");
    const contactLink = document.querySelector(".contact");
    const hamburger = document.getElementById("hamburger");
    const navbar = document.querySelector(".navbar");
    const hireMeBtn = document.querySelector(".btn-1");

    // Hamburger menu functionality
    if (hamburger) {
        hamburger.addEventListener("click", function() {
            hamburger.classList.toggle("active");
            navbar.classList.toggle("active");
        });

        // Close menu when clicking on a link
        navbarLinks.forEach(link => {
            link.addEventListener("click", function() {
                hamburger.classList.remove("active");
                navbar.classList.remove("active");
            });
        });

        // Close menu when clicking outside
        document.addEventListener("click", function(event) {
            if (!hamburger.contains(event.target) && !navbar.contains(event.target)) {
                hamburger.classList.remove("active");
                navbar.classList.remove("active");
            }
        });
    }

    // Hire Me button functionality
    if (hireMeBtn && hireMeBtn.textContent.includes("Hire Me")) {
        hireMeBtn.addEventListener("click", function() {
            // Option 1: Scroll to contact form
            document.querySelector("#contact-form").scrollIntoView({ behavior: 'smooth' });
            
            // Option 2: You could also open email client
            // window.location.href = "mailto:your-email@example.com?subject=Hiring Inquiry&body=Hi Connor, I'm interested in hiring you for a project...";
        });
    }

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
    } else {
        // If no active link stored, default to Home
        const homeLink = document.querySelector('.navbar a[href="#home"]');
        if (homeLink) {
            homeLink.classList.add('active');
        }
    }
    
    // Handle hash in URL on page load (for direct links)
    if (window.location.hash) {
        const hashLink = document.querySelector(`.navbar a[href="${window.location.hash}"]`);
        if (hashLink) {
            navbarLinks.forEach(navLink => navLink.classList.remove("active"));
            hashLink.classList.add("active");
            localStorage.setItem("activeLink", window.location.hash);
        }
    }

    navbarLinks.forEach(link => {
        link.addEventListener("click", function(event) {
            const href = link.getAttribute("href");
            
            // Special handling for Resume link (external PDF)
            if (href.includes("Resume.pdf") || href.includes(".pdf")) {
                // Don't set Resume as active, let current section stay highlighted
                // The PDF will open in a new tab, so user stays on current page
                return;
            }
            
            // Handle internal links (starting with #)
            if (href.startsWith("#")) {
                event.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
                activateLink(this, true);
            } 
            // Handle external links or links with hash (like projects.html)
            else if (href.includes("#")) {
                localStorage.setItem("scrollTarget", href.split("#")[1]);
                activateLink(this, true);
            }
            // Handle regular page links
            else {
                activateLink(this, true);
            }
        });
    });

    contactLink.addEventListener("click", function(event) {
        const href = contactLink.getAttribute("href");
        if (href.includes("#")) {
            localStorage.setItem("scrollTarget", href.split("#")[1]);
        }
        activateLink(this, false);
    });

    // Intersection Observer for scroll-based navigation highlighting
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.navbar a[href^="#"]');
    
    const observerOptions = {
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                
                // Remove active class from all nav items
                navItems.forEach(navItem => {
                    navItem.classList.remove('active');
                });
                
                // Add active class to corresponding nav item
                const activeNavItem = document.querySelector(`.navbar a[href="#${sectionId}"]`);
                if (activeNavItem) {
                    activeNavItem.classList.add('active');
                    localStorage.setItem("activeLink", `#${sectionId}`);
                }
            }
        });
    }, observerOptions);
    
    // Observe all sections
    sections.forEach(section => {
        observer.observe(section);
    });

    // Contact form handling for Netlify
    const contactForm = document.querySelector('form[name="contact"]');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitButton = contactForm.querySelector('input[type="submit"]');
            const originalButtonText = submitButton.value;
            
            // Show loading state
            submitButton.value = 'Sending...';
            submitButton.disabled = true;
            
            // Create FormData object
            const formData = new FormData(contactForm);
            
            // Submit to Netlify
            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            })
            .then(() => {
                // Success
                submitButton.value = 'Message Sent!';
                submitButton.style.backgroundColor = '#28a745';
                
                // Reset form after 3 seconds
                setTimeout(() => {
                    contactForm.reset();
                    submitButton.value = originalButtonText;
                    submitButton.disabled = false;
                    submitButton.style.backgroundColor = '';
                }, 3000);
                
                // Show success message
                showNotification('Thank you! Your message has been sent successfully.', 'success');
            })
            .catch((error) => {
                console.error('Error:', error);
                // Error state
                submitButton.value = 'Error - Try Again';
                submitButton.style.backgroundColor = '#dc3545';
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    submitButton.value = originalButtonText;
                    submitButton.disabled = false;
                    submitButton.style.backgroundColor = '';
                }, 3000);
                
                // Show error message
                showNotification('Sorry, there was an error sending your message. Please try again.', 'error');
            });
        });
    }
});

// Add smooth scroll behavior for better UX
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Notification system for form feedback
function showNotification(message, type = 'success') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
}

