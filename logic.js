// /**
//  * This function changes the active link in the navbar when a link
//  * is clicked so that the user knows which page they are on.
//  */
document.addEventListener("DOMContentLoaded", function() {
    const navbarLinks = document.querySelectorAll(".navbar a");
    const contactLink = document.querySelector(".contact");
    const hamburger = document.getElementById("hamburger");
    const navbar = document.querySelector(".navbar");

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

    // Handle cross-page navigation from localStorage
    const scrollTarget = localStorage.getItem("scrollTarget");
    if (scrollTarget) {
        localStorage.removeItem("scrollTarget"); // Clear it so it doesn't happen again
        setTimeout(() => {
            const targetElement = document.querySelector(`#${scrollTarget}`);
            if (targetElement) {
                const header = document.querySelector('.header');
                const headerHeight = header ? header.offsetHeight : 80;
                // For about section, scroll slightly more to eliminate white sliver
                const extraPadding = scrollTarget === 'about' ? -2 : 20; // -2px means scroll 2px more
                const elementPosition = targetElement.offsetTop - headerHeight - extraPadding;
                
                window.scrollTo({
                    top: Math.max(0, elementPosition),
                    behavior: 'smooth'
                });
                
                // Update active link
                const targetLink = document.querySelector(`.navbar a[href="#${scrollTarget}"]`);
                if (targetLink) {
                    navbarLinks.forEach(navLink => navLink.classList.remove("active"));
                    targetLink.classList.add("active");
                    localStorage.setItem("activeLink", `#${scrollTarget}`);
                }
            }
        }, 100); // Small delay to ensure page is fully loaded
    }

    navbarLinks.forEach(link => {
        link.addEventListener("click", function(event) {
            const href = link.getAttribute("href");
            
            // Handle internal links (starting with #)
            if (href.startsWith("#")) {
                event.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    // Calculate offset for fixed header
                    const header = document.querySelector('.header');
                    const headerHeight = header ? header.offsetHeight : 80; // fallback to 80px
                    // For about section, scroll slightly more to eliminate white sliver
                    const extraPadding = href === '#about' ? -2 : 20; // -2px means scroll 2px more
                    const elementPosition = targetElement.offsetTop - headerHeight - extraPadding;
                    
                    window.scrollTo({
                        top: Math.max(0, elementPosition), // Ensure we don't scroll above page top
                        behavior: 'smooth'
                    });
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
            // Check if it's a cross-page link (starts with index.html)
            if (href.startsWith("index.html#")) {
                // Allow normal navigation and store target for when page loads
                const targetSection = href.split("#")[1];
                localStorage.setItem("scrollTarget", targetSection);
                // Don't prevent default - let it navigate to the other page
            } else {
                // Same page navigation
                event.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    // Calculate offset for fixed header
                    const header = document.querySelector('.header');
                    const headerHeight = header ? header.offsetHeight : 80; // fallback to 80px
                    // No extra padding for about section to make it flush with header
                    const extraPadding = href === '#about' ? 0 : 20;
                    const elementPosition = targetElement.offsetTop - headerHeight - extraPadding;
                    
                    window.scrollTo({
                        top: Math.max(0, elementPosition), // Ensure we don't scroll above page top
                        behavior: 'smooth'
                    });
                }
                localStorage.setItem("scrollTarget", href.split("#")[1]);
            }
        }
        activateLink(this, false);
    });

    // Handle all cross-page navigation links
    function handleCrossPageNavigation() {
        const crossPageLinks = document.querySelectorAll('a[href^="index.html#"]');
        
        crossPageLinks.forEach(link => {
            link.addEventListener("click", function(event) {
                const href = this.getAttribute("href");
                if (href && href.includes("#")) {
                    const targetSection = href.split("#")[1];
                    localStorage.setItem("scrollTarget", targetSection);
                    // Let the link navigate normally, our localStorage handler will take care of scrolling
                }
            });
        });
    }

    // Initialize cross-page navigation
    handleCrossPageNavigation();

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
                // Success - Show dramatic feedback
                showSuccessOverlay();
                
                // Reset form after overlay animation
                setTimeout(() => {
                    contactForm.reset();
                    submitButton.value = originalButtonText;
                    submitButton.disabled = false;
                    submitButton.style.backgroundColor = '';
                }, 2500);
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
                
                // Show error notification
                showNotification('Sorry, there was an error sending your message. Please try again.', 'error');
            });
        });
    }

    // Initialize new features
    initScrollAnimations();
    initHeaderScrollEffect();
    initTypingEffect();
    initParticleBackground();
});

// Page loader functionality
window.addEventListener('load', function() {
    const loader = document.getElementById('pageLoader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
            // Remove loader from DOM after transition
            setTimeout(() => {
                loader.remove();
            }, 500);
        }, 1000); // Show loader for at least 1 second
    }
});

// Enhanced scroll animations and interactivity
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                if (target.classList.contains('fade-in')) {
                    target.classList.add('visible');
                }
                if (target.classList.contains('slide-in-left')) {
                    target.classList.add('visible');
                }
                if (target.classList.contains('slide-in-right')) {
                    target.classList.add('visible');
                }
            }
        });
    }, observerOptions);

    // Add animation classes to elements
    const aboutContent = document.querySelector('.about-content');
    const aboutImg = document.querySelector('.about-img');
    const contactForm = document.querySelector('.contact-form');
    const highlightItems = document.querySelectorAll('.highlight-item');

    if (aboutContent) {
        aboutContent.classList.add('slide-in-left');
        observer.observe(aboutContent);
    }
    
    if (aboutImg) {
        aboutImg.classList.add('slide-in-right');
        observer.observe(aboutImg);
    }

    if (contactForm) {
        contactForm.classList.add('fade-in');
        observer.observe(contactForm);
    }

    highlightItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
        item.classList.add('fade-in');
        observer.observe(item);
    });
}

// Performance optimizations and smooth behaviors
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimized scroll handler
const handleScroll = debounce(() => {
    const header = document.querySelector('.header');
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}, 10);

// Enhanced header scroll effect
function initHeaderScrollEffect() {
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', handleScroll);
}

// Smooth scroll to section with offset
function smoothScrollToSection(targetId) {
    const target = document.querySelector(targetId);
    if (target) {
        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 80;
        const targetPosition = target.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: 'smooth'
        });
    }
}

// Enhanced typing effect for home section
function initTypingEffect() {
    const textElement = document.querySelector('.home-content h2');
    if (!textElement) return;
    
    const text = textElement.textContent;
    textElement.textContent = '';
    textElement.style.borderRight = '2px solid #1995AD';
    
    let i = 0;
    const typeWriter = () => {
        if (i < text.length) {
            textElement.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        } else {
            // Remove cursor after typing is complete
            setTimeout(() => {
                textElement.style.borderRight = 'none';
            }, 1000);
        }
    };
    
    // Start typing effect after a delay
    setTimeout(typeWriter, 1000);
}

// Particle background effect
function initParticleBackground() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    
    document.body.appendChild(canvas);
    
    const particles = [];
    const particleCount = 50;
    
    // Resize canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    // Create particles
    function createParticles() {
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 1,
                speedX: Math.random() * 0.5 - 0.25,
                speedY: Math.random() * 0.5 - 0.25,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    // Animate particles
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Wrap around screen
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.y > canvas.height) particle.y = 0;
            if (particle.y < 0) particle.y = canvas.height;
            
            // Draw particle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(25, 149, 173, ${particle.opacity})`;
            ctx.fill();
        });
        
        requestAnimationFrame(animateParticles);
    }
    
    resizeCanvas();
    createParticles();
    animateParticles();
    
    window.addEventListener('resize', resizeCanvas);
}

// Enhanced form validation
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        const value = input.value.trim();
        const errorElement = input.parentNode.querySelector('.error-message');
        
        // Remove existing error
        if (errorElement) {
            errorElement.remove();
        }
        
        // Validate based on input type
        let isInputValid = true;
        let errorMessage = '';
        
        if (!value) {
            isInputValid = false;
            errorMessage = `${input.placeholder} is required`;
        } else if (input.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isInputValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        } else if (input.type === 'tel') {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (value && !phoneRegex.test(value.replace(/\s/g, ''))) {
                isInputValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
        }
        
        if (!isInputValid) {
            isValid = false;
            
            // Add error styling
            input.style.borderColor = '#dc3545';
            
            // Create error message
            const error = document.createElement('div');
            error.className = 'error-message';
            error.style.color = '#dc3545';
            error.style.fontSize = '14px';
            error.style.marginTop = '5px';
            error.textContent = errorMessage;
            
            input.parentNode.appendChild(error);
        } else {
            input.style.borderColor = '#1995AD';
        }
    });
    
    return isValid;
}

// Add loading spinner component
function createLoadingSpinner() {
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.innerHTML = `
        <div class="spinner"></div>
        <style>
            .loading-spinner {
                display: inline-flex;
                align-items: center;
                gap: 10px;
            }
            .spinner {
                width: 20px;
                height: 20px;
                border: 2px solid #ffffff;
                border-top: 2px solid #1995AD;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    return spinner;
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

// Success overlay for form submission
function showSuccessOverlay() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'success-overlay';
    overlay.innerHTML = `
        <div class="success-content">
            <div class="success-checkmark">
                <i class='bx bx-check-circle'></i>
            </div>
            <h3>Message Sent!</h3>
            <p>Thank you for reaching out. I'll get back to you soon!</p>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(overlay);
    
    // Show overlay with animation
    setTimeout(() => overlay.classList.add('show'), 100);
    
    // Hide overlay after 2.5 seconds
    setTimeout(() => {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 500);
    }, 2500);
    
    // Allow clicking overlay to close early
    overlay.addEventListener('click', () => {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 500);
    });
}

