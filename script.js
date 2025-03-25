document.addEventListener('DOMContentLoaded', () => {
    const dropsContainer = document.getElementById('drops-container');
    if (dropsContainer) {
        for (let i = 0; i < 50; i++) {
            const drop = document.createElement('div');
            drop.classList.add('drop');
            drop.style.left = `${Math.random() * 100}vw`;
            drop.style.animationDelay = `${Math.random() * 2}s`;
            drop.style.animationDuration = `${Math.random() * 3 + 2}s`;
            dropsContainer.appendChild(drop);
        }
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                entry.target.classList.remove('hidden'); // Correction ici : class -> classList
                observer.unobserve(entry.target);
            }
        });
    });

    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach((el) => observer.observe(el));

    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
});