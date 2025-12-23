        // State
        let filters = { status: 'all', language: '', owner: '', country: '', category: '', format: '' };
        let searchQuery = '';
        let searchTimeout = null;
        let editingRating = null;

        const langFlags = { lt: '🇱🇹', sv: '🇸🇪', en: '🇬🇧', ru: '🇷🇺', other: '🌍' };
        const ownerNames = { kristina: 'Kristina', darius: 'Darius', skolinta: 'Skolinta', nepriskirta: 'Nepriskirta' };
        const countryFlags = {
            lt: '🇱🇹', se: '🇸🇪', gb: '🇬🇧', us: '🇺🇸', ru: '🇷🇺',
            de: '🇩🇪', fr: '🇫🇷', it: '🇮🇹', es: '🇪🇸', jp: '🇯🇵',
            no: '🇳🇴', dk: '🇩🇰', pl: '🇵🇱', ie: '🇮🇪', lb: '🇱🇧', ca: '🇨🇦', hu: '🇭🇺', other: '🌍'
        };
        const countryNames = {
            lt: 'Lietuva', se: 'Švedija', gb: 'JK', us: 'JAV', ru: 'Rusija',
            de: 'Vokietija', fr: 'Prancūzija', it: 'Italija', es: 'Ispanija', jp: 'Japonija',
            no: 'Norvegija', dk: 'Danija', pl: 'Lenkija', ie: 'Airija', lb: 'Libanas', ca: 'Kanada', hu: 'Vengrija', other: 'Kita'
        };

        // Language filter buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const lang = this.dataset.lang;

                // Update active button
                document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                // Update filter
                filters.language = lang;

                // Reload books and stats
                loadBooks();
                updateStats();
            });
        });

        // Toggle add form
        document.getElementById('addHeader').addEventListener('click', function() {
            this.classList.toggle('open');
            document.getElementById('addBookForm').classList.toggle('open');
        });

        // Toggle all statistics
        document.getElementById('allStatsHeader').addEventListener('click', function() {
            this.classList.toggle('open');
            document.getElementById('allStatsContent').classList.toggle('open');
        });

        // Filter dropdown
        document.getElementById('filterBtn').addEventListener('click', function(e) {
            e.stopPropagation();
            document.getElementById('filterDropdown').classList.toggle('open');
        });

        document.addEventListener('click', function(e) {
            const dropdown = document.getElementById('filterDropdown');
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('open');
            }
        });

        // Filter items
        document.querySelectorAll('.filter-item').forEach(item => {
            item.addEventListener('click', function() {
                const type = this.dataset.type;
                const value = this.dataset.value;

                // For status, only one can be active
                if (type === 'status') {
                    document.querySelectorAll('.filter-item[data-type="status"]').forEach(i => i.classList.remove('active'));
                    this.classList.add('active');
                    filters.status = value;
                } else {
                    // Toggle for language, owner, and country
                    if (this.classList.contains('active')) {
                        // If clicking the same filter again - deactivate it
                        this.classList.remove('active');
                        filters[type] = '';
                    } else {
                        // Remove active from all items of this type
                        document.querySelectorAll(`.filter-item[data-type="${type}"]`).forEach(i => i.classList.remove('active'));
                        // Activate the clicked one
                        this.classList.add('active');
                        filters[type] = value;
                    }
                }

                updateActiveFiltersDisplay();
                loadBooks();
            });
        });

        function updateActiveFiltersDisplay() {
            const container = document.getElementById('activeFilters');
            let tags = [];

            if (filters.owner) {
                const label = filters.owner === 'kristina' ? '👩 Kristina' :
                              filters.owner === 'darius' ? '👨 Darius' :
                              filters.owner === 'nepriskirta' ? '❓ Nepriskirta' : '📥 Skolinta';
                tags.push(`<span class="active-filter-tag">${label} <span class="remove" onclick="clearFilter('owner')">✕</span></span>`);
            }

            if (filters.country) {
                const label = countryFlags[filters.country] + ' ' + countryNames[filters.country];
                tags.push(`<span class="active-filter-tag">${label} <span class="remove" onclick="clearFilter('country')">✕</span></span>`);
            }

            if (filters.format) {
                const formatLabels = {
                    'paper': '📖 Popierinė',
                    'audio': '🎧 Audio',
                    'ebook-md': '📝 MD',
                    'ebook-pdf': '📄 PDF',
                    'ebook-epub': '📱 EPUB'
                };
                const label = formatLabels[filters.format] || filters.format;
                tags.push(`<span class="active-filter-tag">${label} <span class="remove" onclick="clearFilter('format')">✕</span></span>`);
            }

            container.innerHTML = tags.join('');
        }

        function clearFilter(type) {
            filters[type] = '';
            document.querySelectorAll(`.filter-item[data-type="${type}"]`).forEach(i => i.classList.remove('active'));
            updateActiveFiltersDisplay();
            loadBooks();
        }

        // Load books
        async function loadBooks() {
            try {
                const params = new URLSearchParams({
                    q: searchQuery,
                    status: filters.status,
                    language: filters.language,
                    owner: filters.owner,
                    country: filters.country,
                    category: filters.category,
                    format: filters.format
                });
                
                const response = await fetch(`/api/search?${params}`);
                const books = await response.json();
                
                renderBooks(books);
                updateStats();
            } catch (error) {
                showToast('Klaida kraunant knygas', 'warning');
            }
        }

        // Update stats
        async function updateStats() {
            try {
                const params = new URLSearchParams();
                if (filters.language) {
                    params.append('language', filters.language);
                }
                const response = await fetch(`/api/stats?${params}`);
                const stats = await response.json();
                
                document.getElementById('statPaperRead').textContent = stats.paperRead || 0;
                document.getElementById('statPaperTotal').textContent = stats.paperTotal || 0;
                document.getElementById('statListened').textContent = stats.listened || 0;
                document.getElementById('statAudioTotal').textContent = stats.audioTotal || 0;

                // Update owner stats - show only categories with total > 0
                // Format: read/total (e.g., 25/57)
                const updateOwnerStats = (owner, data) => {
                    const parts = [];

                    // Paper (with or without digital)
                    if (data.paper.total > 0) {
                        parts.push(`📖 <strong>${data.paper.read}</strong>/${data.paper.total}`);
                    }

                    // Digital-only
                    if (data.digital.total > 0) {
                        parts.push(`💾 <strong>${data.digital.read}</strong>/${data.digital.total}`);
                    }

                    // Audio
                    if (data.audio.total > 0) {
                        parts.push(`🎧 <strong>${data.audio.listened}</strong>/${data.audio.total}`);
                    }

                    const infoEl = document.getElementById(`stat${owner}Info`);
                    if (infoEl) {
                        infoEl.innerHTML = parts.length > 0 ? parts.join(' · ') : '-';
                    }
                };

                updateOwnerStats('Kristina', stats.owners.kristina);
                updateOwnerStats('Darius', stats.owners.darius);
                updateOwnerStats('Skolinta', stats.owners.skolinta);

                // Update country stats
                const countryStatsDiv = document.getElementById('countryStatsSection');
                const countryStatsList = document.getElementById('countryStatsList');

                if (stats.countries && Object.keys(stats.countries).length > 0) {
                    countryStatsDiv.style.display = 'block';
                    const sortedCountries = Object.entries(stats.countries)
                        .sort((a, b) => b[1] - a[1]);

                    countryStatsList.innerHTML = sortedCountries.map(([code, count]) =>
                        `<div class="stat-item">
                            <span class="stat-icon">${countryFlags[code] || '🌍'} ${countryNames[code] || 'Kita'}</span>
                            <span class="stat-value">${count}</span>
                        </div>`
                    ).join('');

                    // Update country filters dynamically
                    updateCountryFilters(sortedCountries);
                } else {
                    countryStatsDiv.style.display = 'none';
                    // Hide country filter section if no countries
                    document.getElementById('countryFilterSection').style.display = 'none';
                }

                // Update format stats and combinations
                const formatStatsDiv = document.getElementById('formatStatsSection');
                const combinationStatsDiv = document.getElementById('combinationStatsSection');

                const updateItem = (id, value) => {
                    const el = document.getElementById(id);
                    if (el && value > 0) {
                        el.style.display = 'flex';
                        el.querySelector('.stat-value').textContent = value;
                    } else if (el) {
                        el.style.display = 'none';
                    }
                };

                // Update format totals
                if (stats.formats) {
                    updateItem('statFormatPaper', stats.formats.paper);
                    updateItem('statFormatAudio', stats.formats.audio);
                    updateItem('statFormatMd', stats.formats['ebook-md']);
                    updateItem('statFormatPdf', stats.formats['ebook-pdf']);
                    updateItem('statFormatEpub', stats.formats['ebook-epub']);
                }

                // Update combinations
                if (stats.formatCombinations) {
                    updateItem('statPaperAudio', stats.formatCombinations.paperAudio);
                    updateItem('statPaperDigital', stats.formatCombinations.paperDigital);
                    updateItem('statAudioDigital', stats.formatCombinations.audioDigital);
                    updateItem('statAllThree', stats.formatCombinations.allThree);
                }

                // Show/hide format section if any formats exist
                const hasFormats = stats.formats && Object.values(stats.formats).some(v => v > 0);
                if (formatStatsDiv) {
                    formatStatsDiv.style.display = hasFormats ? 'block' : 'none';
                }

                // Show/hide combination section if any combinations exist
                const hasCombinations = stats.formatCombinations && Object.values(stats.formatCombinations).some(v => v > 0);
                if (combinationStatsDiv) {
                    combinationStatsDiv.style.display = hasCombinations ? 'block' : 'none';
                }
            } catch (error) {}
        }

        // Update country filters based on available countries
        function updateCountryFilters(sortedCountries) {
            const filterSection = document.getElementById('countryFilterSection');
            const filterItems = document.getElementById('countryFilterItems');

            if (sortedCountries.length > 0) {
                filterSection.style.display = 'block';
                filterItems.innerHTML = sortedCountries.map(([code, count]) => {
                    const isActive = filters.country === code ? 'active' : '';
                    return `<div class="filter-item ${isActive}" data-type="country" data-value="${code}">${countryFlags[code] || '🌍'} ${countryNames[code]}</div>`;
                }).join('');

                // Re-attach click handlers to new filter items
                filterItems.querySelectorAll('.filter-item').forEach(item => {
                    item.addEventListener('click', function() {
                        const type = this.dataset.type;
                        const value = this.dataset.value;

                        if (this.classList.contains('active')) {
                            this.classList.remove('active');
                            filters[type] = '';
                        } else {
                            document.querySelectorAll(`.filter-item[data-type="${type}"]`).forEach(i => i.classList.remove('active'));
                            this.classList.add('active');
                            filters[type] = value;
                        }

                        updateActiveFiltersDisplay();
                        loadBooks();
                    });
                });
            } else {
                filterSection.style.display = 'none';
            }
        }

        // Format date
        function formatDate(dateStr) {
            if (!dateStr) return '';
            return new Date(dateStr).toLocaleDateString('lt-LT');
        }

        // Render rating
        function renderRating(rating) {
            if (!rating) return '';
            return '★'.repeat(rating);
        }

        // Highlight search
        function highlight(text, query) {
            if (!query || !text) return text || '';
            const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            return text.replace(regex, '<mark style="background:#f4d03f40;color:#fff">$1</mark>');
        }

        // Render books
        function renderBooks(books) {
            const list = document.getElementById('booksList');
            const empty = document.getElementById('emptyState');
            
            if (books.length === 0) {
                list.innerHTML = '';
                empty.style.display = 'block';
                return;
            }
            
            empty.style.display = 'none';
            list.innerHTML = books.map(book => {
                let cardClass = 'unread';
                if (book.owner === 'skolinta') cardClass = 'borrowed';
                else if (book.lentTo) cardClass = 'lent';
                else if (book.read) cardClass = 'read';

                const langFlag = langFlags[book.language] || '';
                const owner = book.owner || 'nepriskirta';
                const ownerLabel = ownerNames[owner] || '';
                
                let dates = '';
                if (book.startDate || book.endDate) {
                    const parts = [];
                    if (book.startDate) parts.push(formatDate(book.startDate));
                    if (book.endDate) parts.push(formatDate(book.endDate));
                    dates = `<span class="book-dates">📅 ${parts.join(' → ')}</span>`;
                }
                
                // Build title with series info
                let titleText = highlight(book.title, searchQuery);
                if (book.seriesNumber) {
                    titleText += ` (${book.seriesNumber})`;
                }

                return `
                <div class="book-card ${cardClass}">
                    <div class="book-main">
                        <div class="book-info">
                            <div class="book-header">
                                <span class="book-title">${titleText}</span>
                                ${book.publicationYear ? `<span class="book-year">${book.publicationYear}</span>` : ''}
                                ${langFlag ? `<span class="book-lang">${langFlag}</span>` : ''}
                                ${ownerLabel ? `<span class="book-owner ${owner}">${ownerLabel}</span>` : ''}
                            </div>
                            ${book.author ? `<div class="book-author">${highlight(book.author, searchQuery)} ${book.authorCountry ? countryFlags[book.authorCountry] || '' : ''}</div>` : ''}
                            <div class="book-meta">
                                ${book.category ? `<span class="book-category">${book.category}</span>` : ''}
                                ${book.rating ? `<span class="book-rating">${renderRating(book.rating)}</span>` : ''}
                                ${book.formats && book.formats.length > 0 ? `<span class="book-formats" style="font-size: 0.9rem;">${book.formats.map(f => {
                                    const icons = {'paper': '📖', 'audio': '🎧', 'ebook-md': '📝', 'ebook-pdf': '📄', 'ebook-epub': '📱'};
                                    return icons[f] || '';
                                }).join(' ')}</span>` : ''}
                            </div>
                            <div class="book-status-line">
                                ${book.read ? `<span class="book-read-badge">✓ Perskaityta</span>` : ''}
                                ${book.listened ? `<span class="book-listened-badge">🎧 Klausyta</span>` : ''}
                                ${dates}
                            </div>
                            ${book.lentTo ? `<span class="book-lent">📤 Paskolinta: ${highlight(book.lentTo, searchQuery)}</span>` : ''}
                        </div>
                        <div class="book-actions">
                            <button class="btn-icon btn-verified ${book.verified ? 'is-verified' : ''}" onclick="toggleVerified('${book.id}')" title="${book.verified ? 'Atžymėti patikrintą' : 'Pažymėti patikrintą'}"></button>
                            <button class="btn-icon btn-edit" onclick="openEditModal('${book.id}')" title="Redaguoti">✏️</button>
                            <button class="btn-icon btn-delete" onclick="deleteBook('${book.id}')" title="Ištrinti">🗑️</button>
                        </div>
                    </div>
                </div>
                `;
            }).join('');
        }

        // Add book
        document.getElementById('addBookForm').addEventListener('submit', async function(e) {
            e.preventDefault();

            // Collect selected formats
            const formats = [];
            if (document.getElementById('formatPaper').checked) formats.push('paper');
            if (document.getElementById('formatAudio').checked) formats.push('audio');
            if (document.getElementById('formatMd').checked) formats.push('ebook-md');
            if (document.getElementById('formatPdf').checked) formats.push('ebook-pdf');
            if (document.getElementById('formatEpub').checked) formats.push('ebook-epub');

            const seriesNumber = document.getElementById('bookSeriesNumber').value;
            const publicationYear = document.getElementById('bookPublicationYear').value;

            const data = {
                title: document.getElementById('bookTitle').value.trim(),
                seriesNumber: seriesNumber ? parseInt(seriesNumber) : null,
                seriesName: document.getElementById('bookSeriesName').value.trim(),
                author: document.getElementById('bookAuthor').value.trim(),
                authorCountry: document.getElementById('bookAuthorCountry').value,
                publicationYear: publicationYear ? parseInt(publicationYear) : null,
                language: document.getElementById('bookLanguage').value,
                owner: document.getElementById('bookOwner').value,
                category: document.getElementById('bookCategory').value,
                formats: formats
            };

            try {
                const response = await fetch('/api/books', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.status === 409) {
                    document.getElementById('duplicateWarning').classList.add('show');
                    showToast('Tokia knyga jau yra!', 'warning');
                    return;
                }

                if (response.ok) {
                    this.reset();
                    document.getElementById('duplicateWarning').classList.remove('show');
                    loadBooks();
                    showToast(`"${data.title}" pridėta!`);
                }
            } catch (error) {
                showToast('Klaida', 'warning');
            }
        });

        // Check duplicate
        let dupTimeout;
        document.getElementById('bookTitle').addEventListener('input', function() {
            clearTimeout(dupTimeout);
            dupTimeout = setTimeout(async () => {
                if (this.value.length < 2) {
                    document.getElementById('duplicateWarning').classList.remove('show');
                    return;
                }
                try {
                    const response = await fetch(`/api/check-duplicate?title=${encodeURIComponent(this.value)}`);
                    const data = await response.json();
                    document.getElementById('duplicateWarning').classList.toggle('show', data.duplicate);
                } catch (e) {}
            }, 300);
        });

        // Toggle read
        async function toggleRead(id) {
            try {
                const response = await fetch(`/api/books/${id}/toggle-read`, { method: 'POST' });
                if (response.ok) {
                    loadBooks();
                    showToast('Atnaujinta');
                }
            } catch (error) {
                showToast('Klaida', 'warning');
            }
        }

        // Toggle verified - Optimistic UI (instant feedback)
        async function toggleVerified(id) {
            // Find the button and toggle immediately (optimistic)
            const button = event.target.closest('.btn-verified');
            if (button) {
                button.classList.toggle('is-verified');
            }

            // Then update server in background
            try {
                const response = await fetch(`/api/books/${id}/toggle-verified`, { method: 'POST' });
                if (!response.ok) {
                    // If failed, revert the change
                    if (button) {
                        button.classList.toggle('is-verified');
                    }
                    showToast('Klaida', 'warning');
                }
            } catch (error) {
                // If failed, revert the change
                if (button) {
                    button.classList.toggle('is-verified');
                }
                showToast('Klaida', 'warning');
            }
        }

        // Delete book
        async function deleteBook(id) {
            if (!confirm('Ar tikrai nori ištrinti?')) return;
            try {
                const response = await fetch(`/api/books/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    loadBooks();
                    showToast('Ištrinta', 'warning');
                }
            } catch (error) {
                showToast('Klaida', 'warning');
            }
        }

        // Edit modal
        async function openEditModal(id) {
            try {
                const response = await fetch('/api/books');
                const books = await response.json();
                const book = books.find(b => b.id === id);
                if (!book) return;
                
                document.getElementById('editBookId').value = book.id;
                document.getElementById('editTitle').value = book.title;
                document.getElementById('editSeriesNumber').value = book.seriesNumber || '';
                document.getElementById('editSeriesName').value = book.seriesName || '';
                document.getElementById('editAuthor').value = book.author || '';
                document.getElementById('editAuthorCountry').value = book.authorCountry || '';
                document.getElementById('editPublicationYear').value = book.publicationYear || '';
                document.getElementById('editLanguage').value = book.language || '';
                document.getElementById('editOwner').value = book.owner || '';
                document.getElementById('editCategory').value = book.category || '';
                document.getElementById('editRead').checked = book.read;
                document.getElementById('editListened').checked = book.listened || false;
                document.getElementById('editStartDate').value = book.startDate || '';
                document.getElementById('editEndDate').value = book.endDate || '';
                document.getElementById('editLentTo').value = book.lentTo || '';
                document.getElementById('editBorrowedFrom').value = book.borrowedFrom || '';

                // Set formats checkboxes
                const bookFormats = book.formats || [];
                document.getElementById('editFormatPaper').checked = bookFormats.includes('paper');
                document.getElementById('editFormatAudio').checked = bookFormats.includes('audio');
                document.getElementById('editFormatMd').checked = bookFormats.includes('ebook-md');
                document.getElementById('editFormatPdf').checked = bookFormats.includes('ebook-pdf');
                document.getElementById('editFormatEpub').checked = bookFormats.includes('ebook-epub');

                editingRating = book.rating || 0;
                updateStarDisplay();
                
                document.getElementById('editModal').classList.add('show');
            } catch (error) {
                showToast('Klaida', 'warning');
            }
        }

        function closeEditModal() {
            document.getElementById('editModal').classList.remove('show');
        }

        // Star rating
        document.querySelectorAll('#editRating .star').forEach(star => {
            star.addEventListener('click', function() {
                const rating = parseInt(this.dataset.rating);
                editingRating = editingRating === rating ? 0 : rating;
                updateStarDisplay();
            });
            
            star.addEventListener('mouseenter', function() {
                const rating = parseInt(this.dataset.rating);
                document.querySelectorAll('#editRating .star').forEach((s, i) => {
                    s.classList.toggle('active', i < rating);
                });
            });
            
            star.addEventListener('mouseleave', updateStarDisplay);
        });

        function updateStarDisplay() {
            document.querySelectorAll('#editRating .star').forEach((s, i) => {
                s.classList.toggle('active', i < editingRating);
            });
        }

        // Save edit
        async function saveBookEdit() {
            const id = document.getElementById('editBookId').value;

            // Collect selected formats
            const formats = [];
            if (document.getElementById('editFormatPaper').checked) formats.push('paper');
            if (document.getElementById('editFormatAudio').checked) formats.push('audio');
            if (document.getElementById('editFormatMd').checked) formats.push('ebook-md');
            if (document.getElementById('editFormatPdf').checked) formats.push('ebook-pdf');
            if (document.getElementById('editFormatEpub').checked) formats.push('ebook-epub');

            const seriesNumber = document.getElementById('editSeriesNumber').value;
            const publicationYear = document.getElementById('editPublicationYear').value;

            const data = {
                title: document.getElementById('editTitle').value.trim(),
                seriesNumber: seriesNumber ? parseInt(seriesNumber) : null,
                seriesName: document.getElementById('editSeriesName').value.trim(),
                author: document.getElementById('editAuthor').value.trim(),
                authorCountry: document.getElementById('editAuthorCountry').value,
                publicationYear: publicationYear ? parseInt(publicationYear) : null,
                language: document.getElementById('editLanguage').value,
                owner: document.getElementById('editOwner').value,
                category: document.getElementById('editCategory').value,
                formats: formats,
                read: document.getElementById('editRead').checked,
                listened: document.getElementById('editListened').checked,
                rating: editingRating || null,
                startDate: document.getElementById('editStartDate').value || null,
                endDate: document.getElementById('editEndDate').value || null,
                lentTo: document.getElementById('editLentTo').value.trim(),
                borrowedFrom: document.getElementById('editBorrowedFrom').value.trim()
            };

            try {
                const response = await fetch(`/api/books/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    closeEditModal();
                    loadBooks();
                    showToast('Išsaugota!');
                }
            } catch (error) {
                showToast('Klaida', 'warning');
            }
        }

        // Close modal on outside click
        document.getElementById('editModal').addEventListener('click', function(e) {
            if (e.target === this) closeEditModal();
        });

        // Search
        document.getElementById('searchInput').addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchQuery = this.value;
                loadBooks();
            }, 200);
        });

        // Export
        function exportBooks() {
            window.location.href = '/api/export';
            showToast('Eksportuojama...', 'info');
        }

        // Import
        document.getElementById('importInput').addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('/api/import', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                
                if (response.ok) {
                    loadBooks();
                    showToast(`Importuota ${data.added} naujų knygų!`);
                } else {
                    showToast(data.error || 'Klaida', 'warning');
                }
            } catch (error) {
                showToast('Importo klaida', 'warning');
            }
            this.value = '';
        });

        // Backup
        async function createBackup() {
            try {
                const response = await fetch('/api/backup', { method: 'POST' });
                if (response.ok) {
                    showToast('Backup sukurtas!', 'info');
                }
            } catch (error) {
                showToast('Klaida', 'warning');
            }
        }

        // Toast
        function showToast(msg, type = 'success') {
            const toast = document.getElementById('toast');
            toast.textContent = msg;
            toast.className = 'toast show ' + type;
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        // ===== WISHLIST FUNCTIONS =====

        // Toggle wishlist section
        document.getElementById('wishlistHeader').addEventListener('click', function() {
            this.classList.toggle('open');
            document.getElementById('wishlistContent').classList.toggle('open');
        });

        // Load wishlist
        async function loadWishlist() {
            try {
                const response = await fetch('/api/wishlist');
                const items = await response.json();
                renderWishlist(items);
            } catch (error) {
                showToast('Klaida kraunant sąrašą', 'warning');
            }
        }

        // Render wishlist
        function renderWishlist(items) {
            const container = document.getElementById('wishlistItems');
            const empty = document.getElementById('wishlistEmpty');

            if (items.length === 0) {
                container.innerHTML = '';
                empty.style.display = 'block';
                return;
            }

            empty.style.display = 'none';
            container.innerHTML = items.map(item => `
                <div class="wishlist-item">
                    <div class="wishlist-item-info">
                        <div class="wishlist-item-title">${item.title}</div>
                        ${item.author ? `<div class="wishlist-item-author">${item.author}</div>` : ''}
                    </div>
                    <div class="wishlist-item-actions">
                        <button class="btn-icon btn-edit" onclick="openEditWishlistModal('${item.id}')" title="Redaguoti">✏️</button>
                        <button class="btn-icon btn-delete" onclick="deleteWishlistItem('${item.id}')" title="Ištrinti">🗑️</button>
                    </div>
                </div>
            `).join('');
        }

        // Add wishlist item
        document.getElementById('addWishlistForm').addEventListener('submit', async function(e) {
            e.preventDefault();

            const data = {
                title: document.getElementById('wishlistTitle').value.trim(),
                author: document.getElementById('wishlistAuthor').value.trim()
            };

            try {
                const response = await fetch('/api/wishlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    this.reset();
                    loadWishlist();
                    showToast(`"${data.title}" pridėta!`);
                }
            } catch (error) {
                showToast('Klaida', 'warning');
            }
        });

        // Open edit wishlist modal
        async function openEditWishlistModal(id) {
            try {
                const response = await fetch('/api/wishlist');
                const items = await response.json();
                const item = items.find(i => i.id === id);
                if (!item) return;

                document.getElementById('editWishlistId').value = item.id;
                document.getElementById('editWishlistTitle').value = item.title;
                document.getElementById('editWishlistAuthor').value = item.author || '';

                document.getElementById('editWishlistModal').classList.add('show');
            } catch (error) {
                showToast('Klaida', 'warning');
            }
        }

        // Close edit wishlist modal
        function closeEditWishlistModal() {
            document.getElementById('editWishlistModal').classList.remove('show');
        }

        // Save wishlist edit
        async function saveWishlistEdit() {
            const id = document.getElementById('editWishlistId').value;

            const data = {
                title: document.getElementById('editWishlistTitle').value.trim(),
                author: document.getElementById('editWishlistAuthor').value.trim()
            };

            try {
                const response = await fetch(`/api/wishlist/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    closeEditWishlistModal();
                    loadWishlist();
                    showToast('Išsaugota!');
                }
            } catch (error) {
                showToast('Klaida', 'warning');
            }
        }

        // Delete wishlist item
        async function deleteWishlistItem(id) {
            if (!confirm('Ar tikrai nori ištrinti?')) return;
            try {
                const response = await fetch(`/api/wishlist/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    loadWishlist();
                    showToast('Ištrinta', 'warning');
                }
            } catch (error) {
                showToast('Klaida', 'warning');
            }
        }

        // Close modal on outside click
        document.getElementById('editWishlistModal').addEventListener('click', function(e) {
            if (e.target === this) closeEditWishlistModal();
        });

        // Init
        loadBooks();
        loadWishlist();
