#!/usr/bin/env python3
"""
Knygų Biblioteka - Flask aplikacija su JSON saugojimu
Paleisti: python app.py
Arba per PM2: pm2 start ecosystem.config.js
"""

from flask import Flask, render_template, request, jsonify, send_file
import json
from datetime import datetime
from pathlib import Path
import shutil
import webbrowser
from threading import Timer
from stats import calculate_stats

app = Flask(__name__)

BASE_DIR = Path(__file__).parent
BOOKS_FILE = BASE_DIR / "books.json"
WISHLIST_FILE = BASE_DIR / "wishlist.json"
BACKUP_DIR = BASE_DIR / "backups"


def load_books():
    if BOOKS_FILE.exists():
        try:
            with open(BOOKS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return []
    return []


def save_books(books):
    with open(BOOKS_FILE, 'w', encoding='utf-8') as f:
        json.dump(books, f, ensure_ascii=False, indent=2)


def load_wishlist():
    if WISHLIST_FILE.exists():
        try:
            with open(WISHLIST_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return []
    return []


def save_wishlist(items):
    with open(WISHLIST_FILE, 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=2)


def create_backup():
    if not BOOKS_FILE.exists():
        return None
    
    BACKUP_DIR.mkdir(exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = BACKUP_DIR / f"books_backup_{timestamp}.json"
    shutil.copy(BOOKS_FILE, backup_file)
    
    backups = sorted(BACKUP_DIR.glob("books_backup_*.json"), reverse=True)
    for old_backup in backups[10:]:
        old_backup.unlink()
    
    return backup_file.name


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/books', methods=['GET'])
def get_books():
    return jsonify(load_books())


@app.route('/api/books', methods=['POST'])
def add_book():
    data = request.get_json()
    
    if not data or not data.get('title'):
        return jsonify({'error': 'Pavadinimas privalomas'}), 400
    
    books = load_books()
    
    title_lower = data['title'].lower().strip()
    for book in books:
        if book['title'].lower().strip() == title_lower:
            return jsonify({'error': 'Tokia knyga jau egzistuoja', 'duplicate': True}), 409
    
    new_book = {
        'id': datetime.now().strftime("%Y%m%d%H%M%S%f"),
        'title': data['title'].strip(),
        'seriesNumber': data.get('seriesNumber'),
        'seriesName': data.get('seriesName', '').strip(),
        'author': data.get('author', '').strip(),
        'authorCountry': data.get('authorCountry', ''),
        'publicationYear': data.get('publicationYear'),
        'category': data.get('category', ''),
        'language': data.get('language', ''),
        'owner': data.get('owner', ''),
        'formats': data.get('formats', []),
        'read': data.get('read', False),
        'listened': data.get('listened', False),
        'verified': data.get('verified', False),
        'rating': data.get('rating'),
        'startDate': data.get('startDate'),
        'endDate': data.get('endDate'),
        'lentTo': data.get('lentTo', '').strip(),
        'borrowedFrom': data.get('borrowedFrom', '').strip(),
        'addedAt': datetime.now().isoformat()
    }
    
    books.append(new_book)
    save_books(books)
    
    return jsonify(new_book), 201


@app.route('/api/books/<book_id>', methods=['PUT'])
def update_book(book_id):
    data = request.get_json()
    books = load_books()
    
    for book in books:
        if book['id'] == book_id:
            book['title'] = data.get('title', book['title'])
            book['seriesNumber'] = data.get('seriesNumber', book.get('seriesNumber'))
            book['seriesName'] = data.get('seriesName', book.get('seriesName', ''))
            book['author'] = data.get('author', book['author'])
            book['authorCountry'] = data.get('authorCountry', book.get('authorCountry', ''))
            book['publicationYear'] = data.get('publicationYear', book.get('publicationYear'))
            book['category'] = data.get('category', book['category'])
            book['language'] = data.get('language', book.get('language', ''))
            book['owner'] = data.get('owner', book.get('owner', ''))
            book['formats'] = data.get('formats', book.get('formats', []))
            book['read'] = data.get('read', book['read'])
            book['listened'] = data.get('listened', book.get('listened', False))
            book['verified'] = data.get('verified', book.get('verified', False))
            book['rating'] = data.get('rating', book.get('rating'))
            book['startDate'] = data.get('startDate', book.get('startDate'))
            book['endDate'] = data.get('endDate', book.get('endDate'))
            book['lentTo'] = data.get('lentTo', book.get('lentTo', ''))
            book['borrowedFrom'] = data.get('borrowedFrom', book.get('borrowedFrom', ''))
            save_books(books)
            return jsonify(book)
    
    return jsonify({'error': 'Knyga nerasta'}), 404


@app.route('/api/books/<book_id>', methods=['DELETE'])
def delete_book(book_id):
    books = load_books()
    original_count = len(books)
    books = [b for b in books if b['id'] != book_id]
    
    if len(books) == original_count:
        return jsonify({'error': 'Knyga nerasta'}), 404
    
    save_books(books)
    return jsonify({'success': True})


@app.route('/api/books/<book_id>/toggle-read', methods=['POST'])
def toggle_read(book_id):
    books = load_books()

    for book in books:
        if book['id'] == book_id:
            book['read'] = not book['read']
            save_books(books)
            return jsonify(book)

    return jsonify({'error': 'Knyga nerasta'}), 404


@app.route('/api/books/<book_id>/toggle-verified', methods=['POST'])
def toggle_verified(book_id):
    books = load_books()

    for book in books:
        if book['id'] == book_id:
            book['verified'] = not book.get('verified', False)
            save_books(books)
            return jsonify(book)

    return jsonify({'error': 'Knyga nerasta'}), 404


@app.route('/api/search')
def search_books():
    query = request.args.get('q', '').lower().strip()
    filter_status = request.args.get('status', 'all')
    filter_language = request.args.get('language', '')
    filter_owner = request.args.get('owner', '')
    filter_country = request.args.get('country', '')
    filter_format = request.args.get('format', '')
    filter_category = request.args.get('category', '')

    books = load_books()

    # Filter by status
    if filter_status == 'read':
        books = [b for b in books if b.get('read')]
    elif filter_status == 'unread':
        books = [b for b in books if not b.get('read')]
    elif filter_status == 'listened':
        books = [b for b in books if b.get('listened')]
    elif filter_status == 'unlistened':
        books = [b for b in books if not b.get('listened')]
    elif filter_status == 'lent':
        books = [b for b in books if b.get('lentTo')]
    elif filter_status == 'borrowed':
        books = [b for b in books if b.get('owner') == 'skolinta']

    # Filter by language
    if filter_language:
        books = [b for b in books if b.get('language') == filter_language]

    # Filter by owner
    if filter_owner:
        if filter_owner == 'nepriskirta':
            # Show books without owner
            books = [b for b in books if not b.get('owner')]
        else:
            books = [b for b in books if b.get('owner') == filter_owner]

    # Filter by author country
    if filter_country:
        books = [b for b in books if b.get('authorCountry') == filter_country]

    # Filter by format
    if filter_format:
        books = [b for b in books if filter_format in b.get('formats', [])]

    # Filter by category
    if filter_category:
        books = [b for b in books if b.get('category') == filter_category]

    # Search
    if query:
        books = [b for b in books if
                 query in b['title'].lower() or
                 query in b.get('author', '').lower() or
                 query in b.get('category', '').lower() or
                 query in b.get('lentTo', '').lower() or
                 query in b.get('borrowedFrom', '').lower()]

    books.sort(key=lambda x: (
        x.get('author', '').lower(),
        x.get('seriesName', '').lower(),
        x.get('seriesNumber') if x.get('seriesNumber') is not None else float('inf'),
        x.get('publicationYear') if x.get('publicationYear') is not None else float('inf'),
        x['title'].lower()
    ))

    return jsonify(books)


@app.route('/api/check-duplicate')
def check_duplicate():
    title = request.args.get('title', '').lower().strip()
    
    if not title:
        return jsonify({'duplicate': False})
    
    books = load_books()
    
    for book in books:
        book_title = book['title'].lower().strip()
        if book_title == title or title in book_title or book_title in title:
            return jsonify({'duplicate': True, 'existing': book})
    
    return jsonify({'duplicate': False})


@app.route('/api/stats')
def get_stats():
    books = load_books()

    # Filter by language if provided
    language = request.args.get('language', '')
    if language:
        books = [b for b in books if b.get('language') == language]

    stats = calculate_stats(books)
    return jsonify(stats)


@app.route('/api/export')
def export_books():
    if not BOOKS_FILE.exists():
        return jsonify([])
    
    return send_file(
        BOOKS_FILE,
        mimetype='application/json',
        as_attachment=True,
        download_name=f'knygos_{datetime.now().strftime("%Y%m%d")}.json'
    )


@app.route('/api/import', methods=['POST'])
def import_books():
    if 'file' not in request.files:
        return jsonify({'error': 'Failas nepateiktas'}), 400
    
    file = request.files['file']
    
    try:
        imported = json.load(file)
        if not isinstance(imported, list):
            return jsonify({'error': 'Netinkamas formatas'}), 400
        
        create_backup()
        
        books = load_books()
        existing_titles = {b['title'].lower() for b in books}
        
        added = 0
        for item in imported:
            if item.get('title') and item['title'].lower() not in existing_titles:
                new_book = {
                    'id': datetime.now().strftime("%Y%m%d%H%M%S%f") + str(added),
                    'title': item.get('title', ''),
                    'seriesNumber': item.get('seriesNumber'),
                    'seriesName': item.get('seriesName', ''),
                    'author': item.get('author', ''),
                    'authorCountry': item.get('authorCountry', ''),
                    'publicationYear': item.get('publicationYear'),
                    'category': item.get('category', ''),
                    'language': item.get('language', ''),
                    'owner': item.get('owner', ''),
                    'formats': item.get('formats', []),
                    'read': item.get('read', False),
                    'listened': item.get('listened', False),
                    'verified': item.get('verified', False),
                    'rating': item.get('rating'),
                    'startDate': item.get('startDate'),
                    'endDate': item.get('endDate'),
                    'lentTo': item.get('lentTo', ''),
                    'borrowedFrom': item.get('borrowedFrom', ''),
                    'addedAt': datetime.now().isoformat()
                }
                books.append(new_book)
                existing_titles.add(item['title'].lower())
                added += 1
        
        save_books(books)
        return jsonify({'added': added, 'total': len(books)})
    
    except json.JSONDecodeError:
        return jsonify({'error': 'Netinkamas JSON formatas'}), 400


@app.route('/api/backup', methods=['POST'])
def backup():
    backup_name = create_backup()
    if backup_name:
        return jsonify({'success': True, 'file': backup_name})
    return jsonify({'error': 'Nėra ką backupinti'}), 400


# ===== WISHLIST ENDPOINTS =====

@app.route('/api/wishlist', methods=['GET'])
def get_wishlist():
    return jsonify(load_wishlist())


@app.route('/api/wishlist', methods=['POST'])
def add_wishlist_item():
    data = request.get_json()

    if not data or not data.get('title'):
        return jsonify({'error': 'Pavadinimas privalomas'}), 400

    items = load_wishlist()

    new_item = {
        'id': datetime.now().strftime("%Y%m%d%H%M%S%f"),
        'title': data['title'].strip(),
        'author': data.get('author', '').strip(),
        'addedAt': datetime.now().isoformat()
    }

    items.append(new_item)
    save_wishlist(items)

    return jsonify(new_item), 201


@app.route('/api/wishlist/<item_id>', methods=['PUT'])
def update_wishlist_item(item_id):
    data = request.get_json()
    items = load_wishlist()

    for item in items:
        if item['id'] == item_id:
            item['title'] = data.get('title', item['title']).strip()
            item['author'] = data.get('author', item.get('author', '')).strip()
            save_wishlist(items)
            return jsonify(item)

    return jsonify({'error': 'Įrašas nerastas'}), 404


@app.route('/api/wishlist/<item_id>', methods=['DELETE'])
def delete_wishlist_item(item_id):
    items = load_wishlist()
    original_count = len(items)
    items = [i for i in items if i['id'] != item_id]

    if len(items) == original_count:
        return jsonify({'error': 'Įrašas nerastas'}), 404

    save_wishlist(items)
    return jsonify({'success': True})


def open_browser():
    webbrowser.open('http://localhost:5123')


if __name__ == '__main__':
    if not BOOKS_FILE.exists():
        save_books([])

    print(">> Knygu biblioteka paleista!")
    print("   Adresas: http://localhost:5123")
    print("   Stabdyti: Ctrl+C")
    print("   Narsykle atidaroma automatiskai...")

    Timer(1.5, open_browser).start()

    app.run(host='0.0.0.0', port=5123, debug=False)
