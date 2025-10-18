// Documentation-specific JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Copy code functionality
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const codeId = button.getAttribute('data-copy');
            const codeElement = document.getElementById(codeId);
            
            if (codeElement) {
                try {
                    await navigator.clipboard.writeText(codeElement.textContent);
                    const originalHTML = button.innerHTML;
                    button.innerHTML = '<i class="fas fa-check"></i>';
                    button.style.background = 'rgba(16, 185, 129, 0.2)';
                    button.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                    
                    setTimeout(() => {
                        button.innerHTML = originalHTML;
                        button.style.background = '';
                        button.style.borderColor = '';
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy:', err);
                }
            }
        });
    });

    // Copy command functionality
    document.querySelectorAll('.command-copy').forEach(button => {
        button.addEventListener('click', async () => {
            const code = button.previousElementSibling;
            
            if (code) {
                try {
                    await navigator.clipboard.writeText(code.textContent);
                    const originalText = button.textContent;
                    button.textContent = 'Copied!';
                    button.style.background = 'var(--secondary-color)';
                    
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.style.background = '';
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy:', err);
                }
            }
        });
    });

    // Highlight current section in sidebar based on scroll
    const sections = document.querySelectorAll('.doc-section');
    const navLinks = document.querySelectorAll('.sidebar-content a');
    
    const highlightNav = () => {
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop - 200) {
                currentSection = section.querySelector('h2')?.id || '';
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href')?.includes(`#${currentSection}`)) {
                link.classList.add('active');
            }
        });
    };
    
    window.addEventListener('scroll', highlightNav);
    
    // Generate table of contents for long pages
    const generateTOC = () => {
        const tocContainer = document.querySelector('.table-of-contents ul');
        if (!tocContainer) return;
        
        const headings = document.querySelectorAll('.doc-section h2, .doc-section h3');
        headings.forEach((heading, index) => {
            if (!heading.id) {
                heading.id = `section-${index}`;
            }
            
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${heading.id}`;
            a.textContent = heading.textContent;
            
            if (heading.tagName === 'H3') {
                li.style.paddingLeft = '20px';
                li.style.fontSize = '14px';
            }
            
            li.appendChild(a);
            tocContainer.appendChild(li);
        });
    };
    
    generateTOC();
    
    // Add anchor links to headings
    document.querySelectorAll('.doc-section h2, .doc-section h3').forEach(heading => {
        if (heading.id) {
            heading.style.position = 'relative';
            heading.style.cursor = 'pointer';
            
            const anchor = document.createElement('a');
            anchor.href = `#${heading.id}`;
            anchor.className = 'heading-anchor';
            anchor.innerHTML = '<i class="fas fa-link"></i>';
            anchor.style.cssText = `
                position: absolute;
                left: -30px;
                opacity: 0;
                transition: opacity 0.3s ease;
                color: var(--primary-color);
                text-decoration: none;
                font-size: 0.8em;
            `;
            
            heading.appendChild(anchor);
            
            heading.addEventListener('mouseenter', () => {
                anchor.style.opacity = '1';
            });
            
            heading.addEventListener('mouseleave', () => {
                anchor.style.opacity = '0';
            });
        }
    });
    
    // Search functionality (basic)
    const addSearch = () => {
        const sidebar = document.querySelector('.sidebar-content');
        if (!sidebar) return;
        
        const searchBox = document.createElement('div');
        searchBox.className = 'search-box';
        searchBox.innerHTML = `
            <input type="text" placeholder="Search docs..." class="search-input">
            <i class="fas fa-search"></i>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .search-box {
                position: relative;
                margin-bottom: 24px;
            }
            .search-input {
                width: 100%;
                padding: 10px 36px 10px 12px;
                border: 1px solid var(--border-color);
                border-radius: 6px;
                font-size: 14px;
                transition: var(--transition);
            }
            .search-input:focus {
                outline: none;
                border-color: var(--primary-color);
            }
            .search-box i {
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: var(--text-light);
            }
        `;
        document.head.appendChild(style);
        
        sidebar.insertBefore(searchBox, sidebar.firstChild);
        
        const searchInput = searchBox.querySelector('.search-input');
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const links = sidebar.querySelectorAll('a');
            
            links.forEach(link => {
                const text = link.textContent.toLowerCase();
                const li = link.parentElement;
                
                if (text.includes(query) || query === '') {
                    li.style.display = '';
                } else {
                    li.style.display = 'none';
                }
            });
        });
    };
    
    addSearch();
    
    // Add smooth scroll behavior for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offset = 100;
                    const targetPosition = target.offsetTop - offset;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without jumping
                    history.pushState(null, null, href);
                }
            }
        });
    });
    
    // Handle hash on page load
    if (window.location.hash) {
        setTimeout(() => {
            const target = document.querySelector(window.location.hash);
            if (target) {
                const offset = 100;
                const targetPosition = target.offsetTop - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }, 100);
    }
    
    // Add loading state for external links
    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        link.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.animation = 'spin 0.5s ease-in-out';
            }
        });
    });
    
    // Add print styles
    const printStyles = document.createElement('style');
    printStyles.textContent = `
        @media print {
            .navbar,
            .docs-sidebar,
            .doc-navigation {
                display: none !important;
            }
            .docs-layout {
                grid-template-columns: 1fr;
            }
            .docs-content {
                max-width: 100%;
            }
        }
    `;
    document.head.appendChild(printStyles);
});

